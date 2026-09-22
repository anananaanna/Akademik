import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Advertisement } from '../../core/services/advertisement.service';
import * as AdvertisementActions from './advertisements.actions';

export interface AdvertisementsState extends EntityState<Advertisement> {
  isLoading: boolean;
  error: string | null;
  subjectFilter: string;
  levelFilter: string;
  searchFilter: string;
}

export const adapter: EntityAdapter<Advertisement> = createEntityAdapter<Advertisement>({
  selectId: (advertisement) => advertisement.id,
  sortComparer: false,
});

export const initialAdvertisementsState: AdvertisementsState = adapter.getInitialState({
  isLoading: false,
  error: null,
  subjectFilter: '',
  levelFilter: '',
  searchFilter: '',
});

export const advertisementsReducer = createReducer(
  initialAdvertisementsState,

  // Load all
  on(AdvertisementActions.loadAdvertisements, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AdvertisementActions.loadAdvertisementsSuccess, (state, { advertisements }) =>
    adapter.setAll(advertisements, { ...state, isLoading: false, error: null })
  ),

  on(AdvertisementActions.loadAdvertisementsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Load mine
  on(AdvertisementActions.loadMyAdvertisements, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AdvertisementActions.loadMyAdvertisementsSuccess, (state, { advertisements }) =>
    adapter.setAll(advertisements, { ...state, isLoading: false, error: null })
  ),

  on(AdvertisementActions.loadMyAdvertisementsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create
  on(AdvertisementActions.createAdvertisement, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AdvertisementActions.createAdvertisementSuccess, (state, { advertisement }) =>
    adapter.addOne(advertisement, { ...state, isLoading: false })
  ),

  on(AdvertisementActions.createAdvertisementFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Update
  on(AdvertisementActions.updateAdvertisement, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AdvertisementActions.updateAdvertisementSuccess, (state, { advertisement }) =>
    adapter.updateOne(
      { id: advertisement.id, changes: advertisement },
      { ...state, isLoading: false }
    )
  ),

  on(AdvertisementActions.updateAdvertisementFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Delete
  on(AdvertisementActions.deleteAdvertisement, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AdvertisementActions.deleteAdvertisementSuccess, (state, { id }) =>
    adapter.removeOne(id, { ...state, isLoading: false })
  ),

  on(AdvertisementActions.deleteAdvertisementFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Filters
  on(AdvertisementActions.setSubjectFilter, (state, { subject }) => ({
    ...state,
    subjectFilter: subject,
  })),

  on(AdvertisementActions.setLevelFilter, (state, { level }) => ({
    ...state,
    levelFilter: level,
  })),

  on(AdvertisementActions.setSearchFilter, (state, { search }) => ({
    ...state,
    searchFilter: search,
  })),

  on(AdvertisementActions.clearFilters, (state) => ({
    ...state,
    subjectFilter: '',
    levelFilter: '',
    searchFilter: '',
  })),
);