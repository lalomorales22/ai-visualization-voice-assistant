import { useEffect, useMemo, useState } from 'react'
import type { ConversationMessage, PersonalityFact, SessionSummary } from '../../stores/useAppStore'

interface Props {
  messages: ConversationMessage[]
  sessions: SessionSummary[]
  activeSessionId: string | null
  highlightedMemories: PersonalityFact[]
  searchResults: ConversationMessage[]
  onCreateSession: () => void
  onSwitchSession: (sessionId: string) => void
  onSearch: (query: string) => void
  onDeleteMemory: (key: string) => void
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const valuePreview = (value: any) => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object' && value) {
    return Object.values(value).join(', ')
  }
  return String(value)
}

export function ConversationPanel({
  messages,
  sessions,
  activeSessionId,
  highlightedMemories,
  searchResults,
  onCreateSession,
  onSwitchSession,
  onSearch,
  onDeleteMemory
}: Props) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (query.trim().length <= 1) {
      onSearch('')
      return
    }
    const id = window.setTimeout(() => onSearch(query), 250)
    return () => window.clearTimeout(id)
  }, [query, onSearch])

  const displayMessages = useMemo(() => {
    if (query.length > 1) {
      return searchResults
    }
    return messages
  }, [messages, query.length, searchResults])

  return (
    <div className="non-draggable absolute left-4 top-20 bottom-4 w-80 bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 text-white flex flex-col overflow-hidden z-10">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Memory</p>
          <h3 className="text-lg font-semibold">Conversations</h3>
        </div>
        <button
          onClick={onCreateSession}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium"
        >
          + New
        </button>
      </div>

      <div className="p-3 border-b border-white/5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search memories..."
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm focus:outline-none"
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-28 border-r border-white/5 overflow-y-auto">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSwitchSession(session.id)}
              className={`w-full px-3 py-2 text-left text-xs border-b border-white/5 transition-colors ${
                session.id === activeSessionId ? 'bg-white/15 text-white font-semibold' : 'text-white/60 hover:bg-white/5'
              }`}
            >
              <span className="block truncate">{session.title}</span>
              <span className="text-[10px] text-white/40">
                {session.last_active ? new Date(session.last_active).toLocaleDateString() : ''}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl p-3 border text-sm shadow-sm ${
                  message.role === 'user'
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100'
                    : 'bg-purple-500/5 border-purple-500/20 text-purple-100'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] mb-1 text-white/40">
                  <span>{message.role}</span>
                  <span>{formatTimestamp(message.timestamp)}</span>
                </div>
                <p className="text-white/90 text-sm leading-snug whitespace-pre-line">
                  {message.content}
                </p>
              </div>
            ))}

            {!displayMessages.length && (
              <p className="text-center text-white/40 text-xs mt-6">
                {query.length > 1 ? 'No matches yet.' : 'Start speaking to build a trail.'}
              </p>
            )}
          </div>

          <div className="border-t border-white/5 p-3 bg-black/40 max-h-48 overflow-y-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2 sticky top-0 bg-black/40 backdrop-blur-sm py-1">Surfaced Memories</p>
            {highlightedMemories.length === 0 ? (
              <p className="text-white/40 text-xs">We&apos;ll pin highlights here as the orb learns.</p>
            ) : (
              <div className="space-y-1">
                {highlightedMemories.map((fact) => (
                  <div key={fact.key} className="p-2 rounded-lg bg-white/5 border border-white/10 group relative">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/40 mb-1">
                      <span>{fact.key}</span>
                      <div className="flex items-center gap-2">
                        <span>{Math.round(fact.confidence * 100)}%</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteMemory(fact.key)
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                          title="Delete memory"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-white/80">{valuePreview(fact.value)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationPanel
