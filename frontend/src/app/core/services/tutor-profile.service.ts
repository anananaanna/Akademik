import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Subject {
  id: string;
  name: string;
}

export interface TutorProfile {
  id: string;
  userId: string;
  bio: string | null;
  hourlyRate: number | null;
  city: string | null;
  country: string | null;
  education: string | null;
  experienceYears: number | null;
  profilePhotoUrl: string | null;
  isAvailable: boolean;
  subjects: Subject[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTutorProfilePayload {
  bio?: string;
  hourlyRate?: number;
  city?: string;
  country?: string;
  education?: string;
  experienceYears?: number;
  profilePhotoUrl?: string;
  isAvailable?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TutorProfileService {
  private readonly baseUrl = `${environment.apiUrl}/tutor-profile`;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<TutorProfile> {
    return this.http.get<TutorProfile>(`${this.baseUrl}/me`);
  }

  getById(tutorProfileId: string): Observable<TutorProfile> {
    return this.http.get<TutorProfile>(`${this.baseUrl}/${tutorProfileId}`);
  }

  createProfile(payload: UpdateTutorProfilePayload): Observable<TutorProfile> {
    return this.http.post<TutorProfile>(this.baseUrl, payload);
  }

  updateProfile(payload: UpdateTutorProfilePayload): Observable<TutorProfile> {
    return this.http.patch<TutorProfile>(`${this.baseUrl}/me`, payload);
  }

  updateSubjects(subjectIds: string[]): Observable<TutorProfile> {
    return this.http.patch<TutorProfile>(`${this.baseUrl}/me/subjects`, { subjectIds });
  }
}