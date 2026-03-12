/* eslint-disable @typescript-eslint/no-require-imports */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const bcrypt = require('bcrypt') as typeof import('bcrypt');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private omitPassword(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...rest } = user;
    return rest as Omit<User, 'password'>;
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const hashed = (await bcrypt.hash(createUserDto.password, 10)) as string;
    const user = this.usersRepository.create({ ...createUserDto, password: hashed });
    const saved = await this.usersRepository.save(user);
    return this.omitPassword(saved);
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find();
    return users.map((u) => this.omitPassword(u));
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return this.omitPassword(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    if (updateUserDto.password) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      updateUserDto.password = (await bcrypt.hash(
        updateUserDto.password,
        10,
      )) as string;
    }

    const updated = await this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });
    return this.omitPassword(updated);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    await this.usersRepository.remove(user);
  }
}
