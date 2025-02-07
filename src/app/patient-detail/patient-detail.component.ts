import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import moment from 'moment';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
})
export class PatientDetailComponent {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  
  patient: any = null;
  loading = true;

  constructor() {
    this.loadPatientData();
  }

  async loadPatientData() {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (!patientId) return;

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
        insuredSince: this.convertTimestamp(data['insuredSince']),
        paymentMethod: data['paymentMethod'] || '',
        insuranceStatus: data['insuranceStatus'] || ''
      };
    } else {
      console.error('Patient nicht gefunden');
    }
    this.loading = false;
  }

  private convertTimestamp(timestamp: any): string {
    return timestamp instanceof Timestamp ? moment(timestamp.toDate()).format('DD.MM.YYYY') : '';
  }
}
