'use strict'

const ComputerUseAPI = {
  captureExcluding: async () => ({ data: Buffer.alloc(0), width: 0, height: 0 }),
  captureRegion: async () => ({ data: Buffer.alloc(0), width: 0, height: 0 }),
  apps: {
    listInstalled: async () => [],
    listRunning: async () => [],
  },
  tcc: {
    checkAccessibility: () => false,
    checkScreenRecording: () => false,
  },
  resolvePrepareCapture: async () => ({ displays: [], mainWindowId: 0 }),
}

module.exports = {
  ...ComputerUseAPI,
}
