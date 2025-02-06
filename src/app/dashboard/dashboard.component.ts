import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { DialogAddCustomerComponent } from '../dialog-add-customer/dialog-add-customer.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs/operators'; // Import for map operator

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
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private firestore: Firestore = inject(Firestore);
  insuredPeople$: Observable<any[]>;
  insuredPeopleCount: number = 0; // Add a variable to store the count

  constructor(private dialog: MatDialog) {
    const insuredCollection = collection(this.firestore, 'insuredPeople');
    this.insuredPeople$ = collectionData(insuredCollection).pipe(
      map(insuredPeople => {
        this.insuredPeopleCount = insuredPeople.length; // Update the count
        return insuredPeople; // Return the original array
      })
    );
  }

  openAddCustomerDialog() {
    this.dialog.open(DialogAddCustomerComponent, {
      width: '400px'
    });
  }
}