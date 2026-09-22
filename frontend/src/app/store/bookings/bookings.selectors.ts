import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookingsState, adapter } from './bookings.reducer';

export const selectBookingsState =
  createFeatureSelector<BookingsState>('bookings');

const { selectAll, selectEntities, selectTotal } =
  adapter.getSelectors(selectBookingsState);

export const selectAllBookings = selectAll;
export const selectBookingEntities = selectEntities;
export const selectBookingsTotal = selectTotal;

export const selectBookingsLoading = createSelector(
  selectBookingsState,
  (state) => state.isLoading
);

export const selectBookingsError = createSelector(
  selectBookingsState,
  (state) => state.error
);

export const selectConfirmedBookings = createSelector(
  selectAll,
  (bookings) => bookings.filter(b => b.status === 'CONFIRMED')
);

export const selectCompletedBookings = createSelector(
  selectAll,
  (bookings) => bookings.filter(b => b.status === 'COMPLETED')
);

export const selectBookingById = (id: string) => createSelector(
  selectBookingEntities,
  (entities) => entities[id] ?? null
);