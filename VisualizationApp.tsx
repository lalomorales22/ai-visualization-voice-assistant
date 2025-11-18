'use client';

import { useEffect, useRef, useState } from 'react';
import ControlPanel from './ControlPanel';
import AudioControls from './AudioControls';
import RecordingControls from './RecordingControls';

interface VisualConfig {
  // Wave Properties
  waveAmplitude: number;
  waveFrequency: number;
  waveSpeed: number;
  waveCount: number;
  wavePhaseShift: number;
  waveVerticalOffset: number;
  
  // Shape Properties
  shapeType: 'circles' | 'squares' | 'triangles' | 'stars' | 'hexagons' | 'spirals';
  shapeCount: number;
  shapeSize: number;
  shapeRotation: number;
  shapeRotationSpeed: number;
  shapePulsate: boolean;
  shapePulsateSpeed: number;
  
  // Color Properties
  hueStart: number;
  hueRange: number;
  hueSpeed: number;
  saturation: number;
  lightness: number;
  colorCycle: boolean;
  colorInvert: boolean;
  
  // Gradient Properties
  gradientType: 'radial' | 'linear' | 'conic' | 'none';
  gradientAngle: number;
  gradientStops: number;
  gradientBlend: boolean;
  
  // Symmetry Properties
  symmetry: number;
  mirrorX: boolean;
  mirrorY: boolean;
  kaleidoscope: boolean;
  
  // Motion Properties
  motionType: 'circular' | 'linear' | 'spiral' | 'random' | 'bounce' | 'orbit';
  motionSpeed: number;
  motionRadius: number;
  motionChaos: number;
  motionTrails: boolean;
  trailLength: number;
  
  // Particle System
  particleCount: number;
  particleSize: number;
  particleSpeed: number;
  particleLife: number;
  particleGravity: number;
  particleConnection: boolean;
  connectionDistance: number;
  
  // Effects
  bloomIntensity: number;
  noiseIntensity: number;
  distortionX: number;
  distortionY: number;
  timeWarp: number;
  fractalDepth: number;
  glitchIntensity: number;
  
  // Global Controls
  speed: number;
  scale: number;
  complexity: number;
  backgroundDarkness: number;
  strokeWidth: number;
  fillOpacity: number;
  strokeOpacity: number;
}

const defaultConfig: VisualConfig = {
  waveAmplitude: 100,
  waveFrequency: 0.02,
  waveSpeed: 2,
  waveCount: 5,
  wavePhaseShift: 0.5,
  waveVerticalOffset: 0,
  
  shapeType: 'circles',
  shapeCount: 20,
  shapeSize: 30,
  shapeRotation: 0,
  shapeRotationSpeed: 1,
  shapePulsate: true,
  shapePulsateSpeed: 2,
  
  hueStart: 0,
  hueRange: 360,
  hueSpeed: 1,
  saturation: 80,
  lightness: 60,
  colorCycle: true,
  colorInvert: false,
  
  gradientType: 'radial',
  gradientAngle: 0,
  gradientStops: 5,
  gradientBlend: true,
  
  symmetry: 4,
  mirrorX: false,
  mirrorY: false,
  kaleidoscope: true,
  
  motionType: 'circular',
  motionSpeed: 1,
  motionRadius: 100,
  motionChaos: 0,
  motionTrails: true,
  trailLength: 20,
  
  particleCount: 100,
  particleSize: 2,
  particleSpeed: 1,
  particleLife: 100,
  particleGravity: 0,
  particleConnection: true,
  connectionDistance: 100,
  
  bloomIntensity: 0.5,
  noiseIntensity: 0,
  distortionX: 0,
  distortionY: 0,
  timeWarp: 1,
  fractalDepth: 3,
  glitchIntensity: 0,
  
  speed: 1,
  scale: 1,
  complexity: 50,
  backgroundDarkness: 0.95,
  strokeWidth: 2,
  fillOpacity: 0.6,
  strokeOpacity: 0.8,
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
}

