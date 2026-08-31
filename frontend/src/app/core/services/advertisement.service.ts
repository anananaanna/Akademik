import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Advertisement {
  id: string;
  tutorProfileId: string;
  subjectId: string;
  title: string;
  description: string;
  hourlyRate: number;
  level: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  tutorProfile: {
    id: string;
    bio: string | null;
    city: string | null;
    country: string | null;
    experienceYears: number | null;
    isAvailable: boolean;
  };
  subject: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface Subject {
  id: string;
  name: string;
  description: string | null;
}

export interface CreateAdvertisementPayload {
  subjectId: string;
  title: string;
  description: string;
  hourlyRate: number;
  level?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateAdvertisementPayload {
  subjectId?: string;
  title?: string;
  description?: string;
  hourlyRate?: number;
  level?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class AdvertisementService {
  private readonly baseUrl = `${environment.apiUrl}/advertisements`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Advertisement[]> {
    return this.http.get<Advertisement[]>(this.baseUrl).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getById(id: string): Observable<Advertisement> {
    return this.http.get<Advertisement>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getMine(): Observable<Advertisement[]> {
    return this.http.get<Advertisement[]>(`${this.baseUrl}/mine`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  create(payload: CreateAdvertisementPayload): Observable<Advertisement> {
    return this.http.post<Advertisement>(this.baseUrl, payload).pipe(
      catchError(err => throwError(() => err))
    );
  }

  update(id: string, payload: UpdateAdvertisementPayload): Observable<Advertisement> {
    return this.http.patch<Advertisement>(`${this.baseUrl}/${id}`, payload).pipe(
      catchError(err => throwError(() => err))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${environment.apiUrl}/subjects`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}