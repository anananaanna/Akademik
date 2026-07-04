import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { TutorProfile } from '../../tutor-profile/entities/tutor-profile.entity';
import { User } from '../../users/entities/user.entity';

@Entity('progress')
export class Progress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // unique: true enforces one progress entry per booking at the DB level
  @Column({ name: 'booking_id', unique: true })
  bookingId: string;

  @OneToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'tutor_profile_id' })
  tutorProfileId: string;

  @ManyToOne(() => TutorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutor_profile_id' })
  tutorProfile: TutorProfile;

  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'topics_covered', type: 'text' })
  topicsCovered: string;

  @Column({ name: 'homework_assigned', type: 'text', nullable: true })
  homeworkAssigned: string;

  @Column({ name: 'tutor_notes', type: 'text', nullable: true })
  tutorNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}