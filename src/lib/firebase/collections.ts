import { FieldValue, type Firestore } from 'firebase-admin/firestore';

import { appTemplate } from '@/templates/drivexpro';

export const TEMPLATE_COLLECTION = 'templates';
export const APP_TEMPLATE_ID = appTemplate.key;
export const TABLES_COLLECTION = 'tables';
export const RECORDS_COLLECTION = 'records';

export function appTemplateDoc(db: Firestore) {
  return db.collection(TEMPLATE_COLLECTION).doc(APP_TEMPLATE_ID);
}

export function appTableDoc(db: Firestore, name: string) {
  return appTemplateDoc(db).collection(TABLES_COLLECTION).doc(name);
}

export function appCollection(db: Firestore, name: string) {
  return appTableDoc(db, name).collection(RECORDS_COLLECTION);
}

export async function ensureAppTables(db: Firestore) {
  const batch = db.batch();
  batch.set(
    appTemplateDoc(db),
    {
      key: appTemplate.key,
      label: appTemplate.label,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  for (const table of appTemplate.tables) {
    batch.set(
      appTableDoc(db, table.key),
      {
        key: table.key,
        label: table.label,
        order: table.order,
        fields: table.fields,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  await batch.commit();
}
