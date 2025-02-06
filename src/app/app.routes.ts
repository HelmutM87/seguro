// routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component'; // Import your DashboardComponent
import { PatientsComponent } from './patients/patients.component'; // Import your PatientsComponent
import { SettingsComponent } from './settings/settings.component'; // Import your SettingsComponent

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'settings', component: SettingsComponent }, // Stelle sicher, dass diese Route existiert
];