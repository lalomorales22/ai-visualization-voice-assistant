import { useCallback } from 'react'
import { useAppStore, type PersonalityFact } from '../stores/useAppStore'

const serializeFactValue = (value: any) => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
    return entries.map(([key, val]) => `${key}: ${String(val)}`).join(' • ')
  }
  return String(value)
}

const rankFacts = (facts: PersonalityFact[], context?: string, limit = 4) => {
  if (!facts.length) return []
  if (!context) return [...facts].sort((a, b) => b.confidence - a.confidence).slice(0, limit)

  const tokens = context.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

  return [...facts]
    .map(fact => {
      const serialized = serializeFactValue(fact.value).toLowerCase()
      const hits = tokens.reduce((acc, token) => (serialized.includes(token) ? acc + 1 : acc), 0)
      return { fact, score: fact.confidence + hits * 0.2 }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.fact)
}

export function useConversationEngine() {
  const sessionId = useAppStore(state => state.sessionId)
  const messages = useAppStore(state => state.messages)
  const personality = useAppStore(state => state.personality)
  const appendMessage = useAppStore(state => state.appendMessage)
  const fetchPersonality = useAppStore(state => state.fetchPersonality)

  const buildContext = useCallback(async (latestUserInput: string) => {
    const topFacts = rankFacts(personality, latestUserInput)
    const factLines = topFacts
      .map(fact => `- ${fact.key}: ${serializeFactValue(fact.value)} (confidence ${(fact.confidence * 100).toFixed(0)}%)`)
      .join('\n')

    const systemPrompt = `You are Groq Voice Orb, an ambient AI companion.
Capabilities:
1. You can execute bash commands on the user's computer. To do this, output a JSON block: \`\`\`json\n{"tool": "bash", "command": "your command here"}\n\`\`\`
2. Keep responses vivid but concise (max 3 sentences).
3. Blend empathy with curiosity.

Known preferences & memories:
${factLines || '- none yet, so learn actively.'}
Always acknowledge long-term details if relevant.`

    const recentHistory = messages.slice(-8).map(msg => ({ role: msg.role, content: msg.content }))

    return {
      sessionId,
      systemPrompt,
      history: recentHistory,
      facts: topFacts
    }
  }, [messages, personality, sessionId])

  const persistTurn = useCallback(async (turn: {
    user: { content: string; metadata?: Record<string, any> }
    assistant: { content: string; metadata?: Record<string, any> }
  }) => {
    await appendMessage({ role: 'user', content: turn.user.content, metadata: turn.user.metadata })
    
    // Check for tool calls in assistant response
    let finalContent = turn.assistant.content
    try {
      // Regex to find JSON block, supporting optional markdown code fences
      const jsonMatch = finalContent.match(/(?:```json\s*)?(\{"tool":\s*"bash",\s*"command":\s*".*?"\})(?:\s*```)?/s)
      if (jsonMatch && jsonMatch[1]) {
        const toolCall = JSON.parse(jsonMatch[1])
        if (toolCall.tool === 'bash' && window.electron?.system) {
          const result = await window.electron.system.executeCommand(toolCall.command)
          
          // Append the tool result as a system message so context is maintained
          await appendMessage({ 
            role: 'system', 
            content: `Tool Output (${toolCall.command}): ${result.success ? result.output : result.error}` 
          })
        }
      }
    } catch (e) {
      console.error('Tool execution failed', e)
    }

    await appendMessage({ role: 'assistant', content: finalContent, metadata: turn.assistant.metadata })
  }, [appendMessage])

  const extractMemories = useCallback(async (turn: {
    user: string
    assistant: string
  }) => {
    if (!window.electron || turn.user.length < 12) return

    try {
      const extractionPrompt = [
        {
          role: 'system',
          content: 'You extract up to 3 JSON facts from a user/assistant exchange. Respond ONLY with JSON: {"facts":[{"key":"string","value":string|object,"confidence":0-1}]}.'
        },
        {
          role: 'user',
          content: `User said: "${turn.user}"\nAssistant replied: "${turn.assistant}"`
        }
      ]

      const raw = await window.electron.groq.chat(extractionPrompt)
      const parsed = JSON.parse(raw || '{}')
      if (!Array.isArray(parsed?.facts)) return

      for (const fact of parsed.facts) {
        if (!fact?.key || !fact?.value) continue
        await window.electron.db.updatePersonality({
          key: fact.key,
          value: fact.value,
          confidence: typeof fact.confidence === 'number' ? fact.confidence : 0.7
        })
      }

      await fetchPersonality()
    } catch (error) {
      console.warn('Memory extraction skipped:', error)
    }
  }, [fetchPersonality])

  return {
    buildContext,
    persistTurn,
    extractMemories
  }
}
