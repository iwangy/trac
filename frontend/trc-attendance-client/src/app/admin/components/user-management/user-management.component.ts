import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../core/services/auth.service';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">
                <i class="bi bi-people me-2"></i>
                User Management
              </h5>

              <!-- Users List -->
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of users">
                      <td>{{ user.name }}</td>
                      <td>{{ user.email }}</td>
                      <td>
                        <select 
                          class="form-select form-select-sm" 
                          [value]="user.role"
                          (change)="updateUserRole(user._id, $event)"
                          [disabled]="user._id === currentUserId"
                          [ngClass]="{'disabled-select': user._id === currentUserId}"
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{{ user.createdAt | date }}</td>
                      <td>
                        <div class="btn-group">
                          <button 
                            class="btn btn-sm btn-danger" 
                            (click)="deleteUser(user._id)"
                            title="Delete User"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                          <button 
                            class="btn btn-sm btn-warning" 
                            (click)="deleteUserData(user._id)"
                            title="Delete User Data"
                          >
                            <i class="bi bi-eraser"></i>
                          </button>
                        </div>
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

    .form-select-sm {
      padding-top: .25rem;
      padding-bottom: .25rem;
      background-color:#f0f0f0; 
      color: #888;
    }

    .form-select-sm:focus {
      background-color: #f0f0f0; 
      color: #888;
      outline: none; 
      box-shadow: none; 
    }
    
    .disabled-select {
      background-color: #212529 ; 
      color: #888;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  currentUserId: string = '';

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.currentUserId = this.authService.getCurrentUserId();
  }

  async loadUsers(): Promise<void> {
    try {
      this.users = await this.adminService.getUsers();
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async updateUserRole(userId: string, event: Event): Promise<void> {
    const role = (event.target as HTMLSelectElement).value;
    try {
      await this.adminService.updateUserRole(userId, role);
      await this.loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await this.adminService.deleteUser(userId);
        await this.loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  }

  async deleteUserData(userId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this user\'s data? This action cannot be undone.')) {
      try {
        await this.adminService.deleteUserData(userId);
      } catch (error) {
        console.error('Error deleting user data:', error);
      }
    }
  }
} 