import * as admin from 'firebase-admin';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app: admin.app.App | undefined;

type ServiceAccountKeyFile = {
  project_id: string;
  private_key: string;
  client_email: string;
};

function parseServiceAccountJson(): admin.ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceAccountKeyFile;
    if (
      typeof parsed.project_id !== 'string' ||
      typeof parsed.private_key !== 'string' ||
      typeof parsed.client_email !== 'string'
    ) {
      throw new Error('missing project_id, private_key, or client_email');
    }
    return {
      projectId: parsed.project_id,
      privateKey: parsed.private_key,
      clientEmail: parsed.client_email,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON: ${msg}`);
  }
}

function certFromCredentialsPath(relOrAbs: string): admin.ServiceAccount {
  const resolved = resolve(process.cwd(), relOrAbs);
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(readFileSync(resolved, 'utf8')) as Record<string, unknown>;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`FIREBASE_CREDENTIALS could not be read (${resolved}): ${msg}`);
  }
  const project_id = parsed.project_id;
  const private_key = parsed.private_key;
  const client_email = parsed.client_email;
  if (
    typeof project_id !== 'string' ||
    typeof private_key !== 'string' ||
    typeof client_email !== 'string'
  ) {
    throw new Error(
      `FIREBASE_CREDENTIALS JSON must include project_id, private_key, and client_email (${resolved})`,
    );
  }
  return {
    projectId: project_id,
    privateKey: private_key,
    clientEmail: client_email,
  };
}

function parseServiceAccountFromFilePath(): admin.ServiceAccount | null {
  const rel = process.env.FIREBASE_CREDENTIALS?.trim();
  if (!rel) return null;
  return certFromCredentialsPath(rel);
}

function resolveStorageBucketName(projectId?: string): string | undefined {
  const fromEnv = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (fromEnv) return fromEnv;
  if (projectId) return `${projectId}.firebasestorage.app`;
  return undefined;
}

function initAdmin(): admin.app.App {
  const existing = admin.apps[0];
  if (existing) return existing;

  const fromJson = parseServiceAccountJson();
  if (fromJson) {
    return admin.initializeApp({
      credential: admin.credential.cert(fromJson),
      storageBucket: resolveStorageBucketName(fromJson.projectId),
    });
  }

  const fromFile = parseServiceAccountFromFilePath();
  if (fromFile) {
    return admin.initializeApp({
      credential: admin.credential.cert(fromFile),
      storageBucket: resolveStorageBucketName(fromFile.projectId),
    });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: resolveStorageBucketName(process.env.GCLOUD_PROJECT),
    });
  }

  throw new Error(
    'Firebase is not configured. Set FIREBASE_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON in .env.local.',
  );
}

export function getAdminApp(): admin.app.App {
  if (!app) app = initAdmin();
  return app;
}

export function getAdminFirestore() {
  const a = getAdminApp();
  const dbId = process.env.FIRESTORE_DATABASE_ID?.trim();
  return dbId ? getFirestore(a, dbId) : getFirestore(a);
}

export function getAdminStorageBucket() {
  const a = getAdminApp();
  const bucketName = resolveStorageBucketName(a.options.projectId ?? a.options.storageBucket);
  if (!bucketName) {
    throw new Error('Set FIREBASE_STORAGE_BUCKET in .env.local (e.g. your-project-id.appspot.com).');
  }
  return getStorage(a).bucket(bucketName);
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_CREDENTIALS?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );
}
