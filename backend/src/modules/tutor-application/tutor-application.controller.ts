import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TutorApplicationService } from './tutor-application.service';
import { CreateTutorApplicationDto } from './dto/create-tutor-application.dto';
import { TutorApplication } from './entities/tutor-application.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('tutor-applications')
@UseGuards(JwtAuthGuard)
export class TutorApplicationController {
  constructor(
    private readonly tutorApplicationService: TutorApplicationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTutorApplicationDto,
  ): Promise<TutorApplication> {
    return this.tutorApplicationService.create(userId, dto);
  }

  @Get('me')
  async findMine(@CurrentUser('id') userId: string): Promise<TutorApplication> {
    return this.tutorApplicationService.findByUserId(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<TutorApplication[]> {
    return this.tutorApplicationService.findAll();
  }
}