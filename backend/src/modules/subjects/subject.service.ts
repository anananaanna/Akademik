import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async findAll(): Promise<Subject[]> {
    return this.subjectRepository.find({
      order: { name: 'ASC' },
    });
  }

  async create(dto: CreateSubjectDto): Promise<Subject> {
    const existing = await this.subjectRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('A subject with this name already exists');
    }

    const subject = this.subjectRepository.create(dto);
    return this.subjectRepository.save(subject);
  }
}