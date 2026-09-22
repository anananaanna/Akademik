import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AdminApplication {
  id: string;
  userId: string;
  motivation: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit, OnDestroy {
  users: AdminUser[] = [];
  applications: AdminApplication[] = [];
  isLoadingUsers = true;
  isLoadingApplications = true;
  errorMessage = '';
  activeTab: 'users' | 'applications' = 'users';

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadApplications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    this.http.get<AdminUser[]>(`${environment.apiUrl}/users`).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: users => {
        this.users = users;
        this.isLoadingUsers = false;
      },
      error: () => {
        this.isLoadingUsers = false;
        this.errorMessage = 'Failed to load users.';
      },
    });
  }

  private loadApplications(): void {
    this.http.get<AdminApplication[]>(`${environment.apiUrl}/tutor-applications`).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: applications => {
        this.applications = applications;
        this.isLoadingApplications = false;
      },
      error: () => {
        this.isLoadingApplications = false;
      },
    });
  }

  setTab(tab: 'users' | 'applications'): void {
    this.activeTab = tab;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'badge-admin' : 'badge-user';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'badge-approved';
      case 'REJECTED': return 'badge-rejected';
      default: return 'badge-pending';
    }
  }
}