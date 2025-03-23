import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService, User } from './auth.service';
import { environment } from '../../../environments/environment';
import { PLATFORM_ID } from '@angular/core';
import { Routes } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockRoutes: Routes = [
    { path: 'auth/login', redirectTo: '' },
    { path: 'student/check-in-out', redirectTo: '' },
    { path: 'admin/meeting-types', redirectTo: '' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(mockRoutes)
      ],
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  const mockUser: User = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'student',
    token: 'mock-token'
  };

  describe('authentication', () => {
    it('should handle login and store user data', fakeAsync(async () => {
      const loginPromise = service.login('test@example.com', 'password123');
      
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockUser);

      await loginPromise;
      tick();

      expect(service.currentUserValue).toEqual(mockUser);
      expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockUser));
      expect(localStorage.getItem('token')).toBe(mockUser.token);
      expect(service.isAuthenticated()).toBe(true);
    }));

    it('should handle logout', fakeAsync(() => {
      // Setup logged in state
      service.login('test@example.com', 'password123');
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockUser);
      tick();

      service.logout();
      tick();

      expect(service.currentUserValue).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    }));
  });

  describe('role checks', () => {
    it('should correctly identify user roles', fakeAsync(async () => {
      const adminUser = { ...mockUser, role: 'admin' };
      const loginPromise = service.login('admin@example.com', 'password');
      
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(adminUser);
      
      await loginPromise;
      tick();
      
      expect(service.isAdmin()).toBe(true);
      expect(service.isMentor()).toBe(false);

      service.logout();
      expect(service.isAdmin()).toBe(false);
      expect(service.isMentor()).toBe(false);
    }));
  });
});
