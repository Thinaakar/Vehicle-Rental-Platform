# DriveXPro — Vehicle Rental Demo

A multi-role vehicle rental demo built with **TypeScript**, **React**, and **Tailwind CSS** on Next.js.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vehiclerental.com | Admin@123 |
| Vendor | vendor@vehiclerental.com | Vendor@123 |
| Customer | customer@vehiclerental.com | Customer@123 |

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — ESLint
- `npm run type-check` — TypeScript check via Next.js build

## Stack

- React 19 + TypeScript
- Tailwind CSS
- Client-side demo data (localStorage)
- No external database required

## Health check

`GET /api/health` returns `{ ok: true, status: "running" }`.
