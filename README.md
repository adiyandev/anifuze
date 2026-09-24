# AniFuze

> A modern, self-hosted anime platform built for customization, control, and production-ready deployment.

AniFuze is a customizable anime platform designed for people who want to launch and manage their own anime streaming website without relying on a prebuilt hosted service.

Configure your branding, navigation, streaming providers, authentication, templates, analytics, and more directly from the admin panel.

## ✨ Features

### 🎨 Complete Site Customization

* Custom site name and tagline
* Custom logo and favicon
* Primary and accent colors
* Custom background
* Footer configuration
* Social links
* Domain configuration
* SEO configuration
* Custom navigation
* Site builder and pages

### 📺 Streaming Provider Engine

* API-based providers
* Embed/external providers
* Direct media sources
* Provider priority and fallback
* Configurable endpoints
* Custom headers
* Query parameters
* Request bodies
* Source response mapping
* Provider health monitoring
* Provider request history
* Stream diagnostics
* Admin-controlled playback

The public player does **not** rely on hardcoded demo streams. Playback is resolved through the providers configured by the site administrator.

### 👤 User System

* Customer registration
* Login/logout
* Sessions
* Remember-me sessions
* Email verification
* Password reset
* Profiles
* Avatars
* Banners
* Bios
* Favorites
* Watchlist
* Watch history
* Continue watching
* Watch progress

### 🛡️ Admin Platform

* Dashboard
* User management
* Anime management
* Episode management
* Provider management
* Provider console
* Provider diagnostics
* Analytics
* Notifications
* Email configuration
* OAuth configuration
* Security center
* Audit logs
* Backups and restore
* Cache management
* Maintenance mode
* System information
* Update system
* License management
* Site Setup Center

### 📊 Real Analytics

AniFuze uses backend-backed analytics rather than demo dashboard numbers.

Tracked data can include:

* Page views
* Stream starts
* Sessions
* Anime views
* Devices
* Browsers
* Provider request performance
* Event activity

Analytics are stored in the site's database and displayed through the admin panel.

### 🧩 Central Template Marketplace

Templates are designed to be distributed from AniFuze's central infrastructure rather than bundled as fake/local demo templates.

Administrators can:

1. Browse available templates
2. View template information
3. Install a template
4. Activate an installed template

The customer installation only stores the templates it actually installs.

### 🔐 Security

AniFuze includes infrastructure for:

* Admin authentication
* Customer authentication
* Role-based permissions
* Sessions
* Two-factor authentication
* Recovery codes
* Password changes
* Encrypted provider credentials
* Encrypted OAuth secrets
* Audit logging
* Backup/restore
* License verification

Production deployments should still be configured with HTTPS, secure secrets, proper database credentials, and a production-grade deployment environment.

### 📦 Installer

AniFuze includes a dedicated installation system designed to handle:

* Server requirement checks
* License verification
* Database configuration
* Email configuration
* OAuth configuration
* Owner account creation
* Database migrations
* Deployment
* Installation locking
* Rollback handling

The long-term production architecture separates the installer/release system from the customer site's configurable content and templates.

---

## 🏗️ Technology

AniFuze is built around modern web technologies.

* React
* TypeScript
* Vite
* Node.js
* Express
* PostgreSQL
* AniList
* REST APIs
* Server-side authentication
* Responsive administration interface

---

## 🚀 Development

Clone the repository:

```bash
git clone https://github.com/adiyandev/anifuze.git
cd anifuze
```

Install dependencies:

```bash
npm install
```

Start the development environment:

```bash
npm run dev
```

Run backend tests:

```bash
npm run test:server
```

Build the frontend:

```bash
npm run build
```

---

## ⚙️ Configuration

AniFuze uses environment variables for installation-specific configuration.

Important configuration includes:

```env
NODE_ENV=production

ANIFUZE_VERSION=1.0.0

ANIFUZE_ENCRYPTION_KEY=your-secure-encryption-key

ANIFUZE_LICENSE_KEY=your-license-key

ANIFUZE_LICENSE_SERVICE_URL=https://your-license-service.example

ANIFUZE_TEMPLATE_SERVICE_URL=https://your-template-service.example
```

Database, email, OAuth, storage, deployment, and other installation-specific values can also be configured through the appropriate system configuration.

**Never commit production secrets to Git.**

---

## 🛒 Preorders Available

### AniFuze is currently available for preorder.

Preordering gives customers access to the upcoming production release and allows them to secure their AniFuze installation before the final release.

**Preorders are currently available.**

For preorder information, licensing, pricing, and release details, contact the AniFuze team.

> Production availability, included features, and licensing terms may change as development continues.

---

## 🗺️ Development Roadmap

AniFuze is being developed toward a complete production platform.

Current development includes:
* [x] Standalone installer bootstrap
* [x] Installer-only customer package
* [x] Central signed release downloader
* [x] Atomic system installation and activation

* [x] Admin platform foundation
* [x] Customer authentication
* [x] Security center
* [x] Audit logging
* [x] Backups
* [x] Maintenance system
* [x] Update infrastructure
* [x] Licensing infrastructure
* [x] Installer foundation
* [x] Site configuration
* [x] White-label branding
* [x] Streaming provider engine
* [x] Provider diagnostics
* [x] Real analytics
* [x] Central template architecture
* [x] Production OAuth
* [x] Production email delivery
* [x] Protected release distribution
* [x] Production installer package
* [x] Update delivery system
* [x] Final production security audit
* [ ] Full production release

---

## 🔒 About Source Protection

AniFuze is designed around a protected-release architecture.

Customer installations should receive production release artifacts rather than the development repository.

Because AniFuze runs components on customer-controlled infrastructure, no server-side application can guarantee that its code is completely inaccessible to the infrastructure owner. The production architecture therefore focuses on:

* Production builds
* Minification
* Removing development artifacts
* Signed releases
* Release integrity verification
* License verification
* Centralized services
* Server-controlled templates
* Keeping sensitive infrastructure separate from customer deployments

---

## 🤝 Contributing

AniFuze is currently under active development.

Development contributions, bug reports, and technical feedback are welcome.

Before opening a pull request, make sure:

```bash
npm run build
npm run test:server
```

complete successfully.

---

## 📄 License

AniFuze licensing and redistribution terms will be provided with the production release.

The GitHub repository should not be treated as permission to commercially redistribute AniFuze or its production releases.

---

## ⭐ Project

**AniFuze** — Build your anime platform your way.

Preorders are available while the production release is being finalized.
