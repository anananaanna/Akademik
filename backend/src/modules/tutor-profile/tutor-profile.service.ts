import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TutorProfile } from './entities/tutor-profile.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';

@Injectable()
export class TutorProfileService {
  constructor(
    @InjectRepository(TutorProfile)
    private readonly tutorProfileRepository: Repository<TutorProfile>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
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
      relations: ['subjects'],
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return profile;
  }

  // ─── Update profile fields ────────────────────────────────────────────────

  async update(
    userId: string,
    dto: UpdateTutorProfileDto,
  ): Promise<TutorProfile> {
    const profile = await this.findByUserId(userId);

    // Merge only the fields the caller sent — undefined fields are untouched
    Object.assign(profile, dto);

    return this.tutorProfileRepository.save(profile);
  }

  // ─── Update subjects ──────────────────────────────────────────────────────

  async updateSubjects(
    userId: string,
    subjectIds: string[],
  ): Promise<TutorProfile> {
    const profile = await this.findByUserId(userId);

    // Verify every submitted ID actually exists in the subjects table
    const subjects = await this.subjectRepository.findBy({
      id: In(subjectIds),
    });

    if (subjects.length !== subjectIds.length) {
      const foundIds = subjects.map((s) => s.id);
      const missing = subjectIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `The following subject IDs do not exist: ${missing.join(', ')}`,
      );
    }

    // Replace the entire subjects list — this is a full replace, not an append.
    // The caller sends the complete desired set of subjects each time.
    profile.subjects = subjects;

    return this.tutorProfileRepository.save(profile);
  }
}