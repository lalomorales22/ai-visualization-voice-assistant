import { create } from 'zustand'
import { DEFAULT_ASCII_CONFIG, type AsciiConfig, type ThemeKey, type VisualConfig, type VisualizationMode, VISUAL_PRESETS } from '../lib/visualConfig'

export type ConversationRole = 'user' | 'assistant' | 'system'

export interface ConversationMessage {
  id: number | string
  session_id: string
  role: ConversationRole
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface SessionSummary {
  id: string
  title: string
  summary?: string
  last_active?: string
}

export interface PersonalityFact {
  key: string
  value: any
  confidence: number
  last_updated: string
}

type PerformanceMode = 'standard' | 'eco'

interface AppState {
  sessionId: string | null
  sessions: SessionSummary[]
  messages: ConversationMessage[]
  personality: PersonalityFact[]
  highlightedMemories: PersonalityFact[]
  searchResults: ConversationMessage[]
  visualConfig: VisualConfig
  asciiConfig: AsciiConfig
  visualMode: VisualizationMode
  theme: ThemeKey
  performanceMode: PerformanceMode
  preferencesLoaded: boolean
  historyLoading: boolean
  lastUserMessage?: string
  loadInitialState: () => Promise<void>
  refreshHistory: (limit?: number) => Promise<void>
  fetchPersonality: () => Promise<void>
  refreshSessions: () => Promise<void>
  createSession: (title?: string) => Promise<void>
  switchSession: (sessionId: string) => Promise<void>
  appendMessage: (message: { role: ConversationRole; content: string; metadata?: Record<string, any> }) => Promise<void>
  searchConversations: (query: string) => Promise<void>
  setVisualConfig: (config: VisualConfig) => void
  setVisualMode: (mode: VisualizationMode) => void
  setTheme: (theme: ThemeKey) => void
  setAsciiConfig: (changes: Partial<AsciiConfig>) => void
  setPerformanceMode: (mode: PerformanceMode) => void
  deleteMemory: (key: string) => Promise<void>
}

const preference = async (key: string) => {
  return window.electron?.db.getPreference(key)
}

const setPreference = async (key: string, value: any, category: string) => {
  await window.electron?.db.setPreference({ key, value, category })
}

const rankFacts = (facts: PersonalityFact[], context?: string) => {
  if (!context) {
    return [...facts].sort((a, b) => b.confidence - a.confidence).slice(0, 4)
  }

  const tokens = context.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

  return [...facts]
    .map(fact => {
      const serialized = typeof fact.value === 'string' ? fact.value : JSON.stringify(fact.value)
      const factText = serialized.toLowerCase()
      const hits = tokens.reduce((acc, token) => (factText.includes(token) ? acc + 1 : acc), 0)
      const score = fact.confidence + hits * 0.15
      return { fact, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(item => item.fact)
}

export const useAppStore = create<AppState>((set, get) => ({
  sessionId: null,
  sessions: [],
  messages: [],
  personality: [],
  highlightedMemories: [],
  searchResults: [],
  visualConfig: VISUAL_PRESETS.default,
  asciiConfig: DEFAULT_ASCII_CONFIG,
  visualMode: 'canvas',
  theme: 'dark',
  performanceMode: 'eco',
  preferencesLoaded: false,
  historyLoading: false,

  loadInitialState: async () => {
    const electron = window.electron
    if (!electron) return

    const [sessionPref, configPref, modePref, themePref, asciiPref, performancePref] = await Promise.all([
      preference('current_session_id'),
      preference('visual_config'),
      preference('visual_mode'),
      preference('color_theme'),
      preference('ascii_config'),
      preference('performance_mode')
    ])

    let sessionId = sessionPref as string | null
    if (!sessionId) {
      const session = await electron.db.createSession()
      sessionId = session.id
      await setPreference('current_session_id', sessionId, 'system')
    }

    const [messages, sessions, personality] = await Promise.all([
      electron.db.getConversations({ sessionId, limit: 75 }),
      electron.db.getSessions(12),
      electron.db.getPersonality()
    ])

    const visualConfig = (configPref as VisualConfig) ?? VISUAL_PRESETS.default
    const asciiConfig = (asciiPref as AsciiConfig) ?? DEFAULT_ASCII_CONFIG
    const mode = (modePref as VisualizationMode) ?? 'canvas'
    const theme = (themePref as ThemeKey) ?? 'dark'
    const performanceMode = (performancePref as PerformanceMode) ?? (visualConfig.performanceProfile ?? 'eco')

    set({
      sessionId,
      messages,
      sessions,
      personality,
      highlightedMemories: rankFacts(personality, get().lastUserMessage),
      visualConfig,
      asciiConfig,
      visualMode: mode,
      theme,
      performanceMode,
      preferencesLoaded: true
    })
  },

  refreshHistory: async (limit = 75) => {
    const { sessionId } = get()
    if (!sessionId || !window.electron) return
    set({ historyLoading: true })

    const messages = await window.electron.db.getConversations({ sessionId, limit })
    set({ messages, historyLoading: false })
  },

  fetchPersonality: async () => {
    if (!window.electron) return
    const personality = await window.electron.db.getPersonality()
    set({
      personality,
      highlightedMemories: rankFacts(personality, get().lastUserMessage)
    })
  },

  refreshSessions: async () => {
    if (!window.electron) return
    const sessions = await window.electron.db.getSessions(12)
    set({ sessions })
  },

  createSession: async (title?: string) => {
    if (!window.electron) return
    const session = await window.electron.db.createSession(title)
    await setPreference('current_session_id', session.id, 'system')
    set({ sessionId: session.id, messages: [] })
    await get().refreshSessions()
  },

  switchSession: async (sessionId: string) => {
    if (!window.electron) return
    await setPreference('current_session_id', sessionId, 'system')
    set({ sessionId })
    await Promise.all([get().refreshHistory(), get().refreshSessions()])
  },

  appendMessage: async ({ role, content, metadata }) => {
    const { sessionId, messages } = get()
    if (!sessionId || !window.electron) return

    const saved = await window.electron.db.saveMessage({ sessionId, role, content, metadata })
    const nextMessages = [...messages, saved as ConversationMessage]
    set({
      messages: nextMessages,
      lastUserMessage: role === 'user' ? content : get().lastUserMessage,
      highlightedMemories: role === 'user'
        ? rankFacts(get().personality, content)
        : get().highlightedMemories
    })
  },

  searchConversations: async (query: string) => {
    if (!window.electron) return
    if (!query.trim()) {
      set({ searchResults: [] })
      return
    }
    const { sessionId } = get()
    const searchResults = await window.electron.db.searchConversations({ query, sessionId: sessionId ?? undefined, limit: 50 })
    set({ searchResults })
  },

  setVisualConfig: (config: VisualConfig) => {
    set({ visualConfig: config })
    setPreference('visual_config', config, 'visualization')
  },

  setVisualMode: (mode: VisualizationMode) => {
    set({ visualMode: mode })
    setPreference('visual_mode', mode, 'visualization')
  },

  setTheme: (theme: ThemeKey) => {
    set({ theme })
    setPreference('color_theme', theme, 'visualization')
  },

  setAsciiConfig: (changes: Partial<AsciiConfig>) => {
    set(state => {
      const next = { ...state.asciiConfig, ...changes }
      setPreference('ascii_config', next, 'visualization')
      return { asciiConfig: next }
    })
  },

  setPerformanceMode: (mode: PerformanceMode) => {
    set(state => {
      const updatedConfig: VisualConfig = { ...state.visualConfig, performanceProfile: mode }
      setPreference('performance_mode', mode, 'behavior')
      setPreference('visual_config', updatedConfig, 'visualization')
      return {
        performanceMode: mode,
        visualConfig: updatedConfig
      }
    })
  },

  deleteMemory: async (key: string) => {
    if (!window.electron) return
    await window.electron.db.deletePersonality(key)
    await get().fetchPersonality()
  }
}))
