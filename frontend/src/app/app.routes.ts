import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'ads',
    loadComponent: () =>
      import('./features/ads/ads.component').then((m) => m.AdsComponent),
  },
  {
    path: 'tutor/:id',
    loadComponent: () =>
      import('./features/public-tutor-profile/public-tutor-profile.component').then(
        (m) => m.PublicTutorProfileComponent
      ),
  },
  {
    path: 'booking',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/booking/booking.component').then((m) => m.BookingComponent),
  },
  {
    path: 'my-bookings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/my-bookings/my-bookings.component').then((m) => m.MyBookingsComponent),
  },
  {
    path: 'tutor-bookings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tutor-bookings/tutor-bookings.component').then((m) => m.TutorBookingsComponent),
  },
  {
    path: 'tutor-profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tutor-profile/tutor-profile.component').then((m) => m.TutorProfileComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];