import { UserRole } from '../../users/entities/user.entity';

export class AuthUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export class AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}