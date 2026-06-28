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

@Entity('tutor_profiles')
export class TutorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // unique: true enforces one profile per user at the DB level
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({
    name: 'hourly_rate',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  hourlyRate: number;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 255, nullable: true })
  education: string;

  @Column({ name: 'experience_years', type: 'int', nullable: true })
  experienceYears: number;

  @Column({ name: 'profile_photo_url', length: 500, nullable: true })
  profilePhotoUrl: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}