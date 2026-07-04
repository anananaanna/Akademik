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
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Progress } from './entities/progress.entity';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // POST /api/v1/progress
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProgressDto,
  ): Promise<Progress> {
    return this.progressService.create(userId, dto);
  }

  // GET /api/v1/progress/my-progress — student view
  // Declared before :id patterns to prevent route capture
  @Get('my-progress')
  async findMyProgress(
    @CurrentUser('id') studentId: string,
  ): Promise<Progress[]> {
    return this.progressService.findMyProgress(studentId);
  }

  // GET /api/v1/progress/tutor-progress — tutor view
  @Get('tutor-progress')
  async findTutorProgress(
    @CurrentUser('id') userId: string,
  ): Promise<Progress[]> {
    return this.progressService.findTutorProgress(userId);
  }

  // GET /api/v1/progress/booking/:bookingId
  @Get('booking/:bookingId')
  async findByBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser('id') userId: string,
  ): Promise<Progress> {
    return this.progressService.findByBooking(bookingId, userId);
  }

  // PATCH /api/v1/progress/:id
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProgressDto,
  ): Promise<Progress> {
    return this.progressService.update(id, userId, dto);
  }
}