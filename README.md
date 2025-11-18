# 🎙️ AI Visualization Voice Assistant

> An Electron desktop app featuring a floating AI orb with real-time voice conversations, audio-reactive visualizations, and persistent memory powered by Groq's multimodal AI suite

[![Electron](https://img.shields.io/badge/Electron-30.0-47848F)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Groq API](https://img.shields.io/badge/Groq-API-orange)](https://groq.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57)](https://sqlite.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 🌟 Overview

A desktop AI companion that lives on your screen, featuring:
- **Real-time Voice Conversations** - Natural speech-to-speech interaction with Groq
- **Persistent Memory** - SQLite database stores all conversations, learns your preferences
- **AI Personality System** - Evolves and remembers context across sessions
- **Dual Visualization Modes** - Canvas orb (particles, waves, shapes) + ASCII text art
- **Audio-Reactive Animation** - Orb responds to AI voice in real-time (bass/mid/treble)
- **Transparent Floating Window** - Frameless, draggable, always-on-top desktop widget
- **Multimodal Vision** - Screenshot analysis via Llama Scout
- **Streaming Responses** - Ultra-low latency conversational AI

---

## 🏗️ Architecture

### System Flow
```
┌────────────────────────────────────────────────────────────────┐
│                    Electron Main Process                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Transparent  │  │  Groq Client │  │  SQLite Manager  │    │
│  │   Window     │  │  (API Calls) │  │  (Conversations) │    │
│  └──────────────┘  └──────────────┘  └──────────────────┘    │
│         ↓                   ↓                     ↓            │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              IPC Bridge (Main ↔ Renderer)           │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
                              ↕
┌────────────────────────────────────────────────────────────────┐
│                    Renderer Process (React)                     │
│                                                                 │
│  ┌─────────────────────────── Voice Flow ──────────────────┐  │
│  │ MediaRecorder → Groq Whisper → GPT-OSS → PlayAI TTS     │  │
│  │      ↓              ↓             ↓            ↓         │  │
│  │   Record        Transcribe     Stream     Synthesize    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌────────────────── Audio Analysis ──────────────────────┐   │
│  │  Web Audio API → FFT → Bass/Mid/Treble → Visualization │   │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────── Visualization Modes ────────────────────┐  │
│  │  • Canvas Orb (Particles, Waves, Shapes, Kaleidoscope)  │  │
│  │  • ASCII Text Art (Terminal-style character rendering)  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────── Memory System ─────────────────────┐   │
│  │  Conversation → SQLite → AI Personality & Context      │   │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↕
                      Groq Cloud API
```

### Database Schema (SQLite)
```sql
-- Conversation history
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,              -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  audio_url TEXT,                   -- Optional: stored audio file path
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON                     -- Audio duration, model used, etc.
);

-- AI personality traits and learned facts
CREATE TABLE personality (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,         -- 'user_name', 'favorite_topic', 'speaking_style'
  value TEXT NOT NULL,
  confidence REAL DEFAULT 1.0,      -- 0-1: how confident the AI is
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User preferences and settings
CREATE TABLE preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT,                    -- 'audio', 'visualization', 'behavior'
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Visualization presets
CREATE TABLE viz_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  config JSON NOT NULL,             -- Full visualization config
  thumbnail TEXT,                   -- Base64 screenshot
  created DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm/pnpm/yarn
- **Groq API Key** ([Get one here](https://console.groq.com/keys))
- **macOS/Windows/Linux** (Electron supports all platforms)

### Installation
```bash
# Clone repository
git clone https://github.com/lalomorales22/ai-visualization-voice-assistant.git
cd ai-visualization-voice-assistant

# Install dependencies
npm install
# or
pnpm install

# Configure environment
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Run in development mode
npm run dev
# or
pnpm dev

# Build for production
npm run build
npm run package  # Creates distributable app
```

### Environment Variables
```env
# Required
GROQ_API_KEY=gsk_your_api_key_here

# Optional Configuration
WINDOW_WIDTH=1200
WINDOW_HEIGHT=800
ALWAYS_ON_TOP=true
FRAMELESS=true
TRANSPARENT=true
DEFAULT_VOICE=Fritz-PlayAI
DEFAULT_VIZ_MODE=canvas         # 'canvas' | 'ascii'
ENABLE_REASONING=true            # GPT-OSS reasoning mode
```

### Recent Updates

#### 2025-11-18
- 💾 **Memory Stack Online:** Conversation sidebar now shows session timelines, surfaced memories, and instant FTS search.
- 🧠 **Fact Extraction:** Each turn feeds a Groq JSON extractor that writes confidence-scored facts into SQLite for contextual prompts.
- 🖥️ **Eco Visual Suite:** Canvas orb gained an eco-friendly line renderer, color themes, and a brand-new ASCII halo mode with density/ring controls.
- 🎛️ **Sticky Preferences:** Auto-converse, visualization settings, ASCII configs, and themes persist through the preferences table.
- ♻️ **FTS Index:** SQLite FTS5 powers lightning-fast conversation search without taxing the renderer thread.
- 🗑️ **Memory Management:** Added ability to delete surfaced memories.
- 📐 **Wider Layout:** Expanded default window size to 1200x800 for better panel visibility.
- 🎨 **UI Polish:** Refined control center buttons and layout.

#### 2025-01-17

#### Phase 1 & 2 Complete! ✅
- ✅ **Voice Recording:** Press spacebar to record, release to process
- ✅ **Full Groq Integration:** Whisper STT → GPT-OSS Chat → PlayAI TTS
- ✅ **Canvas Visualization:** Audio-reactive orb with 55+ parameters
- ✅ **Settings Panel:** 4 presets (default, cosmic, neon, spiral) + randomize
- ✅ **Audio Reactivity:** Real-time microphone analysis affects visuals
- ✅ **Fixed:** Database initialization error - embedded SQL schema
- ✅ **Fixed:** PostCSS module warning - renamed to `.mjs`

#### How to Use
1. `npm run dev` - Start the app
2. Click "Audio Reactive: OFF" to enable microphone for visualizations
3. Press and hold **Spacebar** to record your voice
4. Release spacebar - AI will respond with voice
5. Click ⚙️ to open settings and try different presets or randomize

---

## 🎯 Core Features

### 🎙️ Voice Conversation System
- **Push-to-Talk** - Hold spacebar (or click orb) to record
- **Voice Activation** - Auto-detect speech (VAD threshold configurable)
- **Real-time Transcription** - Whisper Large V3 Turbo (216x speed)
- **Streaming AI Responses** - GPT-OSS 20B with reasoning capabilities
- **Natural Voice Synthesis** - PlayAI TTS (19 English + 4 Arabic voices)
- **Conversation Memory** - Full history stored in SQLite, recalled contextually

### 🧠 AI Personality & Memory System
- **Session Continuity** - Remembers all past conversations
- **Fact Learning** - Automatically extracts and stores key information about you
- **Preference Tracking** - Learns your communication style, interests, habits
- **Context Injection** - Relevant memories injected into system prompts
- **Confidence Scoring** - AI rates certainty of learned facts (0-1)
- **Memory Retrieval** - Semantic search through conversation history
- **Memory Surfacing UI** - Sidebar pins high-confidence facts + searchable history per session

**Example Personality Storage:**
```json
{
  "user_name": "Lalo",
  "occupation": "Developer",
  "interests": ["AI", "visualization", "music production"],
  "communication_style": "casual, enthusiastic, uses slang",
  "preferred_voice": "Fritz-PlayAI",
  "last_conversation": "2025-01-17T10:30:00Z"
}
```

### 🎨 Dual Visualization Modes

#### Canvas Orb Mode (Default)
- **55+ Visual Parameters** - Comprehensive customization
- **Shape Systems** - Circles, squares, triangles, stars, hexagons, spirals
- **Wave Types** - Sine, square, sawtooth, triangle, noise
- **Particle Effects** - Connection networks, trails, physics simulation
- **Symmetry Modes** - Kaleidoscope, mirrors, radial patterns
- **Motion Types** - Circular, linear, spiral, random, bounce, orbit
- **Effects** - Bloom, distortion, glitch, time warp, noise
- **Real-time FFT** - Bass/mid/treble frequency analysis
- **Audio-Reactive** - Amplitude, size, rotation, color all respond to voice
- **Eco Profiles** - Toggle between eco line render + studio orbit modes to curb GPU load
- **Color Themes** - Dark, Stealth, Beach, and Neon palettes sync fill/stroke accents

#### ASCII Text Art Mode
- **Character-Based Rendering** - Pure text visualization
- **Circular Halo** - Animated glyph rings orbit the orb with spin + jitter controls
- **Audio Waveforms** - Rendered as ASCII characters
- **Frequency Bars** - Terminal-style spectrum analyzer
- **Retro Aesthetic** - Hacker/terminal vibe
- **Lightweight** - Lower CPU/GPU usage

### 👁️ Vision Capabilities
- **Screenshot Analysis** - Llama 4 Scout (17B, 16 experts)
- **Image Understanding** - Code, diagrams, documents, scenes
- **Context Integration** - Vision results feed into conversation
- **Hotkey Capture** - Quick screenshot → analysis workflow

### 🪟 Electron Window Features
- **Transparent Background** - Orb floats above other windows
- **Frameless** - No title bar or borders
- **Draggable** - Click and drag anywhere to reposition
- **Always on Top** - Stays visible over other apps (toggleable)
- **Resizable** - Adjust orb size
- **Multi-Monitor Support** - Works across all displays
- **System Tray** - Minimize to tray, quick settings menu

---

## 🛠️ Technology Stack

### Desktop Framework
- **Electron 30** - Cross-platform desktop apps
- **React 19** - UI library with concurrent features
- **TypeScript 5** - Type safety and developer experience
- **Vite** - Fast build tool and dev server

### Database & Storage
- **better-sqlite3** - Fast, synchronous SQLite bindings
- **SQL.js** - Alternative SQLite implementation
- **LocalStorage** - Quick settings cache

### APIs & Services
- **Groq SDK** - AI model integration
  - Whisper Large V3 Turbo (STT)
  - GPT-OSS 20B (Chat)
  - PlayAI TTS (Voice synthesis)
  - Llama 4 Scout (Vision)
- **Web Audio API** - Audio capture, playback, FFT analysis
- **MediaRecorder API** - Audio recording
- **Canvas API** - 2D rendering

### Styling & UI
- **Tailwind CSS v4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible UI primitives

### State Management
- **Zustand** - Lightweight state management
- **Jotai** - Atomic state (alternative)
- **React Context** - Local component state

---

See [TASKS.md](./TASKS.md) for complete implementation roadmap.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

**Built with 🎵 by developers who love AI, audio, and visual art**

*Talk. Visualize. Remember. Evolve.* 🚀
