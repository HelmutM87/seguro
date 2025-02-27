import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DialogAddCustomerComponent } from '../dialog-add-customer/dialog-add-customer.component';

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
  unpaidInvoicesCount$ = collectionData(
    // Alle Rechnungen mit paid==false abrufen
    // (Da hier keine Patientenspezifische Filterung erfolgt, werden alle offenen Rechnungen im System gezählt)
    collection(this.firestore, 'invoices')
  ).pipe(
    map((invoices: any[]) => invoices.filter(inv => inv.paid === false).length)
  );

  constructor(private dialog: MatDialog) {}

  openAddCustomerDialog() {
    this.dialog.open(DialogAddCustomerComponent, { width: '400px' });
  }

  goToOpenInvoices() {
    // Navigiere zur Patientenliste und übergebe den Query-Parameter "openInvoices=true"
    this.router.navigate(['/patients'], { queryParams: { openInvoices: true } });
  }
}
