import { ipcMain } from 'electron'
import { dbManager } from '../database/manager.js'

export function setupDatabaseHandlers() {
  ipcMain.handle('db:save-message', async (_event, { sessionId, role, content, metadata }) => {
    try {
      return dbManager.saveMessage(sessionId, role, content, metadata)
    } catch (error) {
      console.error('Save message error:', error)
      throw error
    }
  })

  ipcMain.handle('db:get-conversations', async (_event, { sessionId, limit }) => {
    try {
      return dbManager.getConversations(sessionId, limit)
    } catch (error) {
      console.error('Get conversations error:', error)
      throw error
    }
  })

  ipcMain.handle('db:get-personality', async () => {
    try {
      return dbManager.getPersonality()
    } catch (error) {
      console.error('Get personality error:', error)
      throw error
    }
  })

  ipcMain.handle('db:create-session', async (_event, title?: string) => {
    try {
      return dbManager.createSession(title)
    } catch (error) {
      console.error('Create session error:', error)
      throw error
    }
  })

  ipcMain.handle('db:get-session', async (_event, sessionId: string) => {
    try {
      return dbManager.getSession(sessionId)
    } catch (error) {
      console.error('Get session error:', error)
      throw error
    }
  })

  ipcMain.handle('db:get-sessions', async (_event, limit?: number) => {
    try {
      return dbManager.getSessions(limit)
    } catch (error) {
      console.error('Get sessions error:', error)
      throw error
    }
  })

  ipcMain.handle('db:rename-session', async (_event, { sessionId, title }) => {
    try {
      return dbManager.renameSession(sessionId, title)
    } catch (error) {
      console.error('Rename session error:', error)
      throw error
    }
  })

  ipcMain.handle('db:update-session-summary', async (_event, { sessionId, summary }) => {
    try {
      return dbManager.updateSessionSummary(sessionId, summary)
    } catch (error) {
      console.error('Update session summary error:', error)
      throw error
    }
  })

  ipcMain.handle('db:get-recent-context', async (_event, { sessionId, limit }) => {
    try {
      return dbManager.getRecentContext(sessionId, limit)
    } catch (error) {
      console.error('Get recent context error:', error)
      throw error
    }
  })

  ipcMain.handle('db:search-conversations', async (_event, { query, sessionId, limit }) => {
    try {
      return dbManager.searchConversations(query, sessionId, limit)
    } catch (error) {
      console.error('Search conversations error:', error)
      throw error
    }
  })

  ipcMain.handle('db:update-personality', async (_event, { key, value, confidence }) => {
    try {
      return dbManager.updatePersonality(key, value, confidence)
    } catch (error) {
      console.error('Update personality error:', error)
      throw error
    }
  })

  ipcMain.handle('db:delete-personality', async (_event, key) => {
    try {
      return dbManager.deletePersonality(key)
    } catch (error) {
      console.error('Delete personality error:', error)
      throw error
    }
  })

  ipcMain.handle('db:save-preset', async (_event, { name, config, thumbnail }) => {
    try {
      return dbManager.savePreset(name, config, thumbnail)
    } catch (error) {
      console.error('Save preset error:', error)
      throw error
    }
  })

  ipcMain.handle('db:get-presets', async () => {
    try {
      return dbManager.getPresets()
    } catch (error) {
      console.error('Get presets error:', error)
      throw error
    }
  })

  ipcMain.handle('db:get-preference', async (_event, key) => {
    try {
      return dbManager.getPreference(key)
    } catch (error) {
      console.error('Get preference error:', error)
      throw error
    }
  })

  ipcMain.handle('db:set-preference', async (_event, { key, value, category }) => {
    try {
      return dbManager.setPreference(key, value, category)
    } catch (error) {
      console.error('Set preference error:', error)
      throw error
    }
  })
}
