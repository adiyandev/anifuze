# AniFuze Installer

This directory is the customer-facing installation package boundary.

The installer validates the product license and server requirements, collects database and initial owner configuration, and invokes the installation services before the application is unlocked.

- `ui/` — installer interface source
- `server/` — installer bootstrap services
- The installed application lives under `system/`
