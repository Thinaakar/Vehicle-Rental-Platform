import { isFirebaseConfigured } from '@/lib/firebase/admin';
import { isCollectionEmpty } from '@/lib/firestore/app-data';
import { seedAllDemoData } from '@/lib/firestore/app-writes';

let seedPromise: Promise<void> | null = null;

export async function ensureSeedData(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  if (!seedPromise) {
    seedPromise = (async () => {
      if (await isCollectionEmpty('vehicles')) {
        await seedAllDemoData();
      }
    })().catch((e) => {
      seedPromise = null;
      throw e;
    });
  }
  await seedPromise;
}
