import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Material {
  id: string;
  bookingId: string;
  uploadedByUserId: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  createdAt: string;
}

export interface CreateMaterialPayload {
  title: string;
  fileUrl: string;
  description?: string;
  fileType?: string;
}

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private readonly baseUrl = `${environment.apiUrl}/materials`;

  constructor(private http: HttpClient) {}

  getByBooking(bookingId: string): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.baseUrl}/booking/${bookingId}`);
  }

  create(bookingId: string, payload: CreateMaterialPayload): Observable<Material> {
    return this.http.post<Material>(`${this.baseUrl}/booking/${bookingId}`, payload);
  }

  update(id: string, payload: Partial<CreateMaterialPayload>): Observable<Material> {
    return this.http.patch<Material>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}