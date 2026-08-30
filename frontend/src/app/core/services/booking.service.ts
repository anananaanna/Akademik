import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Booking {
  id: string;
  studentId: string;
  tutorProfileId: string;
  advertisementId: string | null;
  timeSlotId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalPrice: number;
  notes: string | null;
  createdAt: string;
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
  advertisement?: {
    title: string;
    subject: { name: string };
    level: string | null;
  } | null;
  tutorProfile?: {
    city: string | null;
    country: string | null;
  };
}

export interface CreateBookingPayload {
  advertisementId: string;
  timeSlotId: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly baseUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(payload: CreateBookingPayload): Observable<Booking> {
    return this.http.post<Booking>(this.baseUrl, payload);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/my-bookings`);
  }

  getTutorBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/tutor-bookings`);
  }

  getById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/${id}`);
  }

  cancel(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/cancel`, {});
  }

  complete(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/complete`, {});
  }
}