import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AttendanceService, Meeting, Attendance } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

interface Student {
  _id: string;
  name: string;
}

interface StudentStats {
  totalHours: number;
  meetingTypeBreakdown: { [key: string]: number };
  recentSessions: Array<Attendance>;
}

@Component({
  selector: 'app-check-in-out',
  templateUrl: './check-in-out.component.html',
  styleUrls: ['./check-in-out.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule]
})
export class CheckInOutComponent implements OnInit {
  students: Student[] = [];
  selecteduserId: string = '';
  selectedStudent: Student | null = null;
  currentSession: any = null;
  activeMeetings: Meeting[] = [];
  stats: StudentStats | null = null;
  checkInForm: FormGroup;
  quickRegisterForm: FormGroup;
  searchTerm: string = '';
  filteredStudents: Student[] = [];
  selectedIndex: number = -1;
  showPassword: boolean = false;
  isRegistering: boolean = false;
  quickRegisterVisible: boolean = true;
  errorMessage = '';

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private fb: FormBuilder,
    private errorHandler: ErrorHandlerService
  ) {
    this.checkInForm = this.fb.group({
      meetingId: ['', Validators.required],
      notes: ['']
    });

    this.quickRegisterForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadActiveMeetings();
  }

  onSearchChange(event: any): void {
    const term = event.target.value.toLowerCase();
    this.filteredStudents = term ? 
      this.students.filter(student => 
        student.name.toLowerCase().includes(term)
      ).slice(0, 10) : [];
    this.selectedIndex = -1;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.filteredStudents.length) return;

    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredStudents.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0) {
          this.onStudentSelect(this.filteredStudents[this.selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.filteredStudents = [];
        this.selectedIndex = -1;
        break;
    }
  }

  private loadStudents(): void {
    this.attendanceService.getStudents().subscribe({
      next: (students) => {
        this.students = students;
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
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

  onStudentSelect(student: Student): void {
    if (student) {
      this.selecteduserId = student._id;
      this.selectedStudent = student;
      this.loadStudentData();
    }
  }

  private loadStudentData(): void {
    // Load current session
    this.attendanceService.getCurrentSession(this.selecteduserId).subscribe({
      next: (session) => {
        this.currentSession = session;
      },
      error: (error) => {
        this.errorMessage = this.errorHandler.handleError(error);
        this.errorHandler.logError(error, 'CheckInOutComponent.loadStudentData - getCurrentSession');
      }
    });

    // Load student stats
    this.attendanceService.getStudentStats(this.selecteduserId).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        this.errorMessage = this.errorHandler.handleError(error);
        this.errorHandler.logError(error, 'CheckInOutComponent.loadStudentData - getStudentStats');
      }
    });
  }

  clearStudent(): void {
    this.selecteduserId = '';
    this.selectedStudent = null;
    this.currentSession = null;
    this.stats = null;
    this.checkInForm.reset();
    this.searchTerm = '';
    this.filteredStudents = [];
    this.selectedIndex = -1;
  }

  checkIn(): void {
    if (this.checkInForm.valid && this.selectedStudent) {
      const data = {
        userId: this.selectedStudent._id,
        ...this.checkInForm.value
      };

      this.attendanceService.checkIn(data).subscribe({
        next: (session) => {
          this.currentSession = session;
          this.loadStudentData();
          this.checkInForm.reset();
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = this.errorHandler.handleError(error);
          this.errorHandler.logError(error, 'CheckInOutComponent.checkIn');
        }
      });
    }
  }

  checkOut(): void {
    if (this.currentSession) {
      this.attendanceService.checkOut(this.currentSession._id).subscribe({
        next: (updatedSession) => {
          // Update the stats first
          this.loadStudentData();
          // Then clear the current session
          this.currentSession = null;
        },
        error: (error) => {
          console.error('Error checking out:', error);
        }
      });
    }
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onQuickRegister(): Promise<void> {
    if (this.quickRegisterForm.valid) {
      this.isRegistering = true;
      try {
        const formData = {
          ...this.quickRegisterForm.value,
          role: 'student'
        };
        await this.authService.register(formData);
        // Reload students to include the new registration
        await this.loadStudents();
        // Find and select the newly registered student
        const newStudent = this.students.find(s => s.name === formData.name);
        if (newStudent) {
          this.onStudentSelect(newStudent);
        }
        this.quickRegisterForm.reset();
      } catch (error) {
        console.error('Quick registration error:', error);
      } finally {
        this.quickRegisterVisible = false;
        this.isRegistering = false;
      }
    }
  }
}
