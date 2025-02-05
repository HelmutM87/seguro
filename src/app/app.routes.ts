// routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component'; // Import your DashboardComponent
import { PatientsComponent } from './patients/patients.component'; // Import your PatientsComponent

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Redirect empty path to dashboard
  { path: 'dashboard', component: DashboardComponent }, // Route for the dashboard
  { path: 'patients', component: PatientsComponent }, // Route for the patients component
  // Add other routes as needed
];