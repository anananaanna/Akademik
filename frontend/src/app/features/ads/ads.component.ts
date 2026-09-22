import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import * as AdvertisementActions from '../../store/advertisements/advertisements.actions';
import {
  selectFilteredAdvertisements,
  selectAdvertisementsLoading,
  selectAdvertisementsError,
  selectSubjectFilter,
  selectLevelFilter,
  selectSearchFilter,
} from '../../store/advertisements/advertisements.selectors';
import { Advertisement } from '../../core/services/advertisement.service';
import { TutorProfileService } from '../../core/services/tutor-profile.service';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ads.component.html',
  styleUrl: './ads.component.scss',
})
export class AdsComponent implements OnInit, OnDestroy {
  filteredAds: Advertisement[] = [];
  subjects: string[] = [];
  isLoading = true;
  errorMessage = '';
  isLoggedIn = false;
  isTutor = false;

  selectedSubject = '';
  selectedLevel = '';
  searchText = '';

  readonly levels = [
    'ELEMENTARY',
    'HIGH_SCHOOL',
    'UNIVERSITY',
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private tutorProfileService: TutorProfileService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(AdvertisementActions.loadAdvertisements());

    this.store.select(selectAdvertisementsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });

    this.store.select(selectAdvertisementsError)
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error ?? '';
      });

    this.store.select(selectFilteredAdvertisements)
      .pipe(takeUntil(this.destroy$))
      .subscribe(ads => {
        this.filteredAds = ads;
        this.subjects = ads
          .map(ad => ad.subject?.name)
          .filter((name, index, self) =>
            name && self.indexOf(name) === index
          ) as string[];
      });

    this.store.select(selectSubjectFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(subject => {
        this.selectedSubject = subject;
      });

    this.store.select(selectLevelFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(level => {
        this.selectedLevel = level;
      });

    this.store.select(selectSearchFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(search => {
        this.searchText = search;
      });

    this.tutorProfileService.getMyProfile().pipe(
      takeUntil(this.destroy$),
      catchError(() => {
        this.isTutor = false;
        return EMPTY;
      }),
    ).subscribe(() => {
      this.isTutor = true;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubjectChange(): void {
    this.store.dispatch(AdvertisementActions.setSubjectFilter({
      subject: this.selectedSubject,
    }));
  }

  onLevelChange(): void {
    this.store.dispatch(AdvertisementActions.setLevelFilter({
      level: this.selectedLevel,
    }));
  }

  onSearchChange(): void {
    this.store.dispatch(AdvertisementActions.setSearchFilter({
      search: this.searchText,
    }));
  }

  clearFilters(): void {
    this.selectedSubject = '';
    this.selectedLevel = '';
    this.searchText = '';
    this.store.dispatch(AdvertisementActions.clearFilters());
  }

  bookAd(ad: Advertisement): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/booking'], {
      queryParams: { advertisementId: ad.id },
    });
  }

  formatLevel(level: string | null): string {
    if (!level) return '';
    return level
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  get totalCount(): number {
    return this.filteredAds.length;
  }

  get averageRate(): number {
    if (this.filteredAds.length === 0) return 0;
    const total = this.filteredAds.reduce(
      (sum, ad) => sum + Number(ad.hourlyRate), 0
    );
    return Math.round(total / this.filteredAds.length);
  }
}