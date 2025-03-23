import { Routes } from '@angular/router';
import { CheckInOutComponent } from './components/check-in-out/check-in-out.component';

export const STUDENT_ROUTES: Routes = [
  {
    path: 'check-in-out',
    component: CheckInOutComponent
  },
  {
    path: '',
    redirectTo: 'check-in-out',
    pathMatch: 'full'
  }
]; 