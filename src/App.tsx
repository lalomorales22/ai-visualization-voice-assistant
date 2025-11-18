import { useCallback, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import SettingsPanel from './components/SettingsPanel'
import ConversationPanel from './components/Conversation/ConversationPanel'
import VisualizationSurface from './components/Visualization/VisualizationSurface'
import { AudioAnalyzer } from './lib/audioAnalyzer'
import { useVoiceRecorder, type AudioLevels } from './hooks/useVoiceRecorder'
import { useAppStore } from './stores/useAppStore'
import { useConversationEngine } from './hooks/useConversationEngine'

const ZERO_LEVELS: AudioLevels = { bass: 0, mid: 0, treble: 0, volume: 0 }

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [showMemories, setShowMemories] = useState(true)
  const [uiVisible, setUiVisible] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [micAudioData, setMicAudioData] = useState<AudioLevels>(ZERO_LEVELS)
  const [aiAudioData, setAiAudioData] = useState<AudioLevels>(ZERO_LEVELS)
  const [visualAudioData, setVisualAudioData] = useState<AudioLevels>(ZERO_LEVELS)
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null)

  const {
    visualConfig,
    asciiConfig,
    visualMode,
    theme,
    performanceMode,
    messages,
    sessions,
    sessionId,
    highlightedMemories,
    searchResults,
    preferencesLoaded
  } = useAppStore(useShallow(state => ({
    visualConfig: state.visualConfig,
    asciiConfig: state.asciiConfig,
    visualMode: state.visualMode,
    theme: state.theme,
    performanceMode: state.performanceMode,
    messages: state.messages,
    sessions: state.sessions,
    sessionId: state.sessionId,
    highlightedMemories: state.highlightedMemories,
    searchResults: state.searchResults,
    preferencesLoaded: state.preferencesLoaded
  })))

  const {
    setVisualConfig,
    setAsciiConfig,
    setVisualMode,
    setTheme,
    setPerformanceMode,
    loadInitialState,
    createSession,
    switchSession,
    searchConversations,
    deleteMemory
  } = useAppStore(useShallow(state => ({
    setVisualConfig: state.setVisualConfig,
    setAsciiConfig: state.setAsciiConfig,
    setVisualMode: state.setVisualMode,
    setTheme: state.setTheme,
    setPerformanceMode: state.setPerformanceMode,
    loadInitialState: state.loadInitialState,
    createSession: state.createSession,
    switchSession: state.switchSession,
    searchConversations: state.searchConversations,
    deleteMemory: state.deleteMemory
  })))

  useEffect(() => {
    loadInitialState()
  }, [loadInitialState])

  useEffect(() => {
    let mounted = true
    window.electron?.db.getPreference('audio_reactive').then(value => {
      if (mounted && typeof value === 'boolean') {
        setAudioEnabled(value)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    window.electron?.db.setPreference({ key: 'audio_reactive', value: audioEnabled, category: 'audio' })
  }, [audioEnabled])

  const { buildContext, persistTurn, extractMemories } = useConversationEngine()

  const handleCreateSession = useCallback(() => {
    void createSession()
  }, [createSession])

  const handleSwitchSession = useCallback((id: string) => {
    void switchSession(id)
  }, [switchSession])

  const handleSearch = useCallback((query: string) => {
    void searchConversations(query)
  }, [searchConversations])

  const { isRecording, isProcessing, autoLoopEnabled, toggleAutoLoop } = useVoiceRecorder({
    onAIVisualization: setAiAudioData,
    buildContext,
    persistTurn,
    extractMemories,
    preferredVoice: 'Fritz-PlayAI'
  })

  useEffect(() => {
    const analyzer = new AudioAnalyzer()
    audioAnalyzerRef.current = analyzer

    let animationId: number
    const updateAudio = () => {
      if (audioAnalyzerRef.current) {
        if (audioEnabled) {
          setMicAudioData(audioAnalyzerRef.current.getFrequencyData())
        } else {
          setMicAudioData(ZERO_LEVELS)
        }
      }
      animationId = requestAnimationFrame(updateAudio)
    }
    updateAudio()

    return () => {
      cancelAnimationFrame(animationId)
      analyzer.disconnect()
    }
  }, [audioEnabled])

  useEffect(() => {
    setVisualAudioData({
      bass: Math.max(micAudioData.bass, aiAudioData.bass),
      mid: Math.max(micAudioData.mid, aiAudioData.mid),
      treble: Math.max(micAudioData.treble, aiAudioData.treble),
      volume: Math.max(micAudioData.volume, aiAudioData.volume)
    })
  }, [micAudioData, aiAudioData])

  const toggleAudio = async () => {
    if (!audioEnabled && audioAnalyzerRef.current) {
      const connected = await audioAnalyzerRef.current.connectMicrophone()
      if (connected) {
        setAudioEnabled(true)
      } else {
        alert('Microphone access denied')
      }
    } else {
      setAudioEnabled(false)
      audioAnalyzerRef.current?.disconnect()
    }
  }

  const statusText = isRecording
    ? 'Recording...'
    : isProcessing
      ? 'Processing...'
      : 'Press Space to Talk'

  if (!preferencesLoaded) {
    return (
      <div className="w-screen h-screen bg-black/60 text-white flex items-center justify-center">
        <p className="text-sm tracking-[0.3em] uppercase text-white/60">Booting the orb...</p>
      </div>
    )
  }

  return (
    <div 
      className="w-screen h-screen bg-transparent overflow-hidden relative"
      onDoubleClick={() => !uiVisible && setUiVisible(true)}
    >
      <VisualizationSurface
        mode={visualMode}
        visualConfig={visualConfig}
        asciiConfig={asciiConfig}
        audioData={visualAudioData}
        audioEnabled={audioEnabled}
        theme={theme}
      />

      {uiVisible && showMemories && (
        <ConversationPanel
          messages={messages}
          sessions={sessions}
          activeSessionId={sessionId}
          highlightedMemories={highlightedMemories}
          searchResults={searchResults}
          onCreateSession={handleCreateSession}
          onSwitchSession={handleSwitchSession}
          onSearch={handleSearch}
          onDeleteMemory={deleteMemory}
        />
      )}

      {/* Draggable handle at top */}
      {uiVisible && (
        <div className="draggable absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm flex items-center justify-between px-4 z-10">
          <div className="text-white text-sm font-semibold flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <span>AI Orb</span>
          </div>
          <div className="non-draggable flex gap-2">
            <button
              onClick={() => window.electron.window.minimize()}
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600"
            />
            <button
              onClick={() => window.electron.window.close()}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
            />
          </div>
        </div>
      )}

      {/* UI Toggle Controls */}
      {uiVisible && (
        <>
          {/* Hide UI Button */}
          <button
            className="non-draggable absolute bottom-36 right-6 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-xl text-white rounded-full border border-white/10 transition-all z-10 flex items-center justify-center text-xl"
            onClick={() => setUiVisible(false)}
            title="Hide UI (Double-click anywhere to show)"
          >
            👁️
          </button>

          {/* Memory toggle button */}
          <button
            className={`non-draggable absolute bottom-20 right-6 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-xl text-white rounded-full border border-white/10 transition-all z-10 flex items-center justify-center text-xl ${!showMemories ? 'opacity-50 hover:opacity-100' : ''}`}
            onClick={() => setShowMemories(!showMemories)}
            title={showMemories ? "Hide Memories" : "Show Memories"}
          >
            💬
          </button>

          {/* Corner settings button */}
          <button
            className="non-draggable absolute bottom-6 right-6 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-xl text-white rounded-full border border-white/10 transition-all z-10 flex items-center justify-center text-xl"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️
          </button>
        </>
      )}

      {showSettings && uiVisible && (
        <SettingsPanel
          config={visualConfig}
          asciiConfig={asciiConfig}
          visualMode={visualMode}
          theme={theme}
          onChange={setVisualConfig}
          onAsciiChange={setAsciiConfig}
          onVisualModeChange={setVisualMode}
          onThemeChange={setTheme}
          onClose={() => setShowSettings(false)}
          audioEnabled={audioEnabled}
          onToggleAudio={toggleAudio}
          autoLoopEnabled={autoLoopEnabled}
          onToggleAutoLoop={toggleAutoLoop}
          statusText={statusText}
          performanceMode={performanceMode}
          onPerformanceModeChange={setPerformanceMode}
        />
      )}
    </div>
  )
}

export default App
