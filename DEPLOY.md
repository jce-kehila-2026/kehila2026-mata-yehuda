# Deploy to Firebase (Hosting + Cloud Functions)

## Project layout

The **React app is at the repo root**, not in `frontend/`:

```txt
/
├── src/           ← frontend source (React + Vite)
├── index.html
├── public/
├── dist/          ← build output (Firebase Hosting)
├── server/        ← Express APIs (deployed as Cloud Functions)
└── functions/     ← Firebase Functions wrapper
```

Ignore the `frontend/` folder — it is legacy and not used.

This project deploys as:

| Part | Firebase service | URL |
|------|------------------|-----|
| React app (`src/` → `npm run build` → `dist/`) | **Hosting** | `https://<project>.web.app` |
| Payment API (`server/server.js`) | **Cloud Function** `paymentApi` | `/api/*` |
| Notifications API (`server/index.js`) | **Cloud Function** `notificationsApi` | `/api/notifications/*`, `/health` |

Firebase Hosting is static files only. The Express servers run as **Cloud Functions** behind Hosting rewrites.

---

## 1. Prerequisites

```bash
npm install -g firebase-tools
firebase login
```

Confirm the Firebase project:

```bash
firebase use
# or switch:
firebase use matayehuda
```

Update `.firebaserc` if needed.

---

## 2. Install dependencies

```bash
npm install
cd functions && npm install && cd ..
```

---

## 3. Set Cloud Function environment variables

In Firebase Console → **Functions** → function → **Configuration** → **Environment variables**:

### Payment API (`paymentApi`)

| Variable | Example |
|----------|---------|
| `FIREBASE_PROJECT_ID` | `matayehuda` |
| `PAYPAL_CLIENT_ID` | your PayPal client id |
| `PAYPAL_CLIENT_SECRET` | your PayPal secret |
| `PAYPAL_BASE_URL` | `https://api-m.sandbox.paypal.com` |
| `FRONTEND_URL` | `https://<project>.web.app` |
| `STAFF_PIN` | staff cancellations PIN |

### Notifications API (`notificationsApi`)

| Variable | Example |
|----------|---------|
| `FIREBASE_PROJECT_ID` | `matayehuda` |
| `CLIENT_ORIGIN` | `https://<project>.web.app` |
| `FCM_TOKEN_STALE_DAYS` | `90` |

> In Cloud Functions, Firebase Admin uses the default service account automatically.

---

## 4. Deploy

```bash
npm run deploy
```

Or separately:

```bash
npm run deploy:hosting
npm run deploy:functions
```

---

## 5. Verify

- `https://<project>.web.app`
- `https://<project>.web.app/health`
- `https://<project>.web.app/api/activities`

---

## 6. Local development

```bash
cd server && npm run dev:payment   # port 5001
cd server && npm start             # port 3001
npm run dev                        # port 5173
```
