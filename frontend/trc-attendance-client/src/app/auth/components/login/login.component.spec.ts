import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let errorHandlerServiceSpy: jasmine.SpyObj<ErrorHandlerService>;
  let router: Router;

  beforeEach(async () => {
    const mockUser = { role: 'student' };
    authServiceSpy = jasmine.createSpyObj('AuthService', 
      ['login', 'isAuthenticated'], 
      { currentUserValue: mockUser }
    );
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigateByRole']);
    errorHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleError', 'logError']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        LoginComponent
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form', () => {
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should validate required fields', () => {
    const form = component.loginForm;
    expect(form.valid).toBeFalsy();

    const emailControl = form.get('email');
    const passwordControl = form.get('password');

    expect(emailControl?.errors?.['required']).toBeTruthy();
    expect(passwordControl?.errors?.['required']).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should validate password length', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.errors).toBeNull();
  });

  it('should call auth service on valid form submission', async () => {
    const testCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    authServiceSpy.login.and.returnValue(Promise.resolve());

    component.loginForm.setValue(testCredentials);
    await component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(authServiceSpy.login).toHaveBeenCalledWith(
      testCredentials.email,
      testCredentials.password
    );
    expect(navigationServiceSpy.navigateByRole).toHaveBeenCalledWith('student');
  });

  it('should handle login error', async () => {
    const error = new Error('Invalid credentials');
    authServiceSpy.login.and.returnValue(Promise.reject(error));
    errorHandlerServiceSpy.handleError.and.returnValue('Error message');

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    await component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(errorHandlerServiceSpy.handleError).toHaveBeenCalledWith(error);
    expect(errorHandlerServiceSpy.logError).toHaveBeenCalledWith(error, 'LoginComponent.onSubmit');
    expect(component.errorMessage).toBe('Error message');
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should check authentication in constructor', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    
    const newComponent = new LoginComponent(
      TestBed.inject(FormBuilder),
      authServiceSpy,
      navigationServiceSpy,
      errorHandlerServiceSpy
    );
    
    expect(navigationServiceSpy.navigateByRole).toHaveBeenCalledWith('student');
  });

  it('should mark form as touched when submitting invalid form', async () => {
    spyOn(component.loginForm, 'markAllAsTouched');
    await component.onSubmit();
    expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });
});
