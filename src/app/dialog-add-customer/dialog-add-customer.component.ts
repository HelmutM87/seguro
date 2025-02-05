import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, getFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-add-customer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './dialog-add-customer.component.html',
  styleUrls: ['./dialog-add-customer.component.css']
})
export class DialogAddCustomerComponent {
  customerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore, // Firestore direkt injizieren
    public dialogRef: MatDialogRef<DialogAddCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.customerForm = this.fb.group({
      idNumber: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      insuredSince: ['', Validators.required],
      insuranceStatus: [false, Validators.required],
      paymentMethod: ['', Validators.required]
    });
  }

  async saveCustomer() {
    if (this.customerForm.valid) {
      const db = getFirestore(); // Sicherstellen, dass Firestore verwendet wird
      const customersCollection = collection(db, 'customers'); 
      
      await addDoc(customersCollection, this.customerForm.value);
      this.dialogRef.close();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
