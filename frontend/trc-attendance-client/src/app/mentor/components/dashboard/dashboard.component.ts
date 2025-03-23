import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';

interface StudentStats {
  name: string;
  userId: string;
  totalHours: number;
  lastActive: Date;
  meetingTypeBreakdown: { [key: string]: number };
  sessions: any[];
}

interface Meeting {
  _id: string;
  meetingType: string;
  customMeetingType?: string;
  location: string;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  studentsPresent: string[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule]
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  students: StudentStats[] = [];
  selectedStudent: StudentStats | null = null;
  activeSessions = 0;
  activeMeetings: Meeting[] = [];
  filterForm: FormGroup;
  meetingForm: FormGroup;
  meetingTypes: string[] = [];
  private modalRef: NgbModalRef | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.filterForm = this.fb.group({
      dateRange: ['week'],
      startDate: [''],
      endDate: [''],
      meetingType: [''],
      sortBy: ['name'],
      showAllStudents: false,
    });

    this.meetingForm = this.fb.group({
      meetingType: ['', Validators.required],
      customMeetingType: [''],
      location: ['', Validators.required],
      notes: ['']
    });

    // Update date fields when date range changes
    this.filterForm.get('dateRange')?.valueChanges.subscribe(value => {
      if (value !== 'custom') {
        const dates = this.getDateRange(value);
        this.filterForm.patchValue({
          startDate: dates.start.toISOString().split('T')[0],
          endDate: dates.end.toISOString().split('T')[0]
        }, { emitEvent: false });
      }
      this.loadDashboardData();
    });

    // Reload data when meeting type changes
    this.filterForm.get('meetingType')?.valueChanges.subscribe(() => {
      this.loadDashboardData();
    });

    // Sort data when sort option changes
    this.filterForm.get('sortBy')?.valueChanges.subscribe(value => {
      this.sortStudents(value);
    });

    // Add validator for custom meeting type when meeting type is 'Custom'
    this.meetingForm.get('meetingType')?.valueChanges.subscribe(value => {
      const customControl = this.meetingForm.get('customMeetingType');
      if (value === 'Custom') {
        customControl?.setValidators([Validators.required]);
      } else {
        customControl?.clearValidators();
      }
      customControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadMeetingTypes();
    this.loadDashboardData();
    this.loadActiveMeetings();
  }

  private loadMeetingTypes(): void {
    this.attendanceService.getMeetingTypes().subscribe({
      next: (types) => {
        // Extract just the names from the meeting types
        this.meetingTypes = types.map(t => t.name);
        // Add 'Custom' option at the end if not already present
        if (!this.meetingTypes.includes('Custom')) {
          this.meetingTypes.push('Custom');
        }
      },
      error: (error) => {
        console.error('Error loading meeting types:', error);
        // Fallback to default meeting types if loading fails
        this.meetingTypes = ['Custom'];
      }
    });
  }

  private getDateRange(range: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      default:
        break;
    }

    return { start, end };
  }

