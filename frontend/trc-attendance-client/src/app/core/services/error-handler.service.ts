import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  handleError(error: any): string {
    if (error instanceof HttpErrorResponse) {
      // Handle HTTP errors
      return this.handleHttpError(error);
    } else if (error instanceof Error) {
      // Handle runtime errors
      return this.handleRuntimeError(error);
    }
    // Handle unknown errors
    return 'An unexpected error occurred';
  }

  private handleHttpError(error: HttpErrorResponse): string {
    if (!environment.production) {
      console.error('HTTP Error:', error);
    }

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return error.error.message;
    }

    // Backend error with message
    if (error.error?.message) {
      return error.error.message;
    }

    // Default error messages based on status codes
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This operation could not be completed due to a conflict.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return `An error occurred (${error.status}). Please try again.`;
    }
  }

  private handleRuntimeError(error: Error): string {
    if (!environment.production) {
      console.error('Runtime Error:', error);
    }
    return error.message || 'An application error occurred';
  }

  logError(error: any, context: string): void {
    if (!environment.production) {
      console.error(`Error in ${context}:`, error);
    }
    // Here you could add error reporting service integration
    // e.g., Sentry, LogRocket, etc.
  }
} 