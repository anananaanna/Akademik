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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Review } from './entities/review.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // POST /api/v1/reviews — JWT required
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') studentId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.create(studentId, dto);
  }

  // GET /api/v1/reviews/tutor/:tutorProfileId — public
  // Declared before :id to prevent "tutor" being captured as a UUID param
  @Get('tutor/:tutorProfileId')
  async findByTutorProfile(
    @Param('tutorProfileId', ParseUUIDPipe) tutorProfileId: string,
  ): Promise<Review[]> {
    return this.reviewsService.findByTutorProfile(tutorProfileId);
  }

  // GET /api/v1/reviews/my-reviews — JWT required
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  async findMyReviews(
    @CurrentUser('id') studentId: string,
  ): Promise<Review[]> {
    return this.reviewsService.findMyReviews(studentId);
  }

  // PATCH /api/v1/reviews/:id — JWT required
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') studentId: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.update(id, studentId, dto);
  }

  // DELETE /api/v1/reviews/:id — JWT required
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') studentId: string,
  ): Promise<void> {
    return this.reviewsService.remove(id, studentId);
  }
}