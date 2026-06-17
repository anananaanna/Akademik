import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    try {
      // Hash explicitly before touching the repository.
      // This is the only place a new password enters the database.
      const hashedPassword = await bcrypt.hash(createUserDto.password, SALT_ROUNDS);

      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Explicitly select password since it's excluded by default (select: false)
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  // ─── Password comparison ──────────────────────────────────────────────────

  /**
   * Compare a plain-text password against a stored hash.
   * Lives in the service (not the entity) so it stays alongside
   * the hashing logic and is easily mockable in tests.
   */
  async verifyPassword(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  // ─── Update password (safe, explicit) ────────────────────────────────────

  /**
   * The only correct way to change a user's password.
   *
   * Uses repository.update() with a freshly-hashed value rather than
   * loading the entity and calling save() — this guarantees that only
   * the password column is written and no other field is accidentally
   * touched, and that the hash is always fresh.
   */
  async updatePassword(id: string, newPlainTextPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPlainTextPassword, SALT_ROUNDS);
    await this.userRepository.update(id, { password: hashedPassword });
  }
}