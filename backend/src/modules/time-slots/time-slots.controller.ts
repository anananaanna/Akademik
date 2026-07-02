import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TimeSlotsService } from './time-slots.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TimeSlot } from './entities/time-slot.entity';

@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  // POST /api/v1/time-slots — JWT required
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTimeSlotDto,
  ): Promise<TimeSlot> {
    return this.timeSlotsService.create(userId, dto);
  }

  // GET /api/v1/time-slots/mine — JWT required
  // Must be declared before :id to avoid "mine" being captured as a UUID param
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(@CurrentUser('id') userId: string): Promise<TimeSlot[]> {
    return this.timeSlotsService.findMine(userId);
  }

  // GET /api/v1/time-slots/tutor/:tutorProfileId — public
  @Get('tutor/:tutorProfileId')
  async findAvailableByTutor(
    @Param('tutorProfileId', ParseUUIDPipe) tutorProfileId: string,
  ): Promise<TimeSlot[]> {
    return this.timeSlotsService.findAvailableByTutorProfile(tutorProfileId);
  }

  // PATCH /api/v1/time-slots/:id — JWT required
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTimeSlotDto,
  ): Promise<TimeSlot> {
    return this.timeSlotsService.update(id, userId, dto);
  }

  // DELETE /api/v1/time-slots/:id — JWT required
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.timeSlotsService.remove(id, userId);
  }
}