# פריסה ל-Render

הפרויקט שלך מורכב מ-**3 חלקים** — צריך **3 שירותים** ב-Render:

| שירות | תיקייה | מה זה |
|--------|--------|--------|
| **matayehuda-frontend** | `src/` (בשורש) | React — נבנה ל-`dist/` |
| **matayehuda-payment-api** | `server/server.js` | תשלומים, הרשמה, PayPal |
| **matayehuda-notifications-api** | `server/index.js` | התראות FCM לצוות |

> תיקיית `frontend/` **לא בשימוש** — הקוד האמיתי ב-`src/`.

---

## שלב 1 — העלאה ל-GitHub

Render מחבר ל-GitHub. ודאי שהקוד ב-repository:

```bash
git add .
git commit -m "Prepare Render deployment"
git push
```

---

## שלב 2 — יצירת שירותים ב-Render

### אפשרות א׳: Blueprint (מומלץ)

1. היכנסי ל-[render.com](https://render.com) → **New** → **Blueprint**
2. חברי את ה-GitHub repo
3. Render יקרא את `render.yaml` ויצור 3 שירותים
4. מלאי משתני סביבה שמסומנים `sync: false` (ראי שלב 3)

### אפשרות ב׳: ידנית

#### שירות 1 — Payment API

| שדה | ערך |
|-----|-----|
| Type | Web Service |
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm run start:payment` |
| Health Check | `/activities` |

#### שירות 2 — Notifications API

| שדה | ערך |
|-----|-----|
| Type | Web Service |
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check | `/health` |

#### שירות 3 — Frontend (Static Site)

| שדה | ערך |
|-----|-----|
| Type | Static Site |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Rewrite | `/*` → `/index.html` (SPA) |

---

## שלב 3 — משתני סביבה

אחרי ש-Render נותן לך URLs (למשל `https://matayehuda-payment-api.onrender.com`):

### Frontend (`matayehuda-frontend`)

```env
VITE_API_BASE=https://matayehuda-payment-api.onrender.com
VITE_NOTIFICATIONS_API_URL=https://matayehuda-notifications-api.onrender.com

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=matayehuda.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=matayehuda
VITE_FIREBASE_STORAGE_BUCKET=matayehuda.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=264845791661
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

> **חשוב:** משתני `VITE_*` נטענים בזמן **build** — אחרי שינוי צריך **Manual Deploy** מחדש.

### Payment API (`matayehuda-payment-api`)

```env
FIREBASE_PROJECT_ID=matayehuda
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
FRONTEND_URL=https://matayehuda-frontend.onrender.com
STAFF_PIN=...
```

### Notifications API (`matayehuda-notifications-api`)

```env
FIREBASE_PROJECT_ID=matayehuda
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
CLIENT_ORIGIN=https://matayehuda-frontend.onrender.com
FCM_TOKEN_STALE_DAYS=90
```

---

## שלב 4 — Firebase Console

1. **Authentication** → **Authorized domains** — הוסיפי:
   - `matayehuda-frontend.onrender.com`
   - (או הדומיין המותאם שלך)

2. **Cloud Messaging** — ודאי ש-`VITE_FIREBASE_VAPID_KEY` תואם לפרויקט

---

## שלב 5 — בדיקה

| URL | מה אמור לקרות |
|-----|----------------|
| `https://...-frontend.onrender.com` | האתר נטען |
| `https://...-payment-api.onrender.com/activities` | JSON של פעילויות |
| `https://...-notifications-api.onrender.com/health` | `{ "ok": true }` |

---

## פיתוח מקומי (ללא שינוי)

```bash
# טרמינל 1 — תשלומים
cd server && npm run dev:payment

# טרמינל 2 — התראות
cd server && npm start

# טרמינל 3 — פרונט
npm run dev
```

---

## בעיות נפוצות

| בעיה | פתרון |
|------|--------|
| האתר נטען אבל API נכשל | בדקי `VITE_API_BASE` — חייב URL מלא של payment-api |
| CORS / התראות לא עובדות | עדכני `CLIENT_ORIGIN` לכתובת ה-frontend ב-Render |
| PayPal לא חוזר נכון | עדכני `FRONTEND_URL` לכתובת ה-frontend |
| שירות "נרדם" (Free plan) | בקשה ראשונה אחרי 15 דק׳ איטית — נורמלי ב-Free |
| `npm run build` נכשל | הריצי מקומית `npm run build` לבדיקה |

---

## מבנה הפרויקט

```txt
/
├── src/              ← פרונט (React)
├── index.html
├── dist/             ← נוצר אחרי build (זה עולה ל-Render Static)
├── server/
│   ├── server.js     ← Payment API
│   └── index.js      ← Notifications API
└── render.yaml       ← הגדרות Blueprint
```
