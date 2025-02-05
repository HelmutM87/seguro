import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent {
  private firestore: Firestore = inject(Firestore);
  patients$: Observable<any[]>;

  constructor() {
    const patientsCollection = collection(this.firestore, 'customers');
    this.patients$ = collectionData(patientsCollection).pipe(
      map(patients => patients.sort((a, b) => a['lastName'].localeCompare(b['lastName']))) // Sortierung nach Nachnamen
    );
  }
}