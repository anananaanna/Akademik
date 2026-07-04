import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { TutorProfile } from '../tutor-profile/entities/tutor-profile.entity';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,

    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(TutorProfile)
    private readonly tutorProfileRepository: Repository<TutorProfile>,
  ) {}

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async resolveBooking(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with id "${bookingId}" not found`,
      );
    }

    return booking;
  }

  private async resolveTutorProfile(
    userId: string,
  ): Promise<TutorProfile | null> {
    return this.tutorProfileRepository.findOne({ where: { userId } });
  }

  /**
   * Asserts the caller is the tutor on the booking.
   * Used for create and update — student cannot write progress entries.
   */
  private async assertTutorOwnership(
    booking: Booking,
    userId: string,
  ): Promise<void> {
    const tutorProfile = await this.resolveTutorProfile(userId);

    const isTutor =
      tutorProfile !== null &&
      booking.tutorProfileId === tutorProfile.id;

    if (!isTutor) {
      throw new ForbiddenException(
        'Only the tutor who owns this booking can manage progress entries',
      );
    }
  }

  /**
   * Asserts the caller is either the tutor or the student on the booking.
   * Used for read endpoints.
   */
  private async assertBookingAccess(
    booking: Booking,
    userId: string,
  ): Promise<void> {
    const tutorProfile = await this.resolveTutorProfile(userId);

    const isTutor =
      tutorProfile !== null &&
      booking.tutorProfileId === tutorProfile.id;

    const isStudent = booking.studentId === userId;

    if (!isTutor && !isStudent) {
      throw new ForbiddenException(
        'You do not have permission to access this progress entry',
      );
    }
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateProgressDto): Promise<Progress> {
    const booking = await this.resolveBooking(dto.bookingId);

    // Rule 1 — Only the tutor can create progress entries
    await this.assertTutorOwnership(booking, userId);

    // Rule 2 — Booking must be COMPLETED
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'Progress entries can only be created for completed bookings',
      );
    }

    // Rule 3 — One progress entry per booking
    const existing = await this.progressRepository.findOne({
      where: { bookingId: dto.bookingId },
    });

    if (existing) {
      throw new ConflictException(
        'A progress entry for this booking already exists',
      );
    }

    const progress = this.progressRepository.create({
      bookingId: dto.bookingId,
      tutorProfileId: booking.tutorProfileId,
      studentId: booking.studentId,
      topicsCovered: dto.topicsCovered,
      homeworkAssigned: dto.homeworkAssigned,
      tutorNotes: dto.tutorNotes,
    });

    return this.progressRepository.save(progress);
  }

  // ─── Find by booking ──────────────────────────────────────────────────────

  async findByBooking(bookingId: string, userId: string): Promise<Progress> {
    const booking = await this.resolveBooking(bookingId);

    await this.assertBookingAccess(booking, userId);

    const progress = await this.progressRepository.findOne({
      where: { bookingId },
    });

    if (!progress) {
      throw new NotFoundException(
        'No progress entry found for this booking',
      );
    }

    return progress;
  }

  // ─── Find my progress (student view) ─────────────────────────────────────

  async findMyProgress(studentId: string): Promise<Progress[]> {
    return this.progressRepository.find({
      where: { studentId },
      relations: ['booking', 'tutorProfile'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Find tutor progress (tutor view) ────────────────────────────────────

  async findTutorProgress(userId: string): Promise<Progress[]> {
    const tutorProfile = await this.resolveTutorProfile(userId);

    if (!tutorProfile) {
      throw new NotFoundException(
        'You do not have a tutor profile',
      );
    }

    return this.progressRepository.find({
      where: { tutorProfileId: tutorProfile.id },
      relations: ['booking', 'student'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(
    id: string,
    userId: string,
    dto: UpdateProgressDto,
  ): Promise<Progress> {
    const progress = await this.progressRepository.findOne({
      where: { id },
    });

    if (!progress) {
      throw new NotFoundException(
        `Progress entry with id "${id}" not found`,
      );
    }

    const booking = await this.resolveBooking(progress.bookingId);

    await this.assertTutorOwnership(booking, userId);

    Object.assign(progress, dto);

    return this.progressRepository.save(progress);
  }
}