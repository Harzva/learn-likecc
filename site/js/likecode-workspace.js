;(function () {
    var root = document.getElementById('likecode-workspace')
    if (!root) return

    var relayInput = document.getElementById('workspace-relay-url')
    var taskSearch = document.getElementById('workspace-task-search')
    var taskList = document.getElementById('workspace-task-list')
    var planEditor = document.getElementById('workspace-plan-editor')
    var planSave = document.getElementById('workspace-plan-save')
    var runtimeStatus = document.getElementById('workspace-runtime-status')
    var planStatus = document.getElementById('workspace-plan-status')
    var checklistHost = document.getElementById('workspace-checklist')
    var evolutionEditor = document.getElementById('workspace-evolution-editor')
    var evolutionPath = document.getElementById('workspace-evolution-path')
    var evolutionStatus = document.getElementById('workspace-evolution-status')
    var daemonJump = document.getElementById('workspace-daemon-jump')
    var connectorTargetInput = document.getElementById('workspace-connector-target-input')
    var connectorNoteInput = document.getElementById('workspace-connector-note-input')
    var connectorBridgeTargetInput = document.getElementById('workspace-connector-bridge-target-input')
    var shellListHost = document.getElementById('workspace-shell-list')
    var shellCommandInput = document.getElementById('workspace-shell-command')
    var shellRecentHost = document.getElementById('workspace-shell-recent')
    var activeTask = null
    var taskPayload = null
    var currentLogMode = 'latest'
    var daemonTaskId = null
    var workspaceMeta = null
    var shellState = {
        sessions: [],
        activeId: '',
        lastOutputSyncAt: '',
        lastOutputSyncFailedAt: '',
    }
    var connectorState = {
        shell_mode: 'ui-shell',
        bind_state: 'unbound',
        target_dialog: '',
        note: 'local draft only',
        session_key: '',
        qrcode_content: '',
        login_status: 'idle',
        runtime_mode: 'mock-flow',
        runtime_owner: 'workspace-shell',
        write_policy: 'local-draft',
        bridge_mode: 'queue-ticket',
        bridge_target: 'workspace',
        bridge_policy: 'daemon-safe',
        bridge_status: 'draft',
        bridge_lock_rule: 'daemon-holds-thread',
        delivery_guardrail: 'queue-only',
    }
    var CONNECTOR_STATE_KEY = 'likecode_workspace_connector_shell_v1'
    var SHELL_RECENT_KEY = 'likecode_workspace_shell_recent_v1'
    var SHELL_CONTEXT_KEY = 'likecode_workspace_shell_context_v1'
    var NO_ACTIVE_SHELL_STATUS = '还没有激活 shell · 先新建或选中，再按 Enter 或点常用探针'
    var NO_ACTIVE_SHELL_PREVIEW = '预览: 先新建或选中一个 shell，再按 Enter 发命令或点常用探针'
    var NO_ACTIVE_SHELL_CONTROL_HINT = '先新建或选中一个 shell，再发送命令、点常用探针或刷新输出'
    var CLOSED_SHELL_BUTTON_HINT = 'current shell is closed; switch or create a shell first'
    var CLOSED_SHELL_CONTROL_HINT = '当前 shell 已关闭；先切到存活会话或新建 shell'
    var NO_SHELL_FOCUS_LIVE_HINT = '还没有 shell；先新建一个 shell'
    var NO_FALLBACK_LIVE_SHELL_HINT = '当前已经是存活会话；没有其它存活会话可切换'
    var CLOSED_NO_FALLBACK_LIVE_SHELL_HINT = '当前 shell 已关闭且没有其它存活会话；请新建 shell 恢复会话'
    var CREATE_SHELL_FIRST_STEP_HINT = '新建一个 relay-backed shell 会话，然后才能发送命令或刷新输出'
    var CREATE_SHELL_RECOVERY_HINT = '当前 shell 已关闭且没有其它存活会话；新建 shell 恢复操作入口'
    var REFRESH_ACTIVE_SHELL_HINT = '刷新当前 shell 输出'
    var CLOSE_ACTIVE_SHELL_HINT = '关闭当前 shell 会话'
    var SEND_ACTIVE_SHELL_HINT = '发送输入框命令到当前 shell'
    var PRESET_ACTIVE_SHELL_HINT = '发送常用探针到当前 shell'
    var CLOSED_SHELL_STATUS = '当前 shell 已关闭 · 先切换或新建，再发送或重放命令'
    var CLOSED_SHELL_PREVIEW = '预览: 当前 shell 已关闭；请先切到存活会话或新建 shell，再发送或重放命令'
    var CLOSED_SHELL_REFRESH_STATUS = '当前 shell 已关闭 · 先切换或新建，再刷新输出'
    var CLOSED_SHELL_REFRESH_PREVIEW = '预览: 当前 shell 已关闭；请先切到存活会话或新建 shell，再刷新输出'

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
    }

    function relayBase() {
        return (relayInput.value || 'http://127.0.0.1:8770').replace(/\/+$/, '')
    }

    function setText(id, value) {
        var el = document.getElementById(id)
        if (el) el.textContent = value == null ? '' : String(value)
    }

    function setStatus(el, text, tone) {
        if (!el) return
        el.textContent = text
        el.className = 'likecode-workspace-status likecode-workspace-status--' + (tone || 'neutral')
    }

    function setBadge(el, text, tone) {
        if (!el) return
        el.textContent = text
        el.className = 'likecode-workspace-badge likecode-workspace-badge--' + (tone || 'neutral')
    }

    function syncLogModeButtons() {
        var daemonButton = document.getElementById('workspace-log-daemon')
        var tickButton = document.getElementById('workspace-log-tick')
        var messageButton = document.getElementById('workspace-log-message')
        if (!daemonButton || !tickButton || !messageButton) return
        daemonButton.setAttribute('aria-pressed', currentLogMode === 'daemon' ? 'true' : 'false')
        tickButton.setAttribute('aria-pressed', currentLogMode === 'latest' ? 'true' : 'false')
        messageButton.setAttribute('aria-pressed', currentLogMode === 'message' ? 'true' : 'false')
    }

    function loadConnectorState() {
        try {
            var raw = window.localStorage.getItem(CONNECTOR_STATE_KEY)
            if (!raw) return
            var parsed = JSON.parse(raw)
            connectorState = Object.assign({}, connectorState, parsed || {})
        } catch (error) {}
    }

    function persistConnectorState() {
        try {
            window.localStorage.setItem(CONNECTOR_STATE_KEY, JSON.stringify(connectorState))
        } catch (error) {}
    }

    function loadShellRecentCommands() {
        try {
            var raw = window.localStorage.getItem(SHELL_RECENT_KEY)
            if (!raw) return []
            return JSON.parse(raw) || []
        } catch (error) {
            return []
        }
    }

    function persistShellRecentCommands(commands) {
        try {
            window.localStorage.setItem(SHELL_RECENT_KEY, JSON.stringify(commands || []))
        } catch (error) {}
    }

    function loadShellContext() {
        try {
            var raw = window.localStorage.getItem(SHELL_CONTEXT_KEY)
            if (!raw) return {}
            return JSON.parse(raw) || {}
        } catch (error) {
            return {}
        }
    }

    function persistShellContext(context) {
        try {
            window.localStorage.setItem(SHELL_CONTEXT_KEY, JSON.stringify(context || {}))
        } catch (error) {}
    }

    function normalizeShellContext(context) {
        var next = {}
        Object.keys(context || {}).forEach(function (seatId) {
            var value = context[seatId]
            if (!value) return
            if (typeof value === 'string') {
                next[seatId] = { command: value, at: '' }
                return
            }
            var command = String(value.command || '').trim()
            var at = String(value.at || '').trim()
            if (!command && !at) return
            next[seatId] = { command: command, at: at }
        })
        return next
    }

    function shellTimeStamp() {
        var now = new Date()
        var year = now.getFullYear()
        var month = String(now.getMonth() + 1).padStart(2, '0')
        var day = String(now.getDate()).padStart(2, '0')
        var hours = String(now.getHours()).padStart(2, '0')
        var minutes = String(now.getMinutes()).padStart(2, '0')
        var seconds = String(now.getSeconds()).padStart(2, '0')
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
    }

    function normalizeRecentCommands(commands) {
        var seen = {}
        return (commands || [])
            .map(function (item) { return String(item || '').trim() })
            .filter(function (item) {
                if (!item || seen[item]) return false
                seen[item] = true
                return true
            })
            .slice(0, 4)
    }

    function shellRecentCue() {
        var active = activeShell()
        if (!active) return { tone: 'neutral', text: 'current seat: no shell yet · replay memory only' }
        if (!active.alive) return { tone: 'attention', text: 'current seat: ' + active.session_id + ' · shell closed' }
        var context = ((shellState.lastCommandBySeat || {})[active.session_id]) || {}
        if (!context.command) {
            return { tone: 'attention', text: 'current seat: ' + active.session_id + ' · no local replay yet' }
        }
        return {
            tone: 'ready',
            text: 'current seat: ' + active.session_id + ' · ' + shellPreviewText(context.command),
        }
    }

    function currentSeatRecentCommand() {
        var active = activeShell()
        if (!active || !active.alive) return ''
        var context = ((shellState.lastCommandBySeat || {})[active.session_id]) || {}
        return String(context.command || '').trim()
    }

    function renderShellRecentCommands() {
        if (!shellRecentHost) return
        var recent = normalizeRecentCommands(shellState.recentCommands || [])
        var cue = shellRecentCue()
        var active = activeShell()
        var activeCommand = currentSeatRecentCommand()
        var shellCount = (shellState.sessions || []).length
        var replayDisabled = !active || !active.alive
        var hasSharedButtons = !!activeCommand && recent.some(function (command) { return command !== activeCommand })
        var cueText = cue.text
        var cueTone = cue.tone
        var emptyText = '上面可按 Enter 发送命令或直接点常用探针；最近成功命令会显示在这里，支持一键重放。'
        if (!active && !recent.length) {
            cueText = 'current seat: no shell yet · no replay yet'
            cueTone = 'attention'
            emptyText = '还没有可重放命令；上面可按 Enter 发送命令或直接点常用探针，成功后会显示在这里，支持一键重放。'
        }
        if (!active && recent.length) {
            cueText = 'current seat: no shell yet · create a shell first'
            cueTone = 'attention'
        }
        if (active && !active.alive && recent.length) {
            cueText += ' · switch or create first'
        }
        if (active && active.alive && !activeCommand && recent.length) {
            cueText += ' · try replay below'
        } else if (hasSharedButtons) {
            cueText += ' + more replay below'
        }
        if (active && !activeCommand && !recent.length) {
            emptyText = '当前 seat 还没有本地可重放命令；上面可按 Enter 发送命令或直接点常用探针，成功后会显示在这里，支持一键重放。'
        }
        if (active && !active.alive && !recent.length) {
            emptyText = '当前 shell 已关闭；先切到存活会话或新建 shell，再发送或重放命令。'
        }
        shellState.recentCommands = recent
        if (!recent.length) {
            shellRecentHost.innerHTML =
                '<span class="likecode-workspace-badge likecode-workspace-badge--' + esc(cueTone) + '">' + esc(cueText) + '</span>' +
                '<span class="likecode-workspace-empty">' + esc(emptyText) + '</span>'
            return
        }
        shellRecentHost.innerHTML =
            '<span class="likecode-workspace-badge likecode-workspace-badge--' + esc(cueTone) + '">' + esc(cueText) + '</span>' +
            recent.map(function (command) {
                var isCurrent = !!activeCommand && command === activeCommand
                var buttonClass = isCurrent ? 'btn btn-primary' : 'btn btn-secondary'
                var buttonLabel = isCurrent ? command : ('saved · ' + command)
                var buttonHint = !active
                    ? (shellCount ? 'select an active shell first' : 'create a shell first')
                    : (!active.alive ? CLOSED_SHELL_BUTTON_HINT : '')
                buttonHint = buttonHint || (
                    isCurrent ? '' : 'saved replay from this browser; not current shell history'
                )
                var buttonAttrs = [' aria-controls="workspace-shell-output"']
                if (buttonHint) {
                    buttonAttrs.push(' title="' + esc(buttonHint) + '"')
                    buttonAttrs.push(' aria-label="' + esc(buttonLabel + ' (' + buttonHint + ')') + '"')
                }
                if (replayDisabled) {
                    buttonAttrs.push(' disabled')
                }
                return '<button type="button" class="' + buttonClass + '" data-shell-command="' + esc(command) + '"' + buttonAttrs.join('') + '>' + esc(buttonLabel) + '</button>'
        }).join('')
        Array.prototype.slice.call(shellRecentHost.querySelectorAll('[data-shell-command]')).forEach(function (button) {
            button.addEventListener('click', function () {
                dispatchShellCommand(button.getAttribute('data-shell-command') || '')
            })
        })
    }

    function rememberShellCommand(command) {
        var recent = normalizeRecentCommands([command].concat(shellState.recentCommands || []))
        shellState.recentCommands = recent
        persistShellRecentCommands(recent)
        renderShellRecentCommands()
    }

    function clearShellMemory() {
        shellState.recentCommands = []
        shellState.lastCommandBySeat = {}
        persistShellRecentCommands([])
        persistShellContext({})
        renderShellRecentCommands()
        renderShellOutput(activeShell())
        setStatus(document.getElementById('workspace-shell-status'), 'browser-local memory cleared · replay row reset to setup state', 'neutral')
    }

    function connectorTone(state) {
        if (state === 'bound') return 'ready'
        if (state === 'qr-wait') return 'attention'
        if (state === 'adapter-draft') return 'attention'
        return 'neutral'
    }

    function connectorRuntimePreview(state) {
        var mode = state.runtime_mode || 'mock-flow'
        var owner = state.runtime_owner || 'workspace-shell'
        var policy = state.write_policy || 'local-draft'
        return mode + ' / ' + owner + ' / ' + policy
    }

    function connectorBridgePreview(state) {
        var mode = state.bridge_mode || 'queue-ticket'
        var target = state.bridge_target || 'workspace'
        var policy = state.bridge_policy || 'daemon-safe'
        var status = state.bridge_status || 'draft'
        return mode + ' / ' + target + ' / ' + policy + ' / ' + status
    }

    function connectorGuardPreview(state) {
        var lock = state.bridge_lock_rule || 'daemon-holds-thread'
        var delivery = state.delivery_guardrail || 'queue-only'
        return lock + ' / ' + delivery
    }

    function renderGuardDecision(decision) {
        var text = 'decision: unchecked'
        if (decision && decision.decision) {
            text = 'decision: ' + decision.decision + ' / ' + (decision.reason || '')
        }
        setText('workspace-connector-guard-decision', text)
    }

    function renderConnectorShell() {
        setText('workspace-connector-mode', connectorState.shell_mode || 'ui-shell')
        setText('workspace-connector-bind-state', connectorState.bind_state || 'unbound')
        setText('workspace-connector-target', connectorState.target_dialog || '--')
        setText('workspace-connector-login-status', connectorState.login_status || 'idle')
        setText('workspace-connector-session-key', connectorState.session_key || '--')
        setText('workspace-connector-runtime-mode', connectorState.runtime_mode || 'mock-flow')
        setText('workspace-connector-runtime-owner', connectorState.runtime_owner || 'workspace-shell')
        setText('workspace-connector-write-policy', connectorState.write_policy || 'local-draft')
        setText('workspace-connector-bridge-mode', connectorState.bridge_mode || 'queue-ticket')
        setText('workspace-connector-bridge-target', connectorState.bridge_target || 'workspace')
        setText('workspace-connector-bridge-policy', connectorState.bridge_policy || 'daemon-safe')
        setText('workspace-connector-bridge-status', connectorState.bridge_status || 'draft')
        setText('workspace-connector-bridge-lock-rule', connectorState.bridge_lock_rule || 'daemon-holds-thread')
        setText('workspace-connector-delivery-guardrail', connectorState.delivery_guardrail || 'queue-only')
        if (connectorTargetInput) connectorTargetInput.value = connectorState.target_dialog || ''
        if (connectorNoteInput) connectorNoteInput.value = connectorState.note || ''
        if (connectorBridgeTargetInput) connectorBridgeTargetInput.value = connectorState.bridge_target || 'workspace'
        setStatus(
            document.getElementById('workspace-connector-status'),
            (connectorState.shell_mode || 'ui-shell') + ' / ' + (connectorState.login_status || connectorState.bind_state || 'idle'),
            connectorTone(connectorState.bind_state)
        )
        setText('workspace-connector-note-preview', 'note: ' + (connectorState.note || 'local draft only'))
        setText('workspace-connector-qr-preview', 'qr: ' + (connectorState.qrcode_content || '--'))
        setText('workspace-connector-runtime-preview', 'lane: ' + connectorRuntimePreview(connectorState))
        setText('workspace-connector-bridge-preview', 'bridge: ' + connectorBridgePreview(connectorState))
        setText('workspace-connector-guard-preview', 'guard: ' + connectorGuardPreview(connectorState))
    }

    function updateConnectorState(patch) {
        connectorState = Object.assign({}, connectorState, patch || {})
        persistConnectorState()
        renderConnectorShell()
    }

    function fetchConnectorState() {
        return fetchJson(relayBase() + '/api/connector/state')
            .then(function (payload) {
                if (payload && payload.connector) updateConnectorState(payload.connector)
                return payload
            })
            .catch(function () {
                renderConnectorShell()
                return null
            })
    }

    function saveConnectorState(patch) {
        updateConnectorState(patch)
        return fetchJson(relayBase() + '/api/connector/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ connector: patch || {} }),
        }).then(function (payload) {
            if (payload && payload.connector) updateConnectorState(payload.connector)
            return payload
        }).catch(function () {
            return null
        })
    }

    function shellPreviewText(buffer) {
        var lines = String(buffer || '').split('\n').map(function (line) { return line.trim() }).filter(Boolean)
        return lines.length ? lines[lines.length - 1] : '--'
    }

    function activeShell() {
        var sessions = shellState.sessions || []
        return sessions.find(function (item) { return item.session_id === shellState.activeId }) || sessions[0] || null
    }

    function syncShellActionState(active) {
        var createButton = document.getElementById('workspace-shell-create')
        var refreshOutput = document.getElementById('workspace-shell-refresh-output')
        var closeButton = document.getElementById('workspace-shell-close')
        var sendButton = document.getElementById('workspace-shell-send')
        var focusLiveButton = document.getElementById('workspace-shell-focus-live')
        var commandInput = document.getElementById('workspace-shell-command')
        var presetButtons = [
            { button: document.getElementById('workspace-shell-preset-pwd'), command: 'pwd' },
            { button: document.getElementById('workspace-shell-preset-ls'), command: 'ls' },
            { button: document.getElementById('workspace-shell-preset-git'), command: 'git status' },
            { button: document.getElementById('workspace-shell-preset-python'), command: 'python -V' },
        ]
        var fallbackLive = (shellState.sessions || []).find(function (item) {
            return !!item.alive && (!active || item.session_id !== active.session_id)
        })
        var disabled = !(active && active.alive)
        var disabledHint = !active ? NO_ACTIVE_SHELL_CONTROL_HINT : (!active.alive ? CLOSED_SHELL_CONTROL_HINT : '')
        function applyButtonHint(button, hint) {
            if (!button) return
            if (hint) {
                button.title = hint
                button.setAttribute('aria-label', button.textContent + ' (' + hint + ')')
            } else {
                button.removeAttribute('title')
                button.removeAttribute('aria-label')
            }
        }
        if (sendButton) {
            sendButton.disabled = disabled
            applyButtonHint(sendButton, disabledHint || (active && active.alive ? (SEND_ACTIVE_SHELL_HINT + ' · ' + active.session_id) : ''))
        }
        presetButtons.forEach(function (item) {
            var button = item.button
            if (!button) return
            button.disabled = disabled
            applyButtonHint(button, disabledHint || (active && active.alive ? (PRESET_ACTIVE_SHELL_HINT + ' · ' + item.command + ' · ' + active.session_id) : ''))
        })
        if (refreshOutput) {
            refreshOutput.disabled = disabled
            applyButtonHint(refreshOutput, disabledHint || (active && active.alive ? (REFRESH_ACTIVE_SHELL_HINT + ' · ' + active.session_id) : ''))
        }
        if (closeButton) {
            closeButton.disabled = disabled
            applyButtonHint(closeButton, disabledHint || (active && active.alive ? (CLOSE_ACTIVE_SHELL_HINT + ' · ' + active.session_id) : ''))
        }
        if (focusLiveButton) {
            focusLiveButton.disabled = !fallbackLive
            focusLiveButton.textContent = fallbackLive ? ('切到存活会话 · ' + fallbackLive.session_id) : '没有其它存活会话'
            applyButtonHint(
                focusLiveButton,
                fallbackLive
                    ? ''
                    : (!active ? NO_SHELL_FOCUS_LIVE_HINT : (!active.alive ? CLOSED_NO_FALLBACK_LIVE_SHELL_HINT : NO_FALLBACK_LIVE_SHELL_HINT))
            )
        }
        if (createButton) {
            createButton.textContent = active && !active.alive && !fallbackLive
                ? '新建 shell · 恢复会话'
                : '新建 shell · 第一步'
            applyButtonHint(
                createButton,
                active && !active.alive && !fallbackLive
                    ? CREATE_SHELL_RECOVERY_HINT
                    : CREATE_SHELL_FIRST_STEP_HINT
            )
        }
        if (commandInput) {
            commandInput.disabled = disabled
            var commandInputHint = ''
            if (!active) {
                commandInput.placeholder = '先新建或选中一个 shell，再按 Enter 发命令'
                commandInputHint = NO_ACTIVE_SHELL_CONTROL_HINT
            } else if (!active.alive) {
                commandInput.placeholder = fallbackLive
                    ? ('当前 shell 已关闭；先切到存活会话 ' + fallbackLive.session_id + ' 再发命令')
                    : '当前 shell 已关闭；请先新建 shell · 恢复会话'
                commandInputHint = fallbackLive
                    ? ('当前 shell 已关闭；先切到存活会话 ' + fallbackLive.session_id + ' 再发命令')
                    : CLOSED_SHELL_CONTROL_HINT
            } else {
                commandInput.placeholder = '输入一条 shell 命令，例如：pwd 或 ls；按 Enter 发送'
            }
            if (commandInputHint) {
                commandInput.title = commandInputHint
                commandInput.setAttribute('aria-label', 'Shell 命令输入框 (' + commandInputHint + ')')
            } else {
                commandInput.removeAttribute('title')
                commandInput.setAttribute('aria-label', 'Shell 命令输入框')
            }
        }
    }

    function renderShellSyncMeta() {
        if (shellState.lastOutputSyncFailedAt) {
            setText('workspace-shell-sync-time', 'output sync failed: ' + shellState.lastOutputSyncFailedAt)
            return
        }
        setText(
            'workspace-shell-sync-time',
            shellState.lastOutputSyncAt
                ? ('output sync: ' + shellState.lastOutputSyncAt)
                : ((shellState.sessions || []).length ? 'output sync: --' : 'output sync: no shell yet')
        )
    }

    function renderShellSummary() {
        var sessions = shellState.sessions || []
        var active = activeShell()
        var liveCount = sessions.filter(function (item) { return !!item.alive }).length
        var closedCount = sessions.length - liveCount
        var fallbackLive = sessions.find(function (item) {
            return !!item.alive && (!active || item.session_id !== active.session_id)
        })
        var actionStateText = sessions.length ? '会话状态: 未选择' : '会话状态: 还没有 shell'
        if (active) {
            if (active.alive) {
                actionStateText = '会话状态: 就绪'
            } else {
                actionStateText = fallbackLive ? '会话状态: 已关闭 · 可切换' : '会话状态: 已关闭 · 需恢复'
            }
        }
        syncShellActionState(active)
        setText('workspace-shell-count', sessions.length ? ('共 ' + sessions.length + ' 个') : '还没有 shell')
        setText('workspace-shell-active', active ? active.session_id : (sessions.length ? '先选中一个 shell' : '先新建一个 shell'))
        setText('workspace-shell-action-target', active ? ('当前会话: ' + active.session_id) : (sessions.length ? '当前会话: 未选择' : '当前会话: 还没有 shell'))
        setText('workspace-shell-action-state', actionStateText)
        setText('workspace-shell-cwd', active ? (active.cwd || '—') : (sessions.length ? '先选中后查看目录' : '先新建后查看目录'))
        setText('workspace-shell-pid', active ? (active.pid || '—') : (sessions.length ? '先选中后查看 pid' : '先新建后查看 pid'))
        setText('workspace-shell-preview', active ? ('预览: ' + shellPreviewText(active.buffer)) : (sessions.length ? '预览: 先选中一个 shell' : '预览: 先新建一个 shell'))
        setStatus(
            document.getElementById('workspace-shell-roster-pulse-badge'),
            sessions.length ? 'roster pulse' : 'empty roster',
            sessions.length ? 'neutral' : 'attention'
        )
        setText(
            'workspace-shell-roster-pulse-text',
            sessions.length
                ? ('当前会话 ' + (active ? active.session_id : '--') + ' · live ' + liveCount + ' · closed ' + closedCount)
                : '还没有 shell 会话 · live 0 · closed 0'
        )
        if (!active) {
            setStatus(document.getElementById('workspace-shell-active-route-badge'), sessions.length ? 'active seat route' : 'empty shell route', 'neutral')
            setText(
                'workspace-shell-active-route-text',
                sessions.length
                    ? '先选中一个 shell，下面的输出预览、刷新输出和关闭动作才会跟着当前会话切换。'
                    : '先新建一个 shell，下面的输出预览、刷新输出和关闭动作才会开始跟着当前会话切换。'
            )
        } else if (!active.alive) {
            setStatus(document.getElementById('workspace-shell-active-route-badge'), 'closed active seat', 'attention')
            setText(
                'workspace-shell-active-route-text',
                fallbackLive
                    ? ('当前会话 ' + active.session_id + ' 已关闭；可以直接切到上面的存活会话 ' + fallbackLive.session_id + ' 继续刷新、发送和关闭动作。')
                    : ('当前会话 ' + active.session_id + ' 已关闭；当前没有其它 live seat，可用上面的 `新建 shell · 恢复会话` 继续。')
            )
        } else {
            setStatus(document.getElementById('workspace-shell-active-route-badge'), 'active seat routing', 'ready')
            setText('workspace-shell-active-route-text', '当前会话 ' + active.session_id + ' 正在驱动下面的输出预览、刷新输出和关闭动作。')
        }
        renderShellSyncMeta()
    }

    function renderShellOutput(session) {
        var host = document.getElementById('workspace-shell-output')
        var label = document.getElementById('workspace-shell-output-label')
        var time = document.getElementById('workspace-shell-output-time')
        var scope = document.getElementById('workspace-shell-output-scope')
        var hint = document.getElementById('workspace-shell-output-hint')
        var hasSessions = !!((shellState.sessions || []).length)
        if (!host) return
        if (!session) {
            host.textContent = hasSessions
                ? '先选中一个 shell，再按 Enter 发命令或点常用探针，这里就会显示最近输出。'
                : '先新建一个 shell，再按 Enter 发命令或点常用探针，这里就会显示最近输出。'
            setStatus(label, hasSessions ? 'output from: select a seat first' : 'output from: no shell yet', 'attention')
            setText('workspace-shell-output-time', hasSessions ? 'updated: select a seat first' : 'updated: no shell yet')
            setBadge(scope, hasSessions ? 'select seat hint' : 'empty shell hint', 'attention')
            if (hint) {
                hint.textContent = hasSessions
                    ? 'hint: select a seat first, then send a command with Enter or the quick probes above to inspect local provenance here.'
                    : 'hint: create a seat first, then send a command with Enter or the quick probes above to inspect local provenance here.'
            }
            return
        }
        host.textContent = session.buffer || '(empty)'
        var context = ((shellState.lastCommandBySeat || {})[session.session_id]) || {}
        var lastCommand = context.command || '--'
        var lastAt = context.at || '--'
        if (lastCommand === '--') {
            setStatus(label, 'output from: unknown on this seat', 'attention')
            if (time) time.textContent = 'updated: no local send yet'
            setBadge(scope, 'seat-local gap', 'attention')
            if (hint) hint.textContent = 'hint: this seat output may predate this browser memory; send a fresh command with Enter or the quick probes above to pair new local provenance.'
            return
        }
        setStatus(label, 'output from: ' + lastCommand, 'ready')
        if (time) time.textContent = 'updated: ' + (lastAt || 'unknown')
        setBadge(scope, 'seat-local cue', 'ready')
        if (hint) hint.textContent = 'hint: this seat is currently paired with the last local probe shown above.'
    }

    function setShellOutputBusy(isBusy) {
        var host = document.getElementById('workspace-shell-output')
        if (host) host.setAttribute('aria-busy', isBusy ? 'true' : 'false')
    }

    function setShellListBusy(isBusy) {
        if (shellListHost) shellListHost.setAttribute('aria-busy', isBusy ? 'true' : 'false')
    }

    function renderShellRoster() {
        if (!shellListHost) return
        var sessions = shellState.sessions || []
        renderShellSummary()
        renderShellRecentCommands()
        if (!sessions.length) {
            shellListHost.innerHTML = '<p class="likecode-workspace-empty">当前还没有 shell 会话。先新建一个 shell，然后就可以按 Enter 发命令或点常用探针。</p>'
            return
        }
        shellListHost.innerHTML = sessions.map(function (session) {
            var active = session.session_id === shellState.activeId ? ' is-active' : ''
            var state = session.alive ? '' : ' is-done'
            var pressed = session.session_id === shellState.activeId ? 'true' : 'false'
            var title = session.session_id + (active ? ' · 当前会话' : '')
            var meta = (session.cwd || '—') + ' · pid ' + (session.pid || '—')
            var status = session.alive ? '状态: 就绪' : '状态: 已关闭'
            return (
                '<button type="button" class="likecode-workspace-checkitem' + active + state + '" data-shell-id="' + esc(session.session_id) + '" aria-pressed="' + pressed + '" aria-describedby="workspace-shell-active-route-text workspace-shell-roster-pulse-text" aria-controls="workspace-shell-action-target workspace-shell-action-state workspace-shell-output-meta workspace-shell-output">' +
                '<span class="likecode-workspace-checkitem__box">' + esc(session.alive ? '>' : 'x') + '</span>' +
                '<span class="likecode-workspace-checkitem__label">' +
                '<span class="likecode-workspace-shellitem__title">' + esc(title) + '</span>' +
                '<span class="likecode-workspace-shellitem__meta">' + esc(meta) + '</span>' +
                '<span class="likecode-workspace-shellitem__meta">' + esc(status) + '</span>' +
                '</span>' +
                '</button>'
            )
        }).join('')
        Array.prototype.slice.call(shellListHost.querySelectorAll('[data-shell-id]')).forEach(function (button) {
            button.addEventListener('click', function () {
                shellState.activeId = button.getAttribute('data-shell-id') || ''
                renderShellRoster()
                refreshShellOutput()
            })
        })
    }

    function focusFirstLiveShell() {
        var nextLive = (shellState.sessions || []).find(function (item) {
            return !!item.alive && item.session_id !== shellState.activeId
        })
        if (!nextLive) return
        shellState.activeId = nextLive.session_id
        renderShellRoster()
        setStatus(document.getElementById('workspace-shell-status'), '已切到存活会话: ' + nextLive.session_id, 'ready')
        refreshShellOutput()
    }

    function refreshShellOutput() {
        var active = activeShell()
        if (!active) {
            shellState.lastOutputSyncAt = ''
            shellState.lastOutputSyncFailedAt = ''
            setShellOutputBusy(false)
            renderShellSyncMeta()
            renderShellOutput(null)
            return Promise.resolve({ ok: false, skipped: true })
        }
        setShellOutputBusy(true)
        return fetchJson(relayBase() + '/api/shell/read?id=' + encodeURIComponent(active.session_id))
            .then(function (payload) {
                var session = payload.session || active
                shellState.sessions = (shellState.sessions || []).map(function (item) {
                    return item.session_id === session.session_id ? session : item
                })
                shellState.lastOutputSyncAt = shellTimeStamp()
                shellState.lastOutputSyncFailedAt = ''
                setShellOutputBusy(false)
                renderShellSummary()
                renderShellOutput(session)
                return { ok: true, session: session }
            })
            .catch(function (error) {
                shellState.lastOutputSyncAt = ''
                shellState.lastOutputSyncFailedAt = shellTimeStamp()
                setShellOutputBusy(false)
                renderShellSyncMeta()
                renderShellOutput({ buffer: '读取 shell 输出失败: ' + error.message })
                return { ok: false, error: error }
            })
    }

    function refreshShellOutputWithFeedback() {
        var statusEl = document.getElementById('workspace-shell-status')
        var active = activeShell()
        if (!active) {
            setStatus(statusEl, NO_ACTIVE_SHELL_STATUS, 'risk')
            setText('workspace-shell-preview', NO_ACTIVE_SHELL_PREVIEW)
            return Promise.resolve({ ok: false, skipped: true })
        }
        if (!active.alive) {
            setStatus(statusEl, CLOSED_SHELL_REFRESH_STATUS, 'risk')
            setText('workspace-shell-preview', CLOSED_SHELL_REFRESH_PREVIEW)
            return Promise.resolve({ ok: false, skipped: true })
        }
        setStatus(statusEl, '正在刷新当前输出', 'neutral')
        setText('workspace-shell-preview', '预览: 正在刷新当前输出 · ' + active.session_id)
        return refreshShellOutput().then(function (result) {
            if (!result || result.ok === false) {
                setStatus(statusEl, '输出刷新失败', 'risk')
                if (result && result.error) {
                    setText('workspace-shell-preview', '预览: 输出刷新错误 · ' + result.error.message)
                }
                return result
            }
            setStatus(statusEl, '当前输出已刷新', 'ready')
            setText('workspace-shell-preview', '预览: 当前输出已刷新 · ' + active.session_id)
            return result
        })
    }

    function refreshShells() {
        var statusEl = document.getElementById('workspace-shell-status')
        setStatus(statusEl, '正在同步 shell 会话', 'neutral')
        setShellListBusy(true)
        return fetchJson(relayBase() + '/api/shell/list')
            .then(function (payload) {
                shellState.sessions = payload.sessions || []
                if (!shellState.sessions.find(function (item) { return item.session_id === shellState.activeId })) {
                    shellState.activeId = shellState.sessions.length ? shellState.sessions[0].session_id : ''
                }
                setShellListBusy(false)
                renderShellRoster()
                setStatus(statusEl, 'shell 会话已同步', 'ready')
                return refreshShellOutput()
            })
            .catch(function (error) {
                shellState.sessions = []
                shellState.activeId = ''
                setShellListBusy(false)
                renderShellRoster()
                renderShellOutput(null)
                setStatus(statusEl, '同步失败', 'risk')
                setText('workspace-shell-preview', '预览: 同步错误 · ' + error.message)
            })
    }

    function createShellSeat() {
        var statusEl = document.getElementById('workspace-shell-status')
        setStatus(statusEl, '正在新建 shell', 'neutral')
        setShellListBusy(true)
        return fetchJson(relayBase() + '/api/shell/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        }).then(function (payload) {
            var session = payload.session || {}
            shellState.activeId = session.session_id || ''
            return refreshShells()
        }).catch(function (error) {
            setShellListBusy(false)
            setStatus(statusEl, '新建失败', 'risk')
            setText('workspace-shell-preview', '预览: 新建错误 · ' + error.message)
        })
    }

    function closeShellSeat() {
        var active = activeShell()
        if (!active) return
        var statusEl = document.getElementById('workspace-shell-status')
        setStatus(statusEl, '正在关闭当前 shell', 'neutral')
        setShellListBusy(true)
        return fetchJson(relayBase() + '/api/shell/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: active.session_id }),
        }).then(function () {
            shellState.activeId = ''
            return refreshShells()
        }).catch(function (error) {
            setShellListBusy(false)
            setStatus(statusEl, '关闭失败', 'risk')
            setText('workspace-shell-preview', '预览: 关闭错误 · ' + error.message)
        })
    }

    function sendShellCommand() {
        if (!shellCommandInput) return
        var command = shellCommandInput.value.trim()
        return dispatchShellCommand(command)
    }

    function dispatchShellCommand(command) {
        var active = activeShell()
        var statusEl = document.getElementById('workspace-shell-status')
        if (!active) {
            setStatus(statusEl, NO_ACTIVE_SHELL_STATUS, 'risk')
            setText('workspace-shell-preview', NO_ACTIVE_SHELL_PREVIEW)
            return
        }
        if (!active.alive) {
            setStatus(statusEl, CLOSED_SHELL_STATUS, 'risk')
            setText('workspace-shell-preview', CLOSED_SHELL_PREVIEW)
            return
        }
        if (!shellCommandInput) return
        command = String(command || '').trim()
        if (!command) {
            setStatus(statusEl, '命令为空', 'attention')
            setText('workspace-shell-preview', '预览: 请输入命令，或点击上方常用探针')
            return
        }
        setStatus(statusEl, '发送中: ' + command, 'neutral')
        setText('workspace-shell-preview', '预览: 发送到 ' + active.session_id + ' · ' + command)
        setShellOutputBusy(true)
        return fetchJson(relayBase() + '/api/shell/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: active.session_id,
                text: command + '\n',
            }),
        }).then(function () {
            setStatus(statusEl, '已发送: ' + command, 'ready')
            setText('workspace-shell-preview', '预览: 已发送到 ' + active.session_id + ' · 等待输出刷新')
            rememberShellCommand(command)
            shellState.lastCommandBySeat = Object.assign({}, shellState.lastCommandBySeat || {}, (function () {
                var patch = {}
                patch[active.session_id] = {
                    command: command,
                    at: shellTimeStamp(),
                }
                return patch
            })())
            persistShellContext(shellState.lastCommandBySeat)
            shellCommandInput.value = ''
            return refreshShellOutput()
        }).catch(function (error) {
            setShellOutputBusy(false)
            setStatus(statusEl, '发送失败: ' + command, 'risk')
            setText('workspace-shell-preview', '预览: 发送错误 · ' + error.message)
        })
    }

    function startConnectorQr() {
        return fetchJson(relayBase() + '/api/connector/qr/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target_dialog: connectorTargetInput ? connectorTargetInput.value.trim() : connectorState.target_dialog,
                note: connectorNoteInput ? (connectorNoteInput.value.trim() || 'local draft only') : connectorState.note,
            }),
        }).then(function (payload) {
            if (payload && payload.connector) updateConnectorState(payload.connector)
        }).catch(function (error) {
            setStatus(document.getElementById('workspace-connector-status'), 'qr start failed', 'risk')
            setText('workspace-connector-qr-preview', 'qr error: ' + error.message)
        })
    }

    function waitConnectorQr() {
        return fetchJson(relayBase() + '/api/connector/qr/wait', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_key: connectorState.session_key || '',
            }),
        }).then(function (payload) {
            if (payload && payload.connector) updateConnectorState(payload.connector)
        }).catch(function (error) {
            setStatus(document.getElementById('workspace-connector-status'), 'qr wait failed', 'risk')
            setText('workspace-connector-qr-preview', 'qr error: ' + error.message)
        })
    }

    function checkConnectorGuardrail() {
        return fetchJson(relayBase() + '/api/connector/bridge/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        }).then(function (payload) {
            var decision = payload && payload.decision
            renderGuardDecision(decision)
        }).catch(function (error) {
            setText('workspace-connector-guard-decision', 'decision error: ' + error.message)
            setStatus(document.getElementById('workspace-connector-status'), 'guardrail check failed', 'risk')
        })
    }

    function parseChecklist(text) {
        return String(text || '')
            .split('\n')
            .map(function (line, index) {
                var match = line.match(/^(\s*)- \[([ xX])\] (.+)$/)
                if (!match) return null
                return {
                    lineIndex: index,
                    indent: match[1] || '',
                    checked: match[2].toLowerCase() === 'x',
                    label: match[3] || '',
                }
            })
            .filter(Boolean)
    }

    function todayStamp() {
        var now = new Date()
        var year = now.getFullYear()
        var month = String(now.getMonth() + 1).padStart(2, '0')
        var day = String(now.getDate()).padStart(2, '0')
        return year + '-' + month + '-' + day
    }

    function evolutionFilename(task) {
        if (!task) return '.claude/plans/loloop/evolution-' + todayStamp() + '-note.md'
        return '.claude/plans/loloop/evolution-' + todayStamp() + '-' + String(task.slug || 'task-note') + '.md'
    }

    function evolutionTemplate(task) {
        var title = ((task || {}).plan || {}).title || (task || {}).headline || 'task'
        var planPath = (task || {}).plan_path || '.claude/plans/loloop/active-*.md'
        return [
            '# ' + evolutionFilename(task).split('/').pop(),
            '',
            '## Plan',
            '',
            '- path: `' + planPath + '`',
            '- bounded target: ',
            '',
            '## Completed',
            '',
            '- ',
            '',
            '## Failed or Deferred',
            '',
            '- ',
            '',
            '## Decisions',
            '',
            '- active task: `' + title + '`',
            '- ',
            '',
            '## Next Handoff',
            '',
            '```text',
            'Use codex-loop to continue the active plan at ' + planPath + '.',
            '```',
            '',
        ].join('\n')
    }

    function renderChecklist() {
        if (!checklistHost) return
        var items = parseChecklist(planEditor.value)
        var done = items.filter(function (item) { return item.checked }).length
        setText('workspace-checklist-meta', done + ' / ' + items.length + ' done')
        if (!items.length) {
            checklistHost.innerHTML = '<p class="likecode-workspace-empty">当前 plan 里没有可解析的 `- [ ]` / `- [x]` 任务。</p>'
            return
        }
        checklistHost.innerHTML = items.map(function (item) {
            return (
                '<button type="button" class="likecode-workspace-checkitem' + (item.checked ? ' is-done' : '') + '" data-line-index="' + esc(item.lineIndex) + '">' +
                '<span class="likecode-workspace-checkitem__box">' + esc(item.checked ? '✓' : '') + '</span>' +
                '<span class="likecode-workspace-checkitem__label">' + esc(item.label) + '</span>' +
                '</button>'
            )
        }).join('')

        Array.prototype.slice.call(checklistHost.querySelectorAll('[data-line-index]')).forEach(function (button) {
            button.addEventListener('click', function () {
                var lineIndex = Number(button.getAttribute('data-line-index'))
                toggleChecklistLine(lineIndex)
            })
        })
    }

    function toggleChecklistLine(lineIndex) {
        var lines = String(planEditor.value || '').split('\n')
        if (!lines[lineIndex]) return
        if (/\[ \]/.test(lines[lineIndex])) {
            lines[lineIndex] = lines[lineIndex].replace('[ ]', '[x]')
        } else if (/\[[xX]\]/.test(lines[lineIndex])) {
            lines[lineIndex] = lines[lineIndex].replace(/\[[xX]\]/, '[ ]')
        } else {
            return
        }
        planEditor.value = lines.join('\n')
        renderChecklist()
        setStatus(planStatus, 'edited', 'neutral')
    }

    function fetchJson(url, options) {
        return fetch(url, options).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status)
            return response.json()
        })
    }

    function setHref(id, href) {
        var el = document.getElementById(id)
        if (el && href) el.href = href
    }

    function setLinkState(id, href, fallbackText) {
        var el = document.getElementById(id)
        if (!el) return
        if (href) {
            el.href = href
            el.removeAttribute('aria-disabled')
            el.classList.remove('is-disabled')
        } else {
            el.href = '#'
            el.setAttribute('aria-disabled', 'true')
            el.classList.add('is-disabled')
        }
        if (fallbackText) el.textContent = fallbackText
    }

    function applyWorkspaceMeta(meta) {
        workspaceMeta = meta || {}
        document.title = (workspaceMeta.shell_title || 'Workspace Shell') + '（本地）'
        setText('workspace-brand-eyebrow', workspaceMeta.shell_eyebrow || 'Codex Loop Workspace')
        setText('workspace-brand-title', workspaceMeta.shell_title || '任务池 + 计划编辑 + Runtime 同屏')
        setText('workspace-brand-summary', workspaceMeta.shell_summary || '本地 workspace shell')
        setText('workspace-runtime-note', 'workspace: ' + (workspaceMeta.workspace_root || '—'))
        setText('workspace-meta-name', 'workspace: ' + (workspaceMeta.workspace_name || '—'))
        setText('workspace-meta-root', workspaceMeta.workspace_root || '—')
        setText('workspace-meta-site-base', workspaceMeta.site_base_url || '—')
        setText('workspace-meta-task-board', workspaceMeta.task_board_path || '—')
        setText('workspace-meta-site-root', workspaceMeta.site_root || '—')
        setText('workspace-meta-config', workspaceMeta.config_path || '—')
        setText('workspace-meta-edit-roots', (workspaceMeta.allowed_edit_roots || []).join(' , ') || '—')
        setText('workspace-meta-edit-files', (workspaceMeta.allowed_edit_files || []).join(' , ') || '—')
        setLinkState('workspace-meta-site-link', workspaceMeta.site_base_url || '', 'Pages Base')
        setLinkState('workspace-meta-repo-link', workspaceMeta.github_repo_url || '', 'Repo')
        setLinkState('workspace-meta-blob-link', workspaceMeta.github_blob_base || '', 'Blob Base')

        var links = workspaceMeta.links || {}
        setHref('workspace-link-task-board', links.task_board || 'topic-loop-task-board.html')
        setHref('workspace-link-monitor', links.monitor || 'topic-codex-loop-console.html')
        setHref('workspace-link-home', links.home || 'index.html')
    }

    function stateTone(state) {
        if (state === 'active') return 'ready'
        if (state === 'done') return 'done'
        if (state === 'deferred') return 'attention'
        if (state === 'blocked') return 'risk'
        return 'neutral'
    }

    function filteredTasks() {
        var query = String((taskSearch.value || '')).toLowerCase().trim()
        var recurring = (taskPayload && taskPayload.recurring) || []
        return recurring.filter(function (task) {
            if (!query) return true
            return String(task.search_text || '').toLowerCase().indexOf(query) !== -1
        }).sort(function (a, b) {
            var aDaemon = a.id === daemonTaskId ? 0 : 1
            var bDaemon = b.id === daemonTaskId ? 0 : 1
            if (aDaemon !== bDaemon) return aDaemon - bDaemon
            var aState = a.state === 'active' ? 0 : 1
            var bState = b.state === 'active' ? 0 : 1
            if (aState !== bState) return aState - bState
            var aProgress = typeof (a.plan || {}).progress === 'number' ? a.plan.progress : -1
            var bProgress = typeof (b.plan || {}).progress === 'number' ? b.plan.progress : -1
            if (bProgress !== aProgress) return bProgress - aProgress
            return (a.id || 0) - (b.id || 0)
        })
    }

    function renderTaskList() {
        var tasks = filteredTasks()
        setText('workspace-task-count', tasks.length)
        if (!tasks.length) {
            taskList.innerHTML = '<p class="likecode-workspace-empty">没有匹配到任务。</p>'
            return
        }
        taskList.innerHTML = tasks.map(function (task) {
            var active = activeTask && activeTask.id === task.id ? ' is-active' : ''
            var daemon = daemonTaskId === task.id ? ' is-daemon' : ''
            var plan = task.plan || {}
            return (
                '<button type="button" class="likecode-workspace-task' + active + daemon + '" data-task-id="' + esc(task.id) + '">' +
                '<span class="likecode-workspace-task__topline">' +
                '<span>Task ' + esc(task.id) + '</span>' +
                '<span class="likecode-workspace-task__badges">' +
                '<span class="likecode-workspace-badge likecode-workspace-badge--' + esc(stateTone(task.state)) + '">' + esc(plan.status || task.state) + '</span>' +
                (daemonTaskId === task.id ? '<span class="likecode-workspace-badge likecode-workspace-badge--attention">daemon</span>' : '') +
                '</span>' +
                '</span>' +
                '<strong>' + esc(plan.title || task.headline) + '</strong>' +
                '<span class="likecode-workspace-task__goal">' + esc(plan.goal || task.headline) + '</span>' +
                '</button>'
            )
        }).join('')

        Array.prototype.slice.call(taskList.querySelectorAll('[data-task-id]')).forEach(function (button) {
            button.addEventListener('click', function () {
                var id = Number(button.getAttribute('data-task-id'))
                var task = ((taskPayload && taskPayload.recurring) || []).find(function (item) { return item.id === id })
                if (task) selectTask(task)
            })
        })
    }

    function renderTaskSummary(task) {
        activeTask = task
        renderTaskList()
        var plan = task.plan || {}
        setText('workspace-active-title', plan.title || task.headline)
        setText('workspace-active-goal', plan.goal || task.headline)
        setText('workspace-active-state', plan.status || task.state)
        setText('workspace-active-progress', typeof plan.progress === 'number' ? ('progress ' + plan.progress + '%') : 'progress --')
        document.getElementById('workspace-active-state').className = 'likecode-workspace-badge likecode-workspace-badge--' + stateTone(task.state)
        document.getElementById('workspace-active-progress').className = 'likecode-workspace-badge likecode-workspace-badge--neutral'
        var linksHost = document.getElementById('workspace-topic-links')
        linksHost.innerHTML = ''
        ;(task.topic_links || []).forEach(function (link) {
            linksHost.innerHTML += '<a href="' + esc(link.live_href || link.href) + '" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Live</a>'
            linksHost.innerHTML += '<a href="' + esc(link.blob_href || link.href) + '" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Topic Blob</a>'
        })
        if (task.plan_href) {
            linksHost.innerHTML += '<a href="' + esc(task.plan_href) + '" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Plan Blob</a>'
        }
        if (task.latest_evolution && task.latest_evolution.href) {
            linksHost.innerHTML += '<a href="' + esc(task.latest_evolution.href) + '" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Evolution Blob</a>'
        }
        setText('workspace-evolution-name', task.latest_evolution ? task.latest_evolution.name : '暂无 evolution')
        setText('workspace-evolution-summary', task.latest_evolution ? (task.latest_evolution.summary || '暂无摘要。') : '还没有 evolution 摘要。')
        resetEvolutionDraft(task)
    }

    function inferDaemonTask(status) {
        var preview = String((status || {}).last_message_preview || '')
        var match = preview.match(/Task\s+(\d+)/)
        if (!match) return null
        var id = Number(match[1])
        return ((taskPayload && taskPayload.recurring) || []).find(function (task) { return task.id === id }) || null
    }

    function renderDaemonTask(status) {
        var task = inferDaemonTask(status)
        daemonTaskId = task ? task.id : null
        if (task) {
            setText('workspace-daemon-task', 'daemon task: Task ' + task.id + ' · ' + ((task.plan || {}).title || task.headline))
            daemonJump.disabled = false
        } else {
            setText('workspace-daemon-task', 'daemon task: unavailable')
            daemonJump.disabled = true
        }
        renderTaskList()
    }

    function loadPlan(task) {
        if (!task || !task.plan_path) return
        setStatus(planStatus, 'loading', 'neutral')
        fetchJson(relayBase() + '/api/plan/read?path=' + encodeURIComponent(task.plan_path))
            .then(function (payload) {
                planEditor.value = payload.text || ''
                renderChecklist()
                setText('workspace-plan-path', payload.path || task.plan_path)
                setText('workspace-plan-updated', 'updated: ' + (payload.updated_at || 'unknown'))
                setStatus(planStatus, 'loaded', 'ready')
            })
            .catch(function (error) {
                setStatus(planStatus, 'load failed', 'risk')
                setText('workspace-plan-updated', 'error: ' + error.message)
            })
    }

    function selectTask(task) {
        renderTaskSummary(task)
        loadPlan(task)
    }

    function resetEvolutionDraft(task) {
        var target = task || activeTask
        if (!target) return
        evolutionPath.value = evolutionFilename(target)
        evolutionEditor.value = evolutionTemplate(target)
        setStatus(evolutionStatus, 'drafted', 'neutral')
        setText('workspace-evolution-updated', 'updated: local draft')
    }

    function refreshRuntime() {
        setStatus(runtimeStatus, 'loading', 'neutral')
        fetchJson(relayBase() + '/api/status')
            .then(function (payload) {
                setText('workspace-daemon-running', payload.daemon_running ? 'running' : 'stopped')
                setText('workspace-daemon-pid', payload.pid || '—')
                setText('workspace-thread-id', payload.thread_id || '—')
                setText('workspace-last-tick', ((payload.last_tick || {}).finished_at) || ((payload.last_tick || {}).started_at) || '—')
                setText('workspace-thread-lock', ((payload.thread_lock || {}).mode) || '—')
                setText('workspace-runtime-workspace', ((payload.last_tick || {}).workspace) || '—')
                renderDaemonTask(payload)
                setStatus(runtimeStatus, 'synced', 'ready')
            })
            .catch(function (error) {
                setStatus(runtimeStatus, 'sync failed', 'risk')
                setText('workspace-runtime-workspace', error.message)
                setText('workspace-daemon-task', 'daemon task: unavailable')
                daemonJump.disabled = true
            })
    }

    function refreshLog(mode) {
        currentLogMode = mode || currentLogMode
        syncLogModeButtons()
        var logOutput = document.getElementById('workspace-log-output')
        var path = '/api/logs/latest?lines=160'
        if (currentLogMode === 'daemon') path = '/api/logs/daemon?lines=160'
        if (currentLogMode === 'message') path = '/api/last-message?lines=160'
        if (logOutput) logOutput.setAttribute('aria-busy', 'true')
        fetchJson(relayBase() + path)
            .then(function (payload) {
                setText('workspace-log-label', currentLogMode === 'daemon' ? 'daemon log' : (currentLogMode === 'message' ? 'last message' : 'latest tick'))
                setText('workspace-log-path', 'path: ' + (payload.path || '—'))
                if (logOutput) {
                    logOutput.textContent = payload.text || '(empty)'
                    logOutput.setAttribute('aria-busy', 'false')
                }
            })
            .catch(function (error) {
                if (logOutput) {
                    logOutput.textContent = 'log load failed: ' + error.message
                    logOutput.setAttribute('aria-busy', 'false')
                }
            })
    }

    function loadTasks() {
        return fetchJson(relayBase() + '/api/task-board')
            .then(function (payload) {
                taskPayload = payload.task_board || payload
                renderTaskList()
                var current = activeTask
                if (current) {
                    var refreshed = (((taskPayload || {}).recurring || []).find(function (item) { return item.id === current.id }))
                    if (refreshed) {
                        renderTaskSummary(refreshed)
                    }
                } else if (((taskPayload || {}).recurring || []).length) {
                    selectTask(filteredTasks()[0] || taskPayload.recurring[0])
                }
            })
    }

    function loadWorkspaceMeta() {
        return fetchJson(relayBase() + '/api/workspace/meta')
            .then(function (payload) {
                applyWorkspaceMeta(payload.meta || {})
            })
            .catch(function () {})
    }

    function savePlan() {
        if (!activeTask || !activeTask.plan_path) return
        setStatus(planStatus, 'saving', 'neutral')
        fetchJson(relayBase() + '/api/plan/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: activeTask.plan_path,
                text: planEditor.value,
            }),
        }).then(function (payload) {
            setStatus(planStatus, 'saved', 'ready')
            setText('workspace-plan-updated', 'updated: ' + (payload.updated_at || 'unknown'))
            renderChecklist()
        }).catch(function (error) {
            setStatus(planStatus, 'save failed', 'risk')
            setText('workspace-plan-updated', 'error: ' + error.message)
        })
    }

    function saveEvolution() {
        if (!evolutionPath.value.trim()) return
        setStatus(evolutionStatus, 'saving', 'neutral')
        fetchJson(relayBase() + '/api/plan/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: evolutionPath.value.trim(),
                text: evolutionEditor.value,
            }),
        }).then(function (payload) {
            setStatus(evolutionStatus, 'saved', 'ready')
            setText('workspace-evolution-updated', 'updated: ' + (payload.updated_at || 'unknown'))
        }).catch(function (error) {
            setStatus(evolutionStatus, 'save failed', 'risk')
            setText('workspace-evolution-updated', 'error: ' + error.message)
        })
    }

    document.getElementById('workspace-refresh').addEventListener('click', function () {
        loadTasks()
        refreshRuntime()
        refreshLog(currentLogMode)
        refreshShells()
    })
    document.getElementById('workspace-runtime-refresh').addEventListener('click', function () {
        refreshRuntime()
        refreshLog(currentLogMode)
        refreshShells()
    })
    document.getElementById('workspace-shell-refresh').addEventListener('click', refreshShells)
    document.getElementById('workspace-shell-refresh-output').addEventListener('click', refreshShellOutputWithFeedback)
    document.getElementById('workspace-shell-create').addEventListener('click', createShellSeat)
    document.getElementById('workspace-shell-focus-live').addEventListener('click', focusFirstLiveShell)
    document.getElementById('workspace-shell-close').addEventListener('click', closeShellSeat)
    document.getElementById('workspace-shell-send').addEventListener('click', sendShellCommand)
    shellCommandInput.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
        event.preventDefault()
        sendShellCommand()
    })
    document.getElementById('workspace-shell-preset-pwd').addEventListener('click', function () { dispatchShellCommand('pwd') })
    document.getElementById('workspace-shell-preset-ls').addEventListener('click', function () { dispatchShellCommand('ls') })
    document.getElementById('workspace-shell-preset-git').addEventListener('click', function () { dispatchShellCommand('git status') })
    document.getElementById('workspace-shell-preset-python').addEventListener('click', function () { dispatchShellCommand('python -V') })
    document.getElementById('workspace-shell-clear-memory').addEventListener('click', clearShellMemory)
    document.getElementById('workspace-log-daemon').addEventListener('click', function () { refreshLog('daemon') })
    document.getElementById('workspace-log-tick').addEventListener('click', function () { refreshLog('latest') })
    document.getElementById('workspace-log-message').addEventListener('click', function () { refreshLog('message') })
    planSave.addEventListener('click', savePlan)
    document.getElementById('workspace-evolution-save').addEventListener('click', saveEvolution)
    document.getElementById('workspace-evolution-reset').addEventListener('click', function () { resetEvolutionDraft(activeTask) })
    daemonJump.addEventListener('click', function () {
        if (!daemonTaskId || !taskPayload) return
        var task = (taskPayload.recurring || []).find(function (item) { return item.id === daemonTaskId })
        if (task) selectTask(task)
    })
    taskSearch.addEventListener('input', renderTaskList)
    planEditor.addEventListener('input', function () {
        renderChecklist()
        setStatus(planStatus, 'edited', 'neutral')
    })
    evolutionEditor.addEventListener('input', function () {
        setStatus(evolutionStatus, 'edited', 'neutral')
    })
    evolutionPath.addEventListener('input', function () {
        setStatus(evolutionStatus, 'edited', 'neutral')
    })
    if (connectorTargetInput) {
        connectorTargetInput.addEventListener('input', function () {
            saveConnectorState({ target_dialog: connectorTargetInput.value.trim() })
        })
    }
    if (connectorNoteInput) {
        connectorNoteInput.addEventListener('input', function () {
            saveConnectorState({ note: connectorNoteInput.value.trim() || 'local draft only' })
        })
    }
    if (connectorBridgeTargetInput) {
        connectorBridgeTargetInput.addEventListener('input', function () {
            saveConnectorState({ bridge_target: connectorBridgeTargetInput.value.trim() || 'workspace' })
        })
    }
    document.getElementById('workspace-connector-qr').addEventListener('click', function () {
        startConnectorQr()
    })
    document.getElementById('workspace-connector-wait').addEventListener('click', function () {
        waitConnectorQr()
    })
    document.getElementById('workspace-connector-bound').addEventListener('click', function () {
        saveConnectorState({
            shell_mode: 'adapter-draft',
            bind_state: 'bound',
            login_status: 'bound',
        })
    })
    document.getElementById('workspace-connector-reset').addEventListener('click', function () {
        connectorState = {
            shell_mode: 'ui-shell',
            bind_state: 'unbound',
            target_dialog: '',
            note: 'local draft only',
            session_key: '',
            qrcode_content: '',
            login_status: 'idle',
            runtime_mode: 'mock-flow',
            runtime_owner: 'workspace-shell',
            write_policy: 'local-draft',
            bridge_mode: 'queue-ticket',
            bridge_target: 'workspace',
            bridge_policy: 'daemon-safe',
            bridge_status: 'draft',
            bridge_lock_rule: 'daemon-holds-thread',
            delivery_guardrail: 'queue-only',
        }
        persistConnectorState()
        renderConnectorShell()
        saveConnectorState(connectorState)
    })
    document.getElementById('workspace-connector-lane-mock').addEventListener('click', function () {
        saveConnectorState({
            runtime_mode: 'mock-flow',
            runtime_owner: 'workspace-shell',
            write_policy: 'local-draft',
            bridge_mode: 'queue-ticket',
            bridge_target: (connectorBridgeTargetInput && connectorBridgeTargetInput.value.trim()) || 'workspace',
            bridge_policy: 'daemon-safe',
            bridge_status: 'draft',
            bridge_lock_rule: 'daemon-holds-thread',
            delivery_guardrail: 'queue-only',
            note: (connectorNoteInput && connectorNoteInput.value.trim()) || 'mock QR stays inside workspace shell',
        })
    })
    document.getElementById('workspace-connector-lane-adapter').addEventListener('click', function () {
        saveConnectorState({
            runtime_mode: 'adapter-flow',
            runtime_owner: 'relay-adapter',
            write_policy: 'single-thread-bind',
            shell_mode: 'adapter-draft',
            bridge_mode: 'task-handoff',
            bridge_target: (connectorBridgeTargetInput && connectorBridgeTargetInput.value.trim()) || 'task:pending',
            bridge_policy: 'ticket-first',
            bridge_status: 'planned',
            bridge_lock_rule: 'manual-unlock-before-inject',
            delivery_guardrail: 'operator-ack',
            note: (connectorNoteInput && connectorNoteInput.value.trim()) || 'adapter flow owns protocol translation but not external delivery yet',
        })
    })
    document.getElementById('workspace-connector-lane-runtime').addEventListener('click', function () {
        saveConnectorState({
            runtime_mode: 'external-runtime',
            runtime_owner: 'connector-runtime',
            write_policy: 'queue-gated',
            bridge_mode: 'queue-ticket',
            bridge_target: (connectorBridgeTargetInput && connectorBridgeTargetInput.value.trim()) || 'inbox:wechat',
            bridge_policy: 'runtime-locked',
            bridge_status: 'guarded',
            bridge_lock_rule: 'runtime-readonly-when-daemon-active',
            delivery_guardrail: 'queue-gated',
            note: (connectorNoteInput && connectorNoteInput.value.trim()) || 'external runtime should sit behind queue or delivery gates',
        })
    })
    document.getElementById('workspace-connector-bridge-queue').addEventListener('click', function () {
        saveConnectorState({
            bridge_mode: 'queue-ticket',
            bridge_target: (connectorBridgeTargetInput && connectorBridgeTargetInput.value.trim()) || 'workspace',
            bridge_policy: 'daemon-safe',
            bridge_status: 'draft',
            bridge_lock_rule: 'daemon-holds-thread',
            delivery_guardrail: 'queue-only',
        })
    })
    document.getElementById('workspace-connector-bridge-thread').addEventListener('click', function () {
        saveConnectorState({
            bridge_mode: 'thread-inject',
            bridge_target: (connectorBridgeTargetInput && connectorBridgeTargetInput.value.trim()) || 'thread:pending',
            bridge_policy: 'single-thread-bind',
            bridge_status: 'risky',
            bridge_lock_rule: 'manual-unlock-before-inject',
            delivery_guardrail: 'operator-ack',
        })
    })
    document.getElementById('workspace-connector-bridge-task').addEventListener('click', function () {
        saveConnectorState({
            bridge_mode: 'task-handoff',
            bridge_target: (connectorBridgeTargetInput && connectorBridgeTargetInput.value.trim()) || 'task:pending',
            bridge_policy: 'ticket-first',
            bridge_status: 'planned',
            bridge_lock_rule: 'daemon-holds-thread',
            delivery_guardrail: 'queue-only',
        })
    })
    document.getElementById('workspace-connector-guard-queue').addEventListener('click', function () {
        saveConnectorState({
            bridge_lock_rule: 'daemon-holds-thread',
            delivery_guardrail: 'queue-only',
            bridge_policy: 'daemon-safe',
            bridge_status: 'draft',
        })
    })
    document.getElementById('workspace-connector-guard-lock').addEventListener('click', function () {
        saveConnectorState({
            bridge_lock_rule: 'manual-unlock-before-inject',
            delivery_guardrail: 'operator-ack',
            bridge_policy: 'single-thread-bind',
            bridge_status: 'guarded',
        })
    })
    document.getElementById('workspace-connector-guard-runtime').addEventListener('click', function () {
        saveConnectorState({
            bridge_lock_rule: 'runtime-readonly-when-daemon-active',
            delivery_guardrail: 'queue-gated',
            bridge_policy: 'runtime-locked',
            bridge_status: 'guarded',
        })
    })
    document.getElementById('workspace-connector-guard-check').addEventListener('click', function () {
        checkConnectorGuardrail()
    })

    shellState.recentCommands = loadShellRecentCommands()
    shellState.lastCommandBySeat = normalizeShellContext(loadShellContext())
    renderShellRecentCommands()
    loadConnectorState()
    renderConnectorShell()
    fetchConnectorState()
    renderGuardDecision(null)
    loadWorkspaceMeta().then(loadTasks).catch(loadTasks)
    refreshRuntime()
    refreshLog('latest')
    refreshShells()
})()
