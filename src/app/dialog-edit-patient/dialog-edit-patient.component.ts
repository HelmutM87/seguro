import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Import für die Checkbox
import moment from 'moment';

// Datumsformat für die Anzeige definieren
const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
  },
};

@Component({
  selector: 'app-dialog-edit-patient',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatCheckboxModule, // Checkbox-Modul hinzufügen
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, Platform] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './dialog-edit-patient.component.html',
  styleUrls: ['./dialog-edit-patient.component.scss']
})
export class DialogEditPatientComponent {
  private firestore = inject(Firestore);
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogEditPatientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      firstName: [data.firstName || '', Validators.required],
      lastName: [data.lastName || '', Validators.required],
      birthDate: [data.birthDate ? moment(data.birthDate) : '', Validators.required],
      city: [data.city || '', Validators.required],
      documentNumber: [data.documentNumber || '', Validators.required],
      phoneNumber: [data.phoneNumber || '', Validators.required],
      email: [data.email || '', [Validators.email]], // E-Mail-Feld mit Validator
      insuredSince: [data.insuredSince ? moment(data.insuredSince) : '', Validators.required],
      paymentMethod: [data.paymentMethod || '', Validators.required],
      insuranceStatus: [data.insuranceStatus || false],
      hasWhatsApp: [data.hasWhatsApp || false] // Neue Checkbox für WhatsApp
    });
  }

  async saveChanges() {
    const patientRef = doc(this.firestore, `customers/${this.data.id}`);
    const formData = this.form.value;

    // Konvertiere das Datum zu einem JavaScript Date-Objekt
    const updatedData = {
      ...formData,
      birthDate: formData.birthDate ? moment(formData.birthDate).toDate() : null,
      insuredSince: formData.insuredSince ? moment(formData.insuredSince).toDate() : null
    };

    await updateDoc(patientRef, updatedData);
    this.dialogRef.close(true);
  }

  async deletePatient() {
    const patientRef = doc(this.firestore, `customers/${this.data.id}`);
    await deleteDoc(patientRef);
    this.dialogRef.close('deleted');
  }

  close() {
    this.dialogRef.close();
  }
}