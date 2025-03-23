import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

  navigateByRole(role: string): void {
    switch (role) {
      case 'student':
        this.router.navigate(['/student/check-in-out']);
        break;
      case 'mentor':
        this.router.navigate(['/mentor/dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin/meeting-types']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToAdminUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToAdminMeetingTypes(): void {
    this.router.navigate(['/admin/meeting-types']);
  }

  navigateToMentorDashboard(): void {
    this.router.navigate(['/mentor/dashboard']);
  }

  navigateToStudentCheckInOut(): void {
    this.router.navigate(['/student/check-in-out']);
  }
} 