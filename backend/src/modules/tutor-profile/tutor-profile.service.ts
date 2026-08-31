import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TutorProfile } from './entities/tutor-profile.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { TutorApplication } from '../tutor-application/entities/tutor-application.entity';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';

@Injectable()
export class TutorProfileService {
  constructor(
    @InjectRepository(TutorProfile)
    private readonly tutorProfileRepository: Repository<TutorProfile>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(TutorApplication)
    private readonly tutorApplicationRepository: Repository<TutorApplication>,
  ) {}

  async create(userId: string, dto: CreateTutorProfileDto): Promise<TutorProfile> {
    const application = await this.tutorApplicationRepository.findOne({
      where: { userId },
    });

    if (!application) {
      throw new ForbiddenException(
        'You must submit a tutor application before creating a tutor profile',
      );
    }

    const existing = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('You already have a tutor profile');
    }

    const profile = this.tutorProfileRepository.create({ ...dto, userId });
    return this.tutorProfileRepository.save(profile);
  }

  async findById(id: string): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { id },
      relations: ['subjects'],
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return profile;
  }

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

  async update(userId: string, dto: UpdateTutorProfileDto): Promise<TutorProfile> {
    const profile = await this.findByUserId(userId);
    Object.assign(profile, dto);
    return this.tutorProfileRepository.save(profile);
  }

  async updateSubjects(userId: string, subjectIds: string[]): Promise<TutorProfile> {
    const profile = await this.findByUserId(userId);

    const subjects = await this.subjectRepository.findBy({ id: In(subjectIds) });

    if (subjects.length !== subjectIds.length) {
      const foundIds = subjects.map((s) => s.id);
      const missing = subjectIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `The following subject IDs do not exist: ${missing.join(', ')}`,
      );
    }

    profile.subjects = subjects;
    return this.tutorProfileRepository.save(profile);
  }
}