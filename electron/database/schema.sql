-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  audio_url TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC);

-- AI Personality & Memory
CREATE TABLE IF NOT EXISTS personality (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  confidence REAL DEFAULT 1.0 CHECK(confidence >= 0 AND confidence <= 1),
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences
CREATE TABLE IF NOT EXISTS preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT CHECK(category IN ('audio', 'visualization', 'behavior', 'system')),
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Visualization Presets
CREATE TABLE IF NOT EXISTS viz_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  config JSON NOT NULL,
  thumbnail TEXT,
  created DATETIME DEFAULT CURRENT_TIMESTAMP
);
