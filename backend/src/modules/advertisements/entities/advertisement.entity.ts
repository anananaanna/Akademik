import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TutorProfile } from '../../tutor-profile/entities/tutor-profile.entity';
import { Subject } from '../../subjects/entities/subject.entity';

export enum AdvertisementLevel {
  ELEMENTARY = 'ELEMENTARY',
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  UNIVERSITY = 'UNIVERSITY',
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum AdvertisementStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('advertisements')
export class Advertisement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tutor_profile_id' })
  tutorProfileId: string;

  @ManyToOne(() => TutorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutor_profile_id' })
  tutorProfile: TutorProfile;

  @Column({ name: 'subject_id' })
  subjectId: string;

  @ManyToOne(() => Subject, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'hourly_rate',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  hourlyRate: number;

  @Column({
    type: 'enum',
    enum: AdvertisementLevel,
    nullable: true,
  })
  level: AdvertisementLevel;

  @Column({
    type: 'enum',
    enum: AdvertisementStatus,
    default: AdvertisementStatus.ACTIVE,
  })
  status: AdvertisementStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}