/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
admin.initializeApp();

export const createMonthlyInvoices = functions.pubsub
  .schedule('0 0 1-7 * *') // Läuft täglich 00:00 an den ersten 7 Tagen jedes Monats
  .timeZone('Europe/Berlin') // Passen Sie die Zeitzone an
  .onRun(async (context: functions.EventContext) => {
    const today = new Date();
    
    // Prüfen, ob heute der erste Werktag des Monats ist
    if (isFirstWorkdayOfMonth(today)) {
      const patients = await getAllPatients();
      
      const batch = admin.firestore().batch();
      const invoicesCollection = admin.firestore().collection('invoices');
      
      patients.forEach(patient => {
        const newInvoiceRef = invoicesCollection.doc();
        batch.set(newInvoiceRef, {
          patientId: patient.id,
          date: today,
          amount: 200,
          description: 'Monatlicher Versicherungsbeitrag',
          paid: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log(`Created ${patients.length} monthly invoices`);
    }
    return null;
  });

/**
 * Überprüft, ob das angegebene Datum der erste Werktag des Monats ist.
 */
function isFirstWorkdayOfMonth(date: Date): boolean {
  // Ersten Tag des Monats finden
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  
  // Wochenende überspringen (Sa=6, So=0)
  while (firstDay.getDay() === 0 || firstDay.getDay() === 6) {
    firstDay.setDate(firstDay.getDate() + 1);
  }
  
  // Prüfen, ob das aktuelle Datum der erste Werktag ist
  return date.getDate() === firstDay.getDate();
}

/**
 * Gibt eine Liste aller Patienten aus der Firestore-Datenbank zurück.
 */
async function getAllPatients(): Promise<{ id: string; [key: string]: any }[]> {
  const snapshot = await admin.firestore().collection('customers').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}