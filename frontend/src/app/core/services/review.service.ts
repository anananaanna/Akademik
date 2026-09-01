import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Review {
  id: string;
  bookingId: string;
  studentId: string;
  tutorProfileId: string;
  rating: number;
  comment: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly baseUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  create(payload: CreateReviewPayload): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, payload);
  }

  getByTutorProfile(tutorProfileId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/tutor/${tutorProfileId}`);
  }

  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/my-reviews`);
  }

  update(id: string, payload: UpdateReviewPayload): Observable<Review> {
    return this.http.patch<Review>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}