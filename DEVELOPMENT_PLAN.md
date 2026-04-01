# AdFido - Development Plan Progetto Web Platform
## 1. Obiettivo del progetto

AdFido e una piattaforma web marketplace dedicata agli annunci per cani, progettata per unire affidabilita editoriale, gestione professionale degli annunci e un controllo amministrativo chiaro del flusso di pubblicazione.

Le macro-aree funzionali previste sono:

- esperienza pubblica e discovery
- autenticazione e area personale
- area professionale per allevatori e rifugi
- area amministrativa per moderazione e inventory

Ruoli target:

- `user`
- `allevatore`
- `canile/rifugio`
- `admin`

## 2. Assunzioni di pianificazione

- Data di avvio piano: `23 marzo 2026`
- Cadenza operativa: sprint rapidi da `1 settimana` con checkpoint intermedi giornalieri
- Perimetro incluso: `sviluppo + deploy + QA`
- Design, contenuti e copy approvati in tempi rapidi
- Accessi tecnici disponibili entro l'avvio: hosting, dominio, Firebase, storage, map services
- Le variazioni di scope fuori freeze vengono spostate alla release successiva

## 3. Strategia di versioning

Il piano adotta versioni incrementali brevi per mostrare avanzamento concreto al management e per concentrare ogni release su un valore immediatamente verificabile.

- `v0.1.0` Foundation Setup
- `v0.2.0` Public Beta
- `v1.0.0` First Operational Release
- `v2.0.0` Expanded Operations Release
- `v3.0.0` Commercial & Monetization Expansion

Regole di lettura:

- le versioni `v0.x` rappresentano release interne e pre-production
- `v1.0.0` rappresenta la prima versione rilasciabile e presentabile come base operativa completa
- `v2.0.0` rappresenta l'estensione funzionale del prodotto dopo il primo testing online
- `v3.0.0` rappresenta l'avvio del layer commerciale e di monetizzazione e quindi la prima versione rilasciabile in via ufficiale

## 4. Roadmap con date di rilascio

| Versione |   Finestra   |  Data target  |                           Obiettivo                                    |
| v0.1.0   | Settimana 1  | 23 marzo 2026 | setup tecnico, architettura, repo, ambiente, quality baseline          |
| v0.2.0   | Settimana 1  | 24 marzo 2026 | beta pubblica iniziale con homepage, marketplace base, auth essenziale |
| Beta     | Milestone    | 24 marzo 2026 | prima versione navigabile e dimostrabile                               |
| v1.0.0   | Settimana 1  | 25 marzo 2026 | area privata completa, dashboard professionale base, deploy stabile    |
| V1       | Milestone    | 25 marzo 2026 | prima release operativa del sito                                       |
| v2.0.0   | Settimana 2  | 30 marzo 2026 | admin moderation, hardening, QA completa, consolidamento flussi        |
| V2       | Milestone    | 30 marzo 2026 | versione estesa e piu matura del prodotto                              |
| v3.0.0   | Settimana 3  | 6 aprile 2026 | monetizzazione, pagamenti, sponsor e servizi premium                   |
| v3.0.0   | Settimana 3  | 7 aprile 2026 | testing                                                                |
...

Milestone manageriali da evidenziare:

- `Beta prevista: 24/03/2026`
- `Versione 1.0 prevista: 25/03/2026`
- `Versione 2.0 prevista: 1/04/2026`
- `Versione 3.0 prevista: 8/04/2026`

## 5. Contenuti previsti per ogni versione

### v0.1.0 - Foundation Setup

Funzioni incluse:

- bootstrap repository e standard progetto
- setup frontend e backend
- struttura routing iniziale
- environment configuration
- API client base
- shell con loading/error state
- quality baseline con build, lint e test

Obiettivo:

- creare una base tecnica stabile e pronta per lo sviluppo rapido delle release successive

### v0.2.0 - Public Beta

Funzioni incluse:

- design system essenziale
- homepage istituzionale
- listings page
- dettaglio annuncio
- ricerca e filtri essenziali
- registrazione e login base
- profilo utente essenziale
- deploy beta e smoke QA iniziale

Obiettivo:

- consegnare entro il 25 aprile una beta navigabile, dimostrabile e coerente con la visione prodotto

### v1.0.0 - First Operational Release

Funzioni incluse:

- route protette per ruolo
- dashboard allevatore privato
- dashboard canile/rifugio
- create/edit/delete listing
- invio annuncio in revisione
- upload immagini
- localizzazione annuncio
- deploy stabile con checklist minima di rilascio

Obiettivo:

