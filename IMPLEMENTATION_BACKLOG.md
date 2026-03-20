# AdFido Implementation Backlog

## Current status

Completed:

- React web foundation with Vite, React Router, React Query, Zustand, TypeScript, ESLint, Vitest, and CI.
- Public home page, listings feed, listing detail, sponsor slotting, and favorites persistence.

In progress:

- Auth foundations and protected route model.
- Subscriber and admin dashboard shells.
- Editorial area and backend-ready API contracts.

## Next delivery slices

### Slice 1: Identity and protected navigation

- Add login and register screens with typed form validation.
- Persist session and expose current user role.
- Protect account, subscriber, and admin routes.
- Add logout and demo role switching for QA.

### Slice 2: Subscriber operations

- Dashboard overview with quota, listings by status, and media-rule reminders.
- Listing editor form with draft and review-ready states.
- Validation for media limits and cover-image requirements.

### Slice 3: Admin and editorial

- Moderation queue page with status badges and quick actions.
- Editorial manager with article cards and embedded-video metadata.
- Sponsor management overview and placement rules.

### Slice 4: Backend integration

- Environment-driven API base URL.
- Typed API client with adapters for auth, listings, favorites, articles, and moderation.
- Replace mock adapters feature by feature behind a stable service layer.

### Slice 5: Hardening

- Auth flow tests.
- Route guard tests.
- Smoke test for public discovery and dashboard access control.
- Performance pass on listing feed and image loading.
