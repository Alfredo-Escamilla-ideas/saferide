-- SafeRide · Schema MySQL 8.0

CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(36)  NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  dni          VARCHAR(20)  NOT NULL UNIQUE,
  phone        VARCHAR(20)  NOT NULL,
  role         ENUM('driver','passenger') NOT NULL,
  certificate_issuer      VARCHAR(100),
  certificate_expires_at  DATETIME,
  active       TINYINT(1)   NOT NULL DEFAULT 1,
  blocked      TINYINT(1)   NOT NULL DEFAULT 0,
  blocked_at   DATETIME,
  last_login   DATETIME,
  created_at   DATETIME     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id       VARCHAR(36)  NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id  VARCHAR(36)  NOT NULL,
  brand    VARCHAR(100) NOT NULL,
  model    VARCHAR(100) NOT NULL,
  plate    VARCHAR(20)  NOT NULL UNIQUE,
  active   TINYINT(1)   NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rides (
  id           VARCHAR(36)  NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  passenger_id VARCHAR(36)  NOT NULL,
  driver_id    VARCHAR(36),
  status       ENUM('pending','searching','accepted','in_progress','completed','cancelled','expired') NOT NULL DEFAULT 'pending',
  origin       VARCHAR(255) NOT NULL,
  destination  VARCHAR(255) NOT NULL,
  price        DECIMAL(6,2),
  created_at   DATETIME     NOT NULL DEFAULT NOW(),
  updated_at   DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (passenger_id) REFERENCES users(id),
  FOREIGN KEY (driver_id)    REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id         VARCHAR(36)  NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id    VARCHAR(36),
  dni        VARCHAR(20)  NOT NULL,
  ip         VARCHAR(45),
  success    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id         VARCHAR(36)  NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id    VARCHAR(36),
  action     VARCHAR(100) NOT NULL,
  detail     TEXT,
  archived   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT NOW()
);
