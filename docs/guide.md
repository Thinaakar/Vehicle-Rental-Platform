# Guide — Build your app from the Base Template

Clone → `npm install` → `npm run dev` → **App is running**.

You add the product: plan, UI, APIs, Firebase data, login, and tests. The template gives Next.js, Tailwind, Firebase Admin helpers, and `/api/health`.

---

## 1. Build flow (follow this order)

| Step | What you do |
|------|-------------|
| **1. Plan** | Define the app, users, main screens, and data you need. Keep v1 small. Note what you will **not** build yet. |
| **2. Design UI** | Sketch/mock screens (login, list, form, detail). Build layout, navigation, and pages in `modules/` + `components/`. No database in UI components. |
| **3. Create APIs** | Add `src/app/api/...` routes. Reads in `lib/firestore/app-data.ts`, writes in `app-writes.ts`. Validate with Zod. Return `{ data }` or `{ error }`. |
| **4. Connect Firebase** | Firebase project → service account JSON → `.env` → confirm `/api/health` is `connected`. Use `appCollection()` for all Firestore reads/writes. |
| **5. Connect UI ↔ API** | Pages `fetch` your APIs with `credentials: 'include'`. Show loading, empty, and error states. Refresh list after save/delete. |
| **6. Test** | Run CRUD on real Firebase. Fix bugs before adding more modules. |
| **7. Login** | Register + login APIs, session cookie, protect routes and `(app)` pages. Optional **demo login** with shared sample data (see §5). |

Build **one feature end-to-end** (plan → UI → API → Firebase → test → login) before the next.

---

## 2. Step details (short)

### Plan
Answer yourself: problem, users, screens, record names, out of scope. Do not copy another app’s product rules.

### Design UI
Login, app shell (nav), lists, forms, detail/settings if needed. Shared pieces in `components/ui/` and `components/shell/`. Feature screens in `modules/`. Keep `src/app/.../page.tsx` thin.

### Create APIs
- `GET` list / one item  
- `POST` create  
- `PATCH` update  
- `DELETE` remove  

Route file: auth check → Zod → `app-data` / `app-writes` → JSON response.

### Connect Firebase
See §4 below.

### Test
`npm run type-check`, `npm run build`, manual test: create → list → edit → delete. Check data in Firebase Console.

### Login
Real users in Firestore (`users` table). Session cookie after login. Use `credentials: 'include'` on every API call from the browser.

**Demo login (optional, pattern from Ledgera Billing):** shared sample data in Firestore, demo user stored in `users`, register does **not** auto-login. See §5.

---

## 3. Frontend ↔ backend (how they connect)

The **browser never talks to Firestore directly**. Only the Next.js server uses Firebase Admin.

```text
UI (modules/ + components/)
  → fetch('/api/products', { credentials: 'include' })
      → API route (src/app/api/products/route.ts)
          → app-data.ts / app-writes.ts
              → getAdminFirestore() + appCollection(db, 'products')
                  → Firestore
          ← JSON { data: [...] }
      ← response
  ← render list / form
```

| Layer | Files |
|-------|--------|
| Frontend | `modules/`, `components/`, `src/app/(app)/.../page.tsx` |
| API | `src/app/api/<resource>/route.ts` |
| Firestore logic | `lib/firestore/app-data.ts`, `app-writes.ts` |
| Firebase connection | `lib/firebase/admin.ts`, `collections.ts` |
| Table definitions | `src/templates/app.ts` |
| Secrets (local only) | `.env`, `src/config/ServiceAccountKey.json` |

Every `fetch` to your APIs must use **`credentials: 'include'`** so the login cookie is sent.

---

## 4. Firebase — connect + one example

### Connect (one-time)

```text
Firebase Console → project → Service accounts → download JSON
  → save as src/config/ServiceAccountKey.json
  → copy .env.example to .env
  → FIREBASE_CREDENTIALS=src/config/ServiceAccountKey.json
  → npm run dev
  → /api/health  →  "firebase": "connected"
```

| File | Role |
|------|------|
| `.env` | Points to your JSON key |
| `src/lib/firebase/admin.ts` | Loads credentials, `getAdminFirestore()` |
| `src/lib/firebase/collections.ts` | `appCollection()`, `ensureAppTables()` |
| `src/templates/app.ts` | Table names and fields |
| `src/app/api/health/route.ts` | Proves connection works |

Data path (always use `appCollection`, not a root collection):

```text
templates/app/tables/products/records/{docId}
```

### Example — `products` end-to-end

**A. Register table** — `src/templates/app.ts` (add `products` with `name`, `price` fields).

**B. Write** — `app-writes.ts`:

```ts
const db = getAdminFirestore();
await ensureAppTables(db);
const ref = appCollection(db, 'products').doc();
await ref.set({ id: ref.id, name, price, createdAt: FieldValue.serverTimestamp(), ... });
```

**C. API** — `GET/POST src/app/api/products/route.ts` calls list/create helpers.

**D. UI** — `fetch('/api/products', { credentials: 'include' })` → show table.

**E. Check** — Firebase Console → `templates` → `app` → `tables` → `products` → `records`.

Never commit `.env` or `ServiceAccountKey.json`.

---

## 5. Demo login flow (optional — Billing pattern)

Use this when you want visitors to **try the app with sample data** before registering.

### What happens (one example)

```text
Visitor → /login → "Use demo credentials" → Sign in
       → demo user created in users (demo@yourapp.local)
       → if customers table is empty → seed 2 rows per module once
       → dashboard with sample customers / invoices
       → demo banner: "Create an account → … delete samples …"
```

**Priya** tries demo → sees Acme + Northwind sample customers.  
**Raj** registers → redirected to **login** (not dashboard) → signs in → sees **same shared data** (no second seed).  
**Priya** signs in as demo again → same lists + anything Raj added.

### Rules to implement

| Rule | Meaning |
|------|---------|
| **Seed once** | Run `ensureSampleData()` only when the main table (e.g. customers) is **empty** |
| **Shared workspace** | Demo and real users read the same Firestore records (template default) |
| **Demo user in DB** | `ensureDemoUser()` writes demo email/password to `users` like a normal account |
| **Register** | Create user → seed if empty → **redirect to login** (no session cookie yet) |
| **Real login** | Session cookie → same APIs as demo (no in-memory fake data) |

### Suggested files (copy shape from Billing)

```text
src/lib/demo/constants.ts          # DEMO_EMAIL, DEMO_PASSWORD, isDemoCredentials()
src/lib/auth/demo-sign-in.ts       # ensureDemoUser + ensureSampleData + notifications
src/lib/sample/sample-data.ts      # 2 records per module (templates only)
src/lib/sample/ensure-sample-data.ts
src/app/api/auth/demo/route.ts
src/components/app/DemoBanner.tsx  # shown when session isDemo
```

Demo credentials: fixed email/password on login; sign-in with those values calls the demo auth path.

---

Frontend does NOT use firebase client SDK. Browser → /api/* → firebase-admin → Firestore.

One task per session. Never commit secrets.

Current task: [one task only]