  loadDashboardData(): void {
    const filters = this.getFilters();
    
    this.attendanceService.getMentorDashboardStats(filters).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.activeSessions = stats.activeSessions;
        this.processStudentData(stats.recentSessions);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  private getFilters(): any {
    const formValue = this.filterForm.value;
    const filters: any = {};

    if (formValue.dateRange === 'custom') {
      if (formValue.startDate) {
        filters.startDate = new Date(formValue.startDate).toISOString();
      }
      if (formValue.endDate) {
        filters.endDate = new Date(formValue.endDate).toISOString();
      }
    } else {
      const dates = this.getDateRange(formValue.dateRange);
      filters.startDate = dates.start.toISOString();
      filters.endDate = dates.end.toISOString();
    }

    if (formValue.meetingType) {
      filters.meetingType = formValue.meetingType;
    }

    filters.showAllStudents = formValue.showAllStudents;

    return filters;
  }

  private processStudentData(sessions: any[]): void {
    const studentMap = new Map<string, StudentStats>();
    // Process sessions
    sessions.forEach(session => {
      const { _id: userId, name } = session.student;
      const duration = (session.duration || 0) / 60; // Convert minutes to hours
      const checkInTime = new Date(session.checkIn);

      if (!studentMap.has(userId)) {
        studentMap.set(userId, {
          name,
          userId,
          totalHours: 0,
          lastActive: checkInTime,
          meetingTypeBreakdown: {},
          sessions: []
        });
      }

      const student = studentMap.get(userId)!;
      student.totalHours += duration;
      student.lastActive = new Date(Math.max(student.lastActive.getTime(), checkInTime.getTime()));
      student.meetingTypeBreakdown[session.meetingType] = (student.meetingTypeBreakdown[session.meetingType] ?? 0) + duration;
      student.sessions.push(session);
    });

    // Fetch all students if "showAllStudents" is checked
    if (this.filterForm.get('showAllStudents')?.value) {
      this.attendanceService.getStudents().subscribe({
        next: (allStudents) => {
          allStudents.forEach(({ _id: userId, name }) => {
            if (!studentMap.has(userId)) {
              studentMap.set(userId, {
                name,
                userId,
                totalHours: 0,
                lastActive: new Date(0), // Default to earliest date
                meetingTypeBreakdown: {},
                sessions: []
              });
            }
          });

          this.updateStudentList(studentMap);
        },
        error: (error) => console.error('Error fetching all students:', error)
      });
    } else {
      this.updateStudentList(studentMap);
    }
}

// Helper method to update student list and sort
private updateStudentList(studentMap: Map<string, StudentStats>): void {
  this.students = Array.from(studentMap.values());
  this.sortStudents(this.filterForm.get('sortBy')?.value);
}


  private sortStudents(sortBy: string): void {
    this.students.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'hours':
          return b.totalHours - a.totalHours;
        case 'recent':
          return b.lastActive.getTime() - a.lastActive.getTime();
        default:
          return 0;
      }
    });
  }

  applyFilters(): void {
    this.loadDashboardData();
  }

  resetFilters(): void {
    this.filterForm.patchValue({
      dateRange: 'week',
      meetingType: '',
      sortBy: 'name'
    });
    this.loadDashboardData();
  }

  viewDetails(student: StudentStats, content: TemplateRef<any>): void {
    this.selectedStudent = student;
    this.modalRef = this.modalService.open(content, { 
      size: 'lg',
      scrollable: true,
      backdrop: 'static',
      windowClass: 'modal-custom',
      centered: true
    });
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }

  exportToExcel(): void {
    // Convert students data to CSV format
    const headers = ['Name', 'Student ID', 'Total Hours', 'Last Active'];
    const csvData = this.students.map(student => [
      student.name,
      student.userId,
      student.totalHours.toFixed(2),
      new Date(student.lastActive).toLocaleString()
    ]);

    // Add headers to the beginning
    csvData.unshift(headers);

    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');

    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `student_attendance_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  openNewMeetingModal(content: TemplateRef<any>): void {
    this.meetingForm.reset();
    this.modalRef = this.modalService.open(content, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'modal-custom',
      centered: true
    });
  }

  createMeeting(): void {
    if (this.meetingForm.valid) {
      const formValue = this.meetingForm.value;
      const meetingData = {
        meetingType: formValue.meetingType,
        customMeetingType: formValue.meetingType === 'Custom' ? formValue.customMeetingType : undefined,
        location: formValue.location,
        notes: formValue.notes
      };

      this.attendanceService.createMeeting(meetingData).subscribe({
        next: () => {
          this.closeModal();
          this.loadActiveMeetings();
        },
        error: (error) => {
          console.error('Error creating meeting:', error);
        }
      });
    }
  }

  endMeeting(meetingId: string): void {
    if (confirm('Are you sure you want to end this meeting?')) {
      this.attendanceService.endMeeting(meetingId).subscribe({
        next: () => {
          this.loadActiveMeetings();
        },
        error: (error) => {
          console.error('Error ending meeting:', error);
        }
      });
    }
  }

  private loadActiveMeetings(): void {
    this.attendanceService.getActiveMeetings().subscribe({
      next: (meetings) => {
        this.activeMeetings = meetings;
      },
      error: (error) => {
        console.error('Error loading active meetings:', error);
      }
    });
  }

  formatDuration(hours: number): string {
    const totalMinutes = Math.round(hours * 60);
    if (totalMinutes >= 60) {
      const displayHours = Math.floor(totalMinutes / 60);
      const displayMinutes = totalMinutes % 60;
      return displayMinutes > 0 ? `${displayHours}h ${displayMinutes}m` : `${displayHours}h`;
    }
    return `${totalMinutes}m`;
  }
}