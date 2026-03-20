# AdFido Webapp

React web application foundation for the AdFido marketplace.

## Scripts

- `npm start`: alias di `npm run dev` per avviare frontend e backend insieme
- `npm run dev`: avvia frontend Vite e backend Node in parallelo
- `npm run dev:web`: avvia solo il client Vite
- `npm run dev:server`: avvia solo il backend Express con Firebase Admin
- `npm run build`: esegue `tsc -b` e la build di produzione Vite
- `npm run typecheck`: esegue il typecheck TypeScript senza emissione
- `npm run lint`: esegue ESLint su tutto il progetto
- `npm run test`: avvia Vitest in watch mode
- `npm run test:run`: esegue Vitest in modalita run
- `npm run format`: formatta il repo con Prettier
- `npm run format:check`: verifica che il formatting sia coerente con Prettier

## Workflow Qualita

Il workflow di validazione del progetto e allineato agli script locali e alla Definition of Done dichiarata in `PROJECT_PLAN.md`.

Controlli previsti in CI:

- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
- `npm run build`

Standard di repository:

- `.editorconfig` per indentazione, newline finale e line ending coerenti
- `Prettier` per uniformare formatting e spacing su codice, CSS, JSON e documentazione
- `ESLint` come guardrail principale per il codice frontend e backend

## Environment

Create `.env` from `.env.example`.

- `GOOGLE_MAPS_API_KEY` stays on the backend only
- `VITE_API_BASE_URL` points the frontend to the backend
- `AUTH_JWT_SECRET` signs the login session tokens on the backend
- `VITE_ENABLE_DEMO_AUTH=true` only for internal testing
- `VITE_FIREBASE_*` configures the Firebase Web SDK in the frontend
- `FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_SERVICE_ACCOUNT_JSON` configures Firebase Admin on the backend
- `FIREBASE_PROJECT_ID` and `FIREBASE_STORAGE_BUCKET` help the backend target the correct Firebase project

## Deploy On Render

This repo is now set up to deploy on Render as a single Node web service:

- Render builds the Vite frontend with `npm ci && npm run build`
- Render starts the Express server with `npm run start:render`
- the server serves both `/api/*` and the built SPA from `dist/`
- frontend production API calls default to same-origin `/api`

Recommended setup:

1. Push this repository to GitHub.
2. In Render, create a new `Blueprint` service from the repo so Render reads [`render.yaml`](./render.yaml).
3. Confirm the generated web service uses:
   - build command: `npm ci && npm run build`
   - start command: `npm run start:render`
   - health check path: `/api/health`
4. Add `GOOGLE_MAPS_API_KEY` in Render only if you want live Google Places autocomplete.
5. Add the Firebase env variables in Render:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
6. After the first deploy, open the Render URL and verify:
   - homepage loads
   - `GET /api/health` returns `ok: true`
   - login works with the demo credentials below

Important Render note:

- Firestore and Firebase Storage replace the previous JSON and local-upload persistence layers
- `AUTH_JWT_SECRET` is generated automatically by `render.yaml`, but you can replace it with your own secret in the Render dashboard
- do not commit Firebase service account JSON files; keep them local or inject them through Render secrets

## Demo access

- `user@adfido.it`
- `breeder.demo@adfido.it`
- `shelter.demo@adfido.it`
- `adfidoadministration@adfido.it`

Demo passwords:

- user: `AdFidoUser2026!`
- admin: `AdFidoAdmin2026!`
- breeder: `AdFidoBreeder2026!`
- shelter: `AdFidoShelter2026!`

## Auth backend

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Users and managed listings are stored in Firestore collections, and listing images are uploaded to Firebase Storage.
