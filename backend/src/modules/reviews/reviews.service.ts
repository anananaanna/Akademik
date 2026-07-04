import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { TutorProfile } from '../tutor-profile/entities/tutor-profile.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(TutorProfile)
    private readonly tutorProfileRepository: Repository<TutorProfile>,
  ) {}

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async resolveBooking(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with id "${bookingId}" not found`,
      );
    }

    return booking;
  }

  private async resolveReview(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with id "${id}" not found`);
    }

    return review;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(studentId: string, dto: CreateReviewDto): Promise<Review> {
    const booking = await this.resolveBooking(dto.bookingId);

    // Rule 1 — Only the student who owns the booking can review it
    if (booking.studentId !== studentId) {
      throw new ForbiddenException(
        'You can only review bookings that belong to you',
      );
    }

    // Rule 2 — Booking must be COMPLETED
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'You can only review a completed booking',
      );
    }

    // Rule 3 — Student cannot review themselves
    // (guard against a user who is both student and tutor on the same booking)
    const tutorProfile = await this.tutorProfileRepository.findOne({
      where: { id: booking.tutorProfileId },
    });

    if (tutorProfile && tutorProfile.userId === studentId) {
      throw new BadRequestException(
        'You cannot review your own booking',
      );
    }

    // Rule 4 — One review per booking
    const existing = await this.reviewRepository.findOne({
      where: { bookingId: dto.bookingId },
    });

    if (existing) {
      throw new ConflictException(
        'A review for this booking already exists',
      );
    }

    const review = this.reviewRepository.create({
      bookingId: dto.bookingId,
      studentId,
      tutorProfileId: booking.tutorProfileId,
      rating: dto.rating,
      comment: dto.comment,
    });

    return this.reviewRepository.save(review);
  }

  // ─── Find by tutor profile (public) ──────────────────────────────────────

  async findByTutorProfile(tutorProfileId: string): Promise<Review[]> {
    const tutorProfile = await this.tutorProfileRepository.findOne({
      where: { id: tutorProfileId },
    });

    if (!tutorProfile) {
      throw new NotFoundException(
        `Tutor profile with id "${tutorProfileId}" not found`,
      );
    }

    return this.reviewRepository.find({
      where: { tutorProfileId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Find my reviews (student's own reviews) ─────────────────────────────

  async findMyReviews(studentId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(
    id: string,
    studentId: string,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.resolveReview(id);

    if (review.studentId !== studentId) {
      throw new ForbiddenException(
        'You can only edit your own reviews',
      );
    }

    // Apply updates — only rating and comment are in UpdateReviewDto
    if (dto.rating !== undefined) {
      review.rating = dto.rating;
    }

    if (dto.comment !== undefined) {
      review.comment = dto.comment;
    }

    // Mark as edited if any field actually changed
    review.isEdited = true;

    return this.reviewRepository.save(review);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async remove(id: string, studentId: string): Promise<void> {
    const review = await this.resolveReview(id);

    if (review.studentId !== studentId) {
      throw new ForbiddenException(
        'You can only delete your own reviews',
      );
    }

    await this.reviewRepository.remove(review);
  }
}