import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TutorApplication {
  id: string;
  userId: string;
  motivation: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TutorApplicationService {
  private readonly baseUrl = `${environment.apiUrl}/tutor-applications`;

  constructor(private http: HttpClient) {}

  getMyApplication(): Observable<TutorApplication> {
    return this.http.get<TutorApplication>(`${this.baseUrl}/me`);
  }

  submitApplication(motivation: string): Observable<TutorApplication> {
    return this.http.post<TutorApplication>(this.baseUrl, { motivation });
  }
}