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
    var activeTask = null
    var taskPayload = null
    var currentLogMode = 'latest'
    var daemonTaskId = null
    var workspaceMeta = null
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
    }
    var CONNECTOR_STATE_KEY = 'likecode_workspace_connector_shell_v1'

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

    function renderConnectorShell() {
        setText('workspace-connector-mode', connectorState.shell_mode || 'ui-shell')
        setText('workspace-connector-bind-state', connectorState.bind_state || 'unbound')
        setText('workspace-connector-target', connectorState.target_dialog || '--')
        setText('workspace-connector-login-status', connectorState.login_status || 'idle')
        setText('workspace-connector-session-key', connectorState.session_key || '--')
        setText('workspace-connector-runtime-mode', connectorState.runtime_mode || 'mock-flow')
        setText('workspace-connector-runtime-owner', connectorState.runtime_owner || 'workspace-shell')
        setText('workspace-connector-write-policy', connectorState.write_policy || 'local-draft')
        if (connectorTargetInput) connectorTargetInput.value = connectorState.target_dialog || ''
        if (connectorNoteInput) connectorNoteInput.value = connectorState.note || ''
        setStatus(
            document.getElementById('workspace-connector-status'),
            (connectorState.shell_mode || 'ui-shell') + ' / ' + (connectorState.login_status || connectorState.bind_state || 'idle'),
            connectorTone(connectorState.bind_state)
        )
        setText('workspace-connector-note-preview', 'note: ' + (connectorState.note || 'local draft only'))
        setText('workspace-connector-qr-preview', 'qr: ' + (connectorState.qrcode_content || '--'))
        setText('workspace-connector-runtime-preview', 'lane: ' + connectorRuntimePreview(connectorState))
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

    function applyWorkspaceMeta(meta) {
        workspaceMeta = meta || {}
        document.title = (workspaceMeta.shell_title || 'Workspace Shell') + '（本地）'
        setText('workspace-brand-eyebrow', workspaceMeta.shell_eyebrow || 'Codex Loop Workspace')
        setText('workspace-brand-title', workspaceMeta.shell_title || '任务池 + 计划编辑 + Runtime 同屏')
        setText('workspace-brand-summary', workspaceMeta.shell_summary || '本地 workspace shell')
        setText('workspace-runtime-note', 'workspace: ' + (workspaceMeta.workspace_root || '—'))

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
        var path = '/api/logs/latest?lines=160'
        if (currentLogMode === 'daemon') path = '/api/logs/daemon?lines=160'
        if (currentLogMode === 'message') path = '/api/last-message?lines=160'
        fetchJson(relayBase() + path)
            .then(function (payload) {
                setText('workspace-log-label', currentLogMode === 'daemon' ? 'daemon log' : (currentLogMode === 'message' ? 'last message' : 'latest tick'))
                setText('workspace-log-path', 'path: ' + (payload.path || '—'))
                document.getElementById('workspace-log-output').textContent = payload.text || '(empty)'
            })
            .catch(function (error) {
                document.getElementById('workspace-log-output').textContent = 'log load failed: ' + error.message
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
    })
    document.getElementById('workspace-runtime-refresh').addEventListener('click', function () {
        refreshRuntime()
        refreshLog(currentLogMode)
    })
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
            note: (connectorNoteInput && connectorNoteInput.value.trim()) || 'mock QR stays inside workspace shell',
        })
    })
    document.getElementById('workspace-connector-lane-adapter').addEventListener('click', function () {
        saveConnectorState({
            runtime_mode: 'adapter-flow',
            runtime_owner: 'relay-adapter',
            write_policy: 'single-thread-bind',
            shell_mode: 'adapter-draft',
            note: (connectorNoteInput && connectorNoteInput.value.trim()) || 'adapter flow owns protocol translation but not external delivery yet',
        })
    })
    document.getElementById('workspace-connector-lane-runtime').addEventListener('click', function () {
        saveConnectorState({
            runtime_mode: 'external-runtime',
            runtime_owner: 'connector-runtime',
            write_policy: 'queue-gated',
            note: (connectorNoteInput && connectorNoteInput.value.trim()) || 'external runtime should sit behind queue or delivery gates',
        })
    })

    loadConnectorState()
    renderConnectorShell()
    fetchConnectorState()
    loadWorkspaceMeta().then(loadTasks).catch(loadTasks)
    refreshRuntime()
    refreshLog('latest')
})()
