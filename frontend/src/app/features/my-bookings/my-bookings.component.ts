import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, catchError, EMPTY } from 'rxjs';
import { BookingService, Booking } from '../../core/services/booking.service';
import { ReviewService, Review } from '../../core/services/review.service';
import { MaterialService, Material } from '../../core/services/material.service';
import { ProgressService, Progress } from '../../core/services/progress.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss',
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  reviews: Review[] = [];
  isLoading = true;
  errorMessage = '';
  cancellingId = '';
  reviewingBookingId = '';
  submittingReview = false;
  deletingReviewId = '';

  materialsMap: Record<string, Material[]> = {};
  expandedMaterialsFor = '';
  loadingMaterialsFor = '';

  progressMap: Record<string, Progress | null> = {};
  expandedProgressFor = '';
  loadingProgressFor = '';

  reviewForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private reviewService: ReviewService,
    private materialService: MaterialService,
    private progressService: ProgressService,
    private fb: FormBuilder,
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [''],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.bookingService.getMyBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: bookings => {
          this.bookings = bookings;
          this.loadReviews();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load bookings.';
        },
      });
  }

  private loadReviews(): void {
    this.reviewService.getMyReviews()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: reviews => {
          this.reviews = reviews;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  toggleMaterials(bookingId: string): void {
    if (this.expandedMaterialsFor === bookingId) {
      this.expandedMaterialsFor = '';
      return;
    }
    this.expandedMaterialsFor = bookingId;
    if (!this.materialsMap[bookingId]) {
      this.loadingMaterialsFor = bookingId;
      this.materialService.getByBooking(bookingId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: materials => {
            this.materialsMap[bookingId] = materials;
            this.loadingMaterialsFor = '';
          },
          error: () => {
            this.materialsMap[bookingId] = [];
            this.loadingMaterialsFor = '';
          },
        });
    }
  }

  toggleProgress(bookingId: string): void {
    if (this.expandedProgressFor === bookingId) {
      this.expandedProgressFor = '';
      return;
    }
    this.expandedProgressFor = bookingId;
    if (!(bookingId in this.progressMap)) {
      this.loadingProgressFor = bookingId;
      this.progressService.getByBooking(bookingId).pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.progressMap[bookingId] = null;
          this.loadingProgressFor = '';
          return EMPTY;
        }),
      ).subscribe(progress => {
        this.progressMap[bookingId] = progress;
        this.loadingProgressFor = '';
      });
    }
  }

  getReviewForBooking(bookingId: string): Review | undefined {
    return this.reviews.find(r => r.bookingId === bookingId);
  }

  canReview(booking: Booking): boolean {
    return booking.status === 'COMPLETED' && !this.getReviewForBooking(booking.id);
  }

  startReview(bookingId: string): void {
    this.reviewingBookingId = bookingId;
    this.reviewForm.reset({ rating: 5, comment: '' });
    this.errorMessage = '';
  }

  cancelReview(): void {
    this.reviewingBookingId = '';
    this.errorMessage = '';
  }

  submitReview(bookingId: string): void {
    if (this.reviewForm.invalid) return;
    this.submittingReview = true;
    this.errorMessage = '';
    const { rating, comment } = this.reviewForm.value;
    const payload = {
      bookingId,
      rating: Number(rating),
      ...(comment?.trim() ? { comment: comment.trim() } : {}),
    };
    this.reviewService.create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: review => {
          this.reviews = [...this.reviews, review];
          this.submittingReview = false;
          this.reviewingBookingId = '';
        },
        error: err => {
          this.submittingReview = false;
          this.errorMessage = err?.error?.message ?? 'Failed to submit review.';
        },
      });
  }

  deleteReview(reviewId: string): void {
    this.deletingReviewId = reviewId;
    this.reviewService.delete(reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== reviewId);
          this.deletingReviewId = '';
        },
        error: err => {
          this.deletingReviewId = '';
          this.errorMessage = err?.error?.message ?? 'Failed to delete review.';
        },
      });
  }

  cancelBooking(id: string): void {
    this.cancellingId = id;
    this.bookingService.cancel(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updated => {
          this.bookings = this.bookings.map(b => b.id === id ? updated : b);
          this.cancellingId = '';
        },
        error: err => {
          this.cancellingId = '';
          this.errorMessage = err?.error?.message ?? 'Failed to cancel booking.';
        },
      });
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  formatDuration(start: string, end: string): string {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    return diff >= 60 ? `${diff / 60}h` : `${diff}min`;
  }

  canCancel(booking: Booking): boolean {
    return booking.status === 'CONFIRMED';
  }

  hasMaterials(booking: Booking): boolean {
    return booking.status !== 'CANCELLED';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}