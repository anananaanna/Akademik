import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlot, TimeSlotStatus } from './entities/time-slot.entity';
import { TutorProfile } from '../tutor-profile/entities/tutor-profile.entity';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';

@Injectable()
export class TimeSlotsService {
  constructor(
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,

    @InjectRepository(TutorProfile)
    private readonly tutorProfileRepository: Repository<TutorProfile>,
  ) {}

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async resolveTutorProfile(userId: string): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(
        'You do not have a tutor profile. Please create one before managing time slots.',
      );
    }

    return profile;
  }

  private validateTimeRange(startTime: string | Date, endTime: string | Date): void {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('startTime and endTime must be valid dates');
    }

    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }

    if (start < new Date()) {
      throw new BadRequestException('startTime must be in the future');
    }
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateTimeSlotDto): Promise<TimeSlot> {
    const tutorProfile = await this.resolveTutorProfile(userId);

    this.validateTimeRange(dto.startTime, dto.endTime);

    const slot = this.timeSlotRepository.create({
      tutorProfileId: tutorProfile.id,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      notes: dto.notes,
    });

    return this.timeSlotRepository.save(slot);
  }

  // ─── Find mine (tutor's own slots) ───────────────────────────────────────

  async findMine(userId: string): Promise<TimeSlot[]> {
    const tutorProfile = await this.resolveTutorProfile(userId);

    return this.timeSlotRepository.find({
      where: { tutorProfileId: tutorProfile.id },
      order: { startTime: 'ASC' },
    });
  }

  // ─── Find available slots for a tutor profile (public) ───────────────────

  async findAvailableByTutorProfile(tutorProfileId: string): Promise<TimeSlot[]> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { id: tutorProfileId },
    });

    if (!profile) {
      throw new NotFoundException(
        `Tutor profile with id "${tutorProfileId}" not found`,
      );
    }

    return this.timeSlotRepository.find({
      where: {
        tutorProfileId,
        status: TimeSlotStatus.AVAILABLE,
      },
      order: { startTime: 'ASC' },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(
    id: string,
    userId: string,
    dto: UpdateTimeSlotDto,
  ): Promise<TimeSlot> {
    const slot = await this.timeSlotRepository.findOne({ where: { id } });

    if (!slot) {
      throw new NotFoundException(`Time slot with id "${id}" not found`);
    }

    const tutorProfile = await this.resolveTutorProfile(userId);

    if (slot.tutorProfileId !== tutorProfile.id) {
      throw new ForbiddenException(
        'You do not have permission to update this time slot',
      );
    }

    if (slot.status === TimeSlotStatus.BOOKED) {
      throw new BadRequestException(
        'A booked time slot cannot be modified. Cancel the booking first.',
      );
    }

    // Validate time range if either time field is being updated
    const newStart = dto.startTime ?? slot.startTime;
    const newEnd = dto.endTime ?? slot.endTime;

    if (dto.startTime || dto.endTime) {
      this.validateTimeRange(newStart, newEnd);
    }

    Object.assign(slot, {
      ...(dto.startTime && { startTime: new Date(dto.startTime) }),
      ...(dto.endTime && { endTime: new Date(dto.endTime) }),
      ...(dto.status && { status: dto.status }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    });

    return this.timeSlotRepository.save(slot);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async remove(id: string, userId: string): Promise<void> {
    const slot = await this.timeSlotRepository.findOne({ where: { id } });

    if (!slot) {
      throw new NotFoundException(`Time slot with id "${id}" not found`);
    }

    const tutorProfile = await this.resolveTutorProfile(userId);

    if (slot.tutorProfileId !== tutorProfile.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this time slot',
      );
    }

    if (slot.status === TimeSlotStatus.BOOKED) {
      throw new BadRequestException(
        'A booked time slot cannot be deleted. Cancel the booking first.',
      );
    }

    await this.timeSlotRepository.remove(slot);
  }
}