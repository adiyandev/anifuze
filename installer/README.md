# AniFuze Installer

This directory is the customer-facing installation package boundary.

The installer validates the product license and server requirements, collects database and initial owner configuration, and invokes the installation services before the application is unlocked.

- `ui/` — installer interface source
- `server/` — installer bootstrap services
- The installed application lives under `system/`


## Production readiness

The production installer uses PostgreSQL, verifies the purchased license against the central AniFuze license service over HTTPS, writes installation secrets with restrictive permissions, runs the complete migration set, creates the first Owner account, verifies the stored license after migration, and locks the installer after a successful installation. The production rollback endpoint is disabled; failed installations automatically clean up newly created AniFuze tables and restore the previous environment file.

Customer API and Embed stream providers are configured after installation from the licensed customer portal. AniFuze administrators cannot edit or remove those customer-owned providers.
