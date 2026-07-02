import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSlot } from './entities/time-slot.entity';
import { TimeSlotsService } from './time-slots.service';
import { TimeSlotsController } from './time-slots.controller';
import { AuthModule } from '../auth/auth.module';
import { TutorProfile } from '../tutor-profile/entities/tutor-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeSlot, TutorProfile]),
    AuthModule,
  ],
  controllers: [TimeSlotsController],
  providers: [TimeSlotsService],
  exports: [TimeSlotsService],
})
export class TimeSlotsModule {}