import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getDefaultMasterData, mergeMasterData, type MasterDataBundle } from '@/data/master-data';
import { FieldValue } from 'firebase-admin/firestore';

const MASTER_DATA_DOC_ID = 'master-data-config';

function col() {
  return appCollection(getAdminFirestore(), 'appAssets');
}

export async function getMasterData(): Promise<MasterDataBundle> {
  const doc = await col().doc(MASTER_DATA_DOC_ID).get();
  if (!doc.exists) return getDefaultMasterData();

  const data = doc.data() as Partial<MasterDataBundle>;
  return mergeMasterData(data);
}

export async function updateMasterData(partial: Partial<MasterDataBundle>): Promise<MasterDataBundle> {
  const db = getAdminFirestore();
  await ensureAppTables(db);

  const current = await getMasterData();
  const next = mergeMasterData({
    locations: partial.locations ?? current.locations,
    categories: partial.categories ?? current.categories,
  });

  await col().doc(MASTER_DATA_DOC_ID).set(
    {
      kind: 'master-data',
      ...next,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return next;
}

export async function addMasterDataItem(
  type: 'locations' | 'categories',
  value: string,
): Promise<MasterDataBundle> {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Value is required');

  const current = await getMasterData();
  const list = current[type];
  if (list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('This entry already exists');
  }

  return updateMasterData({
    [type]: [...list, trimmed],
  });
}

export async function removeMasterDataItem(
  type: 'locations' | 'categories',
  value: string,
): Promise<MasterDataBundle> {
  const current = await getMasterData();
  const nextList = current[type].filter((item) => item !== value);
  if (nextList.length === current[type].length) {
    throw new Error('Entry not found');
  }

  return updateMasterData({
    [type]: nextList,
  });
}
