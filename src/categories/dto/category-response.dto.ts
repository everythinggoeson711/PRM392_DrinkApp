import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Milk Tea' })
  name: string;

  @ApiPropertyOptional({ example: 'Delicious milk tea drinks' })
  description?: string;

  @ApiPropertyOptional({ example: [] })
  products?: unknown[];
}
