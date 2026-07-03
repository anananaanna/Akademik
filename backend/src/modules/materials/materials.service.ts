import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { TutorProfile } from '../tutor-profile/entities/tutor-profile.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,

    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(TutorProfile)
    private readonly tutorProfileRepository: Repository<TutorProfile>,
  ) {}

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Loads a booking and verifies it exists.
   * Does not enforce ownership — callers do that themselves.
   */
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

  /**
   * Resolves the tutor profile for the given userId.
   * Returns null rather than throwing if not found —
   * callers decide whether a missing profile is an error.
   */
  private async resolveTutorProfile(
    userId: string,
  ): Promise<TutorProfile | null> {
    return this.tutorProfileRepository.findOne({ where: { userId } });
  }

  /**
   * Checks that the caller is either the tutor or the student on the booking.
   * Throws 403 if neither.
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
        'You do not have permission to access materials for this booking',
      );
    }
  }

  /**
   * Checks that the caller is the tutor on the booking.
   * Used for create, update, and delete — student cannot modify materials.
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
        'Only the tutor who owns this booking can manage its materials',
      );
    }
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(
    bookingId: string,
    userId: string,
    dto: CreateMaterialDto,
  ): Promise<Material> {
    const booking = await this.resolveBooking(bookingId);

    await this.assertTutorOwnership(booking, userId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException(
        'Materials cannot be added to a cancelled booking',
      );
    }

    const material = this.materialRepository.create({
      ...dto,
      bookingId,
      uploadedByUserId: userId,
    });

    return this.materialRepository.save(material);
  }

  // ─── Find by booking ──────────────────────────────────────────────────────

  async findByBooking(
    bookingId: string,
    userId: string,
  ): Promise<Material[]> {
    const booking = await this.resolveBooking(bookingId);

    await this.assertBookingAccess(booking, userId);

    return this.materialRepository.find({
      where: { bookingId },
      order: { createdAt: 'ASC' },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(
    id: string,
    userId: string,
    dto: UpdateMaterialDto,
  ): Promise<Material> {
    const material = await this.materialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`Material with id "${id}" not found`);
    }

    const booking = await this.resolveBooking(material.bookingId);

    await this.assertTutorOwnership(booking, userId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException(
        'Materials on a cancelled booking cannot be modified',
      );
    }

    Object.assign(material, dto);

    return this.materialRepository.save(material);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async remove(id: string, userId: string): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`Material with id "${id}" not found`);
    }

    const booking = await this.resolveBooking(material.bookingId);

    await this.assertTutorOwnership(booking, userId);

    await this.materialRepository.remove(material);
  }
}