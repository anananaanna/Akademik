import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advertisement, AdvertisementStatus } from './entities/advertisement.entity';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { TutorProfile } from '../tutor-profile/entities/tutor-profile.entity';
import { Subject } from '../subjects/entities/subject.entity';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectRepository(Advertisement)
    private readonly advertisementRepository: Repository<Advertisement>,

    @InjectRepository(TutorProfile)
    private readonly tutorProfileRepository: Repository<TutorProfile>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async resolveTutorProfile(userId: string): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(
        'You do not have a tutor profile. Please create one before posting an advertisement.',
      );
    }

    return profile;
  }

  private async resolveSubject(subjectId: string): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new BadRequestException(
        `Subject with id "${subjectId}" does not exist`,
      );
    }

    return subject;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(
    userId: string,
    dto: CreateAdvertisementDto,
  ): Promise<Advertisement> {
    const tutorProfile = await this.resolveTutorProfile(userId);
    await this.resolveSubject(dto.subjectId);

    const advertisement = this.advertisementRepository.create({
      ...dto,
      tutorProfileId: tutorProfile.id,
    });

    return this.advertisementRepository.save(advertisement);
  }

  // ─── Find all active (public) ─────────────────────────────────────────────

  async findAllActive(): Promise<Advertisement[]> {
    return this.advertisementRepository.find({
      where: { status: AdvertisementStatus.ACTIVE },
      relations: ['tutorProfile', 'subject'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Find one by id (public) ──────────────────────────────────────────────

  async findOne(id: string): Promise<Advertisement> {
    const advertisement = await this.advertisementRepository.findOne({
      where: { id },
      relations: ['tutorProfile', 'subject'],
    });

    if (!advertisement) {
      throw new NotFoundException(`Advertisement with id "${id}" not found`);
    }

    return advertisement;
  }

  // ─── Find mine (tutor's own ads) ──────────────────────────────────────────

  async findMine(userId: string): Promise<Advertisement[]> {
    const tutorProfile = await this.resolveTutorProfile(userId);

    return this.advertisementRepository.find({
      where: { tutorProfileId: tutorProfile.id },
      relations: ['subject'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(
    id: string,
    userId: string,
    dto: UpdateAdvertisementDto,
  ): Promise<Advertisement> {
    const advertisement = await this.findOne(id);
    const tutorProfile = await this.resolveTutorProfile(userId);

    if (advertisement.tutorProfileId !== tutorProfile.id) {
      throw new ForbiddenException(
        'You do not have permission to update this advertisement',
      );
    }

    if (dto.subjectId) {
      await this.resolveSubject(dto.subjectId);
    }

    Object.assign(advertisement, dto);

    return this.advertisementRepository.save(advertisement);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async remove(id: string, userId: string): Promise<void> {
    const advertisement = await this.findOne(id);
    const tutorProfile = await this.resolveTutorProfile(userId);

    if (advertisement.tutorProfileId !== tutorProfile.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this advertisement',
      );
    }

    await this.advertisementRepository.remove(advertisement);
  }
}