import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdvertisementsState, adapter } from './advertisements.reducer';

export const selectAdvertisementsState =
  createFeatureSelector<AdvertisementsState>('advertisements');

const { selectAll, selectEntities, selectTotal } =
  adapter.getSelectors(selectAdvertisementsState);

export const selectAllAdvertisements = selectAll;
export const selectAdvertisementEntities = selectEntities;
export const selectAdvertisementsTotal = selectTotal;

export const selectAdvertisementsLoading = createSelector(
  selectAdvertisementsState,
  (state) => state.isLoading
);

export const selectAdvertisementsError = createSelector(
  selectAdvertisementsState,
  (state) => state.error
);

export const selectSubjectFilter = createSelector(
  selectAdvertisementsState,
  (state) => state.subjectFilter
);

export const selectLevelFilter = createSelector(
  selectAdvertisementsState,
  (state) => state.levelFilter
);

export const selectSearchFilter = createSelector(
  selectAdvertisementsState,
  (state) => state.searchFilter
);

export const selectFilteredAdvertisements = createSelector(
  selectAll,
  selectAdvertisementsState,
  (advertisements, state) => {
    return advertisements.filter(ad => {
      const matchesSubject = state.subjectFilter
        ? ad.subject?.name === state.subjectFilter
        : true;
      const matchesLevel = state.levelFilter
        ? ad.level === state.levelFilter
        : true;
      const matchesSearch = state.searchFilter
        ? ad.title.toLowerCase().includes(state.searchFilter.toLowerCase()) ||
          ad.description.toLowerCase().includes(state.searchFilter.toLowerCase())
        : true;
      return matchesSubject && matchesLevel && matchesSearch;
    });
  }
);

export const selectAdvertisementById = (id: string) => createSelector(
  selectAdvertisementEntities,
  (entities) => entities[id] ?? null
);