import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { JwtUserPayload } from './decorators/current-user.decorator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password: _pw, ...rest } = user;
    return rest as Omit<User, 'password'>;
  }

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    return this.usersService.create({ ...registerDto, role: 'customer' });
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    user: Omit<User, 'password'>;
  }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtUserPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }
}