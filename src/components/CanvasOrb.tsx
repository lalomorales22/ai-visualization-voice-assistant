import { useEffect, useRef } from 'react'
import type { AudioLevels } from '../hooks/useVoiceRecorder'
import type { VisualConfig } from '../lib/visualConfig'

interface ThemeColors {
  accent: string
  secondary: string
  background: string
  text: string
}

interface Props {
  config: VisualConfig
  audioData: AudioLevels
  audioEnabled: boolean
  theme: ThemeColors
}

export default function CanvasOrb({ config, audioData, audioEnabled, theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef(0)
  const audioRef = useRef(audioData)

  useEffect(() => {
    audioRef.current = audioData
  }, [audioData])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationId: number

    const renderLines = (centerX: number, centerY: number, performanceScale: number, time: number) => {
      const segments = Math.max(32, Math.floor(config.shapeCount * 2 * performanceScale))
      const radius = config.motionRadius * config.scale
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.lineWidth = config.strokeWidth * (performanceScale < 1 ? 0.8 : 1)
      ctx.strokeStyle = `${theme.accent}AA`

      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2 + time * config.motionSpeed * 0.5
        const wobble = Math.sin(time + i * 0.5) * (audioRef.current.treble * 40)
        const amp = 1 + (audioEnabled ? audioRef.current.volume * 0.8 : 0)
        const length = radius * amp + wobble

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length)
        ctx.stroke()
      }
      ctx.restore()
    }

    const renderOrbits = (centerX: number, centerY: number, time: number, performanceScale: number) => {
      const count = Math.max(6, Math.floor(config.shapeCount * performanceScale))
      const isEco = config.performanceProfile === 'eco'
      
      // Pre-calculate common values
      const radiusBase = config.motionRadius * config.scale
      const audioMid = audioRef.current.mid
      const audioSizeBoost = audioEnabled ? (1 + audioMid * 1.2) : 1
      const baseSize = config.shapeSize * audioSizeBoost * performanceScale
      
      ctx.lineWidth = config.strokeWidth
      
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + time * config.shapeRotationSpeed * 0.5
        let x = centerX
        let y = centerY

        switch (config.motionType) {
          case 'circular':
            x += Math.cos(angle) * radiusBase
            y += Math.sin(angle) * radiusBase
            break
          case 'spiral': {
            const spiralRadius = radiusBase * (1 + i / count)
            x += Math.cos(angle) * spiralRadius
            y += Math.sin(angle) * spiralRadius
            break
          }
          case 'linear':
            x += (i - count / 2) * 30 * config.scale
            y += Math.sin(time + i * 0.5) * 60
            break
          case 'bounce':
            x += Math.cos(angle) * radiusBase
            y += Math.abs(Math.sin(time * 2 + i * 0.3)) * radiusBase
            break
          case 'orbit':
            x += Math.cos(angle) * radiusBase + Math.cos(time * 3 + i) * 20
            y += Math.sin(angle) * radiusBase + Math.sin(time * 3 + i) * 20
            break
          case 'random':
            x += Math.cos(angle + Math.sin(time + i)) * radiusBase
            y += Math.sin(angle + Math.cos(time + i)) * radiusBase
            break
        }

        const size = config.shapePulsate
          ? baseSize * (1 + Math.sin(time * 2 + i * 0.5) * 0.5)
          : baseSize

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(time * config.shapeRotationSpeed + i * 0.3)
        
        if (!isEco) {
          ctx.shadowBlur = 12 * config.bloomIntensity
          ctx.shadowColor = theme.secondary
        }
        
        ctx.fillStyle = `${theme.accent}${Math.floor(255 * config.fillOpacity).toString(16).padStart(2, '0')}`
        ctx.strokeStyle = `${theme.secondary}${Math.floor(255 * config.strokeOpacity).toString(16).padStart(2, '0')}`

        ctx.beginPath()
        if (config.shapeType === 'circles') {
          ctx.arc(0, 0, size, 0, Math.PI * 2)
        } else if (config.shapeType === 'squares') {
          ctx.rect(-size, -size, size * 2, size * 2)
        } else if (config.shapeType === 'triangles') {
          ctx.moveTo(0, -size)
          ctx.lineTo(size, size)
          ctx.lineTo(-size, size)
          ctx.closePath()
        } else {
          for (let j = 0; j < 6; j++) {
            const segmentAngle = (j * Math.PI * 2) / 6
            const px = Math.cos(segmentAngle) * size
            const py = Math.sin(segmentAngle) * size
            if (j === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
        }

        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }
    }

    const animate = () => {
      timeRef.current += 0.016 * config.speed
      const time = timeRef.current
      const performanceScale = config.performanceProfile === 'eco' ? 0.65 : 1
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.min(centerX, centerY)

      // Clear rect
      if (config.motionTrails) {
        ctx.save()
        ctx.globalCompositeOperation = 'destination-out'
        const fade = Math.min(0.2, Math.max(0.04, 1 - config.trailLength / 80))
        ctx.fillStyle = `rgba(0, 0, 0, ${fade})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      // Clip to circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2)
      ctx.clip()

      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = theme.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.globalCompositeOperation = 'lighter'
      ctx.strokeStyle = `${theme.secondary}55`
      ctx.lineWidth = 1.2

      const waveStep = config.performanceProfile === 'eco' ? 18 : 10
      for (let w = 0; w < config.waveCount; w++) {
        ctx.beginPath()
        for (let x = 0; x < canvas.width; x += waveStep) {
          const audioAmp = audioEnabled ? audioRef.current.bass * 140 : 0
          const y = centerY + Math.sin(x * config.waveFrequency + time * config.waveSpeed + w * 0.4) * (config.waveAmplitude + audioAmp) * config.scale
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      ctx.globalCompositeOperation = 'lighter'
      if (config.renderStyle === 'lines') {
        renderLines(centerX, centerY, performanceScale, time)
      } else {
        renderOrbits(centerX, centerY, time, performanceScale)
      }

      ctx.restore() // Remove clip

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [config, audioEnabled, theme])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}
