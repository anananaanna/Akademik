import { AuthState } from './auth/auth.reducer';
import { AdvertisementsState } from './advertisements/advertisements.reducer';
import { BookingsState } from './bookings/bookings.reducer';

export interface AppState {
  auth: AuthState;
  advertisements: AdvertisementsState;
  bookings: BookingsState;
}