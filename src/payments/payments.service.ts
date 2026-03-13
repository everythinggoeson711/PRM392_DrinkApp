import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SepayWebhookDto } from './dto/sepay-webhook.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly configService: ConfigService,
  ) {}

  // ─── helpers ────────────────────────────────────────────────────────────────

  private toResponse(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.order?.id,
      paymentCode: payment.paymentCode,
      amount: Number(payment.amount),
      status: payment.status,
      qrUrl: payment.qrUrl,
      sepayTransactionId: payment.sepayTransactionId,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    };
  }

  /** Generates a short unique payment code, e.g. DRK42 */
  private generatePaymentCode(orderId: number): string {
    const prefix = this.configService.get<string>('SEPAY_PAYMENT_PREFIX', 'DRK');
    return `${prefix}${orderId}`;
  }

  /** Build SePay QR image URL */
  private buildQrUrl(amount: number, paymentCode: string): string {
    const bank = this.configService.get<string>('SEPAY_BANK_CODE', 'MB');
    const account = this.configService.get<string>('SEPAY_ACCOUNT_NUMBER', '');
    const params = new URLSearchParams({
      bank,
      acc: account,
      template: 'compact',
      amount: String(Math.round(amount)),
      des: paymentCode,
    });
    return `https://qr.sepay.vn/img?${params.toString()}`;
  }

  // ─── public methods ──────────────────────────────────────────────────────────

  /**
   * Create a payment record for an order.
   * One order can only have one payment; calling again returns the existing one.
   */
  async createForOrder(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id: dto.orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order #${dto.orderId} not found`);
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot create payment for a cancelled order');
    }

    // Idempotent — return existing if already created
    const existing = await this.paymentsRepository.findOne({
      where: { order: { id: dto.orderId } },
      relations: { order: true },
    });
    if (existing) {
      if (existing.status === 'PAID') {
        throw new ConflictException('Order is already paid');
      }
      return this.toResponse(existing);
    }

    const paymentCode = this.generatePaymentCode(dto.orderId);
    const qrUrl = this.buildQrUrl(Number(order.totalAmount), paymentCode);

    const payment = this.paymentsRepository.create({
      order,
      paymentCode,
      amount: Number(order.totalAmount),
      status: 'PENDING',
      qrUrl,
    });

    const saved = await this.paymentsRepository.save(payment);
    return this.toResponse(saved);
  }

  /** Get payment status for an order */
  async findByOrder(orderId: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentsRepository.findOne({
      where: { order: { id: orderId } },
      relations: { order: true },
    });
    if (!payment) {
      throw new NotFoundException(`No payment found for order #${orderId}`);
    }
    return this.toResponse(payment);
  }

  /**
   * Handle SePay webhook.
   *
   * SePay sends:  Authorization: Apikey <api_key>
   * We verify it, then find the matching payment by paymentCode embedded
   * in the transfer content, mark it PAID, and advance the order to PROCESSING.
   */
  async handleWebhook(
    body: SepayWebhookDto,
    authHeader: string | undefined,
  ): Promise<{ success: boolean }> {
    // 1. Verify API key
    const expectedKey = this.configService.get<string>('SEPAY_API_KEY', '');
    if (!expectedKey) {
      this.logger.warn('SEPAY_API_KEY is not configured — webhook rejected');
      throw new UnauthorizedException('Payment webhook not configured');
    }

    const provided = (authHeader ?? '').replace(/^Apikey\s+/i, '').trim();
    if (!provided || provided !== expectedKey) {
      this.logger.warn('SePay webhook received with invalid API key');
      throw new UnauthorizedException('Invalid API key');
    }

    // 2. Only process incoming transfers
    if (body.transferType !== 'in') {
      return { success: true }; // ignore outgoing, no error
    }

    // 3. Find payment_code inside the transfer content
    //    SePay puts content in `code` (parsed) or raw `content` string
    const prefix = this.configService.get<string>('SEPAY_PAYMENT_PREFIX', 'DRK');
    const content = (body.code ?? body.content ?? '').toUpperCase();
    const match = content.match(new RegExp(`(${prefix}\\d+)`, 'i'));
    if (!match) {
      this.logger.log(`Webhook: no payment code found in content: "${content}"`);
      return { success: true };
    }

    const paymentCode = match[1].toUpperCase();

    const payment = await this.paymentsRepository.findOne({
      where: { paymentCode },
      relations: { order: true },
    });

    if (!payment) {
      this.logger.log(`Webhook: unknown payment code "${paymentCode}"`);
      return { success: true };
    }

    if (payment.status === 'PAID') {
      this.logger.log(`Webhook: payment "${paymentCode}" already marked PAID`);
      return { success: true };
    }

    // 4. Verify amount (allow ±1 VND rounding tolerance)
    if (Math.abs(body.transferAmount - Number(payment.amount)) > 1) {
      this.logger.warn(
        `Webhook: amount mismatch for "${paymentCode}": expected ${payment.amount}, got ${body.transferAmount}`,
      );
      payment.status = 'FAILED';
      await this.paymentsRepository.save(payment);
      return { success: true };
    }

    // 5. Mark payment PAID
    payment.status = 'PAID';
    payment.sepayTransactionId = String(body.id);
    payment.paidAt = new Date();
    await this.paymentsRepository.save(payment);

    // 6. Advance order status PENDING → PROCESSING
    if (payment.order && payment.order.status === 'PENDING') {
      payment.order.status = 'PROCESSING';
      await this.ordersRepository.save(payment.order);
    }

    this.logger.log(
      `Payment "${paymentCode}" for order #${payment.order?.id} marked PAID (sepay_id=${body.id})`,
    );

    return { success: true };
  }
}
