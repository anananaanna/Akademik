import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService, Booking } from '../../core/services/booking.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss',
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  isLoading = true;
  errorMessage = '';
  cancellingId = '';

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
    this.bookingService.getMyBookings()
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

  canCancel(booking: Booking): boolean {
    return booking.status === 'CONFIRMED';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}