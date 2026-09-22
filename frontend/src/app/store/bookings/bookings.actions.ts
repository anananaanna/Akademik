import { createAction, props } from '@ngrx/store';
import { Booking, CreateBookingPayload } from '../../core/services/booking.service';

// ─── Load my bookings (student) ───────────────────────────────────────────────

export const loadMyBookings = createAction(
  '[Bookings] Load My Bookings'
);

export const loadMyBookingsSuccess = createAction(
  '[Bookings] Load My Bookings Success',
  props<{ bookings: Booking[] }>()
);

export const loadMyBookingsFailure = createAction(
  '[Bookings] Load My Bookings Failure',
  props<{ error: string }>()
);

// ─── Load tutor bookings ──────────────────────────────────────────────────────

export const loadTutorBookings = createAction(
  '[Bookings] Load Tutor Bookings'
);

export const loadTutorBookingsSuccess = createAction(
  '[Bookings] Load Tutor Bookings Success',
  props<{ bookings: Booking[] }>()
);

export const loadTutorBookingsFailure = createAction(
  '[Bookings] Load Tutor Bookings Failure',
  props<{ error: string }>()
);

// ─── Create booking ───────────────────────────────────────────────────────────

export const createBooking = createAction(
  '[Bookings] Create Booking',
  props<{ payload: CreateBookingPayload }>()
);

export const createBookingSuccess = createAction(
  '[Bookings] Create Booking Success',
  props<{ booking: Booking }>()
);

export const createBookingFailure = createAction(
  '[Bookings] Create Booking Failure',
  props<{ error: string }>()
);

// ─── Cancel booking ───────────────────────────────────────────────────────────

export const cancelBooking = createAction(
  '[Bookings] Cancel Booking',
  props<{ id: string }>()
);

export const cancelBookingSuccess = createAction(
  '[Bookings] Cancel Booking Success',
  props<{ booking: Booking }>()
);

export const cancelBookingFailure = createAction(
  '[Bookings] Cancel Booking Failure',
  props<{ error: string }>()
);

// ─── Complete booking ─────────────────────────────────────────────────────────

export const completeBooking = createAction(
  '[Bookings] Complete Booking',
  props<{ id: string }>()
);

export const completeBookingSuccess = createAction(
  '[Bookings] Complete Booking Success',
  props<{ booking: Booking }>()
);

export const completeBookingFailure = createAction(
  '[Bookings] Complete Booking Failure',
  props<{ error: string }>()
);