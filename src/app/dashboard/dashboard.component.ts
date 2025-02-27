import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import moment from 'moment';
import { DialogAddCustomerComponent } from '../dialog-add-customer/dialog-add-customer.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    MatButtonModule,
    MatDialogModule,
    MatSidenavModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    CommonModule,
    AsyncPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);

  insuredPeopleCount$ = collectionData(collection(this.firestore, 'customers')).pipe(
    map(patients => patients.length)
  );
  activeInsuredCount$ = collectionData(collection(this.firestore, 'customers')).pipe(
    map(patients => patients.filter(patient => patient['insuranceStatus'] === true).length)
  );
  inactiveInsuredCount$ = collectionData(collection(this.firestore, 'customers')).pipe(
    map(patients => patients.filter(patient => patient['insuranceStatus'] === false).length)
  );
  unpaidInvoicesCount$ = collectionData(collection(this.firestore, 'invoices')).pipe(
    map((invoices: any[]) => invoices.filter(inv => inv.paid === false).length)
  );

  currentMonthRevenue$: Observable<number>;

  constructor(private dialog: MatDialog) {
    // Aktuelles Jahr und Monat bestimmen
    const currentMonth = moment().format('MM'); // z. B. "02"
    const currentYear = moment().format('YYYY'); // z. B. "2025"

    // Firestore-Abfrage: Einnahmen für den aktuellen Monat holen
    const incomeQuery = query(
      collection(this.firestore, 'income'),
      where('month', '==', currentMonth),
      where('year', '==', currentYear)
    );

    this.currentMonthRevenue$ = collectionData(incomeQuery).pipe(
      map((incomeEntries: any[]) => 
        incomeEntries.reduce((sum, entry) => sum + (entry.revenue || 0), 0)
      )
    );
  }

  openAddCustomerDialog() {
    this.dialog.open(DialogAddCustomerComponent, { width: '400px' });
  }

  goToOpenInvoices() {
    this.router.navigate(['/patients'], { queryParams: { openInvoices: true } });
  }
}
