'use strict'

const DEFAULT_GRANT_FLAGS = {
  read: true,
  write: true,
  execute: true,
}

function bindSessionContext(_ctx) {
  return async function dispatch(_name, _args) {
    return { content: [], isError: false }
  }
}

function buildComputerUseTools(_capabilities, _coordinateMode) {
  return []
}

const API_RESIZE_PARAMS = { width: 1920, height: 1080 }
const targetImageSize = { width: 1920, height: 1080 }

module.exports = {
  bindSessionContext,
  buildComputerUseTools,
  DEFAULT_GRANT_FLAGS,
  API_RESIZE_PARAMS,
  targetImageSize,
}
