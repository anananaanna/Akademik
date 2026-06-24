import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SubjectsService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { Subject } from './entities/subject.entity';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  // GET /api/v1/subjects — public, no auth required per spec
  @Get()
  async findAll(): Promise<Subject[]> {
    return this.subjectsService.findAll();
  }

  // POST /api/v1/subjects — public, no auth required per spec
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSubjectDto): Promise<Subject> {
    return this.subjectsService.create(dto);
  }
}