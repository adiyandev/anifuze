# AniFuze — Build. Customize. Stream.

AniFuze is a frontend-only prototype for operating an anime website as a product, not merely browsing one. It separates the customer-facing anime site, a customer management workspace, and a platform-owner console.

## Highlights

- Public anime experience with discovery, details, safe mock playback, and user-facing routes.
- Role-separated customer and platform-admin routes using conceptual frontend guards.
- Customer dashboard, anime/editor workflows, provider setup/testing, provider console, health/fallback views, marketplace, mock template installation, site builder, and appearance settings.
- Public integration: appearance and builder configuration persist to `localStorage` and update the public experience.
- Local-only mock services keep UI separate from sample data and are intentionally shaped for future API replacement.

## Stack

React, TypeScript, Vite, React Router, CSS design system, and browser localStorage. There is no backend, payment provider, authentication server, provider API request, iframe, DNS verification, or real credential in this prototype.

## Development

```bash
npm install
npm run dev
npm run build
```

## Key routes

- Public: `/`, `/browse`, `/search`, `/anime/:id`, `/watch/:id`, plus library and profile routes.
- Customer: `/manage/dashboard`, `/manage/anime`, `/manage/providers`, `/manage/providers/console`, `/manage/templates/marketplace`, `/manage/site-builder`, `/manage/appearance` and related management routes.
- Platform: `/platform`, `/platform/customers`, `/platform/templates`, `/platform/orders`, and moderation/settings routes.

The login page lets evaluators select a mock customer or platform-admin role. Public users are redirected from private paths.

## Mock architecture

`src/data/mock.ts` holds seed data. `src/services/mockServices.ts` exposes the data operations used by UI, and `src/services/storage.ts` centralizes defensive localStorage access. This boundary is the replacement point for a future authenticated API client.
