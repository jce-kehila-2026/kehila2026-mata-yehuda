# GROUP 6
One-line description (e.g., "Volunteer scheduling app for [Non‑Profit Name]")

## Contents
- [Overview](#overview) • [Non‑Profit](#non-profit) • [Team](#team) • [Quick start](#quick-start) • [Handover](#handover) • [Privacy](#privacy) • [Contacts](#contacts)

## Overview
Briefly describe what the project does, who it serves, and the main value (1–2 sentences).

## Non‑Profit
- Organization: [Non‑Profit Name]  
- Primary stakeholder(s): Name — role — email  
- Key deliverable for them: e.g., "Simple roster export and sign-up form."

## Team
- **Raneen Kharma** — email : raneenkh@post.jce.ac.il — GitHub: @raneen12kh
- **Sujood Totah** — GitHub: @sujood-totah
- **Doha Abdelnabi** — GitHub: @doha-abdelnabi
- **Widad Rajabi** — GitHub: @WidadRajabi

### Team Roles
- **Team Lead** – Responsible for coordination, task distribution, and final decisions.
- **Backend Developer** – Handles server-side logic and data management.
- **Frontend Developer** – Responsible for user interface and user experience.
- **Documentation** – Maintains README, Wiki, and project documentation.

## Project goals
- Describe the main goal of the project
- List 2-3 key objectives.

## Wiki
See the team workflow page in the repository wiki.

## Quick start (local)

Frontend: **repo root** (`src/`, `index.html`) — not the `frontend/` folder.

1. git clone https://github.com/<org>/<repo>.git
2. cd <repo>
3. cp .env.example .env  # edit values (see FCM setup below)
4. npm install
5. cd server && npm install && cd ..
6. npm run dev
7. In another terminal: `cd server && npm run dev:payment` (payment API, port 5001)

Open http://localhost:5173

## Push notifications (FCM)

### Firebase Console setup
1. Enable **Cloud Messaging** for the web app.
2. Generate a **Web Push certificate (VAPID key)** and set `VITE_FIREBASE_VAPID_KEY` in `.env`.
3. Download a **Firebase Admin service account JSON** for the backend and set `GOOGLE_APPLICATION_CREDENTIALS` in `server/.env`.
4. Deploy `firestore.rules` and create a composite index if prompted:
   - Collection: `notification_tokens`
   - Fields: `groups` (Array), `isActive` (Ascending)

### Environment variables
**Frontend (`.env`):**
- `VITE_NOTIFICATIONS_API_URL` — notification server URL (e.g. `http://localhost:3001`)
- `VITE_FIREBASE_VAPID_KEY` — FCM web push VAPID key

**Backend (`server/.env`):**
- `GOOGLE_APPLICATION_CREDENTIALS` — path to service account JSON
- `FIREBASE_PROJECT_ID` — Firebase project id
- `CLIENT_ORIGIN` — frontend origin for CORS
- `FCM_TOKEN_STALE_DAYS` — optional, default 90

### Testing
**Register a device token:** open the site, use the notification opt-in card, optionally verify with ת.ז./טלפון, allow browser notifications. Check Firestore `notification_tokens/{token}`.

**Send from staff dashboard:** log in as staff → **הודעות** → enter title/body → **שליחת הודעה**. Requires the notification server running with Admin SDK configured.

## Demo / Deployment
- Deployed app: https://your-app.example.com  
- CI: GitHub Actions (push → deploy)

## Handover (minimum)
- [ ] Deployed URL + admin credentials (shared securely)  
- [ ] HANDOVER.md with maintenance steps  
- [ ] Add non‑profit staff as repo collaborators or transfer repo

## Privacy & Security
List data collected (names, emails), storage location, and retention policy. Never commit secrets; use environment variables and GitHub secrets.

## Known limitations
Briefly list major limitations or missing features and any workarounds.

## Contacts
- Project lead: Name — email  
- Non‑profit contact: Name — email  
- Instructor / TA: Name — email

## License
Specify license (e.g., MIT) and any IP/ownership notes relevant to the non‑profit.
