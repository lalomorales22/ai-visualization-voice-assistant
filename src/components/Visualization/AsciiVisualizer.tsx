import { useEffect, useRef } from 'react'
import type { AudioLevels } from '../../hooks/useVoiceRecorder'
import type { AsciiConfig, VisualConfig } from '../../lib/visualConfig'

interface ThemeColors {
  accent: string
  secondary: string
  background: string
  text: string
}

interface Props {
  audioData: AudioLevels
  asciiConfig: AsciiConfig
  visualConfig?: VisualConfig // Added visualConfig prop
  theme: ThemeColors
}

export function AsciiVisualizer({ audioData, asciiConfig, visualConfig, theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const audioRef = useRef(audioData)
  const configRef = useRef(asciiConfig)
  const visualConfigRef = useRef(visualConfig)
  const timeRef = useRef(0)

  useEffect(() => {
    audioRef.current = audioData
  }, [audioData])

  useEffect(() => {
    configRef.current = asciiConfig
  }, [asciiConfig])

  useEffect(() => {
    visualConfigRef.current = visualConfig
  }, [visualConfig])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const { density, charSet, ringCount, spinSpeed, jitter } = configRef.current
      const vConfig = visualConfigRef.current
      const chars = Array.from(charSet)
      const audio = audioRef.current
      const ctxWidth = window.innerWidth
      const ctxHeight = window.innerHeight
      const cx = ctxWidth / 2
      const cy = ctxHeight / 2
      const maxRadius = Math.min(cx, cy)

      // Clear or Fade (Motion Trails)
      if (vConfig?.motionTrails) {
        ctx.save()
        ctx.globalCompositeOperation = 'destination-out'
        const fade = Math.min(0.2, Math.max(0.04, 1 - (vConfig.trailLength || 20) / 80))
        ctx.fillStyle = `rgba(0, 0, 0, ${fade})`
        ctx.fillRect(0, 0, ctxWidth, ctxHeight)
        ctx.restore()
      } else {
        ctx.clearRect(0, 0, ctxWidth, ctxHeight)
      }

      // Clip to circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2)
      ctx.clip()

      // Background
      // Only draw background if NOT in motion trails mode to avoid accumulation
      if (!vConfig?.motionTrails) {
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius)
        gradient.addColorStop(0, theme.background)
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, ctxWidth, ctxHeight)
      }

      timeRef.current += 0.016 * spinSpeed * (vConfig?.speed || 1)

      // Bloom effect based on visualConfig
      const bloom = vConfig?.bloomIntensity || 0.3
      ctx.shadowBlur = 15 * bloom + (audio.volume * 20)
      ctx.shadowColor = theme.accent
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const shapeType = vConfig?.shapeType || 'circles'
      const motionType = vConfig?.motionType || 'circular'

      // --- RENDER LOGIC SWITCHER ---

      if (shapeType === 'spirals' || motionType === 'spiral') {
        // VORTEX MODE
        const arms = vConfig?.symmetry || 3
        const points = (vConfig?.shapeCount || 20) * 10 * density
        
        ctx.fillStyle = theme.accent
        ctx.font = `14px "JetBrains Mono", monospace`

        for (let i = 0; i < points; i++) {
          const t = i / points
          const angle = t * Math.PI * 10 + timeRef.current + (audio.bass * 2)
          const radius = t * maxRadius * 0.8
          
          for(let arm = 0; arm < arms; arm++) {
            const armAngle = angle + (arm * (Math.PI * 2 / arms))
            const spiralX = cx + Math.cos(armAngle) * radius
            const spiralY = cy + Math.sin(armAngle) * radius
            
            // Audio reactivity
            const warp = Math.sin(t * 10 + timeRef.current) * audio.mid * 20
            
            const charIndex = Math.floor((t + timeRef.current) * chars.length) % chars.length
            const char = chars[charIndex]

            ctx.fillText(char, spiralX + warp, spiralY + warp)
          }
        }

      } else if (shapeType === 'hexagons' || shapeType === 'squares') {
        // MATRIX / GRID MODE
        const gridSize = 30 * (vConfig?.scale || 1)
        const cols = Math.ceil(ctxWidth / gridSize)
        const rows = Math.ceil(ctxHeight / gridSize)
        
        ctx.font = `16px "JetBrains Mono", monospace`
        
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            // Only draw some characters based on density
            if (Math.random() > density) continue

            const x = i * gridSize
            const y = j * gridSize
            
            // Distance from center
            const dx = x - cx
            const dy = y - cy
            const dist = Math.sqrt(dx*dx + dy*dy)
            
            // Wave effect
            const wave = Math.sin(dist * (vConfig?.waveFrequency || 0.01) - timeRef.current * (vConfig?.waveSpeed || 2)) + audio.bass
            
            if (wave > 0.5) {
              ctx.fillStyle = theme.accent
              const char = chars[Math.floor(Math.random() * chars.length)]
              ctx.fillText(char, x, y)
            } else if (wave > 0.2) {
              ctx.fillStyle = theme.secondary
              ctx.fillText('.', x, y)
            }
          }
        }

      } else if (motionType === 'orbit' || shapeType === 'stars') {
        // TORUS / DONUT MODE
        const torusRings = ringCount * 2
        
        for (let ring = 0; ring < torusRings; ring++) {
          const ringProgress = ring / torusRings
          // 3D-ish projection effect
          const z = Math.sin(ringProgress * Math.PI * 2 + timeRef.current) 
          const scale = 1 + z * 0.3
          const radius = maxRadius * 0.4 * (1 + ringProgress * 0.5)
          
          const segments = (vConfig?.shapeCount || 20) + ring * 5
          
          ctx.font = `${12 * scale}px "JetBrains Mono", monospace`
          ctx.fillStyle = z > 0 ? theme.accent : theme.secondary
          
          for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2 + timeRef.current * (ring % 2 ? 1 : -1)
            
            // Torus wrapping
            const torusX = cx + Math.cos(angle) * radius * scale
            const torusY = cy + Math.sin(angle) * radius * scale * 0.6 // Flattened Y for 3D look
            
            const char = chars[(i + ring) % chars.length]
            ctx.fillText(char, torusX, torusY)
          }
        }

      } else {
        // CLASSIC RINGS (Default)
        for (let ring = 0; ring < ringCount; ring++) {
          const radius = maxRadius * (0.3 + ring * 0.14)
          const segments = Math.max(12, Math.floor(30 * density * (ring + 1)))
          
          const hueMix = ring % 2 === 0 ? theme.accent : theme.secondary
          ctx.fillStyle = hueMix
          ctx.font = `${12 + ring * 2}px "JetBrains Mono", "SFMono-Regular", monospace`
          
          for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2 + timeRef.current + ring * 0.2
            const amplitude = 1 + audio.volume * 0.6 + audio.mid * 0.4
            const wobble = (Math.random() - 0.5) * jitter * (vConfig?.waveAmplitude || 50) / 10
            const char = chars[(i + ring) % chars.length]

            const x = cx + Math.cos(angle) * radius * amplitude + wobble * 5
            const y = cy + Math.sin(angle) * radius * amplitude + wobble * 5

            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(angle)
            ctx.fillText(char, 0, 0)
            ctx.restore()
          }
        }
      }

      // Center Bass Pulse (Common to all)
      ctx.shadowBlur = 0
      ctx.strokeStyle = `${theme.accent}55`
      ctx.lineWidth = 1 + audio.bass * 5
      ctx.beginPath()
      ctx.arc(cx, cy, maxRadius * 0.1 + audio.bass * 60, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore() // Remove clip

      animationRef.current = requestAnimationFrame(draw)
    }

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [theme])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

export default AsciiVisualizer
