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

@Injectable({ providedIn: 'root' })
export class AdvertisementService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Advertisement[]> {
    return this.http.get<Advertisement[]>(`${this.baseUrl}/advertisements`).pipe(
      catchError(err => {
        console.error('Failed to load advertisements', err);
        return throwError(() => err);
      })
    );
  }

  getById(id: string): Observable<Advertisement> {
    return this.http.get<Advertisement>(`${this.baseUrl}/advertisements/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}