import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-meeting-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">
                <i class="bi bi-calendar-event me-2"></i>
                Meeting Types
              </h5>

              <!-- Add New Meeting Type Form -->
              <form [formGroup]="meetingTypeForm" (ngSubmit)="onSubmit()" class="mb-4">
                <div class="row g-3 align-items-end">
                  <div class="col-md-4">
                    <label class="form-label">Meeting Type Name</label>
                    <input type="text" class="form-control" formControlName="name" placeholder="Enter meeting type name">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Description</label>
                    <input type="text" class="form-control" formControlName="description" placeholder="Enter description">
                  </div>
                  <div class="col-md-4">
                    <button type="submit" class="btn btn-primary" [disabled]="!meetingTypeForm.valid || isLoading">
                      <i class="bi bi-plus-circle me-2"></i>
                      Add Meeting Type
                    </button>
                  </div>
                </div>
              </form>

              <!-- Meeting Types List -->
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let type of meetingTypes">
                      <td>{{ type.name }}</td>
                      <td>{{ type.description }}</td>
                      <td>
                        <button class="btn btn-sm btn-danger" (click)="deleteMeetingType(type._id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: var(--bs-border-radius-lg);
      box-shadow: var(--bs-box-shadow);
    }

    .table {
      margin-bottom: 0;
    }

    .btn-sm {
      padding: .25rem .5rem;
    }
  `]
})
export class MeetingTypesComponent implements OnInit {
  meetingTypeForm: FormGroup;
  meetingTypes: any[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.meetingTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMeetingTypes();
  }

  async loadMeetingTypes(): Promise<void> {
    try {
      this.meetingTypes = await this.adminService.getMeetingTypes();
    } catch (error) {
      console.error('Error loading meeting types:', error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.meetingTypeForm.valid) {
      this.isLoading = true;
      try {
        await this.adminService.createMeetingType(this.meetingTypeForm.value);
        await this.loadMeetingTypes();
        this.meetingTypeForm.reset();
      } catch (error) {
        console.error('Error creating meeting type:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  async deleteMeetingType(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this meeting type?')) {
      try {
        await this.adminService.deleteMeetingType(id);
        await this.loadMeetingTypes();
      } catch (error) {
        console.error('Error deleting meeting type:', error);
      }
    }
  }
} 