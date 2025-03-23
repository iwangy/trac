import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CheckInOutComponent } from './check-in-out.component';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';

describe('CheckInOutComponent', () => {
  let component: CheckInOutComponent;
  let fixture: ComponentFixture<CheckInOutComponent>;
  let attendanceServiceSpy: jasmine.SpyObj<AttendanceService>;
  let errorHandlerServiceSpy: jasmine.SpyObj<ErrorHandlerService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockStats = {
    totalHours: 0,
    meetingTypeBreakdown: {},
    recentSessions: []
  };

  beforeEach(async () => {
    attendanceServiceSpy = jasmine.createSpyObj('AttendanceService', [
      'getStudents',
      'getCurrentSession',
      'getActiveMeetings',
      'checkIn',
      'checkOut',
      'getStudentStats'
    ]);
    errorHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleError', 'logError']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'register'], {
      currentUserValue: { role: 'student' }
    });

    // Setup default return values
    attendanceServiceSpy.getStudents.and.returnValue(of([]));
    attendanceServiceSpy.getActiveMeetings.and.returnValue(of([]));
    attendanceServiceSpy.getCurrentSession.and.returnValue(of(null));
    attendanceServiceSpy.getStudentStats.and.returnValue(of(mockStats));
    authServiceSpy.register.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        CheckInOutComponent
      ],
      providers: [
        { provide: AttendanceService, useValue: attendanceServiceSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckInOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students and active meetings on init', () => {
    expect(attendanceServiceSpy.getStudents).toHaveBeenCalled();
    expect(attendanceServiceSpy.getActiveMeetings).toHaveBeenCalled();
  });

  it('should handle student search', () => {
    const mockEvent = { target: { value: 'John' } };
    const mockStudents = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'John Smith' }
    ];
    component.students = mockStudents;
    
    component.onSearchChange(mockEvent);
    
    expect(component.filteredStudents.length).toBe(2);
    expect(component.selectedIndex).toBe(-1);
  });

  it('should handle student selection', () => {
    const mockStudent = { _id: '1', name: 'John Doe' };
    attendanceServiceSpy.getCurrentSession.and.returnValue(of(null));
    attendanceServiceSpy.getStudentStats.and.returnValue(of(mockStats));

    component.onStudentSelect(mockStudent);

    expect(component.selectedStudent).toEqual(mockStudent);
    expect(attendanceServiceSpy.getCurrentSession).toHaveBeenCalledWith(mockStudent._id);
    expect(attendanceServiceSpy.getStudentStats).toHaveBeenCalledWith(mockStudent._id);
  });

  it('should handle quick registration form submission', async () => {
    const mockStudent = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    component.quickRegisterForm.setValue(mockStudent);
    await component.onQuickRegister();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      ...mockStudent,
      role: 'student'
    });
    expect(attendanceServiceSpy.getStudents).toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should clear student selection', () => {
    component.selectedStudent = { _id: '1', name: 'John Doe' };
    component.currentSession = { _id: '1' };
    component.stats = mockStats;

    component.clearStudent();

    expect(component.selectedStudent).toBeNull();
    expect(component.currentSession).toBeNull();
    expect(component.stats).toBeNull();
    expect(component.searchTerm).toBe('');
  });
});
