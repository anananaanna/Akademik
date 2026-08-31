import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs';
import { TimeSlotService, TimeSlot } from '../../core/services/time-slot.service';

type PageState = 'loading' | 'list' | 'create';

@Component({
  selector: 'app-my-slots',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-slots.component.html',
  styleUrl: './my-slots.component.scss',
})
export class MySlotsComponent implements OnInit, OnDestroy {
  state: PageState = 'loading';
  slots: TimeSlot[] = [];
  isSubmitting = false;
  deletingId = '';
  cancellingId = '';
  errorMessage = '';
  successMessage = '';

  slotForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private timeSlotService: TimeSlotService,
    private fb: FormBuilder,
  ) {
    this.slotForm = this.buildForm();
  }

  ngOnInit(): void {
    this.loadSlots();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      notes: [''],
    });
  }

  private loadSlots(): void {
    this.state = 'loading';
    this.timeSlotService.getMySlots()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: slots => {
          this.slots = slots.sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          this.state = 'list';
        },
        error: () => {
          this.errorMessage = 'Failed to load your time slots.';
          this.state = 'list';
        },
      });
  }

  startCreate(): void {
    this.slotForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.state = 'create';
  }

  cancelCreate(): void {
    this.state = 'list';
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.slotForm.invalid) {
      this.slotForm.markAllAsTouched();
      return;
    }

    const { startTime, endTime, notes } = this.slotForm.value;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      this.errorMessage = 'End time must be after start time.';
      return;
    }

    if (start < new Date()) {
      this.errorMessage = 'Start time must be in the future.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: { startTime: string; endTime: string; notes?: string } = {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };

    if (notes?.trim()) {
      payload.notes = notes.trim();
    }

    this.timeSlotService.createSlot(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = 'Time slot created successfully.';
          this.loadSlots();
        },
        error: err => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.message ?? 'Failed to create time slot.';
        },
      });
  }

  cancelSlot(id: string): void {
    this.cancellingId = id;
    this.errorMessage = '';

    this.timeSlotService.updateSlot(id, { status: 'CANCELLED' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updated => {
          this.slots = this.slots.map(s => s.id === id ? updated : s);
          this.cancellingId = '';
        },
        error: err => {
          this.cancellingId = '';
          this.errorMessage = err?.error?.message ?? 'Failed to cancel time slot.';
        },
      });
  }

  deleteSlot(id: string): void {
    this.deletingId = id;
    this.errorMessage = '';

    this.timeSlotService.deleteSlot(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.slots = this.slots.filter(s => s.id !== id);
          this.deletingId = '';
        },
        error: err => {
          this.deletingId = '';
          this.errorMessage = err?.error?.message ?? 'Failed to delete time slot.';
        },
      });
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDuration(start: string, end: string): string {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    return diff >= 60 ? `${diff / 60}h` : `${diff}min`;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  canDelete(slot: TimeSlot): boolean {
    return slot.status === 'AVAILABLE';
  }

  canCancel(slot: TimeSlot): boolean {
    return slot.status === 'AVAILABLE';
  }

  isPast(slot: TimeSlot): boolean {
    return new Date(slot.startTime) < new Date();
  }
}