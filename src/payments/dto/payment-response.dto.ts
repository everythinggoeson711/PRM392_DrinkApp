import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  orderId: number;

  @ApiProperty({ example: 'DRK1' })
  paymentCode: string;

  @ApiProperty({ example: 75000 })
  amount: number;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'] })
  status: PaymentStatus;

  @ApiProperty({
    example:
      'https://qr.sepay.vn/img?bank=MB&acc=1234567890&template=compact&amount=75000&des=DRK1',
    nullable: true,
  })
  qrUrl: string | null;

  @ApiProperty({ example: null, nullable: true })
  sepayTransactionId: string | null;

  @ApiProperty({ example: null, nullable: true })
  paidAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}
