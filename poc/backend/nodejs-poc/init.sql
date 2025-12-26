-- Extensions utiles pour PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Index pour recherche full-text (utile pour AREA)
CREATE INDEX IF NOT EXISTS idx_users_email_trgm ON users USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_name_trgm ON services USING gin (name gin_trgm_ops);
