import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Progress {
  id: string;
  bookingId: string;
  tutorProfileId: string;
  studentId: string;
  topicsCovered: string;
  homeworkAssigned: string | null;
  tutorNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgressPayload {
  bookingId: string;
  topicsCovered: string;
  homeworkAssigned?: string;
  tutorNotes?: string;
}

export interface UpdateProgressPayload {
  topicsCovered?: string;
  homeworkAssigned?: string;
  tutorNotes?: string;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly baseUrl = `${environment.apiUrl}/progress`;

  constructor(private http: HttpClient) {}

  getByBooking(bookingId: string): Observable<Progress> {
    return this.http.get<Progress>(`${this.baseUrl}/booking/${bookingId}`);
  }

  create(payload: CreateProgressPayload): Observable<Progress> {
    return this.http.post<Progress>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateProgressPayload): Observable<Progress> {
    return this.http.patch<Progress>(`${this.baseUrl}/${id}`, payload);
  }
}