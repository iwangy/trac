import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardComponent } from './dashboard.component';
import { AttendanceService, MeetingType } from '../../../core/services/attendance.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let attendanceService: jasmine.SpyObj<AttendanceService>;
  let errorHandlerService: jasmine.SpyObj<ErrorHandlerService>;

  const mockStats = {
    totalStudents: 10,
    activeStudents: 5,
    totalHours: 100,
    activeSessions: 2,
    meetingTypeBreakdown: { 'tutoring': 5, 'workshop': 3 },
    recentSessions: []
  };

  const mockMeetingTypes: MeetingType[] = [
    {
      _id: '1',
      name: 'tutoring',
      description: 'Tutoring Session',
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'workshop',
      description: 'Workshop Session',
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    attendanceService = jasmine.createSpyObj('AttendanceService', [
      'getMentorDashboardStats',
      'getActiveMeetings',
      'getMeetingTypes'
    ]);
    errorHandlerService = jasmine.createSpyObj('ErrorHandlerService', ['handleError']);

    attendanceService.getMentorDashboardStats.and.returnValue(of(mockStats));
    attendanceService.getActiveMeetings.and.returnValue(of([]));
    attendanceService.getMeetingTypes.and.returnValue(of(mockMeetingTypes));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        NgbModule,
        DashboardComponent
      ],
      providers: [
        { provide: AttendanceService, useValue: attendanceService },
        { provide: ErrorHandlerService, useValue: errorHandlerService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load initial data', () => {
    expect(component).toBeTruthy();
    expect(component.filterForm).toBeDefined();
    expect(component.meetingForm).toBeDefined();
    
    expect(attendanceService.getMeetingTypes).toHaveBeenCalled();
    expect(attendanceService.getMentorDashboardStats).toHaveBeenCalled();
    expect(attendanceService.getActiveMeetings).toHaveBeenCalled();
  });

  it('should initialize forms with correct controls', () => {
    expect(component.filterForm.get('dateRange')).toBeTruthy();
    expect(component.filterForm.get('meetingType')).toBeTruthy();
    expect(component.filterForm.get('sortBy')).toBeTruthy();

    expect(component.meetingForm.get('meetingType')).toBeTruthy();
    expect(component.meetingForm.get('location')).toBeTruthy();
    expect(component.meetingForm.get('notes')).toBeTruthy();
  });
});
