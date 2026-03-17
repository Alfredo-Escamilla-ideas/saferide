-- SafeRide · Schema PostgreSQL (Neon)

CREATE TABLE IF NOT EXISTS users (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT        NOT NULL,
  dni                    TEXT        NOT NULL UNIQUE,
  phone                  TEXT        NOT NULL,
  role                   TEXT        NOT NULL CHECK (role IN ('driver','passenger')),
  certificate_issuer     TEXT,
  certificate_expires_at TIMESTAMPTZ,
  active                 BOOLEAN     NOT NULL DEFAULT TRUE,
  blocked                BOOLEAN     NOT NULL DEFAULT FALSE,
  blocked_at             TIMESTAMPTZ,
  last_login             TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id       UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand    TEXT  NOT NULL,
  model    TEXT  NOT NULL,
  plate    TEXT  NOT NULL UNIQUE,
  active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS rides (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID NOT NULL REFERENCES users(id),
  driver_id    UUID REFERENCES users(id),
  status       TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','searching','accepted','in_progress','completed','cancelled','expired')),
  origin       TEXT NOT NULL,
  destination  TEXT NOT NULL,
  price        NUMERIC(6,2),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID,
  dni        TEXT NOT NULL,
  ip         TEXT,
  success    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID,
  action     TEXT NOT NULL,
  detail     TEXT,
  archived   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
