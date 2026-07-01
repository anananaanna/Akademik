import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advertisement } from './entities/advertisement.entity';
import { AdvertisementsService } from './advertisements.service';
import { AdvertisementsController } from './advertisements.controller';
import { AuthModule } from '../auth/auth.module';
import { TutorProfile } from '../tutor-profile/entities/tutor-profile.entity';
import { Subject } from '../subjects/entities/subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Advertisement, TutorProfile, Subject]),
    AuthModule,
  ],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService],
  exports: [AdvertisementsService],
})
export class AdvertisementsModule {}