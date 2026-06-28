import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TutorProfileService } from './tutor-profile.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { TutorProfile } from './entities/tutor-profile.entity';

@Controller('tutor-profile')
@UseGuards(JwtAuthGuard)
export class TutorProfileController {
  constructor(private readonly tutorProfileService: TutorProfileService) {}

  // POST /api/v1/tutor-profile
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTutorProfileDto,
  ): Promise<TutorProfile> {
    return this.tutorProfileService.create(userId, dto);
  }

  // GET /api/v1/tutor-profile/me
  @Get('me')
  async findMine(
    @CurrentUser('id') userId: string,
  ): Promise<TutorProfile> {
    return this.tutorProfileService.findByUserId(userId);
  }

  // PATCH /api/v1/tutor-profile/me
  @Patch('me')
  async update(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTutorProfileDto,
  ): Promise<TutorProfile> {
    return this.tutorProfileService.update(userId, dto);
  }
}