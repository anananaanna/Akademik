import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorProfile } from './entities/tutor-profile.entity';
import { TutorProfileService } from './tutor-profile.service';
import { TutorProfileController } from './tutor-profile.controller';
import { AuthModule } from '../auth/auth.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { Subject } from '../subjects/entities/subject.entity';
import { TutorApplication } from '../tutor-application/entities/tutor-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorProfile, Subject, TutorApplication]),
    AuthModule,
    SubjectsModule,
  ],
  controllers: [TutorProfileController],
  providers: [TutorProfileService],
  exports: [TutorProfileService],
})
export class TutorProfileModule {}