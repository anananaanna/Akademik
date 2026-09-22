import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Booking } from '../../core/services/booking.service';
import * as BookingActions from './bookings.actions';

export interface BookingsState extends EntityState<Booking> {
  isLoading: boolean;
  error: string | null;
}

export const adapter: EntityAdapter<Booking> = createEntityAdapter<Booking>({
  selectId: (booking) => booking.id,
  sortComparer: false,
});

export const initialBookingsState: BookingsState = adapter.getInitialState({
  isLoading: false,
  error: null,
});

export const bookingsReducer = createReducer(
  initialBookingsState,

  // Load my bookings
  on(BookingActions.loadMyBookings, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(BookingActions.loadMyBookingsSuccess, (state, { bookings }) =>
    adapter.setAll(bookings, { ...state, isLoading: false, error: null })
  ),

  on(BookingActions.loadMyBookingsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Load tutor bookings
  on(BookingActions.loadTutorBookings, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(BookingActions.loadTutorBookingsSuccess, (state, { bookings }) =>
    adapter.setAll(bookings, { ...state, isLoading: false, error: null })
  ),

  on(BookingActions.loadTutorBookingsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create booking
  on(BookingActions.createBooking, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(BookingActions.createBookingSuccess, (state, { booking }) =>
    adapter.addOne(booking, { ...state, isLoading: false })
  ),

  on(BookingActions.createBookingFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Cancel booking
  on(BookingActions.cancelBooking, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(BookingActions.cancelBookingSuccess, (state, { booking }) =>
    adapter.updateOne(
      { id: booking.id, changes: booking },
      { ...state, isLoading: false }
    )
  ),

  on(BookingActions.cancelBookingFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Complete booking
  on(BookingActions.completeBooking, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(BookingActions.completeBookingSuccess, (state, { booking }) =>
    adapter.updateOne(
      { id: booking.id, changes: booking },
      { ...state, isLoading: false }
    )
  ),

  on(BookingActions.completeBookingFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
);