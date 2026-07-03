import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TutorProfile } from '../../tutor-profile/entities/tutor-profile.entity';
import { Advertisement } from '../../advertisements/entities/advertisement.entity';
import { TimeSlot } from '../../time-slots/entities/time-slot.entity';

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ─── Student ──────────────────────────────────────────────────────────────

  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  // ─── Tutor profile ────────────────────────────────────────────────────────

  @Column({ name: 'tutor_profile_id' })
  tutorProfileId: string;

  @ManyToOne(() => TutorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutor_profile_id' })
  tutorProfile: TutorProfile;

  // ─── Advertisement ────────────────────────────────────────────────────────
  // SET NULL on delete — booking survives if the ad is removed later.
  // totalPrice snapshot ensures we never lose the agreed price.

  @Column({ name: 'advertisement_id', nullable: true })
  advertisementId: string;

  @ManyToOne(() => Advertisement, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'advertisement_id' })
  advertisement: Advertisement;

  // ─── Time slot ────────────────────────────────────────────────────────────
  // unique: true at the DB level is the hard guarantee against double booking.

  @Column({ name: 'time_slot_id', unique: true })
  timeSlotId: string;

  @OneToOne(() => TimeSlot, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TimeSlot;

  // ─── Booking details ──────────────────────────────────────────────────────

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  // Snapshot of advertisement.hourlyRate at booking time.
  // Preserved even if the tutor changes their rate or deletes the ad.
  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPrice: number;

  @Column({ length: 500, nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}