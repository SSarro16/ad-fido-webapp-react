# AdFido V1 Release Checklist

Questa checklist serve per la repo ufficiale `beta_adfido_v1.0.0` e per la demo della milestone `v1.0.0`.

## Ambiente

- `.env` presente e coerente con la test area
- `AUTH_JWT_SECRET` valorizzato
- `GOOGLE_MAPS_API_KEY` valorizzato
- `VITE_API_BASE_URL` corretto
- `VITE_FIREBASE_*` valorizzate
- `FIREBASE_PROJECT_ID` e `FIREBASE_STORAGE_BUCKET` valorizzati
- `FIREBASE_SERVICE_ACCOUNT_PATH` o `FIREBASE_SERVICE_ACCOUNT_JSON` disponibili

## Quality Gates

- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
- `npm run build`

## Smoke Test Demo

- homepage caricabile
- marketplace caricabile
- login, register e logout funzionanti
- restore session valido dopo refresh
- profilo aggiornabile
- dashboard `breeder` funzionante
- dashboard `shelter` funzionante
- creazione annuncio
- modifica annuncio
- eliminazione annuncio
- upload immagini
- localizzazione via Google Places proxy
- invio annuncio in revisione
- `GET /api/health` restituisce stato valido

## Narrativa Demo

- la demo mostra come focus pubblico, auth e seller operations
- il design resta coerente con la test area
- le estensioni admin non sono il focus del percorso V1 su `main`
