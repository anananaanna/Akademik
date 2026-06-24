import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorApplication } from './entities/tutor-application.entity';
import { TutorApplicationService } from './tutor-application.service';
import { TutorApplicationController } from './tutor-application.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorApplication]),
    AuthModule, // provides JwtAuthGuard and the underlying JWT strategy
  ],
  controllers: [TutorApplicationController],
  providers: [TutorApplicationService],
  exports: [TutorApplicationService],
})
export class TutorApplicationModule {}