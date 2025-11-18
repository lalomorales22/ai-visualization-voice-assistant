import CanvasOrb from '../CanvasOrb'
import AsciiVisualizer from './AsciiVisualizer'
import type { AudioLevels } from '../../hooks/useVoiceRecorder'
import { COLOR_THEMES, type AsciiConfig, type ThemeKey, type VisualConfig, type VisualizationMode } from '../../lib/visualConfig'

interface Props {
  mode: VisualizationMode
  visualConfig: VisualConfig
  asciiConfig: AsciiConfig
  audioData: AudioLevels
  audioEnabled: boolean
  theme: ThemeKey
}

export function VisualizationSurface({ mode, visualConfig, asciiConfig, audioData, audioEnabled, theme }: Props) {
  const themeColors = COLOR_THEMES[theme] ?? COLOR_THEMES.dark

  return (
    <div className="absolute inset-0">
      {mode === 'canvas' ? (
        <CanvasOrb config={visualConfig} audioData={audioData} audioEnabled={audioEnabled} theme={themeColors} />
      ) : (
        <AsciiVisualizer 
          audioData={audioData} 
          asciiConfig={asciiConfig} 
          visualConfig={visualConfig}
          theme={themeColors} 
        />
      )}
    </div>
  )
}

export default VisualizationSurface
