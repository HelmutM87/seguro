import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { DialogAddCustomerComponent } from '../dialog-add-customer/dialog-add-customer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButtonModule, // Buttons für Navigation & Aktionen
    MatDialogModule, // Dialog für Kunden hinzufügen
    MatSidenavModule, // Sidebar für Navigation
    MatCardModule, // Material Cards für die Kennzahlen
    MatListModule, // Falls du eine Patientenliste einbauen willst
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private firestore: Firestore = inject(Firestore);
  insuredPeople$: Observable<any[]>;

  constructor(private dialog: MatDialog) {
    const insuredCollection = collection(this.firestore, 'insuredPeople'); 
    this.insuredPeople$ = collectionData(insuredCollection);
  }

  openAddCustomerDialog() {
    this.dialog.open(DialogAddCustomerComponent, {
      width: '400px'
    });
  }
}
