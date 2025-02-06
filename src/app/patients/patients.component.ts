import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table'; // Import für MatTableModule
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';


@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, // MatTableModule hinzufügen
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent {
  private firestore: Firestore = inject(Firestore);
  patients$: Observable<any[]>;
  displayedColumns: string[] = ['idNumber', 'lastName', 'firstName', 'birthDate', 'insuredSince', 'paymentMethod']; // Definieren der anzuzeigenden Spalten

  constructor() {
    const patientsCollection = collection(this.firestore, 'customers');
    this.patients$ = collectionData(patientsCollection).pipe(
      map(patients => patients.sort((a, b) => a['lastName'].localeCompare(b['lastName']))) // Sortierung nach Nachnamen
    );
  }
}