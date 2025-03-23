import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { MeetingTypesComponent } from './components/meeting-types/meeting-types.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { DashboardComponent } from '../mentor/components/dashboard/dashboard.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'meeting-types',
        component: MeetingTypesComponent
      },
      {
        path: 'users',
        component: UserManagementComponent
      },
      {
        path: '',
        redirectTo: 'meeting-types',
        pathMatch: 'full'
      }
    ]
  }
]; 