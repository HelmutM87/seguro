import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { DialogAddCustomerComponent } from '../dialog-add-customer/dialog-add-customer.component';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';

// Define the Patient interface
interface Patient {
  id: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  city: string;
  // Add other properties as needed (e.g., documentNumber, phoneNumber, etc.)
  documentNumber?: string;
  phoneNumber?: string;
  paymentMethod?: string;
  insuranceStatus?: boolean;
  insuredSince?: string;
}


@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    DialogAddCustomerComponent,
  ],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent {
  private firestore: Firestore = inject(Firestore);
  patients$: Observable<Patient[]>; // Use the Patient interface
  displayedColumns: string[] = ['id', 'lastName', 'firstName', 'birthDate', 'city'];

  constructor(public dialog: MatDialog) {
    const patientsCollection = collection(this.firestore, 'customers');
    this.patients$ = collectionData(patientsCollection, { idField: 'id' }).pipe(
      map(patients => {
        return patients.map((patient): Patient => { // Type the patient in map function
          return {
            id: patient.id,
            lastName: patient['lastName'],
            firstName: patient['firstName'],
            birthDate: patient['birthDate'] ? moment(patient['birthDate'].toDate()).format('DD.MM.YYYY') : '',
            city: patient['city'],
            documentNumber: patient['documentNumber'], // Add other properties here
            phoneNumber: patient['phoneNumber'],
            paymentMethod: patient['paymentMethod'],
            insuranceStatus: patient['insuranceStatus'],
            insuredSince: patient['insuredSince'] ? moment(patient['insuredSince'].toDate()).format('DD.MM.YYYY') : '',
          };
        }).sort((a, b) => a.lastName.localeCompare(b.lastName)); // Use a.lastName
      })
    );
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogAddCustomerComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      // Hier musst du nichts weiter tun, da die Daten bereits in Firestore gespeichert sind.
    });
  }
}