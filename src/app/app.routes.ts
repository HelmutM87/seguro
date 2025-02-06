import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PatientsComponent } from './patients/patients.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'settings', component: SettingsComponent },
];