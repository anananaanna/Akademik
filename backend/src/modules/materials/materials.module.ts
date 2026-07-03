import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { AuthModule } from '../auth/auth.module';
import { Booking } from '../bookings/entities/booking.entity';
import { TutorProfile } from '../tutor-profile/entities/tutor-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material, Booking, TutorProfile]),
    AuthModule,
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}