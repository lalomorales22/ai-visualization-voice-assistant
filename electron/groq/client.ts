import dotenv from 'dotenv'
import Groq from 'groq-sdk'

// Ensure environment variables are loaded before instantiating the SDK
dotenv.config()

const apiKey = process.env.GROQ_API_KEY

if (!apiKey) {
  throw new Error('GROQ_API_KEY is not set. Check your .env or environment variables.')
}

const groq = new Groq({
  apiKey
})

export const MODELS = {
  STT: 'whisper-large-v3-turbo',
  CHAT: 'llama-3.3-70b-versatile',
  TTS: 'playai-tts',
  VISION: 'llama-3.2-11b-vision-preview'
} as const

// Speech-to-Text
export async function transcribeAudio(audioBuffer: Buffer) {
  try {
    const file = await Groq.toFile(audioBuffer, 'audio.webm')

    const response = await groq.audio.transcriptions.create({
      file,
      model: MODELS.STT,
      response_format: 'verbose_json',
      temperature: 0
    })

    return {
      text: response.text?.trim() ?? ''
    }
  } catch (error) {
    console.error('Transcription error:', error)
    throw error
  }
}

// Chat (Streaming)
export async function* chatStream(messages: any[]) {
  try {
    const stream = await groq.chat.completions.create({
      model: MODELS.CHAT,
      messages,
      stream: true,
      temperature: 0.8,
      max_tokens: 2048
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) yield content
    }
  } catch (error) {
    console.error('Chat error:', error)
    throw error
  }
}

// Text-to-Speech
export async function synthesizeSpeech(text: string, voice = 'Fritz-PlayAI') {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODELS.TTS,
        voice,
        input: text,
        response_format: 'wav'
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Groq TTS failed: ${response.status} ${errorBody}`)
    }

    return Buffer.from(await response.arrayBuffer())
  } catch (error) {
    console.error('TTS error:', error)
    throw error
  }
}

// Vision Analysis
export async function analyzeImage(imageBase64: string, prompt: string) {
  try {
    const response = await groq.chat.completions.create({
      model: MODELS.VISION,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageBase64 } }
        ]
      }],
      max_tokens: 1024
    })

    return response.choices[0].message.content || ''
  } catch (error) {
    console.error('Vision error:', error)
    throw error
  }
}
