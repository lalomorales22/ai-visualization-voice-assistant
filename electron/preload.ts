import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Groq API calls (proxied through main process for security)
  groq: {
    transcribe: (audioData: Uint8Array) => ipcRenderer.invoke('groq:transcribe', audioData),
    chat: (messages: any[]) => ipcRenderer.invoke('groq:chat', messages),
    tts: (text: string, voice: string) => ipcRenderer.invoke('groq:tts', text, voice),
    vision: (image: string, prompt: string) => ipcRenderer.invoke('groq:vision', image, prompt),

    // Listen for streaming chat chunks
    onChatChunk: (callback: (chunk: string) => void) => {
      ipcRenderer.on('groq:chat-chunk', (_event, chunk) => callback(chunk))
    }
  },

  // Database operations
  db: {
    saveMessage: (params: {
      sessionId: string
      role: string
      content: string
      metadata?: any
    }) => ipcRenderer.invoke('db:save-message', params),

    getConversations: (params: {
      sessionId: string
      limit?: number
    }) => ipcRenderer.invoke('db:get-conversations', params),

    createSession: (title?: string) => ipcRenderer.invoke('db:create-session', title),

    getSession: (sessionId: string) => ipcRenderer.invoke('db:get-session', sessionId),

    getSessions: (limit?: number) => ipcRenderer.invoke('db:get-sessions', limit),

    renameSession: (params: { sessionId: string; title: string }) =>
      ipcRenderer.invoke('db:rename-session', params),

    updateSessionSummary: (params: { sessionId: string; summary: string }) =>
      ipcRenderer.invoke('db:update-session-summary', params),

    getRecentContext: (params: { sessionId: string; limit?: number }) =>
      ipcRenderer.invoke('db:get-recent-context', params),

    searchConversations: (params: { query: string; sessionId?: string; limit?: number }) =>
      ipcRenderer.invoke('db:search-conversations', params),

    getPersonality: () => ipcRenderer.invoke('db:get-personality'),

    updatePersonality: (params: {
      key: string
      value: any
      confidence?: number
    }) => ipcRenderer.invoke('db:update-personality', params),

    deletePersonality: (key: string) => ipcRenderer.invoke('db:delete-personality', key),

    savePreset: (params: {
      name: string
      config: any
      thumbnail?: string
    }) => ipcRenderer.invoke('db:save-preset', params),

    getPresets: () => ipcRenderer.invoke('db:get-presets'),

    getPreference: (key: string) => ipcRenderer.invoke('db:get-preference', key),

    setPreference: (params: {
      key: string
      value: any
      category: string
    }) => ipcRenderer.invoke('db:set-preference', params)
  },

  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    close: () => ipcRenderer.send('window:close'),
    toggleAlwaysOnTop: () => ipcRenderer.send('window:toggle-on-top')
  },

  // System commands
  system: {
    executeCommand: (command: string) => ipcRenderer.invoke('system:execute-command', command)
  }
})

// Type definitions for TypeScript
export interface ElectronAPI {
  groq: {
    transcribe: (audioData: Uint8Array) => Promise<{ text: string }>
    chat: (messages: any[]) => Promise<string>
    tts: (text: string, voice: string) => Promise<ArrayBuffer>
    vision: (image: string, prompt: string) => Promise<string>
    onChatChunk: (callback: (chunk: string) => void) => void
  }
  db: {
    saveMessage: (params: any) => Promise<any>
    getConversations: (params: any) => Promise<any[]>
    createSession: (title?: string) => Promise<{ id: string; title: string }>
    getSession: (sessionId: string) => Promise<any>
    getSessions: (limit?: number) => Promise<any[]>
    renameSession: (params: { sessionId: string; title: string }) => Promise<any>
    updateSessionSummary: (params: { sessionId: string; summary: string }) => Promise<any>
    getRecentContext: (params: { sessionId: string; limit?: number }) => Promise<any[]>
    searchConversations: (params: { query: string; sessionId?: string; limit?: number }) => Promise<any[]>
    getPersonality: () => Promise<Array<{ key: string; value: any; confidence: number; last_updated: string }>>
    updatePersonality: (params: any) => Promise<any>
    deletePersonality: (key: string) => Promise<any>
    savePreset: (params: any) => Promise<any>
    getPresets: () => Promise<any[]>
    getPreference: (key: string) => Promise<any>
    setPreference: (params: any) => Promise<any>
  }
  window: {
    minimize: () => void
    close: () => void
    toggleAlwaysOnTop: () => void
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
