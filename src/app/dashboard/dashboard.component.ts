import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { DialogAddCustomerComponent } from '../dialog-add-customer/dialog-add-customer.component';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';

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
  insuredPeopleCount$: Observable<number>; // Gesamtanzahl der Patienten
  activeInsuredCount$: Observable<number>; // Anzahl der aktiv Versicherten
  inactiveInsuredCount$: Observable<number>; // Anzahl der passiv Versicherten

  constructor(private dialog: MatDialog) {
    const customersCollection = collection(this.firestore, 'customers');
    
    // Gesamtanzahl der Patienten
    this.insuredPeopleCount$ = collectionData(customersCollection).pipe(
      map(patients => patients.length)
    );

    // Anzahl der aktiv Versicherten
    this.activeInsuredCount$ = collectionData(customersCollection).pipe(
      map(patients => patients.filter(patient => patient['insuranceStatus'] === true).length)
    );

    // Anzahl der passiv Versicherten
    this.inactiveInsuredCount$ = collectionData(customersCollection).pipe(
      map(patients => patients.filter(patient => patient['insuranceStatus'] === false).length)
    );
  }

  openAddCustomerDialog() {
    this.dialog.open(DialogAddCustomerComponent, {
      width: '400px'
    });
  }
}