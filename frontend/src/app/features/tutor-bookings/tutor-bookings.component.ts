import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService, Booking } from '../../core/services/booking.service';
import { MaterialService, Material } from '../../core/services/material.service';

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

  materialForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private materialService: MaterialService,
    private fb: FormBuilder,
  ) {
    this.materialForm = this.buildMaterialForm();
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
          this.materialsMap[bookingId] = [
            ...(this.materialsMap[bookingId] ?? []),
            material,
          ];
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
          this.materialsMap[bookingId] = this.materialsMap[bookingId]
            .filter(m => m.id !== materialId);
          this.deletingMaterialId = '';
        },
        error: err => {
          this.deletingMaterialId = '';
          this.errorMessage = err?.error?.message ?? 'Failed to delete material.';
        },
      });
  }

  canComplete(booking: Booking): boolean {
    return booking.status === 'CONFIRMED';
  }

  canAddMaterials(booking: Booking): boolean {
    return booking.status !== 'CANCELLED';
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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