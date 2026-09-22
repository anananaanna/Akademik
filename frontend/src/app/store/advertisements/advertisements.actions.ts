import { createAction, props } from '@ngrx/store';
import { Advertisement, CreateAdvertisementPayload, UpdateAdvertisementPayload } from '../../core/services/advertisement.service';

// ─── Load all advertisements (public) ────────────────────────────────────────

export const loadAdvertisements = createAction(
  '[Advertisements] Load Advertisements'
);

export const loadAdvertisementsSuccess = createAction(
  '[Advertisements] Load Advertisements Success',
  props<{ advertisements: Advertisement[] }>()
);

export const loadAdvertisementsFailure = createAction(
  '[Advertisements] Load Advertisements Failure',
  props<{ error: string }>()
);

// ─── Load my advertisements (tutor) ──────────────────────────────────────────

export const loadMyAdvertisements = createAction(
  '[Advertisements] Load My Advertisements'
);

export const loadMyAdvertisementsSuccess = createAction(
  '[Advertisements] Load My Advertisements Success',
  props<{ advertisements: Advertisement[] }>()
);

export const loadMyAdvertisementsFailure = createAction(
  '[Advertisements] Load My Advertisements Failure',
  props<{ error: string }>()
);

// ─── Create advertisement ─────────────────────────────────────────────────────

export const createAdvertisement = createAction(
  '[Advertisements] Create Advertisement',
  props<{ payload: CreateAdvertisementPayload }>()
);

export const createAdvertisementSuccess = createAction(
  '[Advertisements] Create Advertisement Success',
  props<{ advertisement: Advertisement }>()
);

export const createAdvertisementFailure = createAction(
  '[Advertisements] Create Advertisement Failure',
  props<{ error: string }>()
);

// ─── Update advertisement ─────────────────────────────────────────────────────

export const updateAdvertisement = createAction(
  '[Advertisements] Update Advertisement',
  props<{ id: string; payload: UpdateAdvertisementPayload }>()
);

export const updateAdvertisementSuccess = createAction(
  '[Advertisements] Update Advertisement Success',
  props<{ advertisement: Advertisement }>()
);

export const updateAdvertisementFailure = createAction(
  '[Advertisements] Update Advertisement Failure',
  props<{ error: string }>()
);

// ─── Delete advertisement ─────────────────────────────────────────────────────

export const deleteAdvertisement = createAction(
  '[Advertisements] Delete Advertisement',
  props<{ id: string }>()
);

export const deleteAdvertisementSuccess = createAction(
  '[Advertisements] Delete Advertisement Success',
  props<{ id: string }>()
);

export const deleteAdvertisementFailure = createAction(
  '[Advertisements] Delete Advertisement Failure',
  props<{ error: string }>()
);

// ─── Filters ──────────────────────────────────────────────────────────────────

export const setSubjectFilter = createAction(
  '[Advertisements] Set Subject Filter',
  props<{ subject: string }>()
);

export const setLevelFilter = createAction(
  '[Advertisements] Set Level Filter',
  props<{ level: string }>()
);

export const setSearchFilter = createAction(
  '[Advertisements] Set Search Filter',
  props<{ search: string }>()
);

export const clearFilters = createAction(
  '[Advertisements] Clear Filters'
);