import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'User password (min 6 characters)' })
  @IsNotEmpty()
  password: string;
}