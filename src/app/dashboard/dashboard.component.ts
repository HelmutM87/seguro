import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogAddCustomerComponent } from '../dialog-add-customer/dialog-add-customer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule, // Hier MatDialogModule importieren
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private firestore: Firestore = inject(Firestore); // Firestore korrekt injizieren
  insuredPeople$: Observable<any[]>;

  constructor(private dialog: MatDialog) {
    const insuredCollection = collection(this.firestore, 'insuredPeople'); 
    this.insuredPeople$ = collectionData(insuredCollection);
  }

  openAddCustomerDialog() {
    this.dialog.open(DialogAddCustomerComponent, {
      width: '400px' // Optional: Breite des Dialogs anpassen
    });
  }
}
