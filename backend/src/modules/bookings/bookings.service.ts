import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';
import { TimeSlot, TimeSlotStatus } from '../time-slots/entities/time-slot.entity';
import { TutorProfile } from '../tutor-profile/entities/tutor-profile.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(Advertisement)
    private readonly advertisementRepository: Repository<Advertisement>,

    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,

    @InjectRepository(TutorProfile)
    private readonly tutorProfileRepository: Repository<TutorProfile>,
  ) {}

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Central booking lookup with relations loaded.
   * Used by findOne, cancel, and complete to avoid repeating the same query.
   */
  private async findBookingById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['timeSlot', 'advertisement', 'tutorProfile', 'student'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id "${id}" not found`);
    }

    return booking;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  /**
   * Structured for easy transaction wrapping:
   * All reads happen first, all validation runs next,
   * then writes are grouped at the end.
   * To wrap in a transaction later, inject DataSource and use
   * queryRunner.manager instead of the injected repositories.
   */
  async create(studentId: string, dto: CreateBookingDto): Promise<Booking> {
    // ── Step 1: Load all required entities ───────────────────────────────────

    const advertisement = await this.advertisementRepository.findOne({
      where: { id: dto.advertisementId },
    });

    if (!advertisement) {
      throw new NotFoundException(
        `Advertisement with id "${dto.advertisementId}" not found`,
      );
    }

    const timeSlot = await this.timeSlotRepository.findOne({
      where: { id: dto.timeSlotId },
    });

    if (!timeSlot) {
      throw new NotFoundException(
        `Time slot with id "${dto.timeSlotId}" not found`,
      );
    }

    // ── Step 2: Validate business rules ──────────────────────────────────────

    // Rule 1 — Slot must be available
    if (timeSlot.status !== TimeSlotStatus.AVAILABLE) {
      throw new ConflictException(
        'This time slot is no longer available',
      );
    }

    // Rule 2 — Slot must belong to the same tutor as the advertisement
    if (timeSlot.tutorProfileId !== advertisement.tutorProfileId) {
      throw new BadRequestException(
        'The selected time slot does not belong to the tutor of this advertisement',
      );
    }

    // Rule 3 — Student cannot book their own advertisement
    const tutorProfile = await this.tutorProfileRepository.findOne({
      where: { id: advertisement.tutorProfileId },
    });

    if (tutorProfile && tutorProfile.userId === studentId) {
      throw new BadRequestException(
        'You cannot book your own advertisement',
      );
    }

    // ── Step 3: Writes — booking first, then slot update ─────────────────────

    const booking = this.bookingRepository.create({
      studentId,
      tutorProfileId: advertisement.tutorProfileId,
      advertisementId: advertisement.id,
      timeSlotId: timeSlot.id,
      totalPrice: advertisement.hourlyRate,
      notes: dto.notes,
      status: BookingStatus.CONFIRMED,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Update slot status immediately after booking is saved.
    // Grouped here so a future transaction wrapper encloses both writes.
    await this.timeSlotRepository.update(timeSlot.id, {
      status: TimeSlotStatus.BOOKED,
    });

    return savedBooking;
  }

  // ─── Find my bookings (student) ───────────────────────────────────────────

  async findMyBookings(studentId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { studentId },
      relations: ['timeSlot', 'advertisement', 'tutorProfile'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Find tutor bookings ──────────────────────────────────────────────────

  async findTutorBookings(userId: string): Promise<Booking[]> {
    const tutorProfile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (!tutorProfile) {
      throw new NotFoundException(
        'You do not have a tutor profile',
      );
    }

    return this.bookingRepository.find({
      where: { tutorProfileId: tutorProfile.id },
      relations: ['timeSlot', 'advertisement', 'student'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Find one ─────────────────────────────────────────────────────────────

  async findOne(id: string, userId: string): Promise<Booking> {
    const booking = await this.findBookingById(id);

    const tutorProfile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    const isStudent = booking.studentId === userId;
    const isTutor = tutorProfile && booking.tutorProfileId === tutorProfile.id;

    if (!isStudent && !isTutor) {
      throw new ForbiddenException(
        'You do not have permission to view this booking',
      );
    }

    return booking;
  }

  // ─── Cancel ───────────────────────────────────────────────────────────────

  async cancel(id: string, userId: string): Promise<Booking> {
    const booking = await this.findBookingById(id);

    // Ownership — only the student who made the booking can cancel it
    if (booking.studentId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to cancel this booking',
      );
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'A completed booking cannot be cancelled',
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException(
        'This booking is already cancelled',
      );
    }

    // Writes — cancel booking then release slot
    booking.status = BookingStatus.CANCELLED;
    const savedBooking = await this.bookingRepository.save(booking);

    await this.timeSlotRepository.update(booking.timeSlotId, {
      status: TimeSlotStatus.AVAILABLE,
    });

    return savedBooking;
  }

  // ─── Complete ─────────────────────────────────────────────────────────────

  async complete(id: string, userId: string): Promise<Booking> {
    const booking = await this.findBookingById(id);

    // Ownership — only the tutor can mark a session as completed
    const tutorProfile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (!tutorProfile || booking.tutorProfileId !== tutorProfile.id) {
      throw new ForbiddenException(
        'You do not have permission to complete this booking',
      );
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        'Only a confirmed booking can be marked as completed',
      );
    }

    booking.status = BookingStatus.COMPLETED;
    return this.bookingRepository.save(booking);
  }
}