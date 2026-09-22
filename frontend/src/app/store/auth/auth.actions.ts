import { createAction, props } from '@ngrx/store';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginCredentials }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthUser; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = createAction(
  '[Auth] Register',
  props<{ credentials: RegisterCredentials }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: AuthUser; token: string }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = createAction('[Auth] Logout');

// ─── Restore session ──────────────────────────────────────────────────────────

export const restoreSession = createAction(
  '[Auth] Restore Session',
  props<{ user: AuthUser; token: string }>()
);