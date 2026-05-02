-- =====================================================
-- Better Auth schema
-- =====================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auth_user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_auth_user_email ON auth_user(email);

CREATE TABLE IF NOT EXISTS auth_session (
    id TEXT PRIMARY KEY,
    expiresAt TEXT NOT NULL,
    token TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES auth_user(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_auth_session_token ON auth_session(token);
CREATE INDEX IF NOT EXISTS idx_auth_session_user_id ON auth_session(userId);

CREATE TABLE IF NOT EXISTS auth_account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt TEXT,
    refreshTokenExpiresAt TEXT,
    scope TEXT,
    password TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES auth_user(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_auth_account_provider_account ON auth_account(providerId, accountId);
CREATE INDEX IF NOT EXISTS idx_auth_account_user_id ON auth_account(userId);

CREATE TABLE IF NOT EXISTS auth_verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_verification_identifier ON auth_verification(identifier);

-- Trigger: create User record with 1000 aipoints when auth_user is created
CREATE TRIGGER IF NOT EXISTS trg_auth_user_after_insert
AFTER INSERT ON auth_user
BEGIN
  INSERT OR IGNORE INTO User (id_user, username, email, aipoints)
  VALUES (NEW.id, COALESCE(NEW.name, NEW.email), NEW.email, 1000);
END;
