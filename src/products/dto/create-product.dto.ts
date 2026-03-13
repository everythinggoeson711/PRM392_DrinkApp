import { IsInt, IsNotEmpty, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Brown Sugar Milk Tea', maxLength: 150 })
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 45000, minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/products/1710311111111-12345.png',
    maxLength: 500,
  })
  @IsOptional()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  categoryId: number;
}
