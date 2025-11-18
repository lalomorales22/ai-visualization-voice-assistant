import { useState } from 'react'
import { COLOR_THEMES, type AsciiConfig, type ThemeKey, type VisualConfig, type VisualizationMode, VISUAL_PRESETS } from '../lib/visualConfig'

interface Props {
  config: VisualConfig
  asciiConfig: AsciiConfig
  visualMode: VisualizationMode
  theme: ThemeKey
  onChange: (config: VisualConfig) => void
  onAsciiChange: (config: Partial<AsciiConfig>) => void
  onVisualModeChange: (mode: VisualizationMode) => void
  onThemeChange: (theme: ThemeKey) => void
  onClose: () => void
  audioEnabled: boolean
  onToggleAudio: () => void
  autoLoopEnabled: boolean
  onToggleAutoLoop: () => void
  statusText: string
  performanceMode: 'standard' | 'eco'
  onPerformanceModeChange: (mode: 'standard' | 'eco') => void
}

export default function SettingsPanel({
  config,
  asciiConfig,
  visualMode,
  theme,
  onChange,
  onAsciiChange,
  onVisualModeChange,
  onThemeChange,
  onClose,
  audioEnabled,
  onToggleAudio,
  autoLoopEnabled,
  onToggleAutoLoop,
  statusText,
  performanceMode,
  onPerformanceModeChange
}: Props) {
  const [activeTab, setActiveTab] = useState<'presets' | 'manual'>('presets')

  const loadPreset = (presetName: string) => {
    onChange(VISUAL_PRESETS[presetName])
  }

  const randomize = () => {
    const randomConfig: VisualConfig = {
      waveAmplitude: Math.random() * 200 + 50,
      waveFrequency: Math.random() * 0.04 + 0.01,
      waveSpeed: Math.random() * 4 + 1,
      waveCount: Math.floor(Math.random() * 10) + 3,
      shapeType: ['circles', 'squares', 'triangles', 'stars', 'hexagons', 'spirals'][Math.floor(Math.random() * 6)] as any,
      shapeCount: Math.floor(Math.random() * 30) + 10,
      shapeSize: Math.random() * 40 + 20,
      shapeRotationSpeed: Math.random() * 2,
      shapePulsate: Math.random() > 0.5,
      hueStart: Math.random() * 360,
      hueRange: Math.random() * 360,
      hueSpeed: Math.random() * 3,
      saturation: Math.random() * 40 + 60,
      lightness: Math.random() * 30 + 45,
      symmetry: Math.floor(Math.random() * 8) + 2,
      kaleidoscope: Math.random() > 0.3,
      motionType: ['circular', 'linear', 'spiral', 'random', 'bounce', 'orbit'][Math.floor(Math.random() * 6)] as any,
      motionSpeed: Math.random() * 2,
      motionRadius: Math.random() * 150 + 50,
      motionTrails: Math.random() > 0.3,
      trailLength: Math.random() * 40 + 10,
      bloomIntensity: Math.random(),
      speed: Math.random() * 1.5 + 0.5,
      scale: Math.random() * 0.8 + 0.8,
      backgroundDarkness: 0,
      strokeWidth: Math.random() * 3 + 1,
      fillOpacity: Math.random() * 0.4 + 0.4,
      strokeOpacity: Math.random() * 0.4 + 0.6,
      renderStyle: Math.random() > 0.4 ? 'lines' : 'orbits',
      performanceProfile: Math.random() > 0.5 ? 'standard' : 'eco'
    };
    onChange(randomConfig)
  }

  return (
    <div className="fixed right-4 top-20 bottom-4 w-96 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 text-white overflow-hidden flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-bold text-lg">Control Center</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      <div className="p-4 border-b border-white/10 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Status</p>
          <p className="text-base font-semibold text-white mt-1">{statusText}</p>
          <p className="text-xs text-white/50 mt-1">Press Space to talk manually anytime.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggleAudio}
            className={`px-3 py-2 rounded-lg border border-white/15 transition-colors text-sm font-medium flex items-center justify-between ${
              audioEnabled ? 'bg-emerald-500/30 text-white' : 'bg-white/5 text-white/80'
            }`}
          >
            <span>Audio Reactive</span>
            <span>{audioEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            onClick={onToggleAutoLoop}
            className={`px-3 py-2 rounded-lg border border-white/15 transition-colors text-sm font-medium flex items-center justify-between ${
              autoLoopEnabled ? 'bg-purple-500/30 text-white' : 'bg-white/5 text-white/80'
            }`}
          >
            <span>Auto Converse</span>
            <span>{autoLoopEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onVisualModeChange('canvas')}
            className={`px-3 py-2 rounded-lg border border-white/15 text-sm font-medium ${
              visualMode === 'canvas' ? 'bg-purple-500/30 text-white' : 'bg-white/5 text-white/70'
            }`}
          >
            Canvas Orb
          </button>
          <button
            onClick={() => onVisualModeChange('ascii')}
            className={`px-3 py-2 rounded-lg border border-white/15 text-sm font-medium ${
              visualMode === 'ascii' ? 'bg-purple-500/30 text-white' : 'bg-white/5 text-white/70'
            }`}
          >
            ASCII Halo
          </button>
        </div>
      </div>

      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'presets' ? 'bg-purple-600/30 border-b-2 border-purple-500' : 'text-white/60'
          }`}
        >
          Presets
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'manual' ? 'bg-purple-600/30 border-b-2 border-purple-500' : 'text-white/60'
          }`}
        >
          Manual
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'presets' ? (
          <div className="space-y-4">
            <button
              onClick={randomize}
              className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium text-sm"
            >
              🎲 Randomize
            </button>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(VISUAL_PRESETS).map(([presetName]) => (
                <button
                  key={presetName}
                  onClick={() => loadPreset(presetName)}
                  className={`w-full px-3 py-2 rounded-lg text-left capitalize border border-white/15 ${
                    config === VISUAL_PRESETS[presetName] ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {presetName}
                </button>
              ))}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Color Themes</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(COLOR_THEMES).map(([key, palette]) => (
                  <button
                    key={key}
                    onClick={() => onThemeChange(key as ThemeKey)}
                    className={`rounded-xl border px-3 py-2 text-left ${
                      theme === key ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                    style={{ background: palette.background }}
                  >
                    <p className="text-sm font-semibold" style={{ color: palette.text }}>{palette.label}</p>
                    <div className="flex gap-1 mt-2">
                      <span className="flex-1 h-2 rounded-full" style={{ background: palette.accent }} />
                      <span className="flex-1 h-2 rounded-full" style={{ background: palette.secondary }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onPerformanceModeChange('eco')}
                className={`px-3 py-2 rounded-lg border border-white/15 ${
                  performanceMode === 'eco' ? 'bg-emerald-500/20 text-white' : 'bg-white/5 text-white/70'
                }`}
              >
                Eco Mode
              </button>
              <button
                onClick={() => onPerformanceModeChange('standard')}
                className={`px-3 py-2 rounded-lg border border-white/15 ${
                  performanceMode === 'standard' ? 'bg-emerald-500/20 text-white' : 'bg-white/5 text-white/70'
                }`}
              >
                Studio Mode
              </button>
            </div>

              <button
              onClick={randomize}
              className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left"
            >
              Quick Shuffle
            </button>

            <div>
              <label className="block text-white/60 mb-1">Shape Type</label>
              <select
                value={config.shapeType}
                onChange={(e) => onChange({ ...config, shapeType: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20"
              >
                <option value="circles">Circles</option>
                <option value="squares">Squares</option>
                <option value="triangles">Triangles</option>
                <option value="stars">Stars</option>
                <option value="hexagons">Hexagons</option>
                <option value="spirals">Spirals</option>
              </select>
            </div>

            <div>
              <label className="block text-white/60 mb-1">Motion Type</label>
              <select
                value={config.motionType}
                onChange={(e) => onChange({ ...config, motionType: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20"
              >
                <option value="circular">Circular</option>
                <option value="linear">Linear</option>
                <option value="spiral">Spiral</option>
                <option value="random">Random</option>
                <option value="bounce">Bounce</option>
                <option value="orbit">Orbit</option>
              </select>
            </div>

            <div>
              <label className="block text-white/60 mb-1">Shape Count: {config.shapeCount}</label>
              <input
                type="range"
                min="5"
                max="50"
                value={config.shapeCount}
                onChange={(e) => onChange({ ...config, shapeCount: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white/60 mb-1">Speed: {config.speed.toFixed(1)}x</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={config.speed}
                onChange={(e) => onChange({ ...config, speed: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white/60 mb-1">Symmetry: {config.symmetry}</label>
              <input
                type="range"
                min="1"
                max="12"
                value={config.symmetry}
                onChange={(e) => onChange({ ...config, symmetry: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.kaleidoscope}
                  onChange={(e) => onChange({ ...config, kaleidoscope: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white/80">Kaleidoscope Mode</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.motionTrails}
                  onChange={(e) => onChange({ ...config, motionTrails: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white/80">Motion Trails</span>
              </label>
            </div>

            {visualMode === 'ascii' && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">ASCII Controls</p>
                <div>
                  <label className="block text-white/60 text-xs mb-1">Ring Count: {asciiConfig.ringCount}</label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={asciiConfig.ringCount}
                    onChange={(e) => onAsciiChange({ ringCount: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs mb-1">Density: {asciiConfig.density.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.05"
                    value={asciiConfig.density}
                    onChange={(e) => onAsciiChange({ density: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs mb-1">Character Set</label>
                  <input
                    type="text"
                    value={asciiConfig.charSet}
                    onChange={(e) => onAsciiChange({ charSet: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
