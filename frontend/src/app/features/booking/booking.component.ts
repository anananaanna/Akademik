import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { AdvertisementService, Advertisement } from '../../core/services/advertisement.service';
import { TimeSlotService, TimeSlot } from '../../core/services/time-slot.service';
import { BookingService } from '../../core/services/booking.service';

type PageState = 'loading' | 'error' | 'select-slot' | 'confirm' | 'success';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
})
export class BookingComponent implements OnInit, OnDestroy {
  state: PageState = 'loading';
  advertisement: Advertisement | null = null;
  availableSlots: TimeSlot[] = [];
  selectedSlot: TimeSlot | null = null;
  bookingNotes = '';
  isSubmitting = false;
  errorMessage = '';
  confirmedBookingId = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private advertisementService: AdvertisementService,
    private timeSlotService: TimeSlotService,
    private bookingService: BookingService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const adId = params['advertisementId'];
        if (!adId) {
          this.state = 'error';
          this.errorMessage = 'No advertisement selected.';
          throw new Error('No advertisementId');
        }
        return this.advertisementService.getById(adId).pipe(
          tap(ad => {
            this.advertisement = ad;
          }),
          switchMap(ad =>
            this.timeSlotService.getAvailableByTutor(ad.tutorProfileId)
          ),
        );
      }),
    ).subscribe({
      next: slots => {
        this.availableSlots = slots.filter(s => s.status === 'AVAILABLE');
        this.state = this.availableSlots.length > 0 ? 'select-slot' : 'error';
        if (this.availableSlots.length === 0) {
          this.errorMessage = 'No available time slots for this tutor.';
        }
      },
      error: () => {
        if (this.state !== 'error') {
          this.state = 'error';
          this.errorMessage = 'Failed to load advertisement details.';
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectSlot(slot: TimeSlot): void {
    this.selectedSlot = slot;
    this.state = 'confirm';
  }

  backToSlots(): void {
    this.selectedSlot = null;
    this.state = 'select-slot';
    this.errorMessage = '';
  }

  confirmBooking(): void {
    if (!this.advertisement || !this.selectedSlot) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      advertisementId: this.advertisement.id,
      timeSlotId: this.selectedSlot.id,
      ...(this.bookingNotes.trim() && { notes: this.bookingNotes.trim() }),
    };

    this.bookingService.createBooking(payload).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: booking => {
        this.confirmedBookingId = booking.id;
        this.isSubmitting = false;
        this.state = 'success';
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Booking failed. Please try again.';
      },
    });
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', {
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

  formatLevel(level: string | null): string {
    if (!level) return '';
    return level.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }

  goToMyBookings(): void {
    this.router.navigate(['/my-bookings']);
  }
}