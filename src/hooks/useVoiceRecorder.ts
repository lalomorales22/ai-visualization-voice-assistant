import { useEffect, useRef, useState } from 'react'

export type AudioLevels = {
  bass: number
  mid: number
  treble: number
  volume: number
}

interface UseVoiceRecorderOptions {
  onAIVisualization?: (levels: AudioLevels) => void
  buildContext?: (latestUserInput: string) => Promise<{
    systemPrompt: string
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  }>
  persistTurn?: (turn: {
    user: { content: string; metadata?: Record<string, any> }
    assistant: { content: string; metadata?: Record<string, any> }
  }) => Promise<void>
  extractMemories?: (turn: { user: string; assistant: string }) => Promise<void>
  preferredVoice?: string
}

const ZERO_LEVELS: AudioLevels = { bass: 0, mid: 0, treble: 0, volume: 0 }
type AudioBinary = ArrayBuffer | ArrayBufferView
const DEFAULT_SYSTEM_PROMPT = 'You are a helpful AI orb that speaks in concise, vivid sentences.'

const averageRange = (data: Uint8Array, start: number, end: number) => {
  let sum = 0
  for (let i = start; i < end; i++) {
    sum += data[i]
  }
  return sum / Math.max(1, end - start)
}

const deriveLevels = (data: Uint8Array): AudioLevels => {
  const bass = averageRange(data, 0, 10) / 255
  const mid = averageRange(data, 10, 50) / 255
  const treble = averageRange(data, 50, 100) / 255
  const volume = (bass + mid + treble) / 3
  return { bass, mid, treble, volume }
}

const normalizeArrayBuffer = (input: AudioBinary): ArrayBuffer => {
  if (input instanceof ArrayBuffer) {
    return input.slice(0)
  }

  if (ArrayBuffer.isView(input)) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength)
  }

  throw new Error('Unsupported audio buffer type')
}

export function useVoiceRecorder(options?: UseVoiceRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoLoopEnabled, setAutoLoopEnabled] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const autoLoopRef = useRef(false)
  const recordingRef = useRef(isRecording)
  const processingRef = useRef(isProcessing)
  const aiAudioContextRef = useRef<AudioContext | null>(null)
  const aiAnalyserRef = useRef<AnalyserNode | null>(null)
  const aiDataArrayRef = useRef<Uint8Array | null>(null)
  const aiAnimationFrameRef = useRef<number | null>(null)

  const emitAiLevels = (levels: AudioLevels = ZERO_LEVELS) => {
    options?.onAIVisualization?.(levels)
  }

  useEffect(() => {
    recordingRef.current = isRecording
  }, [isRecording])

  useEffect(() => {
    processingRef.current = isProcessing
  }, [isProcessing])

  useEffect(() => {
    autoLoopRef.current = autoLoopEnabled
  }, [autoLoopEnabled])

  const analyzeSignal = async (buffer: ArrayBuffer) => {
    const audioContext = new AudioContext()
    try {
      const decoded = await audioContext.decodeAudioData(buffer.slice(0))
      const channel = decoded.getChannelData(0)
      let sumSquares = 0
      let maxSample = 0

      for (let i = 0; i < channel.length; i++) {
        const sample = Math.abs(channel[i])
        sumSquares += sample * sample
        if (sample > maxSample) {
          maxSample = sample
        }
      }

      const rms = Math.sqrt(sumSquares / channel.length)
      return { rms, duration: decoded.duration, peak: maxSample }
    } finally {
      await audioContext.close()
    }
  }

  const ensureAiAnalyser = () => {
    if (!aiAudioContextRef.current) {
      aiAudioContextRef.current = new AudioContext()
    }

    if (!aiAnalyserRef.current) {
      aiAnalyserRef.current = aiAudioContextRef.current.createAnalyser()
      aiAnalyserRef.current.fftSize = 2048
      aiDataArrayRef.current = new Uint8Array(aiAnalyserRef.current.frequencyBinCount)
    }

    return {
      context: aiAudioContextRef.current!,
      analyser: aiAnalyserRef.current!,
      dataArray: aiDataArrayRef.current!
    }
  }

  const stopAiVisualization = () => {
    if (aiAnimationFrameRef.current) {
      cancelAnimationFrame(aiAnimationFrameRef.current)
      aiAnimationFrameRef.current = null
    }
    emitAiLevels(ZERO_LEVELS)
  }

  const playAiSpeech = async (audioBinary: AudioBinary) => {
    const wavBuffer = normalizeArrayBuffer(audioBinary)
    const { context, analyser, dataArray } = ensureAiAnalyser()
    if (context.state === 'suspended') {
      await context.resume()
    }

    const audioBuffer = await context.decodeAudioData(wavBuffer)

    return new Promise<{ duration: number }>((resolve, reject) => {
      const source = context.createBufferSource()
      source.buffer = audioBuffer
      source.connect(analyser)
      analyser.connect(context.destination)

      const pump = () => {
        analyser.getByteFrequencyData(dataArray)
        emitAiLevels(deriveLevels(dataArray))
        aiAnimationFrameRef.current = requestAnimationFrame(pump)
      }

      aiAnimationFrameRef.current = requestAnimationFrame(pump)

      source.onended = () => {
        stopAiVisualization()
        resolve({ duration: audioBuffer.duration })
      }

      source.onerror = (event) => {
        console.error('AI audio playback error:', event)
        stopAiVisualization()
        reject(event)
      }

      source.start(0)
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())

        // Process the recording
        await processRecording(audioBlob)
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Microphone access denied. Please allow microphone access to use voice features.')
      setAutoLoopEnabled(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const resumeAutoConversation = () => {
    if (!autoLoopRef.current) return
    if (recordingRef.current || processingRef.current) return

    setTimeout(() => {
      if (!recordingRef.current && !processingRef.current && autoLoopRef.current) {
        startRecording()
      }
    }, 350)
  }

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      if (!window.electron?.groq) {
        console.error('Groq API not available')
        alert('Voice processing not available. Make sure GROQ_API_KEY is set in .env')
        resumeAutoConversation()
        return
      }

      console.log('Transcribing audio...')
      const arrayBuffer = await audioBlob.arrayBuffer()
      const signal = await analyzeSignal(arrayBuffer)

      if (signal.duration < 0.35 || signal.rms < 0.008) {
        console.log('Ambient noise ignored (duration/rms too low)')
        resumeAutoConversation()
        return
      }

      const buffer = new Uint8Array(arrayBuffer)

      const { text } = await window.electron.groq.transcribe(buffer)
      const cleaned = text?.trim() ?? ''
      console.log('Transcription:', cleaned)

      if (!cleaned) {
        console.log('No speech detected')
        resumeAutoConversation()
        return
      }

      console.log('Getting AI response...')
      const context = await options?.buildContext?.(cleaned)
      const messages = [
        { role: 'system', content: context?.systemPrompt ?? DEFAULT_SYSTEM_PROMPT },
        ...(context?.history ?? []),
        { role: 'user', content: cleaned }
      ]

      const response = await window.electron.groq.chat(messages)
      console.log('AI Response:', response)

      console.log('Generating speech...')
      const audioBuffer = await window.electron.groq.tts(response, options?.preferredVoice ?? 'Fritz-PlayAI')
      console.log('Playing response...')
      const playback = await playAiSpeech(audioBuffer as AudioBinary)

      await options?.persistTurn?.({
        user: {
          content: cleaned,
          metadata: {
            rms: signal.rms,
            duration: signal.duration,
            peak: signal.peak,
            autoLoop: autoLoopRef.current,
            timestamp: Date.now()
          }
        },
        assistant: {
          content: response,
          metadata: {
            playbackDuration: playback?.duration,
            timestamp: Date.now()
          }
        }
      })

      await options?.extractMemories?.({ user: cleaned, assistant: response })
      resumeAutoConversation()

    } catch (error) {
      console.error('Error processing recording:', error)
      alert('Error processing voice input. Check console for details.')
      resumeAutoConversation()
    } finally {
      setIsProcessing(false)
    }
  }

  // Spacebar controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isRecording && !isProcessing && e.target === document.body) {
        e.preventDefault()
        startRecording()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isRecording && e.target === document.body) {
        e.preventDefault()
        stopRecording()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isRecording, isProcessing])

  useEffect(() => {
    if (autoLoopEnabled && !isRecording && !isProcessing) {
      startRecording()
    }
  }, [autoLoopEnabled, isProcessing, isRecording])

  useEffect(() => {
    let mounted = true
    window.electron?.db.getPreference('auto_converse').then(value => {
      if (mounted && typeof value === 'boolean') {
        setAutoLoopEnabled(value)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    window.electron?.db.setPreference({ key: 'auto_converse', value: autoLoopEnabled, category: 'behavior' })
  }, [autoLoopEnabled])

  const toggleAutoLoop = () => {
    setAutoLoopEnabled(prev => !prev)
  }

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    autoLoopEnabled,
    toggleAutoLoop
  }
}
