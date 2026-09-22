# AniFuze — A–Z Complete Master Build Prompt

You are the lead engineer, product designer, frontend architect, and QA engineer for AniFuze.

## Mission

Build the ENTIRE AniFuze application from scratch. Do not stop at a scaffold, landing page, route skeleton, or partial dashboard. Continue until the major product journeys are functional, polished, responsive, persistent, and build successfully.

AniFuze tagline: **Build. Customize. Stream.**

AniFuze is a SaaS platform for creating and managing customizable anime streaming websites.

Three separate experiences:
1. Public anime website
2. Private customer management/admin
3. Private AniFuze platform admin

Current implementation is frontend-only. Use mock services and localStorage. Architect the code so a real backend can replace the mock layer later.

## Stack

Use React + Vite + TypeScript, React Router, Tailwind CSS, Framer Motion where useful, and lucide-react where useful. Avoid unnecessary dependencies or stack rewrites.

No backend, real payments, real provider API calls, real DNS, real email infrastructure, real auth backend, Electron, Capacitor, Android app, or unrelated features.

## Brand / Design

Brand: AniFuze.
Tagline: Build. Customize. Stream.

Do NOT use AnimeVault branding or its black/pink identity.

Visual direction: premium modern SaaS + cinematic streaming UI, inspired by modern products such as Linear/Vercel without copying them. Avoid excessive neon, gradients, and glassmorphism.

Colors:
- Midnight Navy #070B17
- Deep Navy #0B1020
- Panel Navy #10172A
- Elevated Panel #151D32
- Electric Cyan #22D3EE
- Bright Cyan #67E8F9
- Violet #8B5CF6
- Soft Violet #A78BFA
- White #F8FAFC
- Muted White #CBD5E1
- Muted Text #94A3B8
- Dark Text #64748B
- Border #26324A
- Success #22C55E
- Warning #F59E0B
- Error #EF4444
- Info #38BDF8

Use Inter/Geist or another clean SaaS font.

## Architecture

Use separate layouts:
- PublicLayout
- CustomerAdminLayout
- PlatformAdminLayout

Use guards:
- RequireAuth
- RequireCustomer
- RequirePlatformAdmin

Roles:
- public_user
- customer
- platform_admin

Public users must NEVER see admin links, provider credentials, provider console, internal errors, customer tools, platform tools, or admin navigation.

Keep architecture modular:
src/components
src/layouts
src/pages/public
src/pages/manage
src/pages/platform
src/features
src/services
src/hooks
src/context
src/data
src/types
src/utils
src/routes
src/styles

Avoid giant components and duplicated logic.

## Routes

Public:
/
/browse
/search
/anime/:id
/watch/:id
/schedule
/genres
/latest
/trending
/movies
/ongoing
/completed
/favorites
/watchlist
/history
/continue-watching
/profile
/login
/register
/pages/:slug

Customer:
/manage
/manage/dashboard
/manage/anime
/manage/anime/new
/manage/anime/:id
/manage/episodes
/manage/episodes/:id
/manage/genres
/manage/collections
/manage/schedule
/manage/providers
/manage/providers/new
/manage/providers/:id
/manage/providers/console
/manage/providers/health
/manage/providers/sources
/manage/users
/manage/comments
/manage/reports
/manage/templates
/manage/templates/marketplace
/manage/templates/:id
/manage/purchases
/manage/site-builder
/manage/site-builder/:page
/manage/appearance
/manage/navigation
/manage/pages
/manage/seo
/manage/domains
/manage/analytics
/manage/notifications
/manage/settings

Platform:
/platform
/platform/customers
/platform/templates
/platform/creators
/platform/orders
/platform/reviews
/platform/reports
/platform/settings

Every major route must have a real page, working navigation, loading/empty/error/success states, and no dead buttons.

## Services

Create service abstractions:
animeService
episodeService
providerService
userService
templateService
orderService
analyticsService
settingsService
pageService
navigationService
notificationService
collectionService
commentService
reportService
domainService

Implement operations such as:
get/create/update/delete anime
get/create/update/delete episodes
get/create/update/delete providers
testProvider
testEmbed
getProviderHealth
getProviderSources
get/update users
get/get/purchase/install/uninstall/activate templates
get analytics
get/update settings
get/create/update/delete pages
get/update navigation
get/create/update/delete notifications
and equivalent collection/comment/report/domain operations.

Keep mock datasets separate from UI.

## Persistence

Use a storage abstraction, not scattered raw localStorage.

Suggested keys:
anifuze_settings
anifuze_appearance
anifuze_navigation
anifuze_builder
anifuze_pages
anifuze_providers
anifuze_provider_priority
anifuze_provider_enabled
anifuze_templates
anifuze_purchases
anifuze_notifications
anifuze_user_state
anifuze_anime
anifuze_episodes
anifuze_users
anifuze_domains
anifuze_comments
anifuze_reports

Important customer configuration must survive refresh.

## Public Website

Build a polished anime streaming website with:
- homepage hero
- featured anime
- trending
- latest episodes
- continue watching
- popular anime
- seasonal content
- collections
- schedule preview
- CTA
- footer

Homepage must be configuration-driven.

Browse:
- search
- anime grid
- filtering
- sorting
- genre/status/type filters
- pagination
- responsive cards

Anime details:
- poster/cover/banner
- titles
- description
- genres
- status/type/year/rating
- episode count
- favorite
- watchlist
- episodes
- related/recommended

Watch:
- safe mock player area
- episode selector
- previous/next
- source selector
- provider/source status
- continue watching
- episode list
- anime information

NO IFRAMES anywhere.

User features:
- favorites
- watchlist
- history
- continue watching
- profile
- local persistence

## Customer Dashboard

Create a real SaaS dashboard with:
- visitors
- registered users
- anime views
- episode views
- streams
- provider requests
- provider health
- popular anime
- latest episodes
- recent activity
- system status

## Anime Management

Professional table with:
poster, anime, type, status, episodes, views, updated, actions.

Forms for:
title, alternative titles, description, poster, banner, type, status, year, season, genres, rating, external IDs, SEO.

Support create/edit/delete/duplicate/view.

## Episode Management

Fields:
episode number, title, anime, thumbnail, air date, visibility, duration, providers.

Actions:
edit, hide, delete, duplicate, bulk actions.

## Provider System

Types:
- API Provider
- Embed Provider
- Direct Video
- Custom Provider

Provider table:
provider, type, status, priority, latency, requests, last checked, actions.

Actions:
add, edit, enable, disable, delete, test, reorder.

API provider fields:
provider name, description, base URL, API URL, API key, API secret, auth type, HTTP method, headers, query parameters, languages, priority, enabled.

Use only mock credentials:
{{MOCK_API_KEY}}
{{MOCK_API_SECRET}}
Bearer {{MOCK_API_KEY}}

Never include real-looking secrets.

Embed provider fields:
provider name, description, embed URL template, anime ID parameter, episode ID parameter, episode number parameter, language, priority, enabled.

Supported variables:
{animeId}
{episodeId}
{malId}
{anilistId}
{episodeNumber}
{season}

## Provider Console

Route /manage/providers/console.

Features:
- provider selector
- GET/POST/PUT/PATCH/DELETE
- endpoint/path
- headers
- query
- request body
- send
- response
- status
- response time
- response headers
- JSON/raw
- copy
- request history
- clear
- replay

All requests are mocked. Never perform real provider calls.

## Embed Tester

Inputs:
anime ID
episode ID
episode number
MAL ID
AniList ID
season

Generate URL by replacing variables, validate required variables, show generated URL, status, detected variables, provider, simulated response, and copy button.

NO IFRAMES.

## Provider Health

Show:
availability, latency, error rate, request count, last success, last failure.

Statuses:
Healthy, Degraded, Offline, Unknown.

Provider tests simulate:
success, failure, timeout, unauthorized, invalid configuration.

## Source Manager

/manage/providers/sources

Show episode, provider, source type, status, URL, last checked.

Source types:
API, Embed, Direct, Custom.

Actions:
test, edit, disable, delete.

## Provider Fallback

Create a visual chain:
Request -> Provider A -> failure -> Provider B -> failure -> Provider C -> Source Found.

Allow reorder, move up/down, enable/disable and persist priority.

## Marketplace

