import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { TypeOrmConfigService } from './config/typeorm.config';

// ── Implemented modules ───────────────────────────────────────────────────────
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { TutorApplicationModule } from './modules/tutor-application/tutor-application.module';
import { TutorProfileModule } from './modules/tutor-profile/tutor-profile.module';

// ── Pending modules (uncomment as each is implemented) ───────────────────────
// import { AdvertisementsModule } from './modules/advertisements/advertisements.module';
// import { TimeSlotsModule } from './modules/time-slots/time-slots.module';
// import { BookingsModule } from './modules/bookings/bookings.module';
// import { MaterialsModule } from './modules/materials/materials.module';
// import { ReviewsModule } from './modules/reviews/reviews.module';
// import { ProgressModule } from './modules/progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    AuthModule,
    UsersModule,
    SubjectsModule,
    TutorApplicationModule,
    TutorProfileModule,
  ],
})
export class AppModule {}