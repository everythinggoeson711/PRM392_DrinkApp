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

const SIZE_VALUES = ['S', 'M', 'L'] as const;
const LEVEL_VALUES = ['100%', '70%', '50%', '30%', '0%'] as const;

export class CreateOrderItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsIn(SIZE_VALUES)
  size?: (typeof SIZE_VALUES)[number];

  @IsOptional()
  @IsIn(LEVEL_VALUES)
  sugarLevel?: (typeof LEVEL_VALUES)[number];

  @IsOptional()
  @IsIn(['100%', '70%', '50%', '0%'])
  iceLevel?: '100%' | '70%' | '50%' | '0%';

  @IsOptional()
  @IsArray()
  toppings?: string[];
}

export class CreateOrderDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]{8,20}$/)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