- consegnare una prima versione realmente operativa per utenti registrati e profili professionali

### v2.0.0 - Expanded Operations Release

Funzioni incluse:

- control room amministrativa
- overview KPI base
- inventory annunci
- moderation queue
- azioni approve/reject/remove/restore
- note amministrative
- hardening test e responsive QA
- health checks e quality gates completi

Obiettivo:

- portare il prodotto a un livello piu completo e governabile entro fine marzo/inizio aprile

### v3.0.0 - Commercial & Monetization Expansion

Funzioni incluse:

- sistema pagamenti
- abbonamento allevatore mensile
- acquisto pacchetti di annunci
- area billing e gestione piano
- sponsor Google Ads / integrazione inventory pubblicitaria

Obiettivo:

- introdurre il layer commerciale del prodotto e aprire un modello di monetizzazione strutturato

Nota:

- il perimetro `v3.0.0` e ancora da rifinire nel dettaglio economico, legale e tecnico 

## 6. Backlog operativo per task

Scala priorita:

- `P0`: blocca la release
- `P1`: importante ma non bloccante
- `P2`: miglioramento o rifinitura

Scala effort:

- `S`: 1-2 giorni
- `M`: 3-5 giorni
- `L`: 6-10 giorni
- `XL`: oltre 10 giorni

