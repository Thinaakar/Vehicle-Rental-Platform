/**
 * Upload DriveXPro marketing + vehicle images to Firebase Storage.
 * Generates src/data/firebase-assets.ts with public URLs.
 *
 * Usage: npm run upload:assets
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import admin from 'firebase-admin';

const STORAGE_PREFIX = 'drivexpro';
const ASSETS_OUT = 'src/data/firebase-assets.ts';

function loadEnvFile(name) {
  const path = resolve(process.cwd(), name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

function makeVehicleArtworkSvg({ title, subtitle, primary, secondary, accent }) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.95)" />
          <stop offset="100%" stop-color="rgba(226,232,240,0.75)" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" />
      <circle cx="980" cy="150" r="170" fill="rgba(255,255,255,0.08)" />
      <circle cx="180" cy="630" r="250" fill="rgba(255,255,255,0.05)" />
      <g transform="translate(130 150)">
        <rect x="0" y="320" width="940" height="94" rx="47" fill="rgba(15,23,42,0.28)" />
        <path d="M145 300h520c32 0 56 11 75 32l63 70h91c24 0 43 19 43 43v20c0 24-19 43-43 43H116c-35 0-63-28-63-63v-33c0-32 26-59 59-59h33c16 0 31-7 42-19l37-38c7-7 12-16 17-27 6-16 24-29 44-29Z" fill="rgba(15,23,42,0.36)" />
        <path d="M170 306h455c24 0 46 10 62 28l46 52H135c1-30 15-55 35-71Z" fill="url(#glass)" />
        <rect x="126" y="250" width="86" height="96" rx="26" fill="rgba(255,255,255,0.18)" />
        <rect x="232" y="238" width="106" height="108" rx="22" fill="rgba(255,255,255,0.18)" />
        <rect x="354" y="238" width="106" height="108" rx="22" fill="rgba(255,255,255,0.18)" />
        <rect x="480" y="248" width="132" height="98" rx="22" fill="rgba(255,255,255,0.18)" />
        <rect x="640" y="258" width="98" height="88" rx="18" fill="rgba(255,255,255,0.18)" />
        <rect x="776" y="266" width="92" height="80" rx="16" fill="rgba(255,255,255,0.18)" />
        <rect x="66" y="356" width="792" height="22" rx="11" fill="${accent}" opacity="0.95" />
        <circle cx="220" cy="426" r="74" fill="#0f172a" />
        <circle cx="220" cy="426" r="44" fill="#94a3b8" />
        <circle cx="760" cy="426" r="74" fill="#0f172a" />
        <circle cx="760" cy="426" r="44" fill="#94a3b8" />
        <rect x="0" y="444" width="940" height="18" rx="9" fill="rgba(15,23,42,0.45)" />
        <rect x="36" y="18" width="420" height="116" rx="28" fill="rgba(15,23,42,0.52)" />
        <text x="64" y="72" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#ffffff">${title}</text>
        <text x="64" y="108" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600" fill="rgba(255,255,255,0.88)">${subtitle}</text>
      </g>
    </svg>
  `.trim();
}

const VEHICLE_SOURCES = {
  'veh-1': {
    url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800',
    ext: 'jpg',
    contentType: 'image/jpeg',
  },
  'veh-2': {
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
    ext: 'jpg',
    contentType: 'image/jpeg',
  },
  'veh-3': {
    svg: makeVehicleArtworkSvg({
      title: 'Mercedes-Benz G63 AMG',
      subtitle: 'Luxury SUV',
      primary: '#0f172a',
      secondary: '#22d3ee',
      accent: '#38bdf8',
    }),
    ext: 'svg',
    contentType: 'image/svg+xml',
  },
  'veh-4': {
    url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=800',
    ext: 'jpg',
    contentType: 'image/jpeg',
  },
  'veh-5': {
    url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    ext: 'jpg',
    contentType: 'image/jpeg',
  },
  'veh-6': {
    url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    ext: 'jpg',
    contentType: 'image/jpeg',
  },
  'veh-7': {
    svg: makeVehicleArtworkSvg({
      title: 'Rivian R1T',
      subtitle: 'Electric Truck',
      primary: '#0f172a',
      secondary: '#14532d',
      accent: '#22c55e',
    }),
    ext: 'svg',
    contentType: 'image/svg+xml',
  },
  'veh-8': {
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    ext: 'jpg',
    contentType: 'image/jpeg',
  },
};

const MARKETING_HERO = {
  url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=90&w=1600',
  path: `${STORAGE_PREFIX}/marketing/hero.jpg`,
  contentType: 'image/jpeg',
};

const LOGIN_HERO = {
  url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=90&w=1600',
  path: `${STORAGE_PREFIX}/login/hero.jpg`,
  contentType: 'image/jpeg',
};

const FAVICON = {
  localPath: 'src/assets/images/favicon.svg',
  path: `${STORAGE_PREFIX}/branding/favicon.svg`,
  contentType: 'image/svg+xml',
};

function initFirebase() {
  if (admin.apps.length) return admin.apps[0];

  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    const parsed = JSON.parse(inline);
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: parsed.project_id,
        privateKey: parsed.private_key,
        clientEmail: parsed.client_email,
      }),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
        `${parsed.project_id}.firebasestorage.app`,
    });
  }

  const rel = process.env.FIREBASE_CREDENTIALS?.trim();
  if (!rel) throw new Error('Set FIREBASE_CREDENTIALS in .env.local');
  const parsed = JSON.parse(readFileSync(resolve(process.cwd(), rel), 'utf8'));
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: parsed.project_id,
      privateKey: parsed.private_key,
      clientEmail: parsed.client_email,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.trim() || `${parsed.project_id}.firebasestorage.app`,
  });
}

function publicUrl(bucketName, storagePath) {
  return `https://storage.googleapis.com/${bucketName}/${storagePath}`;
}

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  const contentType = res.headers.get('content-type')?.split(';')[0]?.trim();
  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, contentType };
}

async function uploadBuffer(bucket, storagePath, buffer, contentType) {
  const file = bucket.file(storagePath);
  await file.save(buffer, {
    metadata: { contentType, cacheControl: 'public, max-age=31536000' },
    resumable: false,
  });
  try {
    await file.makePublic();
  } catch {
    /* uniform bucket-level access */
  }
  return publicUrl(bucket.name, storagePath);
}

