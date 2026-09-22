import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.state';
import * as AuthActions from './store/auth/auth.actions';
import { selectCurrentUser, selectIsLoggedIn, selectIsAdmin } from './store/auth/auth.selectors';
import { TokenStorageService } from './core/services/token-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  isAdmin$ = this.store.select(selectIsAdmin);
  currentUser$ = this.store.select(selectCurrentUser);

  isLoggedIn = false;
  isAdmin = false;
  displayName = '';

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private tokenStorage: TokenStorageService,
  ) {}

  ngOnInit(): void {
    this.restoreSessionFromToken();

    this.store.select(selectIsLoggedIn)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      });

    this.store.select(selectIsAdmin)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => {
        this.isAdmin = isAdmin;
      });

    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.displayName = user.firstName
            ? user.firstName
            : user.email.split('@')[0];
        } else {
          this.displayName = '';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private restoreSessionFromToken(): void {
    const token = this.tokenStorage.getToken();
    if (!token) return;

    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.tokenStorage.clearToken();
        return;
      }

      this.store.dispatch(AuthActions.restoreSession({
        user: {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          firstName: '',
          lastName: '',
        },
        token,
      }));
    } catch {
      this.tokenStorage.clearToken();
    }
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}