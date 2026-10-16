-- Клиенты кабинета. Аккаунт создаёт менеджер кнопкой «Открыть личный кабинет» в сделке.
CREATE TABLE IF NOT EXISTS clients (
  id                   SERIAL PRIMARY KEY,
  email                TEXT NOT NULL UNIQUE,
  phone                TEXT,
  name                 TEXT NOT NULL DEFAULT '',
  bitrix_contact_id    INTEGER,
  password_hash        TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  blocked              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at        TIMESTAMPTZ
);

-- Объекты клиента: одна сделка воронки «Проекты» = один объект.
CREATE TABLE IF NOT EXISTS client_deals (
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  deal_id    INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, deal_id)
);

-- Сессии: в cookie лежит случайный токен, в базе только его SHA-256.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_client_idx ON sessions(client_id);

CREATE TABLE IF NOT EXISTS schema_migrations (
  name       TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