function writeAssetsModule({ bucketName, vehicleImages, marketingHero, loginHero, favicon }) {
  const lines = [
    '/** Public Firebase Storage URLs — generated by `npm run upload:assets`. Do not edit by hand. */',
    '',
    `export const FIREBASE_STORAGE_BUCKET = '${bucketName}';`,
    '',
    'export const FIREBASE_VEHICLE_IMAGES: Record<string, string> = {',
    ...Object.entries(vehicleImages).map(([id, url]) => `  '${id}': '${url}',`),
    '};',
    '',
    `export const FIREBASE_MARKETING_HERO = '${marketingHero}';`,
    `export const FIREBASE_LOGIN_HERO = '${loginHero}';`,
    `export const FIREBASE_FAVICON = '${favicon}';`,
    '',
  ];
  writeFileSync(resolve(process.cwd(), ASSETS_OUT), lines.join('\n'), 'utf8');
}

async function main() {
  const app = initFirebase();
  const bucket = admin.storage().bucket(app.options.storageBucket);
  const vehicleImages = {};

  console.log(`Uploading to gs://${bucket.name}/${STORAGE_PREFIX}/ ...`);

  for (const [id, source] of Object.entries(VEHICLE_SOURCES)) {
    const storagePath = `${STORAGE_PREFIX}/vehicles/${id}.${source.ext}`;
    let buffer;
    let contentType = source.contentType;

    if (source.url) {
      const downloaded = await download(source.url);
      buffer = downloaded.buffer;
      contentType = downloaded.contentType || contentType;
    } else {
      buffer = Buffer.from(source.svg, 'utf8');
    }

    vehicleImages[id] = await uploadBuffer(bucket, storagePath, buffer, contentType);
    console.log(`  ✓ ${id} → ${vehicleImages[id]}`);
  }

  const heroDownload = await download(MARKETING_HERO.url);
  const marketingHero = await uploadBuffer(
    bucket,
    MARKETING_HERO.path,
    heroDownload.buffer,
    heroDownload.contentType || MARKETING_HERO.contentType,
  );
  console.log(`  ✓ marketing hero → ${marketingHero}`);

  const loginDownload = await download(LOGIN_HERO.url);
  const loginHero = await uploadBuffer(
    bucket,
    LOGIN_HERO.path,
    loginDownload.buffer,
    loginDownload.contentType || LOGIN_HERO.contentType,
  );
  console.log(`  ✓ login hero → ${loginHero}`);

  const faviconBuffer = readFileSync(resolve(process.cwd(), FAVICON.localPath));
  const favicon = await uploadBuffer(bucket, FAVICON.path, faviconBuffer, FAVICON.contentType);
  console.log(`  ✓ favicon → ${favicon}`);

  writeAssetsModule({
    bucketName: bucket.name,
    vehicleImages,
    marketingHero,
    loginHero,
    favicon,
  });
  console.log(`\nWrote ${ASSETS_OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
