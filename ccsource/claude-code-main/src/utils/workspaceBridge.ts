export type WorkspaceDialogAction = {
  id: string
  label: string
  description?: string
  kind?: 'primary' | 'secondary' | 'danger'
}

export type WorkspaceDialogSnapshot = {
  kind: string
  title: string
  subtitle?: string
  body?: string
  tone?: 'info' | 'warning' | 'danger'
  actions?: WorkspaceDialogAction[]
}

export type WorkspaceControlSnapshot = {
  isReady: boolean
  isBusy: boolean
  queuedCommands: number
  canInterrupt: boolean
  inputMode?: string
  statusText?: string
  updatedAt: string
}

type WorkspaceController = {
  submitPrompt: (prompt: string) => Promise<{ accepted: boolean; mode: string }>
  interrupt: () => Promise<{ accepted: boolean }>
  createPane: (input: {
    title?: string
    kind?: string
    initialPrompt?: string
  }) => Promise<{ accepted: boolean; paneId?: string }>
  switchPane: (paneId: string) => Promise<{ accepted: boolean; paneId?: string }>
  runDialogAction: (
    actionId: string,
  ) => Promise<{ accepted: boolean; dialogKind?: string }>
}

let workspaceController: WorkspaceController | null = null
let latestDialogSnapshot: WorkspaceDialogSnapshot | null = null
let latestControlSnapshot: WorkspaceControlSnapshot = {
  isReady: false,
  isBusy: false,
  queuedCommands: 0,
  canInterrupt: false,
  updatedAt: new Date().toISOString(),
}

export function registerWorkspaceController(
  controller: WorkspaceController | null,
): void {
  workspaceController = controller
  if (!controller) {
    latestControlSnapshot = {
      ...latestControlSnapshot,
      isReady: false,
      canInterrupt: false,
      updatedAt: new Date().toISOString(),
    }
  }
}

export function publishWorkspaceDialogSnapshot(
  dialog: WorkspaceDialogSnapshot | null,
): void {
  latestDialogSnapshot = dialog
}

export function publishWorkspaceControlSnapshot(
  control: Omit<WorkspaceControlSnapshot, 'updatedAt'>,
): void {
  latestControlSnapshot = {
    ...control,
    updatedAt: new Date().toISOString(),
  }
}

export function getWorkspaceBridgeSnapshot(): {
  control: WorkspaceControlSnapshot
  dialog: WorkspaceDialogSnapshot | null
} {
  return {
    control: latestControlSnapshot,
    dialog: latestDialogSnapshot,
  }
}

export async function submitWorkspacePrompt(prompt: string): Promise<{
  accepted: boolean
  mode: string
}> {
  if (!workspaceController) {
    return { accepted: false, mode: 'unavailable' }
  }
  return workspaceController.submitPrompt(prompt)
}

export async function interruptWorkspaceRun(): Promise<{
  accepted: boolean
}> {
  if (!workspaceController) {
    return { accepted: false }
  }
  return workspaceController.interrupt()
}

export async function createWorkspacePane(input: {
  title?: string
  kind?: string
  initialPrompt?: string
}): Promise<{
  accepted: boolean
  paneId?: string
}> {
  if (!workspaceController) {
    return { accepted: false }
  }
  return workspaceController.createPane(input)
}

export async function switchWorkspacePane(paneId: string): Promise<{
  accepted: boolean
  paneId?: string
}> {
  if (!workspaceController) {
    return { accepted: false }
  }
  return workspaceController.switchPane(paneId)
}

export async function invokeWorkspaceDialogAction(actionId: string): Promise<{
  accepted: boolean
  dialogKind?: string
}> {
  if (!workspaceController) {
    return { accepted: false }
  }
  return workspaceController.runDialogAction(actionId)
}
