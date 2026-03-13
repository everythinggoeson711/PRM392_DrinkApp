import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty({
    example: 'http://localhost:3000/uploads/products/1710311111111-12345.png',
  })
  imageUrl: string;
}
