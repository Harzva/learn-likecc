'use strict'

function isNativeAudioAvailable() {
  return false
}

function startRecording(_options) {
  return { stop: async () => Buffer.alloc(0) }
}

function stopRecording() {
  return Promise.resolve(Buffer.alloc(0))
}

module.exports = {
  isNativeAudioAvailable,
  startRecording,
  stopRecording,
}
