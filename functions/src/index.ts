import * as admin from "firebase-admin";
import {setGlobalOptions} from "firebase-functions/v2/options";
import {onSchedule} from "firebase-functions/v2/scheduler";

// Firebase Admin initialisieren
admin.initializeApp();

// Globale Optionen für Firebase Functions setzen
setGlobalOptions({region: "southamerica-east1"});

/**
 * Tägliche Rechnungserzeugung und Statusüberprüfung
 */
export const createDailyInvoicesAndCheckStatus = onSchedule(
  {
    schedule: "0 0 * * *", // Jeden Tag um Mitternacht
    timeZone: "America/La_Paz",
  },
  async () => {
    const today = new Date();
    const db = admin.firestore();

    try {
      // Alle Patienten abrufen
      const patientsSnapshot = await db.collection("customers").get();
      const batch = db.batch();
      const invoicesCollection = db.collection("invoices");

      // Für jeden Patienten eine neue Rechnung erstellen
      patientsSnapshot.forEach((doc) => {
        const patientId = doc.id;
        const newInvoiceRef = invoicesCollection.doc();
        batch.set(newInvoiceRef, {
          patientId: patientId,
          date: today,
          amount: 200,
          description: "Monatsbeitrag",
          paid: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      // Batch-Operation ausführen
      await batch.commit();
      console.log("Tägliche Rechnungen wurden für alle Patienten erstellt.");

      // Für jeden Patienten prüfen, ob 3 oder mehr unbezahlte Rechnungen vorliegen
      for (const doc of patientsSnapshot.docs) {
        const patientId = doc.id;

        // **Geänderte Abfrage ohne query()**
        const invoicesSnapshot = await db.collection("invoices")
          .where("patientId", "==", patientId)
          .where("paid", "==", false)
          .get();

        if (invoicesSnapshot.size >= 3) {
          const patientRef = db.collection("customers").doc(patientId);
          await patientRef.update({insuranceStatus: false});
          console.log(`Patient ${patientId} wurde auf passiv gesetzt (≥3 unbezahlte Rechnungen).`);
        }
      }
    } catch (error) {
      console.error("Fehler bei der täglichen Rechnungserzeugung und Statusüberprüfung:", error);
    }
  }
);
