import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Milk Tea', description: 'Category name (max 100 characters)' })
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Delicious milk tea drinks',
    description: 'Category description (max 500 characters)',
  })
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
