import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import * as AdvertisementActions from './advertisements.actions';
import { AdvertisementService } from '../../core/services/advertisement.service';

@Injectable()
export class AdvertisementsEffects {

  loadAdvertisements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdvertisementActions.loadAdvertisements),
      switchMap(() =>
        this.advertisementService.getAll().pipe(
          map(advertisements =>
            AdvertisementActions.loadAdvertisementsSuccess({ advertisements })
          ),
          catchError(err =>
            of(AdvertisementActions.loadAdvertisementsFailure({
              error: err?.error?.message ?? 'Failed to load advertisements',
            }))
          ),
        )
      ),
    )
  );

  loadMyAdvertisements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdvertisementActions.loadMyAdvertisements),
      switchMap(() =>
        this.advertisementService.getMine().pipe(
          map(advertisements =>
            AdvertisementActions.loadMyAdvertisementsSuccess({ advertisements })
          ),
          catchError(err =>
            of(AdvertisementActions.loadMyAdvertisementsFailure({
              error: err?.error?.message ?? 'Failed to load your advertisements',
            }))
          ),
        )
      ),
    )
  );

  createAdvertisement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdvertisementActions.createAdvertisement),
      switchMap(({ payload }) =>
        this.advertisementService.create(payload).pipe(
          map(advertisement =>
            AdvertisementActions.createAdvertisementSuccess({ advertisement })
          ),
          catchError(err =>
            of(AdvertisementActions.createAdvertisementFailure({
              error: err?.error?.message ?? 'Failed to create advertisement',
            }))
          ),
        )
      ),
    )
  );

  updateAdvertisement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdvertisementActions.updateAdvertisement),
      switchMap(({ id, payload }) =>
        this.advertisementService.update(id, payload).pipe(
          map(advertisement =>
            AdvertisementActions.updateAdvertisementSuccess({ advertisement })
          ),
          catchError(err =>
            of(AdvertisementActions.updateAdvertisementFailure({
              error: err?.error?.message ?? 'Failed to update advertisement',
            }))
          ),
        )
      ),
    )
  );

  deleteAdvertisement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdvertisementActions.deleteAdvertisement),
      switchMap(({ id }) =>
        this.advertisementService.delete(id).pipe(
          map(() => AdvertisementActions.deleteAdvertisementSuccess({ id })),
          catchError(err =>
            of(AdvertisementActions.deleteAdvertisementFailure({
              error: err?.error?.message ?? 'Failed to delete advertisement',
            }))
          ),
        )
      ),
    )
  );

  constructor(
    private actions$: Actions,
    private advertisementService: AdvertisementService,
  ) {}
}