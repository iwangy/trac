import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AttendanceService, Student, Meeting, Attendance } from './attendance.service';
import { environment } from '../../../environments/environment';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AttendanceService]
    });
    service = TestBed.inject(AttendanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStudents', () => {
    it('should fetch students', () => {
      const mockStudents: Student[] = [
        { _id: '1', name: 'John Doe' }
      ];

      service.getStudents().subscribe(students => {
        expect(students).toEqual(mockStudents);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/students`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStudents);
    });
  });

  describe('getCurrentSession', () => {
    it('should fetch current session for student', () => {
      const userId = '123';
      const mockSession: Attendance = {
        _id: '1',
        student: userId,
        checkIn: new Date(),
        duration: 0,
        meetingType: 'Programming',
        location: 'Main Room',
        meeting: {
          _id: '456',
          meetingType: 'Programming',
          location: 'Main Room',
          startTime: new Date(),
          studentsPresent: []
        }
      };

      service.getCurrentSession(userId).subscribe(session => {
        expect(session).toBeDefined();
        if (session) {
          expect(session).toEqual(jasmine.objectContaining(mockSession));
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/attendance/current/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);
    });
  });

  describe('getActiveMeetings', () => {
    it('should fetch active meetings', () => {
      const mockMeetings: Meeting[] = [{
        _id: '1',
        meetingType: 'Programming',
        location: 'Main Room',
        startTime: new Date(),
        studentsPresent: []
      }];

      service.getActiveMeetings().subscribe(meetings => {
        expect(meetings.length).toBe(1);
        expect(meetings[0]).toEqual(jasmine.objectContaining(mockMeetings[0]));
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/meetings/active`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMeetings);
    });
  });

  describe('checkIn', () => {
    it('should check in student', () => {
      const checkInData = {
        userId: '123',
        meetingId: '456',
        notes: 'Test check-in'
      };

      service.checkIn(checkInData).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/attendance/check-in`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(checkInData);
      req.flush({});
    });
  });

  describe('checkOut', () => {
    it('should check out student', () => {
      const attendanceId = '456';
      const notes = 'Test check-out';

      service.checkOut(attendanceId, notes).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/attendance/check-out/${attendanceId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ notes });
      req.flush({});
    });
  });

  describe('getStudentStats', () => {
    it('should fetch student stats', () => {
      const userId = '123';
      const mockStats = {
        totalHours: 10,
        meetingTypeBreakdown: { Programming: 5, Mechanical: 5 },
        recentSessions: []
      };

      service.getStudentStats(userId).subscribe(stats => {
        expect(stats).toEqual(mockStats);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/attendance/stats/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });
  });
});
