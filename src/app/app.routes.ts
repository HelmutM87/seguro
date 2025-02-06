import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PatientsComponent } from './patients/patients.component';
import { SettingsComponent } from './settings/settings.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component'; // Import der Detailansicht-Komponente

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'patients/:id', component: PatientDetailsComponent }, // Neue Route für die Detailansicht mit ID-Parameter
  { path: 'settings', component: SettingsComponent },
];