-- =====================================================
-- Prompt Marketplace Database Schema
-- Database: promptmk (SQLite/Turso)
-- =====================================================

CREATE TABLE IF NOT EXISTS __initialized (
  id INTEGER PRIMARY KEY
);

PRAGMA foreign_keys = ON;

-- TABLE: User
CREATE TABLE IF NOT EXISTS User (
    id_user TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT,
    provider TEXT DEFAULT 'local' CHECK(provider IN ('local', 'google', 'github')),
    provider_id TEXT,
    avatar_url TEXT,
    bio TEXT,
    airank INTEGER DEFAULT 0,
    aipoints INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_user_username ON User(username);
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_email ON User(email);
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_provider ON User(provider, provider_id);

-- TABLE: Tag
CREATE TABLE IF NOT EXISTS Tag (
    id_tag TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_tag_name ON Tag(name);
CREATE UNIQUE INDEX IF NOT EXISTS uk_tag_slug ON Tag(slug);

-- TABLE: Prompt
-- upvotes y downvotes removidos: se calculan desde la tabla Vote
CREATE TABLE IF NOT EXISTS Prompt (
    id_prompt TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    model TEXT NOT NULL,
    aipoints_price INTEGER DEFAULT 0,
    uses_count INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES User(id_user) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prompt_user_id ON Prompt(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_model ON Prompt(model);
CREATE INDEX IF NOT EXISTS idx_prompt_aipoints_price ON Prompt(aipoints_price);
CREATE INDEX IF NOT EXISTS idx_prompt_is_published ON Prompt(is_published);
CREATE INDEX IF NOT EXISTS idx_prompt_created_at ON Prompt(created_at);

-- TABLE: PromptTag (many-to-many)
CREATE TABLE IF NOT EXISTS PromptTag (
    prompt_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (prompt_id, tag_id),
    FOREIGN KEY (prompt_id) REFERENCES Prompt(id_prompt) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tag(id_tag) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prompttag_tag_id ON PromptTag(tag_id);

-- TABLE: UserTagFollow
CREATE TABLE IF NOT EXISTS UserTagFollow (
    user_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    followed_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, tag_id),
    FOREIGN KEY (user_id) REFERENCES User(id_user) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tag(id_tag) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usertagfollow_tag_id ON UserTagFollow(tag_id);

-- TABLE: PromptResponse
CREATE TABLE IF NOT EXISTS PromptResponse (
    id_response TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    prompt_id TEXT NOT NULL,
    content TEXT NOT NULL,
    tokens_prompt INTEGER,
    tokens_response INTEGER,
    generated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (prompt_id) REFERENCES Prompt(id_prompt) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_promptresponse_prompt_id ON PromptResponse(prompt_id);

-- TABLE: Vote
CREATE TABLE IF NOT EXISTS Vote (
    id_vote TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    user_id TEXT NOT NULL,
    prompt_id TEXT NOT NULL,
    vote_type INTEGER NOT NULL CHECK(vote_type IN (-1, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES User(id_user) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES Prompt(id_prompt) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_vote_user_prompt ON Vote(user_id, prompt_id);
CREATE INDEX IF NOT EXISTS idx_vote_prompt_id ON Vote(prompt_id);
CREATE INDEX IF NOT EXISTS idx_vote_vote_type ON Vote(vote_type);

-- TABLE: Comment
CREATE TABLE IF NOT EXISTS Comment (
    id_comment TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    user_id TEXT NOT NULL,
    prompt_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES User(id_user) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES Prompt(id_prompt) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comment_user_id ON Comment(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_prompt_id ON Comment(prompt_id);
CREATE INDEX IF NOT EXISTS idx_comment_created_at ON Comment(created_at);

-- TABLE: Purchase
CREATE TABLE IF NOT EXISTS Purchase (
    id_purchase TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    buyer_user_id TEXT NOT NULL,
    prompt_id TEXT NOT NULL,
    aipoints_spent INTEGER NOT NULL,
    purchased_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (buyer_user_id) REFERENCES User(id_user) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES Prompt(id_prompt) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_purchase_buyer_id ON Purchase(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_prompt_id ON Purchase(prompt_id);
CREATE INDEX IF NOT EXISTS idx_purchase_purchased_at ON Purchase(purchased_at);

-- =====================================================
-- VIEW: Conteo de votos por prompt
-- =====================================================
CREATE VIEW IF NOT EXISTS PromptVoteCount AS
SELECT
    p.id_prompt,
    p.title,
    COUNT(CASE WHEN v.vote_type =  1 THEN 1 END) AS upvotes,
    COUNT(CASE WHEN v.vote_type = -1 THEN 1 END) AS downvotes,
    COUNT(CASE WHEN v.vote_type =  1 THEN 1 END) -
    COUNT(CASE WHEN v.vote_type = -1 THEN 1 END) AS score
FROM Prompt p
LEFT JOIN Vote v ON v.prompt_id = p.id_prompt
GROUP BY p.id_prompt, p.title;