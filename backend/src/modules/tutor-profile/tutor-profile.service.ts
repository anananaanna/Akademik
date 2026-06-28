import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorProfile } from './entities/tutor-profile.entity';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';

@Injectable()
export class TutorProfileService {
  constructor(
    @InjectRepository(TutorProfile)
    private readonly tutorProfileRepository: Repository<TutorProfile>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(
    userId: string,
    dto: CreateTutorProfileDto,
  ): Promise<TutorProfile> {
    const existing = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('You already have a tutor profile');
    }

    const profile = this.tutorProfileRepository.create({
      ...dto,
      userId,
    });

    return this.tutorProfileRepository.save(profile);
  }

  // ─── Find by userId ───────────────────────────────────────────────────────

  async findByUserId(userId: string): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return profile;
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(
    userId: string,
    dto: UpdateTutorProfileDto,
  ): Promise<TutorProfile> {
    const profile = await this.findByUserId(userId);

    // Merge only the fields the caller sent — undefined fields are untouched
    Object.assign(profile, dto);

    return this.tutorProfileRepository.save(profile);
  }
}