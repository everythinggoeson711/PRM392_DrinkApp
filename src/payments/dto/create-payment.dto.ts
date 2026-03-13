import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'ID của đơn hàng cần thanh toán' })
  @IsInt()
  @IsPositive()
  orderId: number;
}
