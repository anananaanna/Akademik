import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, catchError, EMPTY } from 'rxjs';
import { TutorProfileService, TutorProfile } from '../../core/services/tutor-profile.service';
import { AdvertisementService } from '../../core/services/advertisement.service';

type PageState = 'loading' | 'no-profile' | 'view' | 'edit' | 'create';

@Component({
  selector: 'app-tutor-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tutor-profile.component.html',
  styleUrl: './tutor-profile.component.scss',
})
export class TutorProfileComponent implements OnInit, OnDestroy {
  state: PageState = 'loading';
  profile: TutorProfile | null = null;
  availableSubjects: { id: string; name: string }[] = [];
  selectedSubjectIds: string[] = [];
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  profileForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private tutorProfileService: TutorProfileService,
    private advertisementService: AdvertisementService,
    private fb: FormBuilder,
  ) {
    this.profileForm = this.buildForm();
  }

  ngOnInit(): void {
    this.advertisementService.getSubjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe(subjects => {
        this.availableSubjects = subjects;
      });

    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      bio: [''],
      hourlyRate: [null, [Validators.min(0)]],
      city: [''],
      country: [''],
      education: [''],
      experienceYears: [null, [Validators.min(0), Validators.max(60)]],
      profilePhotoUrl: [''],
      isAvailable: [true],
    });
  }

  private loadProfile(): void {
    this.state = 'loading';
    this.tutorProfileService.getMyProfile()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.state = 'no-profile';
          return EMPTY;
        }),
      )
      .subscribe(profile => {
        this.profile = profile;
        this.selectedSubjectIds = profile.subjects.map(s => s.id);
        this.state = 'view';
      });
  }

  private patchForm(): void {
    if (!this.profile) return;
    this.profileForm.patchValue({
      bio: this.profile.bio ?? '',
      hourlyRate: this.profile.hourlyRate,
      city: this.profile.city ?? '',
      country: this.profile.country ?? '',
      education: this.profile.education ?? '',
      experienceYears: this.profile.experienceYears,
      profilePhotoUrl: this.profile.profilePhotoUrl ?? '',
      isAvailable: this.profile.isAvailable,
    });
  }

  startCreate(): void {
    this.profileForm.reset({ isAvailable: true });
    this.state = 'create';
  }

  startEdit(): void {
    this.patchForm();
    this.state = 'edit';
  }

  cancelEdit(): void {
    this.state = 'view';
    this.errorMessage = '';
  }

  toggleSubject(id: string): void {
    this.selectedSubjectIds = this.selectedSubjectIds.includes(id)
      ? this.selectedSubjectIds.filter(s => s !== id)
      : [...this.selectedSubjectIds, id];
  }

  isSubjectSelected(id: string): boolean {
    return this.selectedSubjectIds.includes(id);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.buildPayload();
    const isCreating = this.state === 'create';
    const request$ = isCreating
      ? this.tutorProfileService.createProfile(payload)
      : this.tutorProfileService.updateProfile(payload);

    request$.pipe(
      switchMap(profile => {
        this.profile = profile;
        return this.tutorProfileService.updateSubjects(this.selectedSubjectIds);
      }),
      takeUntil(this.destroy$),
    ).subscribe({
      next: updatedProfile => {
        this.profile = updatedProfile;
        this.isSaving = false;
        this.successMessage = isCreating
          ? 'Profile created successfully.'
          : 'Profile updated successfully.';
        this.state = 'view';
      },
      error: err => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message ?? 'Something went wrong. Please try again.';
      },
    });
  }

  private buildPayload() {
    const raw = this.profileForm.value;
    const payload: Record<string, unknown> = {};
    if (raw.bio) payload['bio'] = raw.bio;
    if (raw.hourlyRate !== null && raw.hourlyRate !== '') payload['hourlyRate'] = Number(raw.hourlyRate);
    if (raw.city) payload['city'] = raw.city;
    if (raw.country) payload['country'] = raw.country;
    if (raw.education) payload['education'] = raw.education;
    if (raw.experienceYears !== null && raw.experienceYears !== '') payload['experienceYears'] = Number(raw.experienceYears);
    if (raw.profilePhotoUrl) payload['profilePhotoUrl'] = raw.profilePhotoUrl;
    payload['isAvailable'] = raw.isAvailable;
    return payload;
  }

  formatLevel(level: string | null): string {
    if (!level) return '';
    return level.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }
}