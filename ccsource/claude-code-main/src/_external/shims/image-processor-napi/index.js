'use strict'

// Sharp-compatible stub
function sharp(_input) {
  return {
    metadata: async () => ({ width: 0, height: 0, format: 'unknown' }),
    resize: function(_w, _h, _opts) { return this },
    jpeg: function(_opts) { return this },
    png: function(_opts) { return this },
    webp: function(_opts) { return this },
    toBuffer: async () => Buffer.alloc(0),
  }
}

function getNativeModule() {
  return null
}

module.exports = {
  sharp,
  default: sharp,
  getNativeModule,
}
