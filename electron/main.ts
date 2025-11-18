import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import path from 'path'
import dotenv from 'dotenv'
import { setupGroqHandlers } from './ipc/groq-handlers.js'
import { setupDatabaseHandlers } from './ipc/db-handlers.js'
import { setupSystemHandlers } from './ipc/system-handlers.js'

// Load environment variables
dotenv.config()

// __dirname is available in CommonJS after compilation
const __dirname = path.dirname(require.main?.filename || __filename)

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// Load environment variables
const isDev = process.env.NODE_ENV === 'development'
const VITE_DEV_SERVER_URL = 'http://localhost:5173'

function createWindow() {
  const preloadPath = isDev
    ? path.join(__dirname, '../electron/preload.js')
    : path.join(__dirname, 'preload.js')

  console.log('Preload path:', preloadPath)

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,              // No title bar
    transparent: true,         // Transparent background
    alwaysOnTop: true,        // Float above other windows
    resizable: true,
    hasShadow: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // Load React app
  if (isDev) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Make window draggable and always on top
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  mainWindow.setAlwaysOnTop(true, 'screen-saver')

  // Window event handlers
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createTray() {
  // Note: You'll need to add an icon file
  // tray = new Tray(path.join(__dirname, '../assets/icon.png'))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => mainWindow?.show()
    },
    {
      label: 'Hide',
      click: () => mainWindow?.hide()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ])

  // tray.setContextMenu(contextMenu)
  // tray.setToolTip('AI Orb')
}

// Window control handlers
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window:close', () => {
  mainWindow?.close()
})

ipcMain.on('window:toggle-on-top', () => {
  if (mainWindow) {
    const isOnTop = mainWindow.isAlwaysOnTop()
    mainWindow.setAlwaysOnTop(!isOnTop, 'screen-saver')
  }
})

// App lifecycle
app.whenReady().then(() => {
  // Setup IPC handlers
  setupGroqHandlers()
  setupDatabaseHandlers()
  setupSystemHandlers()

  createWindow()
  // createTray() // Uncomment when you add tray icon

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Quit when all windows are closed
app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.removeAllListeners('close')
    mainWindow.close()
  }
})
