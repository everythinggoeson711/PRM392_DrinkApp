import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Payload SePay gửi về webhook khi phát hiện giao dịch chuyển khoản.
 * Docs: https://docs.sepay.vn
 */
export class SepayWebhookDto {
  @ApiProperty({ example: 123456789, description: 'Transaction ID from SePay' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'MB', description: 'Bank code (e.g., "MB", "VCB")' })
  @IsString()
  gateway: string;

  @ApiProperty({ example: '2024-01-01 12:00:00', description: 'Transaction datetime' })
  @IsString()
  transactionDate: string;

  @ApiProperty({ example: '1234567890', description: 'Beneficiary account number' })
  @IsString()
  accountNumber: string;

  @ApiPropertyOptional({
    example: 'PAYMENT-123',
    description: 'Transfer content — used to match payment_code',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    example: 'PAYMENT-123',
    description: 'Reference code parsed by SePay from transfer content',
  })
  @IsString()
  @IsOptional()
  code?: string | null;

  @ApiProperty({ example: 'in', enum: ['in', 'out'], description: '"in" = money in, "out" = money out' })
  @IsString()
  transferType: string;

  @ApiProperty({ example: 50000, description: 'Transaction amount' })
  @IsNumber()
  transferAmount: number;

  @ApiPropertyOptional({ example: 'ABC123XYZ', description: 'Bank reference code' })
  @IsString()
  @IsOptional()
  referenceCode?: string;

  @ApiPropertyOptional({ example: 100000, description: 'Cumulative balance' })
  @IsNumber()
  @IsOptional()
  accumulated?: number;
}
