export type ShapeType = 'circles' | 'squares' | 'triangles' | 'stars' | 'hexagons' | 'spirals'
export type MotionType = 'circular' | 'linear' | 'spiral' | 'random' | 'bounce' | 'orbit'
export type VisualizationMode = 'canvas' | 'ascii'
export type PerformanceProfile = 'standard' | 'eco'
export type ThemeKey = 'dark' | 'stealth' | 'beach' | 'neon' | 'cyberpunk' | 'nature' | 'retro'

export interface VisualConfig {
  waveAmplitude: number
  waveFrequency: number
  waveSpeed: number
  waveCount: number
  shapeType: ShapeType
  shapeCount: number
  shapeSize: number
  shapeRotationSpeed: number
  shapePulsate: boolean
  hueStart: number
  hueRange: number
  hueSpeed: number
  saturation: number
  lightness: number
  symmetry: number
  kaleidoscope: boolean
  motionType: MotionType
  motionSpeed: number
  motionRadius: number
  motionTrails: boolean
  trailLength: number
  bloomIntensity: number
  speed: number
  scale: number
  backgroundDarkness: number
  strokeWidth: number
  fillOpacity: number
  strokeOpacity: number
  renderStyle?: 'lines' | 'orbits'
  performanceProfile?: PerformanceProfile
}

export interface AsciiConfig {
  density: number
  charSet: string
  ringCount: number
  spinSpeed: number
  jitter: number
}

export const DEFAULT_ASCII_CONFIG: AsciiConfig = {
  density: 0.7,
  charSet: '█▓▒░●◐◑◒◓@#*+=-·',
  ringCount: 4,
  spinSpeed: 0.6,
  jitter: 0.2
}

export const COLOR_THEMES: Record<ThemeKey, {
  label: string
  accent: string
  secondary: string
  background: string
  text: string
}> = {
  dark: {
    label: 'Dark Mode',
    accent: '#8B5CF6',
    secondary: '#F472B6',
    background: 'rgba(0, 0, 0, 0)',
    text: '#F8FAFC'
  },
  stealth: {
    label: 'Stealth Mode',
    accent: '#4ADE80',
    secondary: '#22D3EE',
    background: 'rgba(0, 0, 0, 0)',
    text: '#E2E8F0'
  },
  beach: {
    label: 'Beach Mode',
    accent: '#FBBF24',
    secondary: '#38BDF8',
    background: 'rgba(0, 0, 0, 0)',
    text: '#FEF9C3'
  },
  neon: {
    label: 'Neon Drift',
    accent: '#FF6AD5',
    secondary: '#7C3AED',
    background: 'rgba(0, 0, 0, 0)',
    text: '#FDF2F8'
  },
  cyberpunk: {
    label: 'Cyberpunk',
    accent: '#FCEE0A',
    secondary: '#00F0FF',
    background: 'rgba(0, 0, 0, 0)',
    text: '#00F0FF'
  },
  nature: {
    label: 'Nature',
    accent: '#4ADE80',
    secondary: '#166534',
    background: 'rgba(0, 0, 0, 0)',
    text: '#DCFCE7'
  },
  retro: {
    label: 'Retro',
    accent: '#FF5733',
    secondary: '#C70039',
    background: 'rgba(0, 0, 0, 0)',
    text: '#FFC300'
  }
}

export const VISUAL_PRESETS: Record<string, VisualConfig> = {
  default: {
    waveAmplitude: 55,
    waveFrequency: 0.018,
    waveSpeed: 1.3,
    waveCount: 3,
    shapeType: 'circles',
    shapeCount: 12,
    shapeSize: 26,
    shapeRotationSpeed: 0.6,
    shapePulsate: true,
    hueStart: 270,
    hueRange: 80,
    hueSpeed: 0.6,
    saturation: 70,
    lightness: 58,
    symmetry: 4,
    kaleidoscope: true,
    motionType: 'circular',
    motionSpeed: 0.8,
    motionRadius: 85,
    motionTrails: false,
    trailLength: 12,
    bloomIntensity: 0.35,
    speed: 0.8,
    scale: 0.95,
    backgroundDarkness: 0,
    strokeWidth: 1.5,
    fillOpacity: 0.55,
    strokeOpacity: 0.4,
    renderStyle: 'lines',
    performanceProfile: 'eco'
  },
  stealth: {
    waveAmplitude: 45,
    waveFrequency: 0.02,
    waveSpeed: 1.1,
    waveCount: 2,
    shapeType: 'triangles',
    shapeCount: 10,
    shapeSize: 22,
    shapeRotationSpeed: 0.4,
    shapePulsate: false,
    hueStart: 140,
    hueRange: 30,
    hueSpeed: 0.3,
    saturation: 35,
    lightness: 60,
    symmetry: 3,
    kaleidoscope: false,
    motionType: 'linear',
    motionSpeed: 0.6,
    motionRadius: 60,
    motionTrails: false,
    trailLength: 10,
    bloomIntensity: 0.15,
    speed: 0.6,
    scale: 0.9,
    backgroundDarkness: 0,
    strokeWidth: 1.2,
    fillOpacity: 0.4,
    strokeOpacity: 0.6,
    renderStyle: 'lines',
    performanceProfile: 'eco'
  },
  beach: {
    waveAmplitude: 60,
    waveFrequency: 0.012,
    waveSpeed: 1,
    waveCount: 4,
    shapeType: 'stars',
    shapeCount: 14,
    shapeSize: 28,
    shapeRotationSpeed: 0.5,
    shapePulsate: true,
    hueStart: 45,
    hueRange: 120,
    hueSpeed: 0.5,
    saturation: 80,
    lightness: 60,
    symmetry: 5,
    kaleidoscope: true,
    motionType: 'orbit',
    motionSpeed: 0.7,
    motionRadius: 90,
    motionTrails: false,
    trailLength: 18,
    bloomIntensity: 0.25,
    speed: 0.7,
    scale: 1,
    backgroundDarkness: 0,
    strokeWidth: 1.4,
    fillOpacity: 0.5,
    strokeOpacity: 0.5,
    renderStyle: 'lines',
    performanceProfile: 'standard'
  },
  neon: {
    waveAmplitude: 70,
    waveFrequency: 0.022,
    waveSpeed: 1.8,
    waveCount: 3,
    shapeType: 'hexagons',
    shapeCount: 16,
    shapeSize: 24,
    shapeRotationSpeed: 1,
    shapePulsate: true,
    hueStart: 300,
    hueRange: 100,
    hueSpeed: 1.5,
    saturation: 90,
    lightness: 55,
    symmetry: 6,
    kaleidoscope: true,
    motionType: 'spiral',
    motionSpeed: 0.9,
    motionRadius: 95,
    motionTrails: true,
    trailLength: 14,
    bloomIntensity: 0.45,
    speed: 1,
    scale: 1,
    backgroundDarkness: 0,
    strokeWidth: 1.6,
    fillOpacity: 0.5,
    strokeOpacity: 0.7,
    renderStyle: 'orbits',
    performanceProfile: 'standard'
  },
  cyberpunk: {
    waveAmplitude: 80,
    waveFrequency: 0.03,
    waveSpeed: 2.0,
    waveCount: 5,
    shapeType: 'triangles',
    shapeCount: 20,
    shapeSize: 18,
    shapeRotationSpeed: 1.2,
    shapePulsate: true,
    hueStart: 60,
    hueRange: 180,
    hueSpeed: 2.0,
    saturation: 100,
    lightness: 50,
    symmetry: 3,
    kaleidoscope: false,
    motionType: 'random',
    motionSpeed: 1.2,
    motionRadius: 100,
    motionTrails: true,
    trailLength: 20,
    bloomIntensity: 0.6,
    speed: 1.2,
    scale: 1.1,
    backgroundDarkness: 0.2,
    strokeWidth: 2,
    fillOpacity: 0.6,
    strokeOpacity: 0.8,
    renderStyle: 'lines',
    performanceProfile: 'standard'
  },
  nature: {
    waveAmplitude: 40,
    waveFrequency: 0.01,
    waveSpeed: 0.5,
    waveCount: 2,
    shapeType: 'circles',
    shapeCount: 8,
    shapeSize: 30,
    shapeRotationSpeed: 0.2,
    shapePulsate: true,
    hueStart: 100,
    hueRange: 40,
    hueSpeed: 0.2,
    saturation: 60,
    lightness: 40,
    symmetry: 8,
    kaleidoscope: true,
    motionType: 'circular',
    motionSpeed: 0.4,
    motionRadius: 70,
    motionTrails: false,
    trailLength: 10,
    bloomIntensity: 0.2,
    speed: 0.5,
    scale: 0.9,
    backgroundDarkness: 0,
    strokeWidth: 1,
    fillOpacity: 0.3,
    strokeOpacity: 0.5,
    renderStyle: 'orbits',
    performanceProfile: 'eco'
  },
  retro: {
    waveAmplitude: 60,
    waveFrequency: 0.025,
    waveSpeed: 1.0,
    waveCount: 4,
    shapeType: 'squares',
    shapeCount: 15,
    shapeSize: 20,
    shapeRotationSpeed: 0.8,
    shapePulsate: false,
    hueStart: 0,
    hueRange: 60,
    hueSpeed: 0.8,
    saturation: 80,
    lightness: 60,
    symmetry: 4,
    kaleidoscope: false,
    motionType: 'bounce',
    motionSpeed: 0.8,
    motionRadius: 80,
    motionTrails: true,
    trailLength: 15,
    bloomIntensity: 0.4,
    speed: 0.8,
    scale: 1.0,
    backgroundDarkness: 0.1,
    strokeWidth: 2,
    fillOpacity: 0.7,
    strokeOpacity: 0.9,
    renderStyle: 'lines',
    performanceProfile: 'standard'
  },
  matrix: {
    waveAmplitude: 40,
    waveFrequency: 0.05,
    waveSpeed: 2.0,
    waveCount: 8,
    shapeType: 'hexagons', // Triggers Matrix Mode in ASCII
    shapeCount: 20,
    shapeSize: 15,
    shapeRotationSpeed: 0.5,
    shapePulsate: true,
    hueStart: 120,
    hueRange: 20,
    hueSpeed: 0.2,
    saturation: 100,
    lightness: 50,
    symmetry: 1,
    kaleidoscope: false,
    motionType: 'linear',
    motionSpeed: 1.0,
    motionRadius: 100,
    motionTrails: true,
    trailLength: 25,
    bloomIntensity: 0.8,
    speed: 1.0,
    scale: 1.0,
    backgroundDarkness: 0,
    strokeWidth: 1,
    fillOpacity: 0.8,
    strokeOpacity: 0.8,
    renderStyle: 'lines',
    performanceProfile: 'standard'
  },
  vortex: {
    waveAmplitude: 90,
    waveFrequency: 0.02,
    waveSpeed: 1.5,
    waveCount: 3,
    shapeType: 'spirals', // Triggers Vortex Mode in ASCII
    shapeCount: 12,
    shapeSize: 30,
    shapeRotationSpeed: 2.0,
    shapePulsate: true,
    hueStart: 260,
    hueRange: 100,
    hueSpeed: 2.0,
    saturation: 90,
    lightness: 60,
    symmetry: 3,
    kaleidoscope: true,
    motionType: 'spiral',
    motionSpeed: 1.5,
    motionRadius: 120,
    motionTrails: true,
    trailLength: 18,
    bloomIntensity: 0.6,
    speed: 1.2,
    scale: 1.1,
    backgroundDarkness: 0,
    strokeWidth: 2,
    fillOpacity: 0.6,
    strokeOpacity: 0.8,
    renderStyle: 'orbits',
    performanceProfile: 'standard'
  }
}
