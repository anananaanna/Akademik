import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReviewService, Review } from '../../core/services/review.service';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-reviews.component.html',
  styleUrl: './my-reviews.component.scss',
})
export class MyReviewsComponent implements OnInit, OnDestroy {
  reviews: Review[] = [];
  isLoading = true;
  errorMessage = '';
  editingReviewId = '';
  isSubmitting = false;
  deletingId = '';

  editForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private fb: FormBuilder,
  ) {
    this.editForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [''],
    });
  }

  ngOnInit(): void {
    this.reviewService.getMyReviews()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: reviews => {
          this.reviews = reviews;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load reviews.';
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startEdit(review: Review): void {
    this.editingReviewId = review.id;
    this.editForm.patchValue({
      rating: review.rating,
      comment: review.comment ?? '',
    });
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editingReviewId = '';
    this.errorMessage = '';
  }

  submitEdit(reviewId: string): void {
    if (this.editForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const { rating, comment } = this.editForm.value;
    const payload = {
      rating: Number(rating),
      ...(comment?.trim() ? { comment: comment.trim() } : { comment: '' }),
    };

    this.reviewService.update(reviewId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updated => {
          this.reviews = this.reviews.map(r => r.id === reviewId ? updated : r);
          this.isSubmitting = false;
          this.editingReviewId = '';
        },
        error: err => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.message ?? 'Failed to update review.';
        },
      });
  }

  deleteReview(id: string): void {
    this.deletingId = id;
    this.reviewService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== id);
          this.deletingId = '';
        },
        error: err => {
          this.deletingId = '';
          this.errorMessage = err?.error?.message ?? 'Failed to delete review.';
        },
      });
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}