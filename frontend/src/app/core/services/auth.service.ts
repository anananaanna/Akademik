import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;


  private currentUserSubject = new BehaviorSubject<AuthUser | null>(
    this.loadUserFromToken()
  );


  currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router,
  ) {}


  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    this.tokenStorage.clearToken();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.hasToken() && this.currentUserSubject.value !== null;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }


  private handleAuthResponse(response: AuthResponse): void {
    this.tokenStorage.setToken(response.accessToken);
    this.currentUserSubject.next(response.user);
  }


  private loadUserFromToken(): AuthUser | null {
    const token = localStorage.getItem('akademik_token');
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));

      // JWT expiry check — exp is in seconds, Date.now() is in milliseconds
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('akademik_token');
        return null;
      }

     
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        firstName: '',
        lastName: '',
        createdAt: '',
      };
    } catch {
      localStorage.removeItem('akademik_token');
      return null;
    }
  }
}