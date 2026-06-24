import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorApplication } from './entities/tutor-application.entity';
import { CreateTutorApplicationDto } from './dto/create-tutor-application.dto';

@Injectable()
export class TutorApplicationService {
  constructor(
    @InjectRepository(TutorApplication)
    private readonly tutorApplicationRepository: Repository<TutorApplication>,
  ) {}

  async create(
    userId: string,
    dto: CreateTutorApplicationDto,
  ): Promise<TutorApplication> {
    const existing = await this.tutorApplicationRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException(
        'You have already submitted a tutor application',
      );
    }

    const application = this.tutorApplicationRepository.create({
      userId,
      motivation: dto.motivation,
      // status defaults to PENDING via the entity column definition
    });

    return this.tutorApplicationRepository.save(application);
  }

  async findByUserId(userId: string): Promise<TutorApplication> {
    const application = await this.tutorApplicationRepository.findOne({
      where: { userId },
    });

    if (!application) {
      throw new NotFoundException('No tutor application found for this user');
    }

    return application;
  }
}