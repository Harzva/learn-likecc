'use strict'

const ComputerUseInputAPI = {
  key: async () => {},
  keys: async () => {},
  mouse: {
    move: async () => {},
    click: async () => {},
    doubleClick: async () => {},
    scroll: async () => {},
  },
  getFrontmostApp: () => ({ bundleId: '', name: '' }),
}

module.exports = {
  isSupported: true,
  ...ComputerUseInputAPI,
}
