import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  // Standardwerte gemäß den Vorgaben
  registrationPrices = {
    adult: 1000,    // Erwachsene Person (single)
    married: 900,   // Verheiratete Person
    child: 500      // Person unter 18 Jahre
  };

  monthlyContribution = 200; // Pro Person

  // Funktion zum Speichern der Preise – hier kannst du deinen Firebase-Service ansteuern
  savePrices() {
    console.log('Preise gespeichert:', this.registrationPrices, this.monthlyContribution);
    // z.B. this.firebaseService.savePrices({...});
  }
}
