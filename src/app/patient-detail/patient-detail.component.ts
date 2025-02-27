import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Firestore, doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import moment from 'moment';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogEditPatientComponent } from '../dialog-edit-patient/dialog-edit-patient.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { increment } from 'firebase/firestore';

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

      // Überprüfe, ob der Patient 3 oder mehr unbezahlte Rechnungen hat und aktualisiere ggf. den Versicherungsstatus
      await this.checkAndUpdateInsuranceStatus();
    } catch (error) {
      console.error('Fehler beim Laden der Rechnungen:', error);
    }
  }

  async updateInvoiceStatus(invoiceId: string, newPaid: boolean) {
    try {
      const db = this.firestore;
      const invoiceRef = doc(db, 'invoices', invoiceId);
      
      // Hole das aktuelle Rechnungsdokument, um den alten Status zu kennen
      const invoiceSnap = await getDoc(invoiceRef);
      if (!invoiceSnap.exists()) {
        console.error('Rechnung nicht gefunden');
        return;
      }
      const invoiceData = invoiceSnap.data();
      const previousPaid = invoiceData['paid'];

      // Rechnung aktualisieren
      await updateDoc(invoiceRef, { paid: newPaid });
      
      // Falls die Rechnung von unpaid zu paid geändert wurde, aktualisiere Einkommen und Kontostand
      if (!previousPaid && newPaid) {
        const amount = invoiceData['amount'] || 0;
        await this.updateIncomeAndBalance(amount);
      }
      
      // Rechnungen neu laden, um die UI zu aktualisieren
      await this.loadInvoices(this.patient.id);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Bezahlstatus:', error);
    }
  }

  async updateIncomeAndBalance(amount: number) {
    const db = this.firestore;
    
    // 1. Kontostand aktualisieren (Dokument "account/balance")
    const balanceRef = doc(db, 'account', 'balance');
    await updateDoc(balanceRef, {
      currentBalance: increment(amount)
    });
    
    // 2. Einkommen für den aktuellen Monat aktualisieren
    const currentMonth = moment().format('MM');  // Falls als Zahl gespeichert, verwende parseInt(moment().format('MM'))
    const currentYear = moment().format('YYYY');
    const incomeCollection = collection(db, 'income');
    
    // Abfrage des Einkommen-Dokuments für den aktuellen Monat und das aktuelle Jahr
    const incomeQuery = query(
      incomeCollection,
      where('month', '==', currentMonth),
      where('year', '==', currentYear)
    );
    const incomeSnapshot = await getDocs(incomeQuery);
    if (!incomeSnapshot.empty) {
      const incomeDoc = incomeSnapshot.docs[0];
      await updateDoc(doc(db, 'income', incomeDoc.id), {
        revenue: increment(amount)
      });
    } else {
      // Falls noch kein Dokument existiert, erstelle ein neues
      await addDoc(incomeCollection, {
        month: currentMonth,
        year: currentYear,
        revenue: amount,
        outstanding: 0
      });
    }
  }

  async checkAndUpdateInsuranceStatus() {
    // Zähle alle unbezahlten Rechnungen
    const unpaidCount = this.invoices.filter(invoice => !invoice.paid).length;
    // Falls 3 oder mehr unbezahlte Rechnungen vorliegen und der Patient noch als aktiv gilt
    if (unpaidCount >= 3 && this.patient.insuranceStatus) {
      try {
        const patientRef = doc(this.firestore, `customers/${this.patient.id}`);
        await updateDoc(patientRef, { insuranceStatus: false });
        this.patient.insuranceStatus = false;
        console.log('Versicherungsstatus wurde auf passiv gesetzt, da mindestens 3 unbezahlte Rechnungen vorliegen.');
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Versicherungsstatus:', error);
      }
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
