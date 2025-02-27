import * as admin from "firebase-admin";
import {setGlobalOptions} from "firebase-functions/v2/options";
import {onSchedule} from "firebase-functions/v2/scheduler";

// Firebase Admin initialisieren
admin.initializeApp();

// Globale Optionen für Firebase Functions setzen
setGlobalOptions({region: "southamerica-east1"});

/**
 * Stündliche Rechnungsgenerierung
 */
export const createHourlyInvoices = onSchedule(
  {
    schedule: "0 * * * *",
    timeZone: "America/La_Paz",
  },
  async () => {
    const today = new Date();

    try {
      // Patienten abrufen
      const patients = await getAllPatients();

      // Batch-Operation für Firestore
      const batch = admin.firestore().batch();
      const invoicesCollection = admin.firestore().collection("invoices");

      // Rechnungen für jeden Patienten erstellen
      patients.forEach((patient) => {
        const newInvoiceRef = invoicesCollection.doc();
        batch.set(newInvoiceRef,
          {
            patientId: patient.id,
            date: today,
            amount: 200,
            description: "Monatsbeitrag",
            paid: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      });

      // Batch ausführen
      await batch.commit();
    } catch (error) {
      console.error("Fehler bei der Rechnungsgenerierung:", error);
    }
  }
);

/**
 * Gibt eine Liste aller Patienten aus der Firestore-Datenbank zurück.
 */
async function getAllPatients(): Promise<{id:string}[]> {
  try {
    const snapshot = await admin.firestore().collection("customers").get();
    return snapshot.docs.map((doc) => ({id: doc.id}));
  } catch (error) {
    console.error("Fehler beim Laden der Patienten:", error);
    return [];
  }
}
