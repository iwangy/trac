import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { MeetingTypesComponent } from './components/meeting-types/meeting-types.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { DashboardComponent } from '../mentor/components/dashboard/dashboard.component';

import { ADMIN_ROUTES } from './admin.routes';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(ADMIN_ROUTES),
    NgbModule,
    // Import standalone components here
    AdminDashboardComponent,
    MeetingTypesComponent,
    UserManagementComponent,
    DashboardComponent
  ]
})
export class AdminModule { } 