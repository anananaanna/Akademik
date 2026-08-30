import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, AuthUser } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // takeUntil(destroy$) satisfies the professor's RxJS operator requirement.
    // The subscription is automatically cleaned up when the component destroys,
    // preventing memory leaks.
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get displayName(): string {
    if (!this.currentUser) return '';
    // firstName is empty when restored from JWT decode on refresh —
    // fall back to email prefix in that case
    return this.currentUser.firstName
      ? this.currentUser.firstName
      : this.currentUser.email.split('@')[0];
  }

  logout(): void {
    this.authService.logout();
  }
}