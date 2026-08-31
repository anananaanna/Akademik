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

  async create(studentId: string, dto: CreateBookingDto): Promise<Booking> {

    const callerTutorProfile = await this.tutorProfileRepository.findOne({
      where: { userId: studentId },
    });

    if (callerTutorProfile) {
      throw new ForbiddenException(
        'Tutors cannot book lessons',
      );
    }

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

    if (timeSlot.status !== TimeSlotStatus.AVAILABLE) {
      throw new ConflictException(
        'This time slot is no longer available',
      );
    }

    if (timeSlot.tutorProfileId !== advertisement.tutorProfileId) {
      throw new BadRequestException(
        'The selected time slot does not belong to the tutor of this advertisement',
      );
    }

    const tutorProfile = await this.tutorProfileRepository.findOne({
      where: { id: advertisement.tutorProfileId },
    });

    if (tutorProfile && tutorProfile.userId === studentId) {
      throw new BadRequestException(
        'You cannot book your own advertisement',
      );
    }


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

    await this.timeSlotRepository.update(timeSlot.id, {
      status: TimeSlotStatus.BOOKED,
    });

    return savedBooking;
  }


  async findMyBookings(studentId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { studentId },
      relations: ['timeSlot', 'advertisement', 'tutorProfile'],
      order: { createdAt: 'DESC' },
    });
  }

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

  async cancel(id: string, userId: string): Promise<Booking> {
    const booking = await this.findBookingById(id);

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

    booking.status = BookingStatus.CANCELLED;
    const savedBooking = await this.bookingRepository.save(booking);

    await this.timeSlotRepository.update(booking.timeSlotId, {
      status: TimeSlotStatus.AVAILABLE,
    });

    return savedBooking;
  }


  async complete(id: string, userId: string): Promise<Booking> {
    const booking = await this.findBookingById(id);

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