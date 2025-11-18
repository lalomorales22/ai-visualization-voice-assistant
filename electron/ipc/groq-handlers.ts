import { ipcMain } from 'electron'
import { transcribeAudio, chatStream, synthesizeSpeech, analyzeImage } from '../groq/client.js'

export function setupGroqHandlers() {
  // Transcription
  ipcMain.handle('groq:transcribe', async (_event, audioData: Uint8Array) => {
    try {
      const buffer = Buffer.from(audioData)
      return await transcribeAudio(buffer)
    } catch (error) {
      console.error('Transcribe handler error:', error)
      throw error
    }
  })

  // Chat (streaming via IPC)
  ipcMain.handle('groq:chat', async (event, messages) => {
    try {
      const chunks: string[] = []

      for await (const chunk of chatStream(messages)) {
        chunks.push(chunk)
        event.sender.send('groq:chat-chunk', chunk)
      }

      return chunks.join('')
    } catch (error) {
      console.error('Chat handler error:', error)
      throw error
    }
  })

  // TTS
  ipcMain.handle('groq:tts', async (_event, text, voice) => {
    try {
      const audioBuffer = await synthesizeSpeech(text, voice)
      return audioBuffer
    } catch (error) {
      console.error('TTS handler error:', error)
      throw error
    }
  })

  // Vision
  ipcMain.handle('groq:vision', async (_event, image, prompt) => {
    try {
      return await analyzeImage(image, prompt)
    } catch (error) {
      console.error('Vision handler error:', error)
      throw error
    }
  })
}
