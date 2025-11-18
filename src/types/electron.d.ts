export interface ElectronAPI {
  groq: {
    transcribe: (audioData: Uint8Array) => Promise<{
      text: string
    }>
    chat: (messages: any[]) => Promise<string>
    tts: (text: string, voice: string) => Promise<ArrayBuffer>
    vision: (image: string, prompt: string) => Promise<string>
    onChatChunk: (callback: (chunk: string) => void) => void
  }
  db: {
    saveMessage: (params: {
      sessionId: string
      role: string
      content: string
      metadata?: any
    }) => Promise<any>
    getConversations: (params: {
      sessionId: string
      limit?: number
    }) => Promise<any[]>
    createSession: (title?: string) => Promise<{ id: string; title: string }>
    getSession: (sessionId: string) => Promise<any>
    getSessions: (limit?: number) => Promise<any[]>
    renameSession: (params: { sessionId: string; title: string }) => Promise<any>
    updateSessionSummary: (params: { sessionId: string; summary: string }) => Promise<any>
    getRecentContext: (params: { sessionId: string; limit?: number }) => Promise<any[]>
    searchConversations: (params: { query: string; sessionId?: string; limit?: number }) => Promise<any[]>
    getPersonality: () => Promise<Array<{ key: string; value: any; confidence: number; last_updated: string }>>
    updatePersonality: (params: {
      key: string
      value: any
      confidence?: number
    }) => Promise<any>
    deletePersonality: (key: string) => Promise<any>
    savePreset: (params: {
      name: string
      config: any
      thumbnail?: string
    }) => Promise<any>
    getPresets: () => Promise<any[]>
    getPreference: (key: string) => Promise<any>
    setPreference: (params: {
      key: string
      value: any
      category: string
    }) => Promise<any>
  }
  window: {
    minimize: () => void
    close: () => void
    toggleAlwaysOnTop: () => void
  }
  system: {
    executeCommand: (command: string) => Promise<{ success: boolean; output?: string; error?: string }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}