Categories:
Popular, New, Free, Premium, Minimal, Cinematic, Community, Dark, Light.

Cards:
preview, name, creator, version, price, rating.

Template details:
preview, screenshots, live-demo mock, description, features, requirements, version, changelog, creator, reviews, pricing.

Mock checkout:
Review -> Payment Method -> Confirm -> Success.

Never process real payments.

My Templates:
installed, purchased, updates.

Actions:
install, activate, preview, customize, update, uninstall.

Persist template state.

## Site Builder

Routes:
/manage/site-builder
/manage/site-builder/:page

Three-pane editor:
1. component library
2. live website canvas
3. properties editor

Components:
Hero
Anime Grid
Anime Carousel
Anime Card
Episode List
Schedule
Banner
Image
Text
Button
Divider
Stats
Collection
CTA
Navbar
Footer

Actions:
add, remove, reorder, duplicate, hide, edit, save, preview, undo, redo.

Keyboard:
Ctrl/Cmd+Z
Ctrl/Cmd+Shift+Z

Selecting a component opens its property editor. Property changes immediately update the preview. Do not hardcode sections.

## Page Builder

Allow:
create, rename, duplicate, delete, hide, set homepage.

Default pages:
Home, Browse, Latest, Trending, Schedule, Genres, About, Contact, Custom.

## Appearance

Sections:
Branding
- site name
- logo
- favicon
- tagline

Colors
- primary
- accent
- background
- panels
- text

Typography
- font
- heading size
- body size
- weight

Layout
- container width
- card radius
- spacing
- density

Effects
- shadows
- animations
- borders

Changes must affect public preview and persist.

## Navigation Builder

Allow:
rename, reorder, hide, delete, change destination, add custom link.

Changes must affect public navbar and persist.

## SEO

/manage/seo

Fields:
title
description
keywords
OG image
robots
canonical
sitemap
anime SEO defaults
custom URLs

Provide SEO preview UI.

## Domains

/manage/domains

Show:
current domain
connection status
SSL status
DNS status

Actions:
connect, verify, refresh.

Everything is simulated.

## Users

/manage/users

Columns:
username, email, joined, last active, status, role.

Actions:
view, ban, unban, delete, change role.

Use confirmation dialogs for destructive actions.

## Community

Comments moderation:
user, anime, comment, date, status; approve/hide/delete/warn.

Reports:
reporter, target, reason, date, status; review/resolve/dismiss.

## Collections

Create/edit/delete/reorder collections with:
name, description, cover, anime, visibility.

## Schedule

Show day, anime, episode, release time, status. Filter by day.

## Analytics

/manage/analytics

Metrics:
visitors, users, anime views, episode views, streams, provider usage, popular anime, most watched episodes.

Filters:
7D, 30D, 90D, 1Y.

Use internally consistent mock data.

## Notifications

/manage/notifications

Create:
title, message, type, audience, schedule.

Types:
Info, Success, Warning, Announcement.

Include public preview.

## Settings

/manage/settings

Sections:
General
Branding
Appearance
Users
Authentication
Streaming
Providers
SEO
Notifications
Analytics
Domains
Security
Advanced

## Custom Code

Provide fields for:
Custom CSS
Custom JavaScript
Head Code

Store as configuration only. Do NOT execute arbitrary custom code automatically.

## Platform Admin

Completely separate PlatformAdminLayout.

Routes:
platform dashboard, customers, templates, creators, orders, reviews, reports, settings.

Dashboard:
customers, active customers, templates, purchases, mock revenue, creators, recent orders, reports, system status.

Customers:
manage customer status, plan, created date, last active, template, site status.

Templates:
create, edit, publish, unpublish, feature, remove.

Creators:
creator, templates, sales, rating, status.

Orders:
order ID, customer, template, amount, date, status.

Reviews:
approve, hide, delete.

Reports:
template/creator/customer/abuse reports.

## Shared UI

Build reusable:
Button, Input, Select, Textarea, Switch, Checkbox, Modal, Drawer, Dropdown, Tabs, Badge, Card, Panel, Table, Pagination, Toast, Tooltip, Skeleton, EmptyState, ErrorState, StatCard, Avatar, Breadcrumbs, ConfirmDialog, SearchInput, DateRangePicker, Progress, Chart.

