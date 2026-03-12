import { IsEmail, IsNotEmpty, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['admin', 'customer'])
  role?: 'admin' | 'customer';
}
