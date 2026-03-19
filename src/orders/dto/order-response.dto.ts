import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemResponseDto } from './order-item-response.dto';

export class OrderResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiPropertyOptional({ example: 1 })
  userId?: number;

  @ApiProperty({ example: 'John Doe' })
  customerName: string;

  @ApiProperty({ example: '0912345678' })
  phone: string;

  @ApiPropertyOptional({ example: '123 Nguyen Trai, District 1' })
  address?: string;

  @ApiProperty({ example: 90000 })
  totalAmount: number;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: Date;
}
