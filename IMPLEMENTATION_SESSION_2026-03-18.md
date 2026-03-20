# AdFido Session Summary - 2026-03-18

## Outcome

This session turned the repository into a concrete React webapp baseline with:

- premium marketplace UI
- backend auth
- persistent sessions
- backend Google Places proxy
- backend seller listing CRUD
- global toast notifications
- full-width editorial home sections

## Product shape reached

### Homepage

Current homepage order:

1. Hero search
2. Highlight strip
3. Featured listings
4. Full-width article showcase band
5. Full-width video showcase band

Important visual cues:

- warm sand background
- glass-like white panels
- deep blue structure color
- orange CTA accents
- staggered reveals and restrained motion

### Listings

- Listings feed uses horizontal compact result cards.
- Listing detail uses a smaller gallery so content stays primary.
- Sidebar actions are more spaced and readable.

### Editorial

- Home editorial is no longer a simple grid.
- It is now built as two immersive showcase bands:
  - one for articles
  - one for videos
- Each band has:
  - large active visual
  - text block
  - highlights
  - switcher items below

### Auth and roles

- Backend auth endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Session persists across reloads.
- Role semantics were clarified:
  - `user` = allevatore privato
  - `subscriber` = allevatore strutturato o rifugio
  - `admin` = moderation and operations

### Seller workflow

- Seller dashboard is backend-backed, not only local state.
- CRUD endpoints:
  - `GET /api/subscriber/listings`
  - `POST /api/subscriber/listings`
  - `PUT /api/subscriber/listings/:listingId`
  - `PATCH /api/subscriber/listings/:listingId/status`
  - `DELETE /api/subscriber/listings/:listingId`
- If a seller has no listings, the backend auto-creates a starter draft so the dashboard never feels empty or broken.

### Maps and location

- Google Places autocomplete now runs through the backend proxy.
- The API key is no longer required in the frontend.

### Toasts

Global toast notifications now cover:

- login success/failure
- register success/failure
- logout
- new listing flow
- save draft
- send to review
- publish
- revert to draft
- delete listing

## Review pass findings and fixes

A second manual audit pass was performed during the session to verify workflow coherence.

Main issues found and corrected:

- private seller role was not aligned with seller dashboard access
- seller listings were still partially local-state based
- a seller could land in an empty dashboard without understanding what to do
- some role copy still implied that `privato` meant generic user instead of private breeder

## Files that matter most for reproducing the current app

### Backend

- `server/index.js`
- `server/lib/auth.js`
- `server/lib/user-store.js`
- `server/lib/listing-store.js`
- `server/lib/listing-validation.js`
- `server/lib/listing-templates.js`

### Frontend

- `src/routes/HomePage.tsx`
- `src/routes/ListingsPage.tsx`
- `src/routes/ListingDetailPage.tsx`
- `src/routes/LoginPage.tsx`
- `src/routes/RegisterPage.tsx`
- `src/routes/SubscriberDashboardPage.tsx`
- `src/routes/AccountPage.tsx`
- `src/ui/AppShell.tsx`
- `src/ui/SearchHero.tsx`
- `src/ui/ListingCard.tsx`
- `src/ui/LocationAutocompleteInput.tsx`
- `src/ui/ToastViewport.tsx`
- `src/styles.css`

### Feature modules

- `src/features/auth/*`
- `src/features/subscriber/*`
- `src/features/toasts/*`
- `src/features/articles/articles.data.ts`

## Rebuild notes

If another agent had to rebuild the site from scratch using only the planning material, it must preserve:

- the homepage block order
- the warm editorial visual system
- compact listings results
- lighter listing detail gallery
- seller-first interpretation of `user`
- backend auth and session restore
- backend-backed seller CRUD
- backend Places proxy
- toast notifications
- editorial showcase bands instead of generic article cards

## Current next steps

- real image upload instead of pasted URLs
- admin CRUD for editorial content
- persistent notification center beyond transient toasts
- database migration from file storage
- bundle splitting to reduce the Vite chunk warning