Use them consistently.

## UX

Every important action needs feedback.

Examples:
Template installed
Provider saved
Provider tested
Anime deleted
Settings updated
Navigation saved
Page duplicated
Domain verification started

Implement loading, empty, error and success states. No blank screens.

Create an application-level Error Boundary.

Create a polished 404.

Optional but recommended: Ctrl/Cmd+K command palette for Dashboard, Anime, Providers, Provider Console, Site Builder, Marketplace, Settings, Analytics.

## Responsive / Accessibility

Desktop, laptop, tablet, mobile.

Admin sidebar becomes a mobile drawer. Tables become responsive. Builder remains usable on mobile. Public website has responsive navigation, cards, player and grids.

Accessibility:
semantic HTML, keyboard navigation, visible focus, labels, accessible dialogs, contrast, reduced motion.

## Mock Data

Keep datasets separate:
anime, episodes, providers, users, templates, orders, analytics, notifications, collections, comments, reports, domains.

Seed enough realistic fictional data that a fresh install is not empty.

## Auth Simulation

Frontend-only login/register using localStorage. Support demo roles public_user, customer and platform_admin. Clearly keep it mock authentication.

## Public/Admin Data Flow

Prefer:
UI -> hooks/context/state -> services -> storage -> mock data

Do not put all business logic in page components.

## Performance

Avoid unnecessary rerenders, huge inline datasets, giant components, duplicate state, unnecessary dependencies, and excessive animations.

## README

Create a professional README explaining:
what AniFuze is, features, architecture, stack, installation, development, build, mock architecture, routes, project structure, future backend integration, limitations.

State clearly that it is currently frontend-only and uses mocked services/localStorage.

## QA

After implementation:
- run npm install
- run npm run build, or the correct existing build script
- fix every TypeScript/build/import/runtime error
- inspect every major route
- verify refresh works
- verify persistence
- verify public/customer/platform separation
- verify no iframe exists
- verify no real secrets exist
- remove debug console logs and dead code
- remove AnimeVault branding
- verify responsive layouts
- verify destructive confirmations
- verify buttons are not dead

## Required End-to-End Journeys

Customer:
Login -> Dashboard -> Marketplace -> Template Details -> Purchase -> Install -> Activate -> Site Builder -> Appearance -> Navigation -> Anime -> Episodes -> Providers -> API Provider -> Test -> Console -> Embed Provider -> Embed Tester -> Health -> Priority -> SEO -> Domain -> Public Preview.

Public:
Home -> Browse -> Search -> Anime -> Watch -> Episode -> Source -> Continue Watching -> History -> Favorites -> Profile.

Template:
Marketplace -> Details -> Purchase -> Install -> Activate -> Customize -> Save -> Preview -> Public Site.

Provider:
Providers -> Add Provider -> Configure -> Save -> Test -> Health -> Console -> Priority -> Sources.

Builder:
Site Builder -> Page -> Add Component -> Select -> Edit Properties -> Preview -> Reorder -> Duplicate -> Hide -> Undo -> Redo -> Save -> Refresh -> Verify Persistence.

## Absolute Rules

Do not stop after scaffolding.
Do not leave major pages as placeholders.
Do not create dead buttons.
Do not ask the user to implement remaining features.
If a backend feature cannot exist yet, implement a convincing frontend simulation behind a service abstraction and persist state.
If an error occurs, diagnose it, fix it, retest, and continue.
Do not remove requested features because the backend is not present.
Do not use iframes.
Do not use real credentials.
Do not add unrelated features.

## Definition of Done

AniFuze is done only when it feels like a complete SaaS prototype ready for a future backend:
- public anime site is polished
- customer admin is comprehensive
- platform admin is separate
- marketplace works
- template installation/activation works
- site builder works
- appearance/navigation/page configuration works
- anime/episode management works
- provider management works
- provider console works
- embed tester works
- provider health works
- source manager works
- fallback priority works
- analytics works
- SEO/domain UI works
- settings/notifications work
- state persists
- responsive/accessibility requirements are met
- all major journeys work
- build passes

**BUILD THE WHOLE PRODUCT. DO NOT STOP EARLY.**
