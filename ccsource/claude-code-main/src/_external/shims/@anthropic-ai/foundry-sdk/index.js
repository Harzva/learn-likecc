'use strict'

class FoundryClient {
  constructor(_config) {}
  send(_command) {
    return Promise.resolve({})
  }
}

module.exports = {
  FoundryClient,
  AnthropicFoundry: FoundryClient,
}
