"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electron", {
  // Groq API calls (proxied through main process for security)
  groq: {
    transcribe: (audioData) => import_electron.ipcRenderer.invoke("groq:transcribe", audioData),
    chat: (messages) => import_electron.ipcRenderer.invoke("groq:chat", messages),
    tts: (text, voice) => import_electron.ipcRenderer.invoke("groq:tts", text, voice),
    vision: (image, prompt) => import_electron.ipcRenderer.invoke("groq:vision", image, prompt),
    // Listen for streaming chat chunks
    onChatChunk: (callback) => {
      import_electron.ipcRenderer.on("groq:chat-chunk", (_event, chunk) => callback(chunk));
    }
  },
  // Database operations
  db: {
    saveMessage: (params) => import_electron.ipcRenderer.invoke("db:save-message", params),
    getConversations: (params) => import_electron.ipcRenderer.invoke("db:get-conversations", params),
    createSession: (title) => import_electron.ipcRenderer.invoke("db:create-session", title),
    getSession: (sessionId) => import_electron.ipcRenderer.invoke("db:get-session", sessionId),
    getSessions: (limit) => import_electron.ipcRenderer.invoke("db:get-sessions", limit),
    renameSession: (params) => import_electron.ipcRenderer.invoke("db:rename-session", params),
    updateSessionSummary: (params) => import_electron.ipcRenderer.invoke("db:update-session-summary", params),
    getRecentContext: (params) => import_electron.ipcRenderer.invoke("db:get-recent-context", params),
    searchConversations: (params) => import_electron.ipcRenderer.invoke("db:search-conversations", params),
    getPersonality: () => import_electron.ipcRenderer.invoke("db:get-personality"),
    updatePersonality: (params) => import_electron.ipcRenderer.invoke("db:update-personality", params),
    deletePersonality: (key) => import_electron.ipcRenderer.invoke("db:delete-personality", key),
    savePreset: (params) => import_electron.ipcRenderer.invoke("db:save-preset", params),
    getPresets: () => import_electron.ipcRenderer.invoke("db:get-presets"),
    getPreference: (key) => import_electron.ipcRenderer.invoke("db:get-preference", key),
    setPreference: (params) => import_electron.ipcRenderer.invoke("db:set-preference", params)
  },
  // Window controls
  window: {
    minimize: () => import_electron.ipcRenderer.send("window:minimize"),
    close: () => import_electron.ipcRenderer.send("window:close"),
    toggleAlwaysOnTop: () => import_electron.ipcRenderer.send("window:toggle-on-top")
  },
  // System commands
  system: {
    executeCommand: (command) => import_electron.ipcRenderer.invoke("system:execute-command", command)
  }
});
//# sourceMappingURL=preload.js.map
