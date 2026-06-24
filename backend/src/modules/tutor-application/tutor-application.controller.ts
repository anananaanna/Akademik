import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TutorApplicationService } from './tutor-application.service';
import { CreateTutorApplicationDto } from './dto/create-tutor-application.dto';
import { TutorApplication } from './entities/tutor-application.entity';
import { User } from '../users/entities/user.entity';

@Controller('tutor-applications')
@UseGuards(JwtAuthGuard) // applies to every route in this controller
export class TutorApplicationController {
  constructor(
    private readonly tutorApplicationService: TutorApplicationService,
  ) {}

  // POST /api/v1/tutor-applications
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTutorApplicationDto,
  ): Promise<TutorApplication> {
    return this.tutorApplicationService.create(userId, dto);
  }

  // GET /api/v1/tutor-applications/me
  @Get('me')
  async findMine(@CurrentUser('id') userId: string): Promise<TutorApplication> {
    return this.tutorApplicationService.findByUserId(userId);
  }
}