import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiPropertyOptional({ example: 'Brown Sugar Milk Tea' })
  productName?: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiPropertyOptional({ example: 'M', enum: ['S', 'M', 'L'] })
  size?: string;

  @ApiPropertyOptional({ example: '100%', enum: ['100%', '70%', '50%', '30%', '0%'] })
  sugarLevel?: string;

  @ApiPropertyOptional({ example: '70%', enum: ['100%', '70%', '50%', '0%'] })
  iceLevel?: string;

  @ApiPropertyOptional({ example: ['Pearl', 'Jelly'] })
  toppings?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/image.png' })
  imageUrl?: string;

  @ApiProperty({ example: 45000 })
  price: number;
}
