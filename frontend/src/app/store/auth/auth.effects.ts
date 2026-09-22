import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';

@Injectable()
export class AuthEffects {

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login({ email: credentials.email, password: credentials.password }).pipe(
          map(response => AuthActions.loginSuccess({
            user: {
              id: response.user.id,
              email: response.user.email,
              firstName: response.user.firstName,
              lastName: response.user.lastName,
              role: response.user.role,
            },
            token: response.accessToken,
          })),
          catchError(err =>
            of(AuthActions.loginFailure({
              error: err?.error?.message ?? 'Login failed',
            }))
          ),
        )
      ),
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ token }) => {
        this.tokenStorage.setToken(token);
        this.router.navigate(['/home']);
      }),
    ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ credentials }) =>
        this.authService.register({
          email: credentials.email,
          password: credentials.password,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
        }).pipe(
          map(response => AuthActions.registerSuccess({
            user: {
              id: response.user.id,
              email: response.user.email,
              firstName: response.user.firstName,
              lastName: response.user.lastName,
              role: response.user.role,
            },
            token: response.accessToken,
          })),
          catchError(err =>
            of(AuthActions.registerFailure({
              error: err?.error?.message ?? 'Registration failed',
            }))
          ),
        )
      ),
    )
  );

  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ token }) => {
        this.tokenStorage.setToken(token);
        this.router.navigate(['/home']);
      }),
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.tokenStorage.clearToken();
        this.router.navigate(['/login']);
      }),
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
  ) {}
}