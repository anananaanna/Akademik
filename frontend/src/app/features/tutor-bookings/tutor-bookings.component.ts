import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, catchError, EMPTY } from 'rxjs';
import { BookingService, Booking } from '../../core/services/booking.service';
import { MaterialService, Material } from '../../core/services/material.service';
import { ProgressService, Progress } from '../../core/services/progress.service';

@Component({
  selector: 'app-tutor-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './tutor-bookings.component.html',
  styleUrl: './tutor-bookings.component.scss',
})
export class TutorBookingsComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  isLoading = true;
  errorMessage = '';
  completingId = '';

  materialsMap: Record<string, Material[]> = {};
  loadingMaterialsFor = '';
  expandedBookingId = '';
  addingMaterialFor = '';
  deletingMaterialId = '';
  isSubmittingMaterial = false;

  progressMap: Record<string, Progress | null> = {};
  loadingProgressFor = '';
  expandedProgressId = '';
  editingProgressId = '';
  isSubmittingProgress = false;

  materialForm: FormGroup;
  progressForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private materialService: MaterialService,
    private progressService: ProgressService,
    private fb: FormBuilder,
  ) {
    this.materialForm = this.buildMaterialForm();
    this.progressForm = this.buildProgressForm();
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildMaterialForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      fileUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      description: [''],
      fileType: [''],
    });
  }

  private buildProgressForm(): FormGroup {
    return this.fb.group({
      topicsCovered: ['', Validators.required],
      homeworkAssigned: [''],
      tutorNotes: [''],
    });
  }

  private loadBookings(): void {
    this.bookingService.getTutorBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: bookings => {
          this.bookings = bookings;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load bookings.';
        },
      });
  }

  completeBooking(id: string): void {
    this.completingId = id;
    this.bookingService.complete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updated => {
          this.bookings = this.bookings.map(b => b.id === id ? updated : b);
          this.completingId = '';
        },
        error: err => {
          this.completingId = '';
          this.errorMessage = err?.error?.message ?? 'Failed to complete booking.';
        },
      });
  }

  toggleMaterials(bookingId: string): void {
    if (this.expandedBookingId === bookingId) {
      this.expandedBookingId = '';
      this.addingMaterialFor = '';
      return;
    }
    this.expandedBookingId = bookingId;
    this.addingMaterialFor = '';
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

  startAddMaterial(bookingId: string): void {
    this.addingMaterialFor = bookingId;
    this.materialForm.reset();
    this.errorMessage = '';
  }

  cancelAddMaterial(): void {
    this.addingMaterialFor = '';
    this.errorMessage = '';
  }

  submitMaterial(bookingId: string): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      return;
    }
    this.isSubmittingMaterial = true;
    this.errorMessage = '';
    const { title, fileUrl, description, fileType } = this.materialForm.value;
    const payload = {
      title,
      fileUrl,
      ...(description?.trim() ? { description: description.trim() } : {}),
      ...(fileType?.trim() ? { fileType: fileType.trim() } : {}),
    };
    this.materialService.create(bookingId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: material => {
          this.materialsMap[bookingId] = [...(this.materialsMap[bookingId] ?? []), material];
          this.isSubmittingMaterial = false;
          this.addingMaterialFor = '';
        },
        error: err => {
          this.isSubmittingMaterial = false;
          this.errorMessage = err?.error?.message ?? 'Failed to add material.';
        },
      });
  }

  deleteMaterial(bookingId: string, materialId: string): void {
    this.deletingMaterialId = materialId;
    this.materialService.delete(materialId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.materialsMap[bookingId] = this.materialsMap[bookingId].filter(m => m.id !== materialId);
          this.deletingMaterialId = '';
        },
        error: err => {
          this.deletingMaterialId = '';
          this.errorMessage = err?.error?.message ?? 'Failed to delete material.';
        },
      });
  }

  toggleProgress(bookingId: string): void {
    if (this.expandedProgressId === bookingId) {
      this.expandedProgressId = '';
      this.editingProgressId = '';
      return;
    }
    this.expandedProgressId = bookingId;
    this.editingProgressId = '';
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

  startEditProgress(bookingId: string): void {
    const existing = this.progressMap[bookingId];
    this.progressForm.reset({
      topicsCovered: existing?.topicsCovered ?? '',
      homeworkAssigned: existing?.homeworkAssigned ?? '',
      tutorNotes: existing?.tutorNotes ?? '',
    });
    this.editingProgressId = bookingId;
    this.errorMessage = '';
  }

  cancelEditProgress(): void {
    this.editingProgressId = '';
    this.errorMessage = '';
  }

  submitProgress(bookingId: string): void {
    if (this.progressForm.invalid) {
      this.progressForm.markAllAsTouched();
      return;
    }
    this.isSubmittingProgress = true;
    this.errorMessage = '';
    const { topicsCovered, homeworkAssigned, tutorNotes } = this.progressForm.value;
    const existing = this.progressMap[bookingId];

    if (existing) {
      const payload = {
        topicsCovered,
        ...(homeworkAssigned?.trim() ? { homeworkAssigned: homeworkAssigned.trim() } : {}),
        ...(tutorNotes?.trim() ? { tutorNotes: tutorNotes.trim() } : {}),
      };
      this.progressService.update(existing.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: updated => {
            this.progressMap[bookingId] = updated;
            this.isSubmittingProgress = false;
            this.editingProgressId = '';
          },
          error: err => {
            this.isSubmittingProgress = false;
            this.errorMessage = err?.error?.message ?? 'Failed to update progress.';
          },
        });
    } else {
      const payload = {
        bookingId,
        topicsCovered,
        ...(homeworkAssigned?.trim() ? { homeworkAssigned: homeworkAssigned.trim() } : {}),
        ...(tutorNotes?.trim() ? { tutorNotes: tutorNotes.trim() } : {}),
      };
      this.progressService.create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: created => {
            this.progressMap[bookingId] = created;
            this.isSubmittingProgress = false;
            this.editingProgressId = '';
          },
          error: err => {
            this.isSubmittingProgress = false;
            this.errorMessage = err?.error?.message ?? 'Failed to create progress entry.';
          },
        });
    }
  }

  canComplete(booking: Booking): boolean {
    return booking.status === 'CONFIRMED';
  }

  canAddMaterials(booking: Booking): boolean {
    return booking.status !== 'CANCELLED';
  }

  isCompleted(booking: Booking): boolean {
    return booking.status === 'COMPLETED';
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

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}