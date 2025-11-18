const { build } = require('esbuild')
const path = require('path')

// Build electron main process
Promise.all([
  build({
    entryPoints: ['electron/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'electron/main-compiled.cjs',
    format: 'cjs',
    external: ['electron', 'better-sqlite3', 'dotenv'],
    sourcemap: true,
    logLevel: 'info'
  }),
  build({
    entryPoints: ['electron/preload.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'electron/preload.js',
    format: 'cjs',
    external: ['electron'],
    sourcemap: true,
    logLevel: 'info'
  })
]).then(() => {
  console.log('✓ Electron main process built successfully')
}).catch(() => process.exit(1))
