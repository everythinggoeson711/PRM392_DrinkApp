import { ApiPropertyOptional } from '@nestjs/swagger';

// Re-create with ApiPropertyOptional for proper Swagger documentation
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name of the user' })
  name?: string;

  @ApiPropertyOptional({ example: 'user@example.com', description: 'User email address' })
  email?: string;

  @ApiPropertyOptional({ example: '123456', description: 'Password (minimum 6 characters)' })
  password?: string;

  @ApiPropertyOptional({
    example: 'customer',
    enum: ['admin', 'customer'],
    description: 'User role',
  })
  role?: 'admin' | 'customer';
}
