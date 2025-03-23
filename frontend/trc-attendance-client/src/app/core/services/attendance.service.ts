import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Attendance {
  _id: string;
  student: string;
  checkIn: Date;
  checkOut?: Date;
  duration: number;
  meetingType: 'Mechanical' | 'Programming' | 'Drive' | 'Other' | 'Custom';
  customMeetingType?: string;
  location: string;
  notes?: string;
  meeting?: Meeting;
}

export interface Student {
  _id: string;
  name: string;
}

export interface Meeting {
  _id: string;
  meetingType: string;
  customMeetingType?: string;
  location: string;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  studentsPresent: string[];
}

export interface MentorDashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalHours: number;
  activeSessions: number;
  meetingTypeBreakdown: { [key: string]: number };
  recentSessions: Array<Attendance & { student: { _id: string; name: string } }>;
}

export interface MeetingType {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}`;
  private attendanceUrl = `${this.apiUrl}/attendance`;
  private meetingsUrl = `${this.apiUrl}/meetings`;

  constructor(private http: HttpClient) {}

  // Student methods
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/users/students`);
  }

  // Meeting management methods
  createMeeting(data: {
    meetingType: string;
    customMeetingType?: string;
    location: string;
    notes?: string;
  }): Observable<Meeting> {
    return this.http.post<Meeting>(`${this.meetingsUrl}`, data);
  }

  getActiveMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.meetingsUrl}/active`);
  }

  endMeeting(meetingId: string): Observable<Meeting> {
    return this.http.patch<Meeting>(`${this.meetingsUrl}/${meetingId}/end`, {});
  }

  // Attendance methods
  checkIn(data: { userId: string; meetingId: string; notes?: string }): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.attendanceUrl}/check-in`, data);
  }

  checkOut(attendanceId: string, notes?: string): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.attendanceUrl}/check-out/${attendanceId}`, { notes });
  }

  getCurrentSession(userId: string): Observable<Attendance | null> {
    return this.http.get<Attendance | null>(`${this.attendanceUrl}/current/${userId}`);
  }

  getAttendanceHistory(filters?: {
    startDate?: Date;
    endDate?: Date;
    meetingType?: string;
    userId?: string;
  }): Observable<Attendance[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate.toISOString());
      }
      if (filters.meetingType) {
        params = params.set('meetingType', filters.meetingType);
      }
      if (filters.userId) {
        params = params.set('userId', filters.userId);
      }
    }

    return this.http.get<Attendance[]>(`${this.attendanceUrl}/history`, { params });
  }

  // Stats methods
  getStudentStats(userId: string): Observable<{
    totalHours: number;
    meetingTypeBreakdown: { [key: string]: number };
    recentSessions: Attendance[];
  }> {
    return this.http.get<any>(`${this.attendanceUrl}/stats/${userId}`);
  }

  getMentorDashboardStats(filters?: {
    startDate?: string;
    endDate?: string;
    meetingType?: string;
  }): Observable<MentorDashboardStats> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate);
      }
      if (filters.meetingType) {
        params = params.set('meetingType', filters.meetingType);
      }
    }

    return this.http.get<MentorDashboardStats>(`${this.attendanceUrl}/mentor-stats`, { params });
  }

  // Meeting Types
  getMeetingTypes(): Observable<MeetingType[]> {
    return this.http.get<MeetingType[]>(`${this.meetingsUrl}/types`);
  }
}
