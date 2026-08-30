import { Injectable } from '@angular/core';

const TOKEN_KEY = 'akademik_token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  hasToken(): boolean {
    return this.getToken() !== null;
  }
}