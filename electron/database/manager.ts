import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import { randomUUID } from 'crypto'

const SCHEMA_SQL = `
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

-- Session metadata
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON sessions(last_active DESC);

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

-- Lightweight full-text search for conversations
CREATE VIRTUAL TABLE IF NOT EXISTS conversation_fts USING fts5(
  content,
  role UNINDEXED,
  session_id UNINDEXED,
  metadata,
  content_unaccent,
  tokenize = 'porter'
);
`

class DatabaseManager {
  private db: Database.Database
  private insertFts: Database.Statement

  constructor() {
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'conversations.db')

    this.db = new Database(dbPath)
    this.initializeSchema()
    this.backfillSessions()
    this.backfillSearchIndex()
    this.insertFts = this.db.prepare(`
      INSERT INTO conversation_fts (rowid, content, role, session_id, metadata, content_unaccent)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
  }

  private initializeSchema() {
    this.db.exec(SCHEMA_SQL)
  }

  private backfillSearchIndex() {
    const countAll = this.db.prepare('SELECT COUNT(*) as count FROM conversations').get() as { count: number }
    const countFts = this.db.prepare('SELECT COUNT(*) as count FROM conversation_fts').get() as { count: number }

    if (countAll.count === 0 || countFts.count >= countAll.count) {
      return
    }

    const insertStmt = this.db.prepare(`
      INSERT INTO conversation_fts (rowid, content, role, session_id, metadata, content_unaccent)
      VALUES (:id, :content, :role, :session_id, :metadata, :content_unaccent)
    `)

    const rows = this.db.prepare('SELECT id, content, role, session_id, metadata FROM conversations').all() as any[]
    const insertMany = this.db.transaction((items: any[]) => {
      items.forEach(item => {
        insertStmt.run({
          id: item.id,
          content: item.content,
          role: item.role,
          session_id: item.session_id,
          metadata: item.metadata,
          content_unaccent: String(item.content ?? '').toLowerCase()
        })
      })
    })

    insertMany(rows)
  }

  private backfillSessions() {
    const missing = this.db.prepare(`
      SELECT DISTINCT session_id as id
      FROM conversations
      WHERE session_id NOT IN (SELECT id FROM sessions)
    `).all() as Array<{ id: string }>

    if (!missing.length) return

    const insert = this.db.prepare('INSERT INTO sessions (id, title) VALUES (?, ?)')
    const batch = this.db.transaction((rows: Array<{ id: string }>) => {
      rows.forEach(row => {
        const fallbackTitle = this.generateDefaultSessionTitle()
        insert.run(row.id, fallbackTitle)
      })
    })

    batch(missing)
  }

  // Conversations
  saveMessage(sessionId: string, role: string, content: string, metadata?: any) {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (session_id, role, content, metadata)
      VALUES (?, ?, ?, ?)
    `)
    const insertResult = stmt.run(sessionId, role, content, JSON.stringify(metadata || {}))

    try {
      this.insertFts.run(
        insertResult.lastInsertRowid,
        content,
        role,
        sessionId,
        JSON.stringify(metadata || {}),
        content.toLowerCase()
      )
    } catch (error) {
      console.error('FTS insert failed:', error)
    }

