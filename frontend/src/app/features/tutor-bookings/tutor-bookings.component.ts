import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService, Booking } from '../../core/services/booking.service';

@Component({
  selector: 'app-tutor-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tutor-bookings.component.html',
  styleUrl: './tutor-bookings.component.scss',
})
export class TutorBookingsComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  isLoading = true;
  errorMessage = '';
  completingId = '';

  private destroy$ = new Subject<void>();

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  canComplete(booking: Booking): boolean {
    return booking.status === 'CONFIRMED';
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