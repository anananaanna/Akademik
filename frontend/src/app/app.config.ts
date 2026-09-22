import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { advertisementsReducer } from './store/advertisements/advertisements.reducer';
import { AdvertisementsEffects } from './store/advertisements/advertisements.effects';
import { bookingsReducer } from './store/bookings/bookings.reducer';
import { BookingsEffects } from './store/bookings/bookings.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideStore({
      auth: authReducer,
      advertisements: advertisementsReducer,
      bookings: bookingsReducer,
    }),
    provideEffects([
      AuthEffects,
      AdvertisementsEffects,
      BookingsEffects,
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
    }),
  ],
};