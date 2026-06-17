import { UserRole } from '../entities/user.entity';

/**
 * Internal DTO used by UsersService.create().
 * Not exposed directly as an HTTP request body — use RegisterDto for that.
 */
export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}