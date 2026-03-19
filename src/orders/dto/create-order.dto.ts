import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const SIZE_VALUES = ['S', 'M', 'L'] as const;
const LEVEL_VALUES = ['100%', '70%', '50%', '30%', '0%'] as const;

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantity (minimum 1)' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    example: 'M',
    enum: ['S', 'M', 'L'],
    description: 'Size of the drink',
  })
  @IsOptional()
  @IsIn(SIZE_VALUES)
  size?: (typeof SIZE_VALUES)[number];

  @ApiPropertyOptional({
    example: '100%',
    enum: ['100%', '70%', '50%', '30%', '0%'],
    description: 'Sugar level',
  })
  @IsOptional()
  @IsIn(LEVEL_VALUES)
  sugarLevel?: (typeof LEVEL_VALUES)[number];

  @ApiPropertyOptional({
    example: '70%',
    enum: ['100%', '70%', '50%', '0%'],
    description: 'Ice level',
  })
  @IsOptional()
  @IsIn(['100%', '70%', '50%', '0%'])
  iceLevel?: '100%' | '70%' | '50%' | '0%';

  @ApiPropertyOptional({
    example: ['Pearl', 'Jelly'],
    description: 'List of toppings',
    type: String,
  })
  @IsOptional()
  @IsArray()
  toppings?: string[];
}

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 1, description: 'User ID (optional, for authenticated users)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiProperty({ example: 'John Doe', description: 'Customer full name (max 100 characters)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @ApiProperty({ example: '0912345678', description: 'Customer phone number (8-20 characters)' })
  @IsString()
  @Matches(/^[0-9+\-\s()]{8,20}$/)
  phone: string;

  @ApiPropertyOptional({
    example: '123 Nguyen Trai, District 1',
    description: 'Delivery address (max 255 characters)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiProperty({
    description: 'List of order items (at least 1 item required)',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
