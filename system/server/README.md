# AniFuze server foundation

This is the beginning of the customer-installed backend. Database credentials stay server-side and are never sent to React.

Supported databases: PostgreSQL, MySQL, MariaDB.

Development:
1. Copy `.env.example` to `.env`.
2. Set the customer database credentials.
3. Run `npm install`.
4. Run `npm run server`.

Startup runs pending migrations before opening the API listener. Migration history is stored in `af_migration_history`.

Authentication, installer transactions, licensing verification, provider sync, and the production security layer are later phases.
