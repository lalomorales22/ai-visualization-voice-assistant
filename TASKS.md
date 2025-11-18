# 🎙️ Groq Voice AI Orb - Development Roadmap

> Electron desktop app with transparent floating orb, voice AI, persistent memory, and audio-reactive visualization

---

## 📊 Current Status

**Last Updated:** 2025-11-18
**Phase:** Phase 3 ✅ Memory + Personality Ship
**Status:** ✅ Voice+visual loop stable, prepping memory/personality

---

## 🎯 Quick Summary

### What's Working
- ✅ Electron app launches successfully with transparent, frameless window
- ✅ Voice recording (spacebar to talk) plus optional auto-converse loop
- ✅ Groq API integration (Whisper STT, GPT-OSS Chat, PlayAI TTS REST)
- ✅ SQLite database initialized
- ✅ Canvas visualization reacts to both mic input and AI voice output
- ✅ Settings panel with presets, randomize, and control center (status + toggles)
- ✅ Ambient-noise rejection (RMS/duration gate + browser constraints)
- ✅ CSP policy tightened without warnings
- ✅ Conversation history sidebar with session switcher + surfaced memories
- ✅ ASCII halo & eco-line visualizations with color themes + performance profiles

### What's Next
- 🔄 Phase 4 polish: auto-update + system tray controls
- 🔄 Expand visualization presets (10+) with thumbnail previews
- 🔄 Add error logging + diagnostics overlay
- 🔄 Harden deployment assets (icons, signing, release workflows)
- 🔄 Introduce quick command palette / keyboard shortcuts panel

---

## 📋 PHASE 1: Foundation & Electron Setup

**Goal:** Electron app with transparent window, Groq integration, SQLite database
**Status:** ✅ COMPLETE

### Completed Tasks
- ✅ Initialize Electron + Vite + React + TypeScript project
- ✅ Install core dependencies (electron, groq-sdk, better-sqlite3)
- ✅ Configure transparent frameless window
- ✅ Setup draggable window controls
- ✅ Create SQLite database schema (conversations, personality, preferences, viz_presets)
- ✅ Embed SQL schema in manager.ts (fixed bundling issue)
- ✅ Setup Groq API client (Whisper, GPT-OSS, PlayAI TTS, Llama Scout)
- ✅ Create IPC handlers for Groq API calls
- ✅ Create IPC handlers for database operations
- ✅ Fix PostCSS module warning (renamed to .mjs)

### Technical Specs
- **Electron:** 32.2.0
- **React:** 18.3.1
- **TypeScript:** 5.6.3
- **Database:** better-sqlite3 (synchronous SQLite)
- **Build Tool:** Vite 5.4 + esbuild
- **AI Provider:** Groq Cloud API

### Key Files Created
- `electron/main.ts` - Main process with transparent window setup
- `electron/preload.ts` - IPC bridge (groq, db, window APIs)
- `electron/database/manager.ts` - SQLite database manager with embedded schema
- `electron/groq/client.ts` - Groq API wrapper
- `electron/ipc/groq-handlers.ts` - IPC handlers for AI calls
- `electron/ipc/db-handlers.ts` - IPC handlers for database

---

## 📋 PHASE 2: Visualization & Voice System

**Goal:** Full voice conversation + audio-reactive visualization + settings
**Status:** ✅ COMPLETE (Polish ongoing)

### Completed Tasks
- ✅ Create CanvasOrb component with audio reactivity (mic + AI output)
- ✅ Implement voice recording hook (spacebar controls + auto-converse toggle)
- ✅ Add RMS/duration noise gate + browser audio constraints
- ✅ Feed Groq TTS audio through Web Audio analyser for visualization
- ✅ Build SettingsPanel with presets, manual controls, and new control center
- ✅ Integrate voice + visualization + audio loops end-to-end
- ✅ Implement randomize visualization feature + 4 base presets
- ✅ Ensure window stays fully transparent by default

### Technical Specs

#### Visualization Features
- **Shape Types:** Circles, Squares, Triangles, Stars, Hexagons, Spirals
- **Motion Types:** Circular, Linear, Spiral, Random, Bounce, Orbit
- **Symmetry:** 1-12 fold symmetry with kaleidoscope mode
- **Audio Reactive:** Bass affects wave amplitude, Mid affects shape size, Treble affects rotation
- **Effects:** Bloom, motion trails, color cycling
- **ASCII Halo Mode:** Character-based circular spectrogram with density/ring/spin controls
- **Color Themes:** Dark, Stealth, Beach, Neon palettes synchronize fills/strokes
- **Performance Profiles:** Eco (line renderer) + Studio (orbit) modes reduce GPU load on demand
- **55+ Configurable Parameters**

### Voice System Features
- **Push-to-Talk:** Spacebar to record (with status text in settings)
- **Auto Converse:** Optional loop that waits for AI speech to finish, then listens again
- **Noise Rejection:** RMS/duration gating plus browser echo/noise suppression
- **STT:** Groq Whisper Large V3 Turbo
- **Chat:** GPT-OSS 20B with streaming
- **TTS:** PlayAI TTS (Fritz voice) via REST endpoint with robust error handling
- **Status Display:** Control center shows Recording/Processing/Ready states

### Key Files Created
- `src/components/CanvasOrb.tsx` - Main visualization component
- `src/components/SettingsPanel.tsx` - Settings UI with presets
- `src/hooks/useVoiceRecorder.ts` - Voice recording hook
- `src/lib/audioAnalyzer.ts` - Audio frequency analyzer
- `src/App.tsx` - Main app integration

### Presets Available
1. **Default** - Balanced eco-line kaleidoscope with gentle bloom
2. **Stealth** - Low-saturation linear beams for minimal distraction
3. **Beach** - Orbiting stars with warm sands + aqua highlights
4. **Neon** - Kaleidoscopic orbits with punchy magenta/violet accents

---

## 📋 PHASE 3: Memory & Personality System

**Goal:** AI personality that learns and remembers
**Status:** ✅ COMPLETE

### Delivered
- [x] Implemented conversation history UI with surfaced memories & status chips
- [x] Built Groq-powered personality extraction pipeline with JSON facts + scoring
- [x] Injected ranked memories + recent history into prompts for better context
- [x] Added multi-session management (create, rename, autosave active session)
- [x] Surfaced fact confidence in UI + stored metadata in SQLite
- [x] Added conversation search powered by SQLite FTS5 + renderer debouncing

### Technical Design

#### Database Tables
```sql
conversations (id, session_id, role, content, audio_url, timestamp, metadata)
personality (id, key, value, confidence, last_updated)
preferences (key, value, category, last_updated)
viz_presets (id, name, config, thumbnail, created)
```

#### Personality Features
- Extract facts from conversations
- Store user preferences and habits
- Confidence scoring (0-1) for learned facts
- Context injection into system prompts
- Session continuity across app restarts

---

## 📋 PHASE 4: Polish & Production

**Goal:** Production-ready app with packaging
**Status:** 📅 PLANNED

### Tasks
- [ ] Add conversation history sidebar
- [ ] Create system tray integration
- [ ] Add keyboard shortcuts panel
- [ ] Implement app auto-update
- [ ] Add more visualization presets (10+ total)
- [ ] Create app icon and assets
- [ ] Setup code signing
- [ ] Build installers (macOS .dmg, Windows .exe, Linux .AppImage)
- [ ] Write user documentation
- [ ] Add error handling and logging

### Distribution Checklist
- [ ] macOS .dmg installer
- [ ] Windows .exe installer
- [ ] Linux .AppImage
- [ ] App icons (all sizes)
- [ ] Code signing certificates
- [ ] Auto-update server setup
- [ ] GitHub releases workflow

---

## 🐛 Known Issues & Fixes

### Fixed
- ✅ **2025-11-18:** Groq TTS playback crash (`decodeAudioData` input) – normalized buffers before decoding
- ✅ **2025-11-18:** Content-Security-Policy warning – removed unsupported `frame-ancestors` from meta delivery
- ✅ **2025-11-18:** Visualization background halo – presets now default to transparent + trail compositing fix
- ✅ **2025-01-17:** Database schema loading error - embedded SQL directly in code
- ✅ **2025-01-17:** PostCSS module warning - renamed to .mjs extension
- ✅ **2025-01-17:** Black background issue - changed bg-black to bg-transparent in App.tsx
- ✅ **2025-01-17:** Preload script not rebuilding - added preload.ts compilation to build-electron.js

### Active Issues
- None currently

---

## 🚀 Next Steps

1. Test voice conversation flow with Groq API
2. Add conversation history display
3. Implement personality extraction
4. Create more visualization presets
5. Add system tray with quick controls

---

## 📦 Project Structure

```
ascii-voice/
├── electron/
│   ├── main.ts                 # Main process
│   ├── preload.ts              # IPC bridge
│   ├── main-compiled.cjs       # Compiled main (generated)
│   ├── database/
│   │   ├── manager.ts          # SQLite manager
│   │   └── schema.sql          # SQL schema (reference)
│   ├── groq/
│   │   └── client.ts           # Groq API wrapper
│   └── ipc/
│       ├── groq-handlers.ts    # AI IPC handlers
│       └── db-handlers.ts      # Database IPC handlers
├── src/
│   ├── App.tsx                 # Main app component
│   ├── components/
│   │   ├── CanvasOrb.tsx       # Visualization
│   │   └── SettingsPanel.tsx   # Settings UI
│   ├── hooks/
│   │   └── useVoiceRecorder.ts # Voice recording
│   └── lib/
│       └── audioAnalyzer.ts    # Audio analysis
├── package.json
├── vite.config.ts
├── build-electron.js           # Electron build script
└── .env                        # API keys
```

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build Electron main process
npm run build:electron

# Rebuild native modules
npm run rebuild

# Build for production
npm run build

# Package app for distribution
npm run package
npm run package:mac
npm run package:win
npm run package:linux
```

---

## 🎨 Customization Guide

### Adding New Presets
Edit `src/components/SettingsPanel.tsx` and add to the `PRESETS` object:

```typescript
myPreset: {
  shapeType: 'stars',
  motionType: 'spiral',
  // ... other config
}
```

### Modifying Visualization
Edit `src/components/CanvasOrb.tsx` to change rendering logic.

### Adding Voice Commands
Edit `src/hooks/useVoiceRecorder.ts` to add command detection.

---

**Built with 🎵 by developers who love AI, audio, and visual art**
