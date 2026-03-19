import { IsEmail, IsNotEmpty, IsOptional, IsIn, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Password (minimum 6 characters)' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'customer',
    enum: ['admin', 'customer'],
    description: 'User role (default: customer)',
  })
  @IsOptional()
  @IsIn(['admin', 'customer'])
  role?: 'admin' | 'customer';
}