export default function VisualizationApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [config, setConfig] = useState<VisualConfig>(defaultConfig);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  
  // Audio reactivity state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioDataRef = useRef({
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
    frequencies: new Uint8Array(0) as Uint8Array,
    waveform: new Uint8Array(0) as Uint8Array,
  });

  const handleAudioData = (data: {
    frequencies: Uint8Array;
    waveform: Uint8Array;
    bass: number;
    mid: number;
    treble: number;
    volume: number;
  }) => {
    audioDataRef.current = {
      ...data,
      frequencies: data.frequencies as Uint8Array,
      waveform: data.waveform as Uint8Array,
    };
    
    // Update visual meters if they exist
    const bassMeter = document.getElementById('bass-meter');
    const midMeter = document.getElementById('mid-meter');
    const trebleMeter = document.getElementById('treble-meter');
    
    if (bassMeter) bassMeter.style.width = `${data.bass * 100}%`;
    if (midMeter) midMeter.style.width = `${data.mid * 100}%`;
    if (trebleMeter) trebleMeter.style.width = `${data.treble * 100}%`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = Array.from({ length: config.particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.particleSpeed,
        vy: (Math.random() - 0.5) * config.particleSpeed,
        life: Math.random() * config.particleLife,
        maxLife: config.particleLife,
        hue: Math.random() * 360,
      }));
    };
    initParticles();

    // Animation loop
    const animate = () => {
      if (isPaused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      timeRef.current += 0.016 * config.speed * config.timeWarp;
      const time = timeRef.current;

      // Get audio data
      const audio = audioDataRef.current;
      const audioMultiplier = audioEnabled ? 1 : 0;

      // Trail effect
      if (config.motionTrails) {
        ctx.fillStyle = `rgba(0, 0, 0, ${1 - config.trailLength / 100})`;
      } else {
        ctx.fillStyle = `rgba(0, 0, 0, ${config.backgroundDarkness})`;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Apply distortion
      ctx.save();
      if (config.distortionX !== 0 || config.distortionY !== 0) {
        ctx.translate(
          Math.sin(time * 0.5) * config.distortionX * 10,
          Math.cos(time * 0.5) * config.distortionY * 10
        );
      }

      // Draw based on symmetry
      const drawSymmetric = (drawFn: () => void) => {
        if (config.kaleidoscope) {
          for (let i = 0; i < config.symmetry; i++) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate((Math.PI * 2 * i) / config.symmetry);
            ctx.translate(-centerX, -centerY);
            drawFn();
            ctx.restore();
          }
        } else {
          drawFn();
          if (config.mirrorX) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
            drawFn();
            ctx.restore();
          }
          if (config.mirrorY) {
            ctx.save();
            ctx.scale(1, -1);
            ctx.translate(0, -canvas.height);
            drawFn();
            ctx.restore();
          }
        }
      };

      // Draw waves
      drawSymmetric(() => {
        for (let w = 0; w < config.waveCount; w++) {
          ctx.beginPath();
          const waveHue = (config.hueStart + (w / config.waveCount) * config.hueRange + time * config.hueSpeed * 10) % 360;
          ctx.strokeStyle = `hsla(${waveHue}, ${config.saturation}%, ${config.lightness}%, ${config.strokeOpacity})`;
          ctx.lineWidth = config.strokeWidth * (1 + audio.volume * audioMultiplier * 2);

          for (let x = 0; x < canvas.width; x += 5) {
            // Audio-reactive amplitude
            const audioAmp = audioEnabled ? audio.bass * 200 : 0;
            
            const y =
              centerY +
              config.waveVerticalOffset +
              Math.sin(x * config.waveFrequency + time * config.waveSpeed + w * config.wavePhaseShift) *
                (config.waveAmplitude + audioAmp) *
                config.scale +
              Math.sin(time + w) * 50;
            
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      });

      // Draw shapes
      drawSymmetric(() => {
        for (let i = 0; i < config.shapeCount; i++) {
          const angle = (i / config.shapeCount) * Math.PI * 2 + time * config.shapeRotationSpeed * 0.5;
          const radius = config.motionRadius * config.scale;
          
          let x = centerX;
          let y = centerY;

          // Apply motion type
          switch (config.motionType) {
            case 'circular':
              x += Math.cos(angle) * radius;
              y += Math.sin(angle) * radius;
              break;
            case 'spiral':
              const spiralRadius = radius * (1 + i / config.shapeCount);
              x += Math.cos(angle) * spiralRadius;
              y += Math.sin(angle) * spiralRadius;
              break;
            case 'linear':
              x += (i - config.shapeCount / 2) * 50 * config.scale;
              y += Math.sin(time + i * 0.5) * 100;
              break;
            case 'bounce':
              x += Math.cos(angle) * radius;
              y += Math.abs(Math.sin(time * 2 + i * 0.3)) * radius;
              break;
            case 'orbit':
              x += Math.cos(angle) * radius + Math.cos(time * 3 + i) * 50;
              y += Math.sin(angle) * radius + Math.sin(time * 3 + i) * 50;
              break;
            case 'random':
              x += Math.cos(angle + Math.sin(time + i)) * radius * (1 + Math.sin(time * 2 + i) * config.motionChaos);
              y += Math.sin(angle + Math.cos(time + i)) * radius * (1 + Math.cos(time * 2 + i) * config.motionChaos);
              break;
          }

          const size = config.shapePulsate
            ? config.shapeSize * (1 + Math.sin(time * config.shapePulsateSpeed + i * 0.5) * 0.5)
            : config.shapeSize;

          // Audio-reactive size boost
          const audioSizeBoost = audioEnabled ? (1 + audio.mid * 1.5) : 1;
          const finalSize = size * audioSizeBoost;

          const rotation = config.shapeRotation + time * config.shapeRotationSpeed + i * 0.5 + (audio.treble * audioMultiplier * 2);
          const hue = (config.hueStart + (i / config.shapeCount) * config.hueRange + time * config.hueSpeed * 10 + audio.volume * audioMultiplier * 50) % 360;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation);

          // Apply bloom effect (enhanced with audio)
          if (config.bloomIntensity > 0) {
            ctx.shadowBlur = 20 * config.bloomIntensity * (1 + audio.volume * audioMultiplier * 2);
            ctx.shadowColor = `hsl(${hue}, ${config.saturation}%, ${config.lightness}%)`;
          }

          ctx.fillStyle = `hsla(${hue}, ${config.saturation}%, ${config.lightness}%, ${config.fillOpacity})`;
          ctx.strokeStyle = `hsla(${hue}, ${config.saturation}%, ${config.lightness}%, ${config.strokeOpacity})`;
          ctx.lineWidth = config.strokeWidth;

          // Draw shape type
          ctx.beginPath();
          switch (config.shapeType) {
            case 'circles':
              ctx.arc(0, 0, finalSize, 0, Math.PI * 2);
              break;
            case 'squares':
              ctx.rect(-finalSize, -finalSize, finalSize * 2, finalSize * 2);
              break;
            case 'triangles':
              ctx.moveTo(0, -finalSize);
              ctx.lineTo(finalSize, finalSize);
              ctx.lineTo(-finalSize, finalSize);
              ctx.closePath();
              break;
            case 'stars':
              for (let s = 0; s < 10; s++) {
                const starAngle = (s * Math.PI) / 5;
                const starRadius = s % 2 === 0 ? finalSize : finalSize * 0.5;
                const sx = Math.cos(starAngle) * starRadius;
                const sy = Math.sin(starAngle) * starRadius;
                if (s === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
              }
              ctx.closePath();
              break;
            case 'hexagons':
              for (let h = 0; h < 6; h++) {
                const hexAngle = (h * Math.PI) / 3;
                const hx = Math.cos(hexAngle) * finalSize;
                const hy = Math.sin(hexAngle) * finalSize;
                if (h === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
              }
              ctx.closePath();
              break;
            case 'spirals':
              for (let sp = 0; sp < 100; sp++) {
                const spiralAngle = sp * 0.1;
                const spiralRadius = (sp / 100) * finalSize;
                const spx = Math.cos(spiralAngle) * spiralRadius;
                const spy = Math.sin(spiralAngle) * spiralRadius;
                if (sp === 0) ctx.moveTo(spx, spy);
                else ctx.lineTo(spx, spy);
              }
              break;
          }
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      });

      // Update and draw particles
      if (config.particleCount > 0) {
        // Adjust particle count
        while (particlesRef.current.length < config.particleCount) {
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * config.particleSpeed * 2,
            vy: (Math.random() - 0.5) * config.particleSpeed * 2,
            life: Math.random() * config.particleLife,
            maxLife: config.particleLife,
            hue: Math.random() * 360,
          });
        }
        particlesRef.current = particlesRef.current.slice(0, config.particleCount);

        particlesRef.current.forEach((particle, i) => {
          // Update particle (audio-reactive speed)
          const audioSpeedBoost = audioEnabled ? (1 + audio.volume * 0.5) : 1;
          particle.x += particle.vx * config.particleSpeed * audioSpeedBoost;
          particle.y += particle.vy * config.particleSpeed * audioSpeedBoost;
          particle.vy += config.particleGravity * 0.1;
          particle.life--;

          // Wrap around screen
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;

          // Reset if dead
          if (particle.life <= 0) {
            particle.x = Math.random() * canvas.width;
            particle.y = Math.random() * canvas.height;
            particle.life = particle.maxLife;
          }

          // Draw particle (audio-reactive size)
          const particleHue = (particle.hue + time * config.hueSpeed * 10) % 360;
          const audioParticleSize = audioEnabled ? config.particleSize * (1 + audio.treble * 0.5) : config.particleSize;
          ctx.fillStyle = `hsla(${particleHue}, ${config.saturation}%, ${config.lightness}%, ${config.fillOpacity * (particle.life / particle.maxLife)})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, audioParticleSize, 0, Math.PI * 2);
          ctx.fill();

          // Draw connections
          if (config.particleConnection) {
            particlesRef.current.slice(i + 1).forEach((other) => {
              const dx = particle.x - other.x;
              const dy = particle.y - other.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < config.connectionDistance) {
                const opacity = (1 - distance / config.connectionDistance) * config.strokeOpacity * 0.3;
                ctx.strokeStyle = `hsla(${particleHue}, ${config.saturation}%, ${config.lightness}%, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
              }
            });
          }
        });
      }

      // Draw audio frequency bars
      if (audioEnabled && audio.frequencies.length > 0) {
        const barCount = 128;
        const barWidth = canvas.width / barCount;
        const step = Math.floor(audio.frequencies.length / barCount);

        for (let i = 0; i < barCount; i++) {
          const value = audio.frequencies[i * step] / 255;
          const barHeight = value * canvas.height * 0.5;
          const hue = (config.hueStart + (i / barCount) * config.hueRange) % 360;

          ctx.fillStyle = `hsla(${hue}, ${config.saturation}%, ${config.lightness}%, ${0.3 + value * 0.5})`;
          
          // Draw from bottom
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
          
          // Mirror at top
          ctx.fillRect(i * barWidth, 0, barWidth - 1, barHeight);
        }
      }

      // Apply noise/glitch effect
      if (config.noiseIntensity > 0 || config.glitchIntensity > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (Math.random() < config.noiseIntensity * 0.1) {
            const noise = Math.random() * 255;
            data[i] = noise;
            data[i + 1] = noise;
            data[i + 2] = noise;
          }

          if (Math.random() < config.glitchIntensity * 0.01) {
            data[i] = Math.random() * 255;
            data[i + 1] = Math.random() * 255;
            data[i + 2] = Math.random() * 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [config, isPaused]);

  const handleConfigChange = (key: keyof VisualConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const randomizeAll = () => {
    setConfig({
      waveAmplitude: Math.random() * 200,
      waveFrequency: Math.random() * 0.05,
      waveSpeed: Math.random() * 5,
      waveCount: Math.floor(Math.random() * 10) + 1,
      wavePhaseShift: Math.random() * 2,
      waveVerticalOffset: (Math.random() - 0.5) * 200,
      
      shapeType: ['circles', 'squares', 'triangles', 'stars', 'hexagons', 'spirals'][Math.floor(Math.random() * 6)] as any,
      shapeCount: Math.floor(Math.random() * 50) + 5,
      shapeSize: Math.random() * 50 + 10,
      shapeRotation: Math.random() * Math.PI * 2,
      shapeRotationSpeed: Math.random() * 3,
      shapePulsate: Math.random() > 0.5,
      shapePulsateSpeed: Math.random() * 5,
      
      hueStart: Math.random() * 360,
      hueRange: Math.random() * 360,
      hueSpeed: Math.random() * 3,
      saturation: Math.random() * 50 + 50,
      lightness: Math.random() * 40 + 40,
      colorCycle: Math.random() > 0.5,
      colorInvert: Math.random() > 0.5,
      
      gradientType: ['radial', 'linear', 'conic', 'none'][Math.floor(Math.random() * 4)] as any,
      gradientAngle: Math.random() * 360,
      gradientStops: Math.floor(Math.random() * 8) + 2,
      gradientBlend: Math.random() > 0.5,
      
      symmetry: Math.floor(Math.random() * 12) + 2,
      mirrorX: Math.random() > 0.5,
      mirrorY: Math.random() > 0.5,
      kaleidoscope: Math.random() > 0.3,
      
      motionType: ['circular', 'linear', 'spiral', 'random', 'bounce', 'orbit'][Math.floor(Math.random() * 6)] as any,
      motionSpeed: Math.random() * 3,
      motionRadius: Math.random() * 300 + 50,
      motionChaos: Math.random(),
      motionTrails: Math.random() > 0.5,
      trailLength: Math.random() * 50 + 10,
      
      particleCount: Math.floor(Math.random() * 200),
      particleSize: Math.random() * 5 + 1,
      particleSpeed: Math.random() * 3,
      particleLife: Math.random() * 200 + 50,
      particleGravity: (Math.random() - 0.5) * 2,
      particleConnection: Math.random() > 0.5,
      connectionDistance: Math.random() * 200 + 50,
      
      bloomIntensity: Math.random(),
      noiseIntensity: Math.random() * 0.3,
      distortionX: Math.random() * 10,
      distortionY: Math.random() * 10,
      timeWarp: Math.random() * 2 + 0.5,
      fractalDepth: Math.floor(Math.random() * 5) + 1,
      glitchIntensity: Math.random() * 0.3,
      
      speed: Math.random() * 2 + 0.5,
      scale: Math.random() * 1.5 + 0.5,
      complexity: Math.random() * 100,
      backgroundDarkness: Math.random() * 0.5 + 0.5,
      strokeWidth: Math.random() * 5 + 1,
      fillOpacity: Math.random() * 0.8 + 0.2,
      strokeOpacity: Math.random() * 0.8 + 0.2,
    });
  };

  const resetToDefault = () => {
    setConfig(defaultConfig);
    timeRef.current = 0;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setShowControls(!showControls)}
          className="px-4 py-2 bg-black/70 text-white rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-2 bg-black/70 text-white rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
        >
          {isPaused ? 'Play' : 'Pause'}
        </button>
        <button
          onClick={randomizeAll}
          className="px-4 py-2 bg-purple-600/80 text-white rounded-lg backdrop-blur-sm hover:bg-purple-700/80 transition-colors"
        >
          🎲 Randomize
        </button>
        <button
          onClick={resetToDefault}
          className="px-4 py-2 bg-red-600/80 text-white rounded-lg backdrop-blur-sm hover:bg-red-700/80 transition-colors"
        >
          Reset
        </button>
      </div>

      <AudioControls 
        onAudioData={handleAudioData}
        onAudioEnabled={setAudioEnabled}
        isVisible={showControls}
      />

      <RecordingControls 
        canvasRef={canvasRef}
        isVisible={showControls}
      />

      {showControls && (
        <ControlPanel config={config} onChange={handleConfigChange} />
      )}
    </div>
  );
}
