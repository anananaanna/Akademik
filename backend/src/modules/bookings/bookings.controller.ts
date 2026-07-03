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
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Booking } from './entities/booking.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // POST /api/v1/bookings
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ): Promise<Booking> {
    return this.bookingsService.create(userId, dto);
  }

  // GET /api/v1/bookings/my-bookings
  // Declared before :id to prevent "my-bookings" being captured as a UUID param
  @Get('my-bookings')
  async findMyBookings(
    @CurrentUser('id') userId: string,
  ): Promise<Booking[]> {
    return this.bookingsService.findMyBookings(userId);
  }

  // GET /api/v1/bookings/tutor-bookings
  @Get('tutor-bookings')
  async findTutorBookings(
    @CurrentUser('id') userId: string,
  ): Promise<Booking[]> {
    return this.bookingsService.findTutorBookings(userId);
  }

  // GET /api/v1/bookings/:id
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Booking> {
    return this.bookingsService.findOne(id, userId);
  }

  // PATCH /api/v1/bookings/:id/cancel
  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Booking> {
    return this.bookingsService.cancel(id, userId);
  }

  // PATCH /api/v1/bookings/:id/complete
  @Patch(':id/complete')
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Booking> {
    return this.bookingsService.complete(id, userId);
  }
}