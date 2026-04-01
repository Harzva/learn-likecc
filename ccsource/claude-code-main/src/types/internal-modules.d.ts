/**
 * Type declarations for internal Anthropic packages that cannot be installed
 * from public npm. All exports are typed as `any` to suppress errors while
 * still allowing IDE navigation for the actual source code.
 */

// ============================================================================
// bun:bundle — compile-time macros
// ============================================================================
declare module "bun:bundle" {
    export function feature(name: string): boolean;
    export function MACRO<T>(fn: () => T): T;
}

declare module "bun:ffi" {
    export function dlopen<T extends Record<string, { args: readonly string[]; returns: string }>>(path: string, symbols: T): { symbols: { [K in keyof T]: (...args: unknown[]) => unknown }; close(): void };
}

// ============================================================================
// Internal modules that may be missing
// ============================================================================
declare module "*/cli/handlers/ant.js" {
  const mod: any
  export default mod
}

declare module "*/cachedMicrocompact.js" {
  const mod: any
  export default mod
}

declare module "*/services/contextCollapse/persist.js" {
  const mod: any
  export default mod
}

declare module "*/skills/mcpSkills.js" {
  const mod: any
  export default mod
}

declare module "*/server/parseConnectUrl.js" {
  const mod: any
  export default mod
}

declare module "*/assistant/sessionDiscovery.js" {
  const mod: any
  export default mod
}

declare module "*/assistant/index.js" {
  const mod: any
  export default mod
}

declare module "*/proactive/index.js" {
  const mod: any
  export default mod
}

declare module "*/daemon/workerRegistry.js" {
  const mod: any
  export default mod
}

declare module "*/utils/systemThemeWatcher.js" {
  const mod: any
  export default mod
}

declare module "*/coordinator/coordinatorMode.js" {
  const mod: any
  export default mod
}

declare module "*/tools/DiscoverSkillsTool/prompt.js" {
  const mod: any
  export default mod
}

declare module "*/services/compact/cachedMCConfig.js" {
  const mod: any
  export default mod
}

declare module "*/components/agents/SnapshotUpdateDialog.js" {
  const mod: any
  export default mod
}

declare module "*/assistant/AssistantSessionChooser.js" {
  const mod: any
  export default mod
}

declare module "*/commands/assistant/assistant.js" {
  const mod: any
  export default mod
}

declare module "*/tasks/LocalWorkflowTask/LocalWorkflowTask.js" {
  const mod: any
  export default mod
}

declare module "*/ui/option.js" {
  const mod: any
  export default mod
}

declare module "*/tools/ReviewArtifactTool/ReviewArtifactTool.js" {
  const mod: any
  export default mod
}

declare module "*/components/permissions/ReviewArtifactPermissionRequest/ReviewArtifactPermissionRequest.js" {
  const mod: any
  export default mod
}

declare module "*/components/permissions/MonitorPermissionRequest/MonitorPermissionRequest.js" {
  const mod: any
  export default mod
}

declare module "*/components/tasks/WorkflowDetailDialog.js" {
  const mod: any
  export default mod
}

declare module "*/components/tasks/MonitorMcpDetailDialog.js" {
  const mod: any
  export default mod
}

declare module "*/cli/up.js" {
  const mod: any
  export default mod
}

declare module "*/cli/rollback.js" {
  const mod: any
  export default mod
}

// ============================================================================
// Additional missing internal modules
// ============================================================================
declare module "*/udsClient.js" {
  const mod: any
  export default mod
}

declare module "*/utils/udsMessaging.js" {
  const mod: any
  export default mod
}

declare module "*/utils/taskSummary.js" {
  const mod: any
  export default mod
}

declare module "*/utils/sessionDataUploader.js" {
  const mod: any
  export default mod
}

declare module "*/utils/sdkHeapDumpMonitor.js" {
  const mod: any
  export default mod
}

declare module "*/utils/eventLoopStallDetector.js" {
  const mod: any
  export default mod
}

declare module "*/utils/ccshareResume.js" {
  const mod: any
  export default mod
}

declare module "*/services/skillSearch/prefetch.js" {
  const mod: any
  export default mod
}

declare module "*/server/sessionManager.js" {
  const mod: any
  export default mod
}

declare module "*/server/serverLog.js" {
  const mod: any
  export default mod
}

declare module "*/server/serverBanner.js" {
  const mod: any
  export default mod
}

declare module "*/server/server.js" {
  const mod: any
  export default mod
}

declare module "*/server/lockfile.js" {
  const mod: any
  export default mod
}

declare module "*/server/connectHeadless.js" {
  const mod: any
  export default mod
}

declare module "*/server/processMessages.js" {
  const mod: any
  export default mod
}

declare module "*/server/handleIncomingMessage.js" {
  const mod: any
  export default mod
}

declare module "*/uds/server.js" {
  const mod: any
  export default mod
}

declare module "*/utils/filePersistence/types.js" {
  const mod: any
  export default mod
}
