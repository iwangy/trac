import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { environment } from '../../../environments/environment';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorHandlerService]
    });
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleError', () => {
    it('should handle HttpErrorResponse with error message', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Custom error message' },
        status: 400,
        statusText: 'Bad Request'
      });

      const errorMessage = service.handleError(errorResponse);
      expect(errorMessage).toBe('Custom error message');
    });

    it('should handle HttpErrorResponse with default message for status codes', () => {
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found'
      });

      const errorMessage = service.handleError(errorResponse);
      expect(errorMessage).toBe('The requested resource was not found.');
    });

    it('should handle client-side error', () => {
      const errorResponse = new HttpErrorResponse({
        error: new ErrorEvent('Network error', {
          message: 'Failed to connect to the server'
        })
      });

      const errorMessage = service.handleError(errorResponse);
      expect(errorMessage).toBe('Failed to connect to the server');
    });

    it('should handle runtime Error', () => {
      const error = new Error('Runtime error occurred');
      const errorMessage = service.handleError(error);
      expect(errorMessage).toBe('Runtime error occurred');
    });

    it('should handle unknown error type', () => {
      const errorMessage = service.handleError('Unknown error');
      expect(errorMessage).toBe('An unexpected error occurred');
    });
  });

  describe('logError', () => {
    it('should log error in development mode', () => {
      spyOn(console, 'error');
      const error = new Error('Test error');
      const context = 'TestComponent';

      service.logError(error, context);

      if (!environment.production) {
        expect(console.error).toHaveBeenCalledWith('Error in TestComponent:', error);
      }
    });

    it('should not log error in production mode', () => {
      spyOn(console, 'error');
      const originalEnv = environment.production;
      environment.production = true;

      const error = new Error('Test error');
      service.logError(error, 'TestComponent');

      expect(console.error).not.toHaveBeenCalled();

      environment.production = originalEnv;
    });
  });
}); 