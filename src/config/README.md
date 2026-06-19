Place your Firebase service account JSON here.

1. Firebase Console → Project settings → Service accounts → **Generate new private key**
2. Save as `ServiceAccountKey.json` in this folder (filename can differ if you update `.env`)
3. Copy `.env.example` to `.env` and set `FIREBASE_CREDENTIALS=src/config/ServiceAccountKey.json`

Do not commit the JSON file. It is listed in `.gitignore`.
