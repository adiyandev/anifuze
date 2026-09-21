# AniFuze

**Build. Customize. Stream.** AniFuze is a frontend-only prototype for operating customer-owned anime websites. It separates a public streaming experience, a customer management workspace, and AniFuze platform administration.

## Included flows

- LocalStorage-backed mock role guards for `public_user`, `customer`, and `platform_admin`.
- Public catalog, anime detail, mock watch experience, discovery pages, and configurable navigation/appearance.
- Customer dashboard, anime CRUD, episode visibility controls, provider management/testing/health/source management, and a mock API console.
- Template marketplace with a simulated checkout/install/activate sequence.
- Visual site builder with component insertion, editing, visibility, duplication, remove, save, undo/redo, and keyboard shortcuts.
- Website, SEO, domain, community, notification, analytics, and settings control surfaces.
- Separate platform-owner metrics and ecosystem-management tables.

## Architecture

- `src/app`: route configuration and private-route guards.
- `src/layouts`: deliberately distinct public, customer, and platform shells.
- `src/pages`: page-level public, manage, and platform product surfaces.
- `src/components/ui`: shared buttons, cards, badges, states, confirmation controls, and statistics.
- `src/services`: mock/localStorage services designed to be replaced by backend clients later.

## Development

```bash
npm install
npm run dev
npm run build
```

No API calls, credentials, payments, DNS requests, analytics collection, or embedded iframes are used. Provider responses, payment steps, connection tests, and domain states are intentionally simulated.