    this.touchSession(sessionId)
    return {
      id: insertResult.lastInsertRowid,
      session_id: sessionId,
      role,
      content,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    }
  }

  getConversations(sessionId: string, limit = 50) {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations
      WHERE session_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    return stmt.all(sessionId, limit).reverse()
  }

  getAllConversations(limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    return stmt.all(limit)
  }

  createSession(title?: string) {
    const id = randomUUID()
    const displayTitle = title || this.generateDefaultSessionTitle()
    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, title)
      VALUES (?, ?)
    `)
    stmt.run(id, displayTitle)
    return { id, title: displayTitle }
  }

  getSession(sessionId: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions WHERE id = ?
    `)
    return stmt.get(sessionId)
  }

  getSessions(limit = 20) {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions
      ORDER BY last_active DESC
      LIMIT ?
    `)
    return stmt.all(limit)
  }

  renameSession(sessionId: string, title: string) {
    const stmt = this.db.prepare(`
      UPDATE sessions SET title = ?, last_active = CURRENT_TIMESTAMP WHERE id = ?
    `)
    return stmt.run(title, sessionId)
  }

  updateSessionSummary(sessionId: string, summary: string) {
    const stmt = this.db.prepare(`
      UPDATE sessions SET summary = ?, last_active = CURRENT_TIMESTAMP WHERE id = ?
    `)
    return stmt.run(summary, sessionId)
  }

  touchSession(sessionId: string) {
    const stmt = this.db.prepare(`
      UPDATE sessions
      SET last_active = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    stmt.run(sessionId)
  }

  getRecentContext(sessionId: string, limit = 8) {
    const stmt = this.db.prepare(`
      SELECT id, role, content, timestamp, metadata
      FROM conversations
      WHERE session_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    return stmt.all(sessionId, limit).reverse()
  }

  private sanitizeQuery(query: string) {
    return query
      .replace(/['"*]/g, ' ')
      .replace(/[^\w\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .map(token => `${token}*`)
      .join(' ')
  }

  searchConversations(query: string, sessionId?: string, limit = 25) {
    if (!query.trim()) return []
    const sanitized = this.sanitizeQuery(query)
    if (!sanitized) return []

    let sql = `
      SELECT c.*
      FROM conversation_fts f
      JOIN conversations c ON c.id = f.rowid
      WHERE conversation_fts MATCH ?
    `
    const params: any[] = [sanitized]

    if (sessionId) {
      sql += ' AND c.session_id = ?'
      params.push(sessionId)
    }

    sql += ' ORDER BY c.timestamp DESC LIMIT ?'
    params.push(limit)

    const stmt = this.db.prepare(sql)
    return stmt.all(...params)
  }

  // Personality System
  getPersonality() {
    const stmt = this.db.prepare('SELECT * FROM personality ORDER BY confidence DESC')
    const rows = stmt.all() as any[]

    return rows.map(row => {
      let parsedValue: any = row.value
      try {
        parsedValue = JSON.parse(row.value)
      } catch {
        // leave as string
      }

      return {
        key: row.key,
        value: parsedValue,
        confidence: row.confidence,
        last_updated: row.last_updated
      }
    })
  }

  updatePersonality(key: string, value: any, confidence = 1.0) {
    const stmt = this.db.prepare(`
      INSERT INTO personality (key, value, confidence, last_updated)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        confidence = excluded.confidence,
        last_updated = CURRENT_TIMESTAMP
    `)
    return stmt.run(key, JSON.stringify(value), confidence)
  }

  deletePersonality(key: string) {
    const stmt = this.db.prepare('DELETE FROM personality WHERE key = ?')
    return stmt.run(key)
  }

  // Preferences
  getPreference(key: string) {
    const stmt = this.db.prepare('SELECT value FROM preferences WHERE key = ?')
    const row = stmt.get(key) as any
    return row ? JSON.parse(row.value) : null
  }

  setPreference(key: string, value: any, category: string) {
    const stmt = this.db.prepare(`
      INSERT INTO preferences (key, value, category, last_updated)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        last_updated = CURRENT_TIMESTAMP
    `)
    return stmt.run(key, JSON.stringify(value), category)
  }

  // Visualization Presets
  savePreset(name: string, config: any, thumbnail?: string) {
    const stmt = this.db.prepare(`
      INSERT INTO viz_presets (name, config, thumbnail)
      VALUES (?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        config = excluded.config,
        thumbnail = excluded.thumbnail
    `)
    return stmt.run(name, JSON.stringify(config), thumbnail)
  }

  getPresets() {
    const stmt = this.db.prepare('SELECT * FROM viz_presets ORDER BY created DESC')
    return stmt.all()
  }

  close() {
    this.db.close()
  }

  private generateDefaultSessionTitle() {
    const date = new Date()
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    }) + ' Session'
  }
}

export const dbManager = new DatabaseManager()
