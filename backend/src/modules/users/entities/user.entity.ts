import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/**
 * Pure data model — no lifecycle hooks, no bcrypt logic.
 *
 * Password hashing is handled explicitly in UsersService so that:
 *  - The entity never silently mutates data passed to save()
 *  - Unrelated updates (e.g. firstName change) cannot accidentally
 *    re-hash a loaded password hash
 *  - repository.update() partial updates remain safe to use
 *  - The hashing path is always visible and testable at the service layer
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ select: false }) // Never returned in queries by default
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}