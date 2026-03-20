# AdFido Project Plan

## Visione Prodotto

AdFido e una webapp marketplace dedicata agli annunci per cani, progettata per unire discovery pubblico, profili pubblicanti piu chiari e moderazione concreta. Il prodotto non deve sembrare un catalogo generico: deve trasmettere fiducia, leggibilita, gerarchia editoriale e separazione netta tra chi cerca, chi pubblica e chi modera.

Target utenti:

- utente normale: esplora, salva preferiti, contatta i pubblicanti;
- allevatore privato: gestisce fino a 3 annunci, li crea, modifica, elimina e invia in revisione;
- canile / rifugio: gestisce un volume ampio di schede affido con tono piu istituzionale;
- CEO / Admin: monitora inventory, analytics operative e flussi di moderazione.

Baseline UX/UI da preservare:

- palette sabbia chiara, blu profondo e accenti arancioni;
- superfici morbide, glass-like e ombre leggere;
- layout editoriali, mai template-generic;
- motion selettivo e mai invasivo;
- forte attenzione a spacing, wrap del testo, CTA, stati di loading/error e toast.

Principi qualitativi del sito:

- ogni area deve avere uno scopo chiaro;
- ogni mutazione asincrona deve dare feedback visibile;
- seller e admin non devono confondersi ne visivamente ne come permessi;
- i breakpoints canonici da verificare restano `1080`, `860`, `640`.

## Stato Attuale Del Repo

Stato reale attuale:

- frontend React + TypeScript con Vite, React Router, Zustand, React Query, Framer Motion;
- backend Express file-based con auth, listings, upload media, Google Places proxy e API admin;
- shell applicativa con topbar sticky, aside account contestuale, toast globali e footer;
- homepage con hero search, percorsi principali, blocchi editoriali e contact form;
- marketplace pubblico con listing cards, filtri, detail page, share e favorites;
- auth completa con register, login, logout, restore session e update profilo;
- dashboard seller operative per allevatore privato e canile/rifugio;
- area admin con control room e inventory di moderazione;
- test automatici per store auth, toast, listing detail e servizi chiave gia presenti.

Cosa e backend reale:

- login/register/session;
- CRUD seller listings;
- moderation admin;
- payload overview/inventory admin;
- upload e media pipeline base;
- luoghi via Google Places proxy.

Cosa resta ibrido o da consolidare:

- alcune compat legacy legate al ruolo `subscriber`;
- demo credentials e loro esposizione frontend/backend da mantenere allineate;
- analytics e audit log ancora leggeri;
- pipeline media non ancora "production-grade";
- dualita mock/backend da tenere sotto controllo nei fallback.

## Version Roadmap

### Versione 0.1 Foundation

Obiettivi prodotto:

- impostare shell, routing, tema e struttura tecnica;
- creare una base credibile e coerente per una webapp reale.

UX/UI requirements:

- topbar sticky leggibile;
- footer coerente con il tono premium del sito;
- card, panel e CTA con spacing stabile;
- toast globali gia integrati come feedback base.

Funzionalita obbligatorie:

- route layout condiviso;
- design tokens e CSS globale;
- provider applicativi;
- gestione errori di base;
- struttura tipizzata per feature e services.

API/data contracts coinvolti:

- configurazione base API;
- session token persistente;
- error mapping minimo.

Edge case e failure modes:

- route non trovate;
- app bootstrap senza sessione;
- fetch fallite in shell o landing.

Criteri di accettazione:

- `typecheck`, `lint`, `test:run`, `build` verdi;
- nessuna pagina core senza fallback;
- baseline responsive funzionante.

Test richiesti:

- smoke di routing;
- bootstrap sessione;
- shell rendering.

Dipendenze:

- nessuna.

### Versione 0.2 Public Marketplace

Obiettivi prodotto:

- rendere solido il discovery path pubblico;
- dare peso a ricerca, listings e detail page.

UX/UI requirements:

- hero orientata all'intento;
- results layout leggibile anche con card dense;
- detail con gerarchia netta tra gallery, facts, contatto e contesto.

Funzionalita obbligatorie:

- listings page con filtri;
- detail page con gallery;
- reveal telefono;
- share nativo con fallback copia URL;
- preferiti per utenti autenticati;
- contenuti editoriali a supporto della fiducia.

API/data contracts coinvolti:

- public listings feed;
- listing detail;
- tracking view / reveal / share non bloccante.

Edge case e failure modes:

- loading, error, not found ed empty fallback distinti;
- evitare flash di "annuncio non trovato" durante fetch;
- share senza `navigator.share`;
- reveal telefono senza bloccare il rendering.

Criteri di accettazione:

- detail page non mostra falsi errori in loading;
- share/reveal funzionano con toast coerenti;
- cards e sidebar restano leggibili ai 3 breakpoint.

Test richiesti:

- listing detail loading/not-found/share fallback;
- smoke favorites.

Dipendenze:

- `0.1 Foundation`.

### Versione 0.3 Identity & Account

Obiettivi prodotto:

- consolidare auth, sessione e area personale;
- rendere affidabile il feedback utente.

UX/UI requirements:

- login/register chiari;
- demo fast access leggibile;
- stato account e profilo sintetici ma non piatti;
- feedback informativo visibile dopo logout.

Funzionalita obbligatorie:

- login;
- register;
- logout;
- restore session;
- update profilo;
- route protection per ruolo.

API/data contracts coinvolti:

- `POST /auth/login`;
- `POST /auth/register`;
- `GET /auth/me`;
- `PATCH /auth/profile`;
- messaggi da redirect state.

Edge case e failure modes:

- `loading` auth che non si resetta;
- errori login/register con stato bloccato;
- profilo salvato senza toast;
- credenziali demo divergenti dal backend.

Criteri di accettazione:

- `loginWithPassword`, `registerAccount` e `saveProfile` escono sempre da `loading`;
- `status` torna a `idle` in failure;
- `authenticated` resta vero solo nei path di successo;
- login legge `location.state.message` e lo mostra.

Test richiesti:

- store auth success/failure/reset status;
- smoke login/logout/profile.

Dipendenze:

- `0.1 Foundation`.

### Versione 0.4 Seller Operations

Obiettivi prodotto:

- rendere la seller area usabile davvero;
- distinguere allevatore privato e canile/rifugio sia nei permessi sia nel tono della dashboard.

UX/UI requirements:

- dashboard differenti per breeder e shelter;
- seller sidebar ordinata, senza wrap brutti o CTA compresse;
- nuovo annuncio aperto in card dedicata, non in stato ambiguo;
- form leggibile, modulare e con spacing stabile.

Funzionalita obbligatorie:

- create/edit/delete listing;
- draft cards multiple aperte solo quando consentito dal flusso;
- submit in review;
- upload immagini da file;
- localita tramite Google Maps / Places;
- note admin visibili sulla scheda quando presenti.

API/data contracts coinvolti:

- CRUD seller listings;
- upload media;
- update status a `in_review`;
- query invalidation coerente post-mutation.

Edge case e failure modes:

- doppio click durante mutazione;
- delete senza conferma;
- card di nuovo annuncio che non si apre correttamente;
- breeder oltre il limite di 3 annunci;
- canile/rifugio con listato piu denso e form piu estesi.

Criteri di accettazione:

- pulsanti seller disabilitati durante richieste;
- success/error sempre notificati via toast;
- breeder limit esplicito e applicato;
- shelter dashboard visivamente e funzionalmente distinta;
- nuovo annuncio apre sempre una card editor nuova e stabile.

Test richiesti:

- mutation seller con error backend e invalidazione query;
- smoke create/edit/delete/send review.

Dipendenze:

- `0.1 Foundation`;
- `0.3 Identity & Account`.

### Versione 0.5 Admin & Moderation

Obiettivi prodotto:

- creare una vera moderation console, non una semplice lista;
- allineare frontend admin al backend reale.

UX/UI requirements:

- coda review compatta ma leggibile;
- dettaglio aperto con gerarchia tra media, dati pubblicante, red flags, nota admin e azioni finali;
- inventory admin abbastanza ricco da permettere un giudizio reale sull'annuncio.

Funzionalita obbligatorie:

- overview admin dedicata;
- inventory listings dedicato;
- moderation actions `approve`, `reject`, `remove`, `restore_review`;
- nota admin persistita nel payload;
- analytics operative base;
- dettaglio inventory con tutte le info rilevanti della pubblicazione.

API/data contracts coinvolti:

- `/api/admin/overview`;
- `/api/admin/listings`;
- `/api/admin/listings/:id/moderation`;
- tipi `AdminOverviewPayload` e `AdminManagedListing` allineati alla shape backend.

Edge case e failure modes:

- frontend che usa mutazioni subscriber per azioni admin;
- campi fantasma solo frontend;
- doppie azioni admin su listing in pending;
- coda review con layout stretchato o disallineato.

Criteri di accettazione:

- admin usa solo servizi/query admin dedicati;
- note admin salvate correttamente;
- error/success/pending visibili;
- queue e inventory differiscono nel layout dove serve;
- il dettaglio aperto appare come moderation console e non come card generica.

Test richiesti:

- admin service / mutation error path;
- invalidazione query admin;
- smoke approve/reject/remove/restore.

Dipendenze:

- `0.1 Foundation`;
- `0.3 Identity & Account`;
- `0.4 Seller Operations`.

### Versione 0.6 Production Hardening

Obiettivi prodotto:

- chiudere il gap tra "bella demo" e "webapp pronta a reggere iterazioni reali";
- stabilizzare flussi, feedback, styling e QA.

UX/UI requirements:

- zero stringhe corrotte;
- footer, sidebar, cards dense e moduli rifiniti;
- nessun overflow o stretching brutto sui breakpoint target;
- toasts coerenti e non duplicati.

Funzionalita obbligatorie:

- cleanup timer toast su dismiss manuale;
- prevenzione di notifiche duplicate;
- uniformita pending/error/success;
- responsive review sistematica;
- quality gates sempre verdi.

API/data contracts coinvolti:

- mapping errori coerente;
- contratti demo accounts allineati;
- fallback mock/backend espliciti e limitati.

Edge case e failure modes:

- doppio toast su mutazioni concorrenti;
- stato UI incoerente dopo errori;
- spacing regressivo in dashboard/admin/footer;
- mismatch tra credenziali demo esposte e seed backend.

Criteri di accettazione:

- `npm run typecheck`, `npm run lint`, `npm run test:run`, `npm run build` verdi;
- review manuale completata sulle route core;
- nessuna regressione visiva evidente nelle aree sensibili.

Test richiesti:

- store toast auto-dismiss e dismiss manuale;
- responsive QA checklist;
- smoke completi end-to-end manuali.

Dipendenze:

- tutte le versioni precedenti.

## Rebuild Specification

### Ordine Delle Pagine

1. Home.
2. Listings.
3. Listing detail.
4. Favorites.
5. Login.
6. Register.
7. Account profile.
8. Dashboard allevatore privato.
9. Dashboard canile / rifugio.
10. Control room admin.
11. Inventory admin / moderazione.
12. Articles / editorial.

### Comportamento Atteso Dei Componenti Chiave

- `AppShell`: topbar sticky, nav principale, blocco utente contestuale, footer forte ma sobrio.
- `ToastViewport`: globale, sempre montato, dismiss sicuro, niente timer pendenti dopo chiusura manuale.
- `AccessPage`: login con demo fast access ben spaziate e coerenti con backend.
- `ProfilePage`: quick actions, stato account sintetico, form profilo con successo/errore espliciti.
- `ProfessionalDashboardPage`: shell seller con sidebar libreria + area card editor; breeder e shelter devono differire per copy, permessi, statistiche e tono.
- `AdminInventoryPage`: review queue e inventory con righe collassabili e dettaglio moderation-console.
- `ListingDetailPage`: loading/error/not-found separati, share reale o fallback copy URL, reveal telefono sicuro.
- `LocationAutocompleteInput`: usa Google Places proxy, suggerimenti chiari, placeholder leggibile.

### Palette / Tone / Layout Baseline

- sfondo caldo sabbia;
- testo blu profondo;
- accenti arancioni per azioni primarie;
- card chiare, sfumature leggere, border soft;
- typography leggibile, tono premium e affidabile;
- evitare look "dashboard SaaS purple standard".

### Routing, Ruoli E Dashboard Separation

- `user`: puo salvare preferiti e gestire il proprio profilo;
- `breeder`: max 3 annunci per account;
- `shelter`: annunci multipli senza limite pratico in questa iterazione;
- `admin`: control room, inventory, moderation, overview;
- admin e seller devono avere route e servizi separati;
- `subscriber`: compat legacy da pulire progressivamente.

### Principi Di Spacing, Motion, Toast, Loading/Error States

- blocchi densi con aria sufficiente ma senza vuoti inutili;
- niente box stretchati o pulsanti compressi;
- wrap del testo controllato nelle zone strette;
- motion breve, utile e non decorativo;
- toast come feedback primario per auth, profile, CRUD, moderation, contact form;
- stati distinti: `idle`, `loading`, `authenticated` per auth; pending/error/success per mutazioni; `loading/error/empty/not-found` per dati remoti.

### Regole Anti-Output Generico O Regressivo

- non produrre layout intercambiabili da template;
- non appiattire le differenze tra breeder e shelter;
- non trattare l'admin come un seller avanzato;
- non sostituire il footer con copy vuoto o blandissimo;
- non lasciare azioni senza toast o senza pending state;
- non usare campi frontend non supportati dal backend reale;
- non introdurre credenziali demo diverse da quelle servite o seedate.

## Engineering Standards

- branching: feature branch corte e focalizzate;
- commit: Conventional Commits;
- quality gates: `typecheck`, `lint`, `test:run`, `build`;
- Definition of Done: codice implementato, testato, rifinito visivamente, responsive review fatta, piano aggiornato;
- QA manuale minima: login, register, logout, profile update, seller CRUD, submit review, moderation admin, listing detail, favorites, footer/topbar responsive;
- accessibility minima: focus visibile, CTA leggibili, contrasto sufficiente, toasts non bloccanti, dialog chiudibili;
- review responsive: controllare 1080 / 860 / 640 su topbar, footer, seller shell, review queue, moderation detail, detail sidebar, forms e cards;
- repository hygiene: evitare fix "locali" non documentati quando impattano pattern condivisi;
- source of truth: backend Express/file-based canonico per questa iterazione.

## Known Risks / Tech Debt

- compat legacy `subscriber` ancora presente in alcune route/tipizzazioni;
- demo credentials da mantenere sincronizzate tra backend e frontend;
- dualita mock/backend ancora possibile in alcuni flussi;
- upload media migliorabile lato pipeline e validazioni;
- analytics admin ancora essenziali;
- notification center persistente non ancora implementato;
- possibili drift futuri su spacing/styling nelle aree seller/admin se non si rispettano i pattern attuali.

## Session Ledger

### Lavoro Effettivamente Svolto Fino Ad Oggi

- hardening dello store auth con reset corretto dello stato dopo errori;
- miglioramento del sistema toast con dismiss manuale sicuro e timer centralizzati;
- allineamento dei feedback asincroni su login, logout, register, update profilo, seller CRUD e moderation admin;
- lettura del messaggio di logout nella pagina login tramite `location.state.message`;
- riallineamento progressivo delle demo credentials e del fast access;
- separazione piu chiara tra ruoli canonici `user`, `breeder`, `shelter`, `admin`;
- rifinitura del dettaglio annuncio con share reale/fallback e gestione loading/error/not-found;
- rafforzamento delle dashboard seller con limiti breeder, workflow piu chiaro, card editor e differenziazione breeder vs shelter;
- fix del bug "Nuovo annuncio" con apertura della card dedicata nell'editor seller;
- integrazione del flusso localita con Google Places proxy e supporto upload file media nel form seller;
- rifacimento importante della moderation queue/admin inventory con dettaglio aperto piu simile a una moderation console;
- aggiunta di dati pubblicante, red flags, nota admin e CTA finali piu gerarchiche nel pannello admin;
- miglioramento del footer, del profile summary, della detail sidebar e di diversi spacing/styling sensibili;
- mantenimento verdi di `typecheck`, `lint`, `build` nelle ultime iterazioni;
- preparazione del deploy Render con servizio Node unico, SPA fallback, API same-origin in produzione, `render.yaml` e `.env.example`;
- riallineamento del repository locale a una baseline Git seria con branch `main`, commit convenzionale iniziale del rewrite e tag `v0.1.0`;
- aggiunta di `CONTRIBUTING.md` per portare nel repo le regole operative di branching, PR e versioning derivate dalla documentazione in `version-control/`;
- consolidamento di `project_plan.md` come roadmap + reconstruction spec.

### Modifiche Funzionali Da Considerare Canoniche

- auth:
  - loading sempre chiuso nei path di errore;
  - status coerente dopo success/failure;
  - messaggi post-logout visibili.

- toasts:
  - feedback primario cross-app;
  - dismiss manuale con cleanup;
  - test sullo store.

- seller:
  - breeder max 3 annunci;
  - shelter con gestione piu ampia;
  - dashboard separate per tono e casi d'uso;
  - create/edit/delete/review con pending state e toast.

- admin:
  - overview + listings via servizio admin dedicato;
  - moderation actions dedicate;
  - admin notes persistite;
  - inventory ricca di dati utili al giudizio.

- detail page:
  - niente falso "not found" in loading;
  - share nativo o fallback copy URL;
  - reveal telefono e tracking non bloccante.

### Demo Accounts Canonici Da Mantenere

- utente normale: solo preferiti e profilo;
- allevatore privato: max 3 annunci;
- canile / rifugio: annunci multipli e workflow affido;
- CEO / Admin: gestione inventory, moderation e analytics operative.

Nota operativa:

- le credenziali demo devono restare sempre sincronizzate con il seed/backend reale; il frontend non deve divergere.

### Stato Repo E GitHub Da Considerare Canonico

- branch di riferimento locale: `main`;
- repository GitHub pubblicato: `https://github.com/SSarro16/ad-fido-webapp-react`;
- ultimo commit locale dopo l'estensione della history: `340a3b7` (`docs: capture roadmap and repository release status`);
- baseline funzionale del rewrite presente in history: `8d0bd97`, `5e27b54`, `ef68e6e`, `09520bf`, `e3bd68f`, `a9b17c2`, `1eb35ec`, `1ab22e0`, `7fdc3eb`;
- tag baseline attuale pubblicato: `v0.1.0`;
- quality gates verificate su questa baseline: `npm run lint`, `npm run test:run`, `npm run build`;
- workflow desiderato: feature branching con commit Conventional Commits e merge verso `main` tramite Pull Request;
- file guida repo da mantenere: `README.md`, `CONTRIBUTING.md`, `.github/workflows/ci.yml`, `render.yaml`.

Stato operativo completato:

- remote `origin` configurato verso GitHub;
- branch `main` pubblicato e tracciato su `origin/main`;
- tag `v0.1.0` pubblicato su GitHub;
- repository pronto per essere collegato a Render come source of truth.

Obiettivo finale di questa traccia:

- usare il repository GitHub come source of truth per il deploy Render, con `main` come branch deployabile e CI GitHub attiva sui push/PR.

### Checklist Manuale Da Considerare Completata O Da Rieseguire Ad Ogni Pass Critico

- register fallito e riuscito;
- login fallito e riuscito;
- logout con messaggio visibile nel login;
- update profilo con toast;
- create/edit/delete bozza annuncio seller;
- invio in review;
- approvazione/rifiuto/rimozione admin;
- visualizzazione annuncio nel marketplace;
- reveal telefono e share;
- close manuale toast e auto-dismiss;
- review responsive su home, listings, detail, favorites, profile, seller dashboard, control room, inventory admin, footer.

## Definition Of Done

Una iterazione AdFido si considera chiusa solo quando:

- il flusso implementato funziona davvero e non solo "visivamente";
- i ruoli e i permessi sono coerenti;
- le mutazioni hanno pending, error e success feedback;
- `typecheck`, `lint`, `test:run`, `build` passano;
- le aree toccate sono controllate anche lato spacing, wrapping e responsive;
- `project_plan.md` viene aggiornato se cambia la baseline del prodotto;
- il risultato resta fedele all'identita di AdFido e non degrada in una UI generica.
