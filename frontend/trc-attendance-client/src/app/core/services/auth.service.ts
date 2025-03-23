import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  token: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private platformId = inject(PLATFORM_ID);
  private authStateSubject = new BehaviorSubject<boolean>(false);

  isAuthenticated$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    let storedUser = null;
    if (isPlatformBrowser(this.platformId)) {
      storedUser = localStorage.getItem('currentUser');
    }
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.authStateSubject.next(this.checkInitialAuthState());
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private checkInitialAuthState(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const token = localStorage.getItem('token');
    return !!token;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.post<User>(`${this.apiUrl}/login`, { email, password })
      );
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', user.token);
      }
      this.currentUserSubject.next(user);
      this.authStateSubject.next(true);

      // Navigate based on role
      if (user.role === 'student') {
        this.router.navigate(['/student/check-in-out']);
      } else if (user.role === 'admin') {
        this.router.navigate(['/admin/meeting-types']);
      } else {
        this.router.navigate(['/mentor/dashboard']);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.error?.message || 'Failed to login');
    }
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'mentor' | 'admin';
    mentorCode?: string;
    adminCode?: string;
  }): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.post<User>(`${this.apiUrl}/register`, {
          ...userData,
          userId: Math.random().toString(36).substr(2, 9) // Generate a random student ID
        })
      );

      if (user.role === 'mentor' || user.role === 'admin') {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', user.token);
        }
        this.currentUserSubject.next(user);
        this.authStateSubject.next(true);

        this.router.navigate(user.role === 'mentor' ? ['/mentor/dashboard'] : ['/admin/meeting-types']);
      }
      this.router.navigate(['/student/check-in-out']);
      
      // if (isPlatformBrowser(this.platformId)) {
      //   localStorage.setItem('currentUser', JSON.stringify(user));
      //   localStorage.setItem('token', user.token);
      // }
      // this.currentUserSubject.next(user);
      // this.authStateSubject.next(true);

      // // Navigate based on role
      // if (user.role === 'student') {
      //   this.router.navigate(['/student/check-in-out']);
      // } else if (user.role === 'mentor') {
      //   this.router.navigate(['/mentor/dashboard']);
      // } else if (user.role === 'admin') {
      //   this.router.navigate(['/admin/meeting-types']);
      // }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.error?.message || 'Failed to register');
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
    this.authStateSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value;
  }

  isMentor(): boolean {
    return this.currentUserValue?.role === 'mentor';
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('token');
  }

  getCurrentUserId(): string {
    return this.currentUserValue?._id || '';
  }
}
