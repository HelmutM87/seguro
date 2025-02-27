import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData, Timestamp, query, where, getDocs } from '@angular/fire/firestore';
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
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

interface Patient {
  documentNumber: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  city: string;
  phoneNumber: string;
  insuranceStatus: string;
  id?: string;
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
  private route: ActivatedRoute = inject(ActivatedRoute);

  patients$: Observable<Patient[]>;
  displayedColumns: string[] = ['documentNumber', 'lastName', 'firstName', 'birthDate', 'city', 'phone', 'status'];
  searchQuery: string = '';
  allPatients: Patient[] = [];
  filteredPatients: Patient[] = [];

  constructor(public dialog: MatDialog) {
    const patientsCollection = collection(this.firestore, 'customers');
    this.patients$ = collectionData(patientsCollection, { idField: 'id' }).pipe(
      map(patients =>
        patients.map((patient): Patient => ({
          id: patient['id'],
          documentNumber: patient['documentNumber'],
          lastName: patient['lastName'],
          firstName: patient['firstName'],
          birthDate: this.convertTimestamp(patient['birthDate']),
          city: patient['city'],
          phoneNumber: patient['phoneNumber'] || '',
          insuranceStatus: patient['insuranceStatus'] === true ? 'aktiv' : (patient['insuranceStatus'] === false ? 'passiv' : patient['insuranceStatus'] || ''),
        }))
          .sort((a, b) => {
            if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) return -1;
            if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) return 1;
            if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return -1;
            if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return 1;
            return 0;
          })
      )
    );

    this.patients$.subscribe(data => {
      this.allPatients = data;
      // Standardmäßig alle Patienten anzeigen
      this.filteredPatients = [...this.allPatients];

      // Wenn Query-Parameter openInvoices=true, dann filtere Patienten, die offene Rechnungen haben
      if (this.route.snapshot.queryParams['openInvoices']) {
        this.filterPatientsWithOpenInvoices();
      }
    });
  }

  private async filterPatientsWithOpenInvoices() {
    try {
      // Hole alle Rechnungen, bei denen paid == false
      const invoicesCollection = collection(this.firestore, 'invoices');
      const q = query(invoicesCollection, where('paid', '==', false));
      const querySnapshot = await getDocs(q);
      // Sammle alle eindeutigen Patient-IDs mit offenen Rechnungen
      const openPatientIds = new Set(querySnapshot.docs.map(doc => doc.data()['patientId']));
      // Filtere die Patientenliste
      this.filteredPatients = this.allPatients.filter(patient => openPatientIds.has(patient.id));
    } catch (error) {
      console.error('Fehler beim Abrufen offener Rechnungen:', error);
    }
  }

  private convertTimestamp(timestamp: any): string {
    if (timestamp instanceof Timestamp) {
      return moment(timestamp.toDate()).format('DD.MM.YYYY');
    } else if (typeof timestamp === 'string') {
      return timestamp;
    }
    return '';
  }

  filterPatients() {
    const queryLower = this.searchQuery.toLowerCase();
    this.filteredPatients = this.allPatients.filter(patient =>
      patient.lastName.toLowerCase().includes(queryLower) ||
      patient.firstName.toLowerCase().includes(queryLower) ||
      patient.city.toLowerCase().includes(queryLower)
    );
  }

  viewPatientDetails(documentNumber: string) {
    this.router.navigate(['/patients', documentNumber]);
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogAddCustomerComponent);
    dialogRef.afterClosed().subscribe();
  }
}