| Task ID | Area | Task | Descrizione | Versione | Priority | Effort | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|---|---|---|
| FND-01  | Foundation | Setup repository e standard | Impostazione repo, convenzioni, struttura iniziale e baseline quality | v0.1.0 | P0 | S | Nessuna | Repository avviato, standard definiti, script base eseguibili |
| FND-02 | Foundation | Setup frontend architecture | Avvio applicazione web, struttura pagine, router, service layer iniziale | v0.1.0 | P0 | M | FND-01 | Routing base funzionante e shell caricabile |
| FND-03 | Foundation | Setup backend API layer | Backend iniziale, health endpoint, contratti API minimi | v0.1.0 | P0 | M | FND-01 | API raggiungibile e risposta health valida |
| FND-04 | Foundation | Environment e secrets strategy | Configurazione env locali e produzione, gestione chiavi e credenziali | v0.1.0 | P0 | S | FND-01 | Avvio locale e produzione configurabili senza hardcode |
| FND-05 | Foundation | CI pipeline | Lint, test e build in pipeline automatica | v0.1.0 | P0 | S | FND-02, FND-03 | La pipeline esegue i controlli minimi senza errori |
| DS-01 | Design System | Design tokens e palette | Definizione colori, variabili e identita visiva base | v0.2.0 | P0 | S | FND-02 | Palette e token applicati ai componenti principali |
| DS-02 | Design System | Typography e layout rules | Regole di spaziatura, gerarchia testi e griglie principali | v0.2.0 | P0 | S | DS-01 | Le pagine core mantengono gerarchia e spacing coerenti |
| DS-03 | Design System | Componenti base UI | Button, card, form controls, states e pattern riusabili | v0.2.0 | P0 | M | DS-01, DS-02 | I componenti base coprono i casi essenziali del prodotto |
| DS-04 | Design System | Responsive behavior standard | Regole responsive minime per desktop e mobile | v0.2.0 | P1 | S | DS-03 | Nessun blocco critico di layout sui breakpoint principali |
| PUB-01 | Public Experience | Homepage istituzionale | Home con valore prodotto, CTA e sezioni editoriali essenziali | v0.2.0 | P0 | M | DS-03 | La homepage e raggiungibile e comunica il posizionamento del servizio |
| PUB-02 | Public Experience | Pagina listings | Vista elenco annunci con card e struttura consultabile | v0.2.0 | P0 | M | DS-03, FND-03 | L'utente visualizza un feed annunci leggibile |
| PUB-03 | Public Experience | Search e filtri | Ricerca testuale e filtri base del marketplace | v0.2.0 | P0 | M | PUB-02 | I filtri modificano la lista in modo coerente |
| PUB-04 | Public Experience | Pagina dettaglio annuncio | Scheda singolo annuncio con dati, immagini e contatto base | v0.2.0 | P0 | M | PUB-02 | Il dettaglio e raggiungibile da routing pubblico |
| PUB-05 | Public Experience | Sistema preferiti | Salvataggio preferiti per utenti autenticati | v1.0.0 | P1 | S | ID-02, PUB-02 | Un utente autenticato puo aggiungere e rimuovere preferiti |
| PUB-06 | Public Experience | Area articoli/editorial | Sezione articoli di supporto alla fiducia e alla SEO | v2.0.0 | P2 | S | PUB-01 | L'area editoriale e navigabile e coerente con il tono del brand |
| ID-01 | Identity | Registrazione account | Creazione account con validazioni minime | v0.2.0 | P0 | M | FND-03 | Il form valida i campi obbligatori e crea il profilo |
| ID-02 | Identity | Login e logout | Accesso, uscita e stato sessione iniziale | v0.2.0 | P0 | M | ID-01 | Login e logout funzionano con feedback chiaro |
| ID-03 | Identity | Restore session | Ripristino sessione su refresh e bootstrap applicazione | v1.0.0 | P0 | S | ID-02 | La sessione valida viene ripristinata automaticamente |
| ID-04 | Identity | Profilo utente | Gestione dati base utente e aggiornamento profilo | v1.0.0 | P1 | S | ID-02 | Il profilo salva modifiche con stato loading, successo ed errore |
| ID-05 | Identity | Guardie di accesso per ruolo | Protezione route e sezioni riservate | v1.0.0 | P0 | S | ID-03 | Le aree riservate sono accessibili solo ai ruoli corretti |
| PRO-01 | Professional | Dashboard breeder | Area privata per allevatore con overview e accesso rapido ai propri annunci | v1.0.0 | P0 | M | ID-05 | Il breeder vede una dashboard dedicata e coerente col proprio ruolo |
| PRO-02 | Professional | Dashboard shelter | Area privata per rifugio/canile con flusso operativo dedicato | v1.0.0 | P0 | M | ID-05 | Il shelter vede una dashboard distinta da quella breeder |
| PRO-03 | Professional | Editor annuncio | Form completo per creare e modificare annunci | v1.0.0 | P0 | L | PRO-01, PRO-02 | Il professionista puo creare, modificare ed eliminare un annuncio |
| PRO-04 | Professional | Upload immagini | Gestione upload media per gli annunci | v1.0.0 | P1 | M | PRO-03 | Le immagini vengono caricate e associate all'annuncio |
| PRO-05 | Professional | Localizzazione annuncio | Inserimento localita e dati geografici di base | v1.0.0 | P1 | M | PRO-03 | La localita viene selezionata e salvata in modo coerente |
| PRO-06 | Professional | Invio in revisione | Workflow di submit listing verso la moderazione | v1.0.0 | P0 | S | PRO-03 | L'annuncio passa in stato revisione con feedback utente corretto |
| ADM-01 | Admin | Dashboard overview admin | Vista KPI e quadro sintetico del sistema | v2.0.0 | P0 | M | ID-05 | L'admin visualizza overview e numeri chiave del portale |
| ADM-02 | Admin | Inventory annunci | Elenco completo annunci con stati e contesto | v2.0.0 | P0 | M | ADM-01 | L'admin puo consultare l'inventory completa degli annunci |
| ADM-03 | Admin | Moderation queue | Coda di revisione annunci da valutare | v2.0.0 | P0 | M | ADM-02 | Gli annunci in revisione sono chiaramente identificabili e filtrabili |
| ADM-04 | Admin | Azioni approve/reject/remove | Workflow amministrativo sulle pubblicazioni | v2.0.0 | P0 | S | ADM-03 | L'azione aggiorna lo stato e mostra feedback corretto |
| ADM-05 | Admin | Note di moderazione | Annotazioni interne per approvazione o rifiuto | v2.0.0 | P1 | S | ADM-03 | Le note admin vengono salvate e rilette correttamente |
| REL-01 | Release & Quality | Test suite base | Copertura unit e integration per i flussi principali | v0.1.0-v2.0.0 | P0 | L | FND-02, FND-03 | I flussi core hanno test eseguibili in pipeline |
| REL-02 | Release & Quality | Smoke test manuali | Checklist di verifica per ogni release | v0.2.0-v2.0.0 | P0 | M | PUB-01, ID-02 | Le user journey core vengono verificate prima del rilascio |
| REL-03 | Release & Quality | Setup deploy environment | Hosting, build pipeline e configurazione ambiente release | v1.0.0 | P0 | M | FND-04, FND-05 | Il deploy esegue build e pubblicazione in ambiente target |
| REL-04 | Release & Quality | Healthcheck e monitoring base | Endpoint di controllo e monitoraggio tecnico iniziale | v2.0.0 | P1 | S | REL-03 | L'ambiente espone almeno un controllo salute affidabile |
| REL-05 | Release & Quality | Release checklist V1/V2 | Checklist finale di uscita per milestone manageriali | v1.0.0-v2.0.0 | P0 | S | REL-02, REL-03 | Ogni milestone viene chiusa con checklist completata |
| MON-01 | Monetization | Sistema pagamenti | Integrazione pagamenti per servizi premium | v3.0.0 | P0 | XL | V2, definizione business model | Il sistema consente pagamenti validi e tracciabili |
| MON-02 | Monetization | Abbonamento allevatore | Piano mensile per account breeder | v3.0.0 | P0 | M | MON-01 | L'allevatore puo attivare e gestire un abbonamento mensile |
| MON-03 | Monetization | Pacchetti annunci | Acquisto di pacchetti di pubblicazione annunci | v3.0.0 | P1 | M | MON-01 | L'utente professionale puo acquistare pacchetti annunci |
| MON-04 | Monetization | Sponsor Google Ads | Gestione spazi sponsorizzati e supporto advertising | v3.0.0 | P2 | M | definizione commerciale e tecnica | Gli spazi sponsor risultano integrabili senza impattare i flussi core |

## 7. Quality gates e Definition of Done

Quality gates fissi:

- `typecheck`
- `lint`
- `test`
- `production build`
- verifica responsive su pagine core
- smoke test dei flussi principali

Definition of Done:

- sviluppo completato rispetto all'obiettivo della release
- test applicabili eseguiti
- feedback utente gestiti con stati coerenti
- revisione responsive effettuata
- feature allineata al ruolo e al perimetro previsto
- documentazione di release aggiornata

## 8. Rischi e dipendenze

| Rischio                                                              | Impatto                                | Mitigazione                                         |
|---|---|--
--|
| Dipendenza da servizi esterni come Firebase, hosting, storage e maps | Possibile blocco o ritardo tecnico     | Attivare gli accessi e verificare gli ambienti prima dell'avvio operativo |
| Ritardi approvativi su contenuti, UI o copy                          | Slittamento delle milestone compresse  | Concordare approvazioni rapide e congelare i materiali per release |
| Espansione dello scope oltre V1                                      | Perdita di credibilita sulle date      | Mantenere V1 sul perimetro essenziale e spostare extra in V2 o V3 |
| Revisione design tardiva                                             | Rework su UI e frontend                | Chiudere direzione visuale all'inizio della Beta    |
| Dati seed/demo non coerenti                                          | Demo poco affidabile verso stakeholder | Definire una baseline demo stabile per ogni milestone |
| Ambiente di test o produzione non pronto                             | Ritardo sul deploy finale              | Preparare configurazioni e checklist infrastrutturali gia in v0.1.0 |
| Timeline molto compressa con un solo developer                       | Rischio alto di accumulo su task P0    | Limitare il polish nelle prime release e dare priorita ai flussi core |

## 9. Cadenza di reporting e governance

- aggiornamento stato settimanale
- review/demo a fine sprint ogni `1 settimana`
- freeze di scope a `3 giorni lavorativi` dalla Beta e dalla V1
- change request post-freeze spostata alla release successiva salvo priorita critica
- conferma milestone solo con sign-off esplicito

## 10. Test Plan

Validazione su tre livelli:

- per task: ogni task contiene acceptance criteria misurabili
- per versione: ogni release ha exit criteria specifici
- per milestone: Beta, V1 e V2 richiedono checklist di chiusura e validazione

Exit criteria per milestone:

- `Beta`: homepage, listings, dettaglio, auth base e profilo essenziale funzionanti
- `V1`: area professionale, route protette, CRUD annunci e deploy stabile completati
- `V2`: area admin, moderazione, hardening QA e health checks completati

Smoke scenario minimi:

- navigazione homepage e pagine pubbliche
- ricerca annunci e apertura dettaglio
- registrazione e login
- aggiornamento profilo
- creazione/modifica annuncio breeder
- workflow shelter
- moderazione admin
- verifica deploy e health endpoint

## 11. Sintesi finale per il management

Il piano proposto consente di presentare una `Beta entro il 24 marzo 2026`, una `Versione 1.0 entro il 25 marzo 2026` e una `Versione 2.0 entro il 1 aprile 2026`, mantenendo una traiettoria di rilascio molto rapida ma leggibile. La sostenibilita di questa roadmap dipende in modo diretto dal controllo dello scope, dalla rapidita delle approvazioni e dalla priorita assoluta assegnata ai flussi core del prodotto.

La `Versione 3.0`, pianificata in modo preliminare per `8 aprile 2026`, introduce invece il primo livello di monetizzazione del progetto con pagamenti, abbonamento allevatore, pacchetti di annunci e potenziale integrazione sponsor `Google Ads`, da rifinire in una successiva definizione economica e tecnica.
