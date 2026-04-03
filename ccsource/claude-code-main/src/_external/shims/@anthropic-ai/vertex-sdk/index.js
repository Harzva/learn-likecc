'use strict'

class VertexClient {
  constructor(_config) {}
  send(_command) {
    return Promise.resolve({})
  }
}

module.exports = {
  VertexClient,
  AnthropicVertex: VertexClient,
}
