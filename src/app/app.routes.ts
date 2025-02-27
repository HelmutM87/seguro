import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PatientsComponent } from './patients/patients.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { SettingsComponent } from './settings/settings.component';
import { IncomeComponent } from './income/income.component';
import { ExpensesComponent } from './expenses/expenses.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'patients/:id', component: PatientDetailComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'income', component: IncomeComponent },
  { path: 'expenses', component: ExpensesComponent }
];
