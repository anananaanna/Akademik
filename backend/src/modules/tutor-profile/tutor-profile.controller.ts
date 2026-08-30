import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TutorProfileService } from './tutor-profile.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { UpdateTutorSubjectsDto } from './dto/update-tutor-subjects.dto';
import { TutorProfile } from './entities/tutor-profile.entity';

@Controller('tutor-profile')
export class TutorProfileController {
  constructor(private readonly tutorProfileService: TutorProfileService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTutorProfileDto,
  ): Promise<TutorProfile> {
    return this.tutorProfileService.create(userId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMine(
    @CurrentUser('id') userId: string,
  ): Promise<TutorProfile> {
    return this.tutorProfileService.findByUserId(userId);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TutorProfile> {
    return this.tutorProfileService.findById(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTutorProfileDto,
  ): Promise<TutorProfile> {
    return this.tutorProfileService.update(userId, dto);
  }

  @Patch('me/subjects')
  @UseGuards(JwtAuthGuard)
  async updateSubjects(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTutorSubjectsDto,
  ): Promise<TutorProfile> {
    return this.tutorProfileService.updateSubjects(userId, dto.subjectIds);
  }
}