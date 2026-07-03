import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { AuthModule } from '../auth/auth.module';
import { Advertisement } from '../advertisements/entities/advertisement.entity';
import { TimeSlot } from '../time-slots/entities/time-slot.entity';
import { TutorProfile } from '../tutor-profile/entities/tutor-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Advertisement, TimeSlot, TutorProfile]),
    AuthModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}