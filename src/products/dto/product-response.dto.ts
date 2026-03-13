import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Brown Sugar Milk Tea' })
  name: string;

  @ApiProperty({ example: 45000 })
  price: number;

  @ApiProperty({
    nullable: true,
    example: 'http://localhost:3000/uploads/products/1710311111111-12345.png',
  })
  imageUrl: string | null;

  @ApiProperty({ nullable: true, example: 1 })
  categoryId: number | null;
}
