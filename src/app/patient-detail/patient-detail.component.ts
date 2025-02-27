import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Firestore, doc, getDoc, collection, query, where, getDocs, updateDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import moment from 'moment';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogEditPatientComponent } from '../dialog-edit-patient/dialog-edit-patient.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
})
export class PatientDetailComponent {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  patient: any = null;
  invoices: any[] = [];
  loading = true;

  constructor() {
    this.loadPatientData();
  }

  async loadPatientData() {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (!patientId) {
      console.error('Keine Patienten-ID gefunden');
      this.loading = false;
      return;
    }

    try {
      // Patientendaten laden
      const patientDocRef = doc(this.firestore, `customers/${patientId}`);
      const docSnap = await getDoc(patientDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.patient = {
          id: patientId,
          lastName: data['lastName'] || '',
          firstName: data['firstName'] || '',
          birthDate: this.convertTimestamp(data['birthDate']),
          city: data['city'] || '',
          documentNumber: data['documentNumber'] || '',
          phoneNumber: data['phoneNumber'] || '',
          email: data['email'] || '',
          insuredSince: this.convertTimestamp(data['insuredSince']),
          paymentMethod: data['paymentMethod'] || '',
          insuranceStatus: data['insuranceStatus'] || false,
          hasWhatsApp: data['hasWhatsApp'] || false
        };

        // Rechnungen laden
        await this.loadInvoices(patientId);
      } else {
        console.error('Patient nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Patientendaten:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadInvoices(patientId: string) {
    try {
      const db = this.firestore;
      const q = query(
        collection(db, 'invoices'),
        where('patientId', '==', patientId)
      );
      
      const querySnapshot = await getDocs(q);
      this.invoices = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: this.convertTimestamp(data['date']),
          amount: data['amount'],
          paid: data['paid']
        };
      });
    } catch (error) {
      console.error('Fehler beim Laden der Rechnungen:', error);
    }
  }

  async updateInvoiceStatus(invoiceId: string, paid: boolean) {
    try {
      const db = this.firestore;
      const invoiceRef = doc(db, 'invoices', invoiceId);
      await updateDoc(invoiceRef, { paid });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Bezahlstatus:', error);
    }
  }

  openEditDialog() {
    const dialogRef = this.dialog.open(DialogEditPatientComponent, {
      width: '400px',
      data: this.patient
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'deleted') {
        this.router.navigate(['/patients']);
      } else if (result) {
        this.loadPatientData();
      }
    });
  }

  private convertTimestamp(timestamp: any): string {
    if (timestamp?.toDate) {
      return moment(timestamp.toDate()).format('DD.MM.YYYY');
    }
    return moment(timestamp).format('DD.MM.YYYY');
  }
}