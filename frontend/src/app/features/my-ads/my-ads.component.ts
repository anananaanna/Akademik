import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, forkJoin } from 'rxjs';
import {
  AdvertisementService,
  Advertisement,
  Subject as AdSubject,
} from '../../core/services/advertisement.service';

type PageState = 'loading' | 'list' | 'create' | 'edit';

@Component({
  selector: 'app-my-ads',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-ads.component.html',
  styleUrl: './my-ads.component.scss',
})
export class MyAdsComponent implements OnInit, OnDestroy {
  state: PageState = 'loading';
  advertisements: Advertisement[] = [];
  subjects: AdSubject[] = [];
  editingAd: Advertisement | null = null;
  isSubmitting = false;
  deletingId = '';
  errorMessage = '';
  successMessage = '';

  adForm: FormGroup;

  readonly levels = [
    { value: 'ELEMENTARY', label: 'Elementary' },
    { value: 'HIGH_SCHOOL', label: 'High School' },
    { value: 'UNIVERSITY', label: 'University' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private advertisementService: AdvertisementService,
    private fb: FormBuilder,
  ) {
    this.adForm = this.buildForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      subjectId: ['', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.required],
      hourlyRate: [null, [Validators.required, Validators.min(0)]],
      level: [''],
      status: ['ACTIVE'],
    });
  }

  private loadData(): void {
    this.state = 'loading';
    forkJoin({
      ads: this.advertisementService.getMine(),
      subjects: this.advertisementService.getSubjects(),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ ads, subjects }) => {
        this.advertisements = ads;
        this.subjects = subjects;
        this.state = 'list';
      },
      error: () => {
        this.errorMessage = 'Failed to load your advertisements.';
        this.state = 'list';
      },
    });
  }

  startCreate(): void {
    this.editingAd = null;
    this.adForm.reset({ status: 'ACTIVE', level: '' });
    this.errorMessage = '';
    this.successMessage = '';
    this.state = 'create';
  }

  startEdit(ad: Advertisement): void {
    this.editingAd = ad;
    this.adForm.patchValue({
      subjectId: ad.subjectId,
      title: ad.title,
      description: ad.description,
      hourlyRate: ad.hourlyRate,
      level: ad.level ?? '',
      status: ad.status,
    });
    this.errorMessage = '';
    this.successMessage = '';
    this.state = 'edit';
  }

  cancelForm(): void {
    this.editingAd = null;
    this.errorMessage = '';
    this.state = 'list';
  }

  onSubmit(): void {
    if (this.adForm.invalid) {
      this.adForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const raw = this.adForm.value;
    const payload = {
      subjectId: raw.subjectId,
      title: raw.title,
      description: raw.description,
      hourlyRate: Number(raw.hourlyRate),
      ...(raw.level ? { level: raw.level } : { level: null }),
      status: raw.status,
    };

    const request$ = this.state === 'create'
      ? this.advertisementService.create(payload)
      : this.advertisementService.update(this.editingAd!.id, payload);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = this.state === 'create'
          ? 'Advertisement created successfully.'
          : 'Advertisement updated successfully.';
        this.editingAd = null;
        this.loadData();
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Something went wrong. Please try again.';
      },
    });
  }

  deleteAd(id: string): void {
    this.deletingId = id;
    this.errorMessage = '';

    this.advertisementService.delete(id).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => {
        this.advertisements = this.advertisements.filter(a => a.id !== id);
        this.deletingId = '';
      },
      error: err => {
        this.deletingId = '';
        this.errorMessage = err?.error?.message ?? 'Failed to delete advertisement.';
      },
    });
  }

  getSubjectName(subjectId: string): string {
    return this.subjects.find(s => s.id === subjectId)?.name ?? '';
  }

  formatLevel(level: string | null): string {
    if (!level) return 'All levels';
    return level.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }
}