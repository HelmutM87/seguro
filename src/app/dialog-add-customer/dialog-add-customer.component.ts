import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, getFirestore } from '@angular/fire/firestore';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { v4 as uuidv4 } from 'uuid';
import { MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment'; // Korrekter Import

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
  },
};


@Component({
  selector: 'app-dialog-add-customer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogTitle, MatDialogContent, MatDialogActions,
    MatCheckboxModule,
    MatDatepickerModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, Platform] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './dialog-add-customer.component.html',
  styleUrls: ['./dialog-add-customer.component.css']
})
export class DialogAddCustomerComponent {
  customerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    public dialogRef: MatDialogRef<DialogAddCustomerComponent>
  ) {
    this.customerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      city: ['', Validators.required],
      documentNumber: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      insuredSince: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      insuranceStatus: [false]
    });
  }

  async saveCustomer() {
    if (this.customerForm.valid) {
      const db = getFirestore();
      const customersCollection = collection(db, 'customers');

      const customerData = {
        ...this.customerForm.value,
        insuredNumber: uuidv4()
      };

      await addDoc(customersCollection, customerData);
      this.dialogRef.close(customerData);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}