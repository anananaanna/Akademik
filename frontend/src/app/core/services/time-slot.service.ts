import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimeSlot {
  id: string;
  tutorProfileId: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED';
  notes: string | null;
}

@Injectable({ providedIn: 'root' })
export class TimeSlotService {
  private readonly baseUrl = `${environment.apiUrl}/time-slots`;

  constructor(private http: HttpClient) {}

  getAvailableByTutor(tutorProfileId: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.baseUrl}/tutor/${tutorProfileId}`);
  }

  getMySlots(): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.baseUrl}/mine`);
  }

  createSlot(payload: { startTime: string; endTime: string; notes?: string }): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(this.baseUrl, payload);
  }

  updateSlot(id: string, payload: Partial<{ startTime: string; endTime: string; status: string; notes: string }>): Observable<TimeSlot> {
    return this.http.patch<TimeSlot>(`${this.baseUrl}/${id}`, payload);
  }

  deleteSlot(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}