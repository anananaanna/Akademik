import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import * as BookingActions from './bookings.actions';
import { BookingService } from '../../core/services/booking.service';

@Injectable()
export class BookingsEffects {

  loadMyBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadMyBookings),
      switchMap(() =>
        this.bookingService.getMyBookings().pipe(
          map(bookings =>
            BookingActions.loadMyBookingsSuccess({ bookings })
          ),
          catchError(err =>
            of(BookingActions.loadMyBookingsFailure({
              error: err?.error?.message ?? 'Failed to load bookings',
            }))
          ),
        )
      ),
    )
  );

  loadTutorBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadTutorBookings),
      switchMap(() =>
        this.bookingService.getTutorBookings().pipe(
          map(bookings =>
            BookingActions.loadTutorBookingsSuccess({ bookings })
          ),
          catchError(err =>
            of(BookingActions.loadTutorBookingsFailure({
              error: err?.error?.message ?? 'Failed to load tutor bookings',
            }))
          ),
        )
      ),
    )
  );

  createBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.createBooking),
      switchMap(({ payload }) =>
        this.bookingService.createBooking(payload).pipe(
          map(booking =>
            BookingActions.createBookingSuccess({ booking })
          ),
          catchError(err =>
            of(BookingActions.createBookingFailure({
              error: err?.error?.message ?? 'Failed to create booking',
            }))
          ),
        )
      ),
    )
  );

  cancelBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.cancelBooking),
      switchMap(({ id }) =>
        this.bookingService.cancel(id).pipe(
          map(booking =>
            BookingActions.cancelBookingSuccess({ booking })
          ),
          catchError(err =>
            of(BookingActions.cancelBookingFailure({
              error: err?.error?.message ?? 'Failed to cancel booking',
            }))
          ),
        )
      ),
    )
  );

  completeBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.completeBooking),
      switchMap(({ id }) =>
        this.bookingService.complete(id).pipe(
          map(booking =>
            BookingActions.completeBookingSuccess({ booking })
          ),
          catchError(err =>
            of(BookingActions.completeBookingFailure({
              error: err?.error?.message ?? 'Failed to complete booking',
            }))
          ),
        )
      ),
    )
  );

  constructor(
    private actions$: Actions,
    private bookingService: BookingService,
  ) {}
}