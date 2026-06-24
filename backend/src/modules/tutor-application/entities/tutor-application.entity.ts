import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TutorApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('tutor_applications')
export class TutorApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // unique: true enforces "one user → one application" at the DB level
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  motivation: string;

  @Column({
    type: 'enum',
    enum: TutorApplicationStatus,
    default: TutorApplicationStatus.PENDING,
  })
  status: TutorApplicationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}