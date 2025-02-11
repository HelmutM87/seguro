import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import { DialogAddCustomerComponent } from '../dialog-add-customer/dialog-add-customer.component';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface Patient {
  id: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  city: string;
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class PatientsComponent {
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);

  patients$: Observable<Patient[]>;
  displayedColumns: string[] = ['id', 'lastName', 'firstName', 'birthDate', 'city'];

  searchQuery: string = '';
  allPatients: Patient[] = [];
  filteredPatients: Patient[] = [];

  constructor(public dialog: MatDialog) {
    const patientsCollection = collection(this.firestore, 'customers');
    this.patients$ = collectionData(patientsCollection, { idField: 'id' }).pipe(
      map(patients => 
        patients
          .map((patient): Patient => ({
            id: patient.id,
            lastName: patient['lastName'],
            firstName: patient['firstName'],
            birthDate: this.convertTimestamp(patient['birthDate']),
            city: patient['city']
          }))
          .sort((a, b) => {
            // Sortiere zuerst nach Nachnamen
            if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) return -1;
            if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) return 1;

            // Wenn die Nachnamen gleich sind, sortiere nach Vornamen
            if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return -1;
            if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return 1;

            return 0; // Falls alles gleich ist
          })
      )
    );

    this.patients$.subscribe(data => {
      this.allPatients = data;
      this.filteredPatients = [...this.allPatients];
    });
  }

  private convertTimestamp(timestamp: any): string {
    if (timestamp instanceof Timestamp) {
      return moment(timestamp.toDate()).format('DD.MM.YYYY');
    } else if (typeof timestamp === 'string') {
      return timestamp; // Falls bereits als String gespeichert, direkt zurückgeben
    }
    return ''; // Falls null oder undefined
  }

  filterPatients() {
    const query = this.searchQuery.toLowerCase();
    this.filteredPatients = this.allPatients.filter(patient =>
      patient.lastName.toLowerCase().includes(query) ||
      patient.firstName.toLowerCase().includes(query) ||
      patient.city.toLowerCase().includes(query)
    );
  }

  viewPatientDetails(patientId: string) {
    this.router.navigate(['/patients', patientId]);
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogAddCustomerComponent);
    dialogRef.afterClosed().subscribe();
  }
}