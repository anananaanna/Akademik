import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  Subject,
  BehaviorSubject,
  combineLatest,
  takeUntil,
  EMPTY,
} from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import {
  AdvertisementService,
  Advertisement,
} from '../../core/services/advertisement.service';
import { AuthService } from '../../core/services/auth.service';
import { TutorProfileService } from '../../core/services/tutor-profile.service';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ads.component.html',
  styleUrl: './ads.component.scss',
})
export class AdsComponent implements OnInit, OnDestroy {
  advertisements: Advertisement[] = [];
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
  private subjectFilter$ = new BehaviorSubject<string>('');
  private levelFilter$ = new BehaviorSubject<string>('');
  private searchFilter$ = new BehaviorSubject<string>('');

  constructor(
    private advertisementService: AdvertisementService,
    private authService: AuthService,
    private tutorProfileService: TutorProfileService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = user !== null;
        if (user) {
          this.tutorProfileService.getMyProfile().pipe(
            catchError(() => {
              this.isTutor = false;
              return EMPTY;
            }),
          ).subscribe(() => {
            this.isTutor = true;
          });
        } else {
          this.isTutor = false;
        }
      });

    this.advertisementService.getAll().pipe(
      tap(ads => {
        this.advertisements = ads;
        this.isLoading = false;
        this.subjects = ads
          .map(ad => ad.subject?.name)
          .filter((name, index, self) =>
            name && self.indexOf(name) === index
          ) as string[];
      }),
      switchMap(() =>
        combineLatest([
          this.subjectFilter$,
          this.levelFilter$,
          this.searchFilter$,
        ])
      ),
      map(([subject, level, search]) =>
        this.advertisements.filter(ad => {
          const matchesSubject = subject ? ad.subject?.name === subject : true;
          const matchesLevel = level ? ad.level === level : true;
          const matchesSearch = search
            ? ad.title.toLowerCase().includes(search.toLowerCase()) ||
              ad.description.toLowerCase().includes(search.toLowerCase())
            : true;
          return matchesSubject && matchesLevel && matchesSearch;
        })
      ),
      takeUntil(this.destroy$),
    ).subscribe({
      next: filtered => {
        this.filteredAds = filtered;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load advertisements. Please try again.';
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubjectChange(): void {
    this.subjectFilter$.next(this.selectedSubject);
  }

  onLevelChange(): void {
    this.levelFilter$.next(this.selectedLevel);
  }

  onSearchChange(): void {
    this.searchFilter$.next(this.searchText);
  }

  clearFilters(): void {
    this.selectedSubject = '';
    this.selectedLevel = '';
    this.searchText = '';
    this.subjectFilter$.next('');
    this.levelFilter$.next('');
    this.searchFilter$.next('');
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