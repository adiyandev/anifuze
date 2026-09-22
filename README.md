# AniFuze

**Build. Customize. Stream.**

AniFuze is a frontend-first SaaS prototype for creating, customizing, and managing anime streaming websites.

## Implemented

- Premium public anime experience
- Private customer workspace
- Private platform administration
- Anime and episode management
- Provider management and fallback priority
- Mock provider health and connection tests
- Safe embed URL tester
- Mock API/provider console
- Source manager
- Template marketplace and mock checkout
- Template installation and activation
- Visual site builder with undo/redo
- Appearance editor
- Navigation and page management
- SEO and domain configuration UI
- Users, comments and reports
- Analytics and notifications
- Local persistence through a storage abstraction
- Responsive UI and application error boundary

## Architecture

The app is intentionally frontend-only. UI code talks to mock service modules, which persist demo state through localStorage. The service boundary is designed so a future API/backend can replace the mocks without rewriting the page layer.

### Stack

React, Vite, TypeScript, React Router, CSS, lucide-react.

### Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Demo access

Open **/login** and choose either the customer workspace or platform administration. Authentication is deliberately simulated and is not production security.

## Safety boundaries

No real provider credentials are used. Provider requests and playback are mocked. AniFuze does not use iframes or execute custom JavaScript from the builder.

See `ANIFUZE_MASTER_BUILD_PROMPT.md` for the complete A–Z product specification.
