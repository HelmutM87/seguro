import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import moment from 'moment';

interface MonthData {
  month: string;
  year: number;
  revenue: number;
  outstanding: number;
}

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule
  ],
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})
export class IncomeComponent implements OnInit {
  private firestore = inject(Firestore);

  currentBalance: number = 0;
  monthsData: MonthData[] = [];
  displayedColumns: string[] = ['monthYear', 'revenue', 'outstanding'];

  ngOnInit(): void {
    this.loadCurrentBalance();
    this.loadInvoicesData();
  }

  async loadCurrentBalance(): Promise<void> {
    const balanceDocRef = doc(this.firestore, 'account/balance');
    const balanceSnap = await getDoc(balanceDocRef);
    if (balanceSnap.exists()) {
      const data = balanceSnap.data();
      this.currentBalance = data['currentBalance'] || 0;
    } else {
      this.currentBalance = 0;
    }
  }

  loadInvoicesData(): void {
    // Übersicht für die letzten 12 Monate (inkl. dem laufenden Monat)
    const startDate = moment().subtract(11, 'months').startOf('month');
    const endDate = moment().endOf('month');
    const tempData: MonthData[] = [];
    const current = startDate.clone();

    while (current.isBefore(endDate) || current.isSame(endDate, 'month')) {
      tempData.push({
        month: current.format('MMMM'),
        year: current.year(),
        revenue: 0,
        outstanding: 0
      });
      current.add(1, 'month');
    }

    // Alle Rechnungen aus der Collection abrufen
    const invoicesCollection = collection(this.firestore, 'invoices');
    collectionData(invoicesCollection).subscribe((invoices: any[]) => {
      // Summen zurücksetzen
      tempData.forEach(entry => {
        entry.revenue = 0;
        entry.outstanding = 0;
      });
      // Gruppiere Rechnungen nach Monat und Jahr
      invoices.forEach(invoice => {
        let invoiceDate: moment.Moment;
        if (invoice.date && invoice.date.toDate) {
          invoiceDate = moment(invoice.date.toDate());
        } else {
          invoiceDate = moment(invoice.date);
        }
        if (invoiceDate.isBetween(startDate, endDate, 'month', '[]')) {
          const monthYearKey = invoiceDate.format('MMMM') + '-' + invoiceDate.year();
          const entry = tempData.find(m => (m.month + '-' + m.year) === monthYearKey);
          if (entry) {
            if (invoice.paid) {
              entry.revenue += invoice.amount;
            } else {
              entry.outstanding += invoice.amount;
            }
          }
        }
      });
      this.monthsData = tempData;
      this.updateCurrentBalance();
    });
  }

  async updateCurrentBalance(): Promise<void> {
    // Summiere alle Einnahmen (revenue) aus den Monatsdaten
    const newBalance = this.monthsData.reduce((sum, entry) => sum + entry.revenue, 0);
    const balanceDocRef = doc(this.firestore, 'account/balance');
    await setDoc(balanceDocRef, { currentBalance: newBalance }, { merge: true });
    this.currentBalance = newBalance;
  }
}
