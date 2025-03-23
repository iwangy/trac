import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type UserRole = 'student' | 'mentor' | 'admin';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        CommonModule,
        RegisterComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('name')).toBeDefined();
    expect(component.registerForm.get('email')).toBeDefined();
    expect(component.registerForm.get('password')).toBeDefined();
    expect(component.registerForm.get('role')).toBeDefined();
  });

  it('should handle successful student registration', fakeAsync(() => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'student' as UserRole
    };

    const navigateSpy = spyOn(router, 'navigate');
    authService.register.and.returnValue(Promise.resolve());

    component.registerForm.patchValue(mockUser);
    component.onSubmit();
    tick();

    expect(authService.register).toHaveBeenCalledWith(mockUser);
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  }));

  it('should handle successful mentor registration', fakeAsync(() => {
    const mockUser = {
      name: 'Test Mentor',
      email: 'mentor@example.com',
      password: 'password123',
      role: 'mentor' as UserRole,
      mentorCode: 'TEST123'
    };

    const navigateSpy = spyOn(router, 'navigate');
    authService.register.and.returnValue(Promise.resolve());

    component.registerForm.patchValue(mockUser);
    component.onSubmit();
    tick();

    expect(authService.register).toHaveBeenCalledWith(mockUser);
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  }));

  it('should validate mentor code for mentor role', () => {
    const roleControl = component.registerForm.get('role');
    const mentorCodeControl = component.registerForm.get('mentorCode');

    roleControl?.setValue('mentor' as UserRole);
    fixture.detectChanges();

    expect(mentorCodeControl?.hasValidator(Validators.required)).toBeTruthy();
    expect(mentorCodeControl?.value).toBe('');

    roleControl?.setValue('student' as UserRole);
    fixture.detectChanges();

    expect(mentorCodeControl?.hasValidator(Validators.required)).toBeFalsy();
  });
});
