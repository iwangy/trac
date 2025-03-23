import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // List of public endpoints that don't require authentication
  const publicEndpoints = [
    `${environment.apiUrl}/users/students`,
    `${environment.apiUrl}/meetings/active`,
    `${environment.apiUrl}/attendance/check-in`,
    `${environment.apiUrl}/attendance/check-out`,
    `${environment.apiUrl}/attendance/current-session`,
    `${environment.apiUrl}/attendance/stats`
  ];

  // Skip auth token for public endpoints
  if (publicEndpoints.some(endpoint => req.url.startsWith(endpoint))) {
    return next(req);
  }
  
  if (isPlatformBrowser(platformId)) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (currentUser && currentUser.token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
    }
  }

  return next(req);
};