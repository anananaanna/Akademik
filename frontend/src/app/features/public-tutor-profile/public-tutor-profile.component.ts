import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, forkJoin, EMPTY } from 'rxjs';
import { takeUntil, switchMap, catchError } from 'rxjs/operators';
import { TutorProfileService, TutorProfile } from '../../core/services/tutor-profile.service';
import { AdvertisementService, Advertisement } from '../../core/services/advertisement.service';
import { ReviewService, Review } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-tutor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-tutor-profile.component.html',
  styleUrl: './public-tutor-profile.component.scss',
})
export class PublicTutorProfileComponent implements OnInit, OnDestroy {
  profile: TutorProfile | null = null;
  advertisements: Advertisement[] = [];
  reviews: Review[] = [];
  isLoading = true;
  errorMessage = '';
  isLoggedIn = false;
  isTutor = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tutorProfileService: TutorProfileService,
    private advertisementService: AdvertisementService,
    private reviewService: ReviewService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(user => {
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

    this.route.params.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const id = params['id'];
        return forkJoin({
          profile: this.tutorProfileService.getById(id),
          ads: this.advertisementService.getAll(),
          reviews: this.reviewService.getByTutorProfile(id),
        });
      }),
    ).subscribe({
      next: ({ profile, ads, reviews }) => {
        this.profile = profile;
        this.advertisements = ads.filter(
          ad => ad.tutorProfileId === profile.id && ad.status === 'ACTIVE'
        );
        this.reviews = reviews;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Tutor profile not found.';
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    return level.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  get averageRating(): number {
    if (this.reviews.length === 0) return 0;
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / this.reviews.length) * 10) / 10;
  }
}