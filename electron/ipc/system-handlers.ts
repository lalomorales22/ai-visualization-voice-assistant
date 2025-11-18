import { ipcMain } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export function setupSystemHandlers() {
  ipcMain.handle('system:execute-command', async (_event, command: string) => {
    try {
      // Security: In a real app, you'd want to whitelist commands or sandbox this.
      // For this personal assistant, we'll allow it but log it.
      console.log(`[System] Executing: ${command}`)
      
      const { stdout, stderr } = await execAsync(command)
      return { success: true, output: stdout || stderr }
    } catch (error: any) {
      console.error('[System] Command failed:', error)
      return { success: false, error: error.message }
    }
  })
}
