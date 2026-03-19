import { ApiPropertyOptional } from '@nestjs/swagger';

// Re-create with ApiPropertyOptional for proper Swagger documentation
export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Milk Tea', description: 'Category name (max 100 characters)' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Delicious milk tea drinks',
    description: 'Category description (max 500 characters)',
  })
  description?: string;
}
