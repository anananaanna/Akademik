import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorProfile } from './entities/tutor-profile.entity';
import { TutorProfileService } from './tutor-profile.service';
import { TutorProfileController } from './tutor-profile.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorProfile]),
    AuthModule,
  ],
  controllers: [TutorProfileController],
  providers: [TutorProfileService],
  exports: [TutorProfileService],
})
export class TutorProfileModule {}