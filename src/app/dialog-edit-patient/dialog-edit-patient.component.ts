import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Firestore, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

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
    MatOptionModule
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
      firstName: [data.firstName || ''],
      lastName: [data.lastName || ''],
      birthDate: [data.birthDate || ''],
      city: [data.city || ''],
      documentNumber: [data.documentNumber || ''],
      phoneNumber: [data.phoneNumber || ''],
      insuredSince: [data.insuredSince || ''],
      paymentMethod: [data.paymentMethod || ''],
      insuranceStatus: [data.insuranceStatus || false]
    });
  }

  async saveChanges() {
    const patientRef = doc(this.firestore, `customers/${this.data.id}`);
    await updateDoc(patientRef, this.form.value);
    this.dialogRef.close(true); // Dialog schließen und aktualisieren
  }

  async deletePatient() {
    const patientRef = doc(this.firestore, `customers/${this.data.id}`);
    await deleteDoc(patientRef);
    this.dialogRef.close('deleted'); // Patient gelöscht, zurück zur Liste
  }

  close() {
    this.dialogRef.close();
  }
}
