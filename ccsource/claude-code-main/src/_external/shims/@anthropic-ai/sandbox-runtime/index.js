'use strict'

class SandboxViolationStore {
  subscribe(listener) {
    listener([])
    return () => {}
  }

  getTotalCount() {
    return 0
  }
}

const sandboxViolationStore = new SandboxViolationStore()

const SandboxRuntimeConfigSchema = {
  parse(config) {
    return config
  },
  safeParse(config) {
    return { success: true, data: config }
  },
}

class SandboxManager {
  static checkDependencies(_opts) {
    return { errors: [], warnings: [] }
  }

  static isSupportedPlatform() {
    return false
  }

  static wrapWithSandbox(command, _binShell, _customConfig, _abortSignal) {
    return Promise.resolve(command)
  }

  static initialize(_runtimeConfig, _callback) {
    return Promise.resolve()
  }

  static updateConfig(_runtimeConfig) {}

  static reset() {
    return Promise.resolve()
  }

  static getFsReadConfig() {
    return undefined
  }

  static getFsWriteConfig() {
    return undefined
  }

  static getNetworkRestrictionConfig() {
    return undefined
  }

  static getIgnoreViolations() {
    return undefined
  }

  static getAllowUnixSockets() {
    return undefined
  }

  static getAllowLocalBinding() {
    return undefined
  }

  static getEnableWeakerNestedSandbox() {
    return undefined
  }

  static getProxyPort() {
    return undefined
  }

  static getSocksProxyPort() {
    return undefined
  }

  static getLinuxHttpSocketPath() {
    return undefined
  }

  static getLinuxSocksSocketPath() {
    return undefined
  }

  static waitForNetworkInitialization() {
    return Promise.resolve(false)
  }

  static getSandboxViolationStore() {
    return sandboxViolationStore
  }

  static annotateStderrWithSandboxFailures(_command, stderr) {
    return stderr
  }

  static cleanupAfterCommand() {}
}

module.exports = {
  SandboxManager,
  SandboxRuntimeConfigSchema,
  SandboxViolationStore,
}
