import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { SepayWebhookDto } from './dto/sepay-webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Tạo payment cho đơn hàng. Trả về QR URL để người dùng quét chuyển khoản.
   * Gọi lại với cùng orderId sẽ trả về payment hiện tại (idempotent).
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tạo payment cho đơn hàng',
    description:
      'Trả về QR URL SePay. Người dùng quét QR và chuyển khoản đúng nội dung `paymentCode`.',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiCreatedResponse({ type: PaymentResponseDto })
  async create(@Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentsService.createForOrder(dto);
  }

  /**
   * Kiểm tra trạng thái thanh toán của 1 đơn hàng.
   */
  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra trạng thái payment của đơn hàng' })
  @ApiParam({ name: 'orderId', type: Number })
  @ApiOkResponse({ type: PaymentResponseDto })
  async findByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.findByOrder(orderId);
  }

  /**
   * SePay gọi vào đây khi phát hiện giao dịch chuyển khoản.
   * Không cần JWT — được bảo vệ bằng Apikey header.
   * Endpoint này phải được expose ra internet (public VPS / ngrok).
   */
  @Post('webhook/sepay')
  @HttpCode(200)
  @ApiOperation({
    summary: '[SePay] Webhook nhận thông báo chuyển khoản',
    description:
      'SePay POST tới endpoint này khi phát hiện giao dịch. ' +
      'Header phải có `Authorization: Apikey <SEPAY_API_KEY>`. ' +
      'Không gọi endpoint này từ client app.',
  })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async webhook(
    @Body() body: SepayWebhookDto,
    @Headers('authorization') authHeader: string | undefined,
  ): Promise<{ success: boolean }> {
    return this.paymentsService.handleWebhook(body, authHeader);
  }
}
