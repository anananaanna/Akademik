import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil, map } from 'rxjs/operators';
import { AdvertisementService, Advertisement } from '../../core/services/advertisement.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredAds: Advertisement[] = [];
  totalAds = 0;
  isLoggedIn = false;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private advertisementService: AdvertisementService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = user !== null;
      });

    this.advertisementService.getAll().pipe(
      take(1),
      map(ads => {
        this.totalAds = ads.length;
        return ads.slice(0, 3);
      }),
    ).subscribe({
      next: ads => {
        this.featuredAds = ads;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUniqueSubjects(): string[] {
    return this.featuredAds
      .map(ad => ad.subject?.name)
      .filter((name, index, self) => name && self.indexOf(name) === index) as string[];
  }

  formatLevel(level: string | null): string {
    if (!level) return '';
    return level
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  navigateToAds(): void {
    this.router.navigate(['/ads']);
  }
}