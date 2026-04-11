;(function () {
    var root = document.getElementById('codex-loop-console')
    if (!root) return

    var STORAGE_KEY = 'codex-loop-console-layout-v3'
    var relayInput = document.getElementById('relay-url')
    var threadInput = document.getElementById('thread-id')
    var messageInput = document.getElementById('thread-message')
    var sendBtn = document.getElementById('thread-send')
    var forceInput = document.getElementById('thread-force')
    var sendStatus = document.getElementById('thread-send-status')
    var lockStatus = document.getElementById('thread-lock-status')
    var lastTickPath = document.getElementById('last-tick-path')
    var daemonPath = document.getElementById('daemon-log-path')
    var heartbeatBadge = document.getElementById('heartbeat-badge')
    var tickBadge = document.getElementById('tick-badge')
    var daemonControlStatus = document.getElementById('daemon-control-status')
    var canvas = root.querySelector('.codex-console-canvas')
    var monitorTemplate = document.getElementById('monitor-pane-template')
    var monitorCounter = 1
    var currentWorkspace = 'overview'
    var lastData = { daemonLog: '', tickLog: '', lastMessage: '' }
    var shellState = { sessions: [], activeId: '' }
    var es = null

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
    }

    function relayBase() {
        return (relayInput.value || 'http://127.0.0.1:8770').replace(/\/+$/, '')
    }

    function setText(id, text) {
        var el = document.getElementById(id)
        if (el) el.textContent = text || ''
    }

    function setHtml(id, text) {
        var el = document.getElementById(id)
        if (el) el.innerHTML = esc(text || '')
    }

    function fetchJson(path, options) {
        return fetch(relayBase() + path, options).then(function (r) {
            return r.json().then(function (data) {
                if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status))
                return data
            })
        })
    }

    function allPanels() {
        return Array.prototype.slice.call(root.querySelectorAll('.codex-console-panel'))
    }

    function syncMonitorCounter() {
        allPanels().forEach(function (panel) {
            var id = panel.dataset.panelId || ''
            var match = id.match(/^monitor-(\d+)$/)
            if (match) monitorCounter = Math.max(monitorCounter, Number(match[1]))
        })
    }

    function bumpPanel(panel) {
        var maxZ = 20
        allPanels().forEach(function (item) {
            maxZ = Math.max(maxZ, Number(item.style.zIndex || 20))
        })
        panel.style.zIndex = String(maxZ + 1)
    }

    function panelDrag(panel) {
        if (panel.dataset.bound === 'true') return
        panel.dataset.bound = 'true'

        var handle = panel.querySelector('.codex-console-panel__head')
        var resize = panel.querySelector('.codex-console-panel__resize')
        var mode = null
        var startX = 0
        var startY = 0
        var startLeft = 0
        var startTop = 0
        var startWidth = 0
        var startHeight = 0

        function onMove(ev) {
            if (!mode) return
            var dx = ev.clientX - startX
            var dy = ev.clientY - startY
            if (mode === 'drag') {
                var left = Math.max(0, Math.min(canvas.clientWidth - 220, startLeft + dx))
                var top = Math.max(0, Math.min(canvas.clientHeight - 140, startTop + dy))
                panel.style.left = left + 'px'
                panel.style.top = top + 'px'
            } else if (mode === 'resize') {
                panel.style.width = Math.max(280, startWidth + dx) + 'px'
                panel.style.height = Math.max(180, startHeight + dy) + 'px'
            }
        }

        function onUp() {
            mode = null
            document.removeEventListener('pointermove', onMove)
            document.removeEventListener('pointerup', onUp)
            saveLayout()
        }

        function begin(ev, nextMode) {
            mode = nextMode
            startX = ev.clientX
            startY = ev.clientY
            startLeft = panel.offsetLeft
            startTop = panel.offsetTop
            startWidth = panel.offsetWidth
            startHeight = panel.offsetHeight
            bumpPanel(panel)
            document.addEventListener('pointermove', onMove)
            document.addEventListener('pointerup', onUp)
            ev.preventDefault()
        }

        panel.addEventListener('pointerdown', function () {
            bumpPanel(panel)
        })

        handle.addEventListener('pointerdown', function (ev) {
            if (ev.target.closest('button,select,input,textarea')) return
            begin(ev, 'drag')
        })

        if (resize) {
            resize.addEventListener('pointerdown', function (ev) {
                begin(ev, 'resize')
            })
        }
    }

    function monitorTextFor(source) {
        if (source === 'tick') return lastData.tickLog
        if (source === 'last-message') return lastData.lastMessage
        return lastData.daemonLog
    }

    function updateMonitorPane(panel) {
        var select = panel.querySelector('[data-monitor-select]')
        var output = panel.querySelector('[data-monitor-output]')
        if (!select || !output) return
        panel.dataset.monitorSource = select.value
        output.innerHTML = esc(monitorTextFor(select.value) || 'waiting…')
    }

    function bindMonitorPane(panel) {
        var select = panel.querySelector('[data-monitor-select]')
        var removeBtn = panel.querySelector('[data-pane-remove]')
        if (select && select.dataset.bound !== 'true') {
            select.dataset.bound = 'true'
            select.value = panel.dataset.monitorSource || select.value
            select.addEventListener('change', function () {
                updateMonitorPane(panel)
                saveLayout()
            })
        }
        if (removeBtn && removeBtn.dataset.bound !== 'true') {
            removeBtn.dataset.bound = 'true'
            removeBtn.addEventListener('click', function () {
                panel.remove()
                saveLayout()
            })
        }
        panelDrag(panel)
        updateMonitorPane(panel)
    }

    function refreshMonitorPanes() {
        Array.prototype.slice.call(root.querySelectorAll('.codex-console-panel--monitor')).forEach(updateMonitorPane)
    }

    function panelState(panel) {
        return {
            panelId: panel.dataset.panelId || '',
            monitorSource: panel.dataset.monitorSource || '',
            workspaceGroup: panel.dataset.workspaceGroup || '',
            left: panel.style.left || '',
            top: panel.style.top || '',
            width: panel.style.width || '',
            height: panel.style.height || '',
            zIndex: panel.style.zIndex || '',
            html: panel.classList.contains('codex-console-panel--monitor') ? panel.outerHTML : '',
        }
    }

    function saveLayout() {
        var payload = {
            relayUrl: relayInput.value || '',
            interval: document.getElementById('daemon-interval-input').value || '',
            workspace: currentWorkspace,
            panels: allPanels().map(panelState),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    }

    function removeDynamicMonitors() {
        Array.prototype.slice.call(root.querySelectorAll('.codex-console-panel--monitor')).forEach(function (panel) {
            if (panel.dataset.panelId !== 'monitor-1') panel.remove()
        })
    }

    function workspaceVisibleFor(panel, workspaceName) {
        var groups = (panel.dataset.workspaceGroup || 'overview').split(',').map(function (item) {
            return item.trim()
        })
        return groups.indexOf(workspaceName) !== -1
    }

    function applyWorkspace(name) {
        currentWorkspace = name
        Array.prototype.slice.call(document.querySelectorAll('[data-workspace-tab]')).forEach(function (btn) {
            btn.classList.toggle('is-active', btn.dataset.workspaceTab === name)
        })
        allPanels().forEach(function (panel) {
            panel.classList.toggle('is-hidden-workspace', !workspaceVisibleFor(panel, name))
        })
        saveLayout()
    }

    function loadLayout() {
        var raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            syncMonitorCounter()
            allPanels().forEach(panelDrag)
            bindMonitorPane(document.querySelector('[data-panel-id="monitor-1"]'))
            applyWorkspace('overview')
            return
        }

        try {
            var payload = JSON.parse(raw)
            if (payload.relayUrl) relayInput.value = payload.relayUrl
            if (payload.interval) document.getElementById('daemon-interval-input').value = payload.interval
            removeDynamicMonitors()
            ;(payload.panels || []).forEach(function (state) {
                var panel = state.panelId ? root.querySelector('[data-panel-id="' + state.panelId + '"]') : null
                if (!panel && state.html) {
                    var wrapper = document.createElement('div')
                    wrapper.innerHTML = state.html
                    panel = wrapper.firstElementChild
                    if (panel) canvas.appendChild(panel)
                }
                if (!panel) return
                if (state.panelId) panel.dataset.panelId = state.panelId
                if (state.monitorSource) panel.dataset.monitorSource = state.monitorSource
                if (state.workspaceGroup) panel.dataset.workspaceGroup = state.workspaceGroup
                panel.style.left = state.left || panel.style.left
                panel.style.top = state.top || panel.style.top
                panel.style.width = state.width || panel.style.width
                panel.style.height = state.height || panel.style.height
                panel.style.zIndex = state.zIndex || panel.style.zIndex
                if (panel.classList.contains('codex-console-panel--monitor')) bindMonitorPane(panel)
                else panelDrag(panel)
            })
            allPanels().forEach(function (panel) {
                if (panel.classList.contains('codex-console-panel--monitor')) bindMonitorPane(panel)
                else panelDrag(panel)
            })
            syncMonitorCounter()
            applyWorkspace(payload.workspace || 'overview')
        } catch (err) {
            console.warn('layout restore failed', err)
            allPanels().forEach(panelDrag)
            bindMonitorPane(document.querySelector('[data-panel-id="monitor-1"]'))
            applyWorkspace('overview')
        }
    }

    function resetLayout() {
        localStorage.removeItem(STORAGE_KEY)
        window.location.reload()
    }

    function addMonitorPane() {
        monitorCounter += 1
        var node = monitorTemplate.content.firstElementChild.cloneNode(true)
        node.dataset.panelId = 'monitor-' + monitorCounter
        node.style.left = 60 + monitorCounter * 24 + 'px'
        node.style.top = 60 + monitorCounter * 20 + 'px'
        canvas.appendChild(node)
        bindMonitorPane(node)
        bumpPanel(node)
        saveLayout()
    }

    function updateThreadLock(lockState) {
        var lock = lockState || {}
        setText('thread-lock-mode', lock.mode || '—')
        setText('thread-lock-source', lock.source || '—')
        setText('thread-lock-note', lock.note || '—')
    }

    function updateStatus(data) {
        if (!data || !data.status) return
        var status = data.status
        setText('daemon-running', String(status.daemon_running))
        setText('daemon-pid', status.pid ? String(status.pid) : '—')
        setText('daemon-thread', status.thread_id || '—')
        if (!threadInput.value || threadInput.value === '—') threadInput.value = status.thread_id || ''
        var heartbeat = status.heartbeat || {}
        var tick = status.last_tick || {}
        heartbeatBadge.textContent = heartbeat.phase || 'unknown'
        tickBadge.textContent = tick.phase || 'unknown'
        setText('daemon-phase', heartbeat.phase || '—')
        setText('daemon-interval', heartbeat.interval_minutes ? String(heartbeat.interval_minutes) + ' min' : '—')
        setText('last-tick-started', tick.started_at || '—')
        setText('last-tick-finished', tick.finished_at || '—')
        setText('last-tick-returncode', typeof tick.returncode === 'number' ? String(tick.returncode) : '—')
        setText('last-message-preview', tick.last_message_preview || '—')
        lastTickPath.textContent = tick.raw_log_path || '—'
        updateThreadLock(status.thread_lock || data.thread_lock || {})
    }

    function refreshLogs() {
        fetchJson('/api/logs/daemon?lines=140')
            .then(function (data) {
                lastData.daemonLog = data.text || ''
                setHtml('daemon-log', data.text)
                daemonPath.textContent = data.path || '—'
                refreshMonitorPanes()
            })
            .catch(function (err) {
                setText('daemon-log', 'daemon log error: ' + err.message)
            })

        fetchJson('/api/logs/latest?lines=140')
            .then(function (data) {
                lastData.tickLog = data.text || ''
                setHtml('tick-log', data.text)
                refreshMonitorPanes()
            })
            .catch(function (err) {
                setText('tick-log', 'tick log error: ' + err.message)
            })

        fetchJson('/api/last-message?lines=140')
            .then(function (data) {
                lastData.lastMessage = data.text || ''
                setHtml('thread-output', data.text)
                refreshMonitorPanes()
            })
            .catch(function (err) {
                setText('thread-output', 'last message error: ' + err.message)
            })
    }

    function renderShellTabs() {
        var host = document.getElementById('shell-tabs')
        host.innerHTML = ''
        shellState.sessions.forEach(function (session) {
            var btn = document.createElement('button')
            btn.type = 'button'
            btn.className = 'codex-console-tab codex-console-tab--mini' + (session.session_id === shellState.activeId ? ' is-active' : '')
            btn.textContent = session.session_id
            btn.dataset.sessionId = session.session_id
            btn.addEventListener('click', function () {
                shellState.activeId = session.session_id
                renderShellTabs()
                renderShellOutput()
            })
            host.appendChild(btn)
        })
    }

    function activeShell() {
        return shellState.sessions.find(function (session) {
            return session.session_id === shellState.activeId
        }) || null
    }

    function renderShellOutput() {
        var session = activeShell()
        if (!session) {
            setText('shell-output', '暂无 shell session。点击“新建 Shell”。')
            setText('shell-session-meta', 'none')
            setText('shell-cwd', 'cwd: —')
            setText('shell-lines', '0 lines')
            return
        }
        setHtml('shell-output', session.buffer || '')
        setText('shell-session-meta', session.session_id + ' · pid=' + session.pid + ' · ' + (session.alive ? 'alive' : 'done'))
        setText('shell-cwd', 'cwd: ' + (session.cwd || '—'))
        var lineCount = session.buffer ? session.buffer.split(/\r?\n/).length : 0
        setText('shell-lines', String(lineCount) + ' lines')
    }

    function refreshShellList() {
        return fetchJson('/api/shell/list')
            .then(function (data) {
                shellState.sessions = data.sessions || []
                if (!shellState.activeId && shellState.sessions.length) shellState.activeId = shellState.sessions[0].session_id
                if (shellState.activeId && !activeShell() && shellState.sessions.length) shellState.activeId = shellState.sessions[0].session_id
                if (!shellState.sessions.length) shellState.activeId = ''
                renderShellTabs()
                renderShellOutput()
            })
            .catch(function (err) {
                setText('shell-status', err.message)
            })
    }

    function refreshActiveShell() {
        if (!shellState.activeId) return Promise.resolve()
        return fetchJson('/api/shell/read?id=' + encodeURIComponent(shellState.activeId))
            .then(function (data) {
                shellState.sessions = shellState.sessions.map(function (session) {
                    return session.session_id === data.session.session_id ? data.session : session
                })
                renderShellOutput()
            })
            .catch(function (err) {
                setText('shell-status', err.message)
            })
    }

    function createShell() {
        setText('shell-status', 'creating...')
        fetchJson('/api/shell/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        })
            .then(function (data) {
                shellState.sessions.push(data.session)
                shellState.activeId = data.session.session_id
                renderShellTabs()
                renderShellOutput()
                setText('shell-status', 'shell ready')
                applyWorkspace('shell')
            })
            .catch(function (err) {
                setText('shell-status', err.message)
            })
    }

    function closeActiveShell() {
        if (!shellState.activeId) return
        var sessionId = shellState.activeId
        fetchJson('/api/shell/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: sessionId }),
        })
            .then(function () {
                shellState.sessions = shellState.sessions.filter(function (session) {
                    return session.session_id !== sessionId
                })
                shellState.activeId = shellState.sessions.length ? shellState.sessions[0].session_id : ''
                renderShellTabs()
                renderShellOutput()
                setText('shell-status', 'shell closed')
            })
            .catch(function (err) {
                setText('shell-status', err.message)
            })
    }

    function sendShellInput() {
        var input = document.getElementById('shell-input').value || ''
        if (!shellState.activeId || !input.trim()) return
        setText('shell-status', 'sending...')
        fetchJson('/api/shell/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: shellState.activeId, input: input.endsWith('\n') ? input : input + '\n' }),
        })
            .then(function (data) {
                shellState.sessions = shellState.sessions.map(function (session) {
                    return session.session_id === data.session.session_id ? data.session : session
                })
                document.getElementById('shell-input').value = ''
                renderShellOutput()
                setText('shell-status', 'sent')
            })
            .catch(function (err) {
                setText('shell-status', err.message)
            })
    }

    function connectEvents() {
        if (es) es.close()
        es = new EventSource(relayBase() + '/events')
        setText('relay-status', 'connecting')
        es.onopen = function () {
            setText('relay-status', 'connected')
            saveLayout()
        }
        es.onmessage = function (ev) {
            try {
                var data = JSON.parse(ev.data)
                if (data.type === 'status') {
                    updateStatus(data)
                    refreshLogs()
                    refreshActiveShell()
                }
            } catch (err) {
                setText('relay-status', 'event parse error: ' + err)
            }
        }
        es.onerror = function () {
            setText('relay-status', 'connection error')
        }
    }

    function daemonAction(action) {
        var interval = Number(document.getElementById('daemon-interval-input').value || 10)
        daemonControlStatus.textContent = action + '...'
        fetchJson('/api/daemon/' + action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interval_minutes: interval }),
        })
            .then(function (data) {
                daemonControlStatus.textContent = data.stdout || (action + ' ok')
                updateStatus({ status: data.status })
                refreshLogs()
            })
            .catch(function (err) {
                daemonControlStatus.textContent = err.message
            })
    }

    function setThreadLock(mode) {
        var path = mode === 'readonly' ? '/api/thread/lock' : '/api/thread/unlock'
        lockStatus.textContent = 'updating...'
        fetchJson(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                thread_id: (threadInput.value || '').trim(),
                note: mode === 'readonly' ? 'locked from web terminal' : 'unlocked from web terminal',
            }),
        })
            .then(function (data) {
                updateThreadLock(data.thread_lock)
                lockStatus.textContent = 'ok'
            })
            .catch(function (err) {
                lockStatus.textContent = err.message
            })
    }

    document.getElementById('relay-connect').addEventListener('click', connectEvents)
    document.getElementById('relay-refresh').addEventListener('click', function () {
        fetchJson('/api/status')
            .then(function (data) {
                updateStatus({ status: data })
                refreshLogs()
                refreshShellList()
                setText('relay-status', 'manual refresh ok')
            })
            .catch(function (err) {
                setText('relay-status', err.message)
            })
    })
    document.getElementById('daemon-start').addEventListener('click', function () {
        daemonAction('start')
    })
    document.getElementById('daemon-stop').addEventListener('click', function () {
        daemonAction('stop')
    })
    document.getElementById('layout-save').addEventListener('click', function () {
        saveLayout()
        daemonControlStatus.textContent = 'layout saved'
    })
    document.getElementById('layout-reset').addEventListener('click', resetLayout)
    document.getElementById('pane-add-monitor').addEventListener('click', addMonitorPane)
    document.getElementById('thread-lock-readonly').addEventListener('click', function () {
        setThreadLock('readonly')
    })
    document.getElementById('thread-lock-writable').addEventListener('click', function () {
        setThreadLock('writable')
    })
    document.getElementById('shell-new').addEventListener('click', createShell)
    document.getElementById('shell-close').addEventListener('click', closeActiveShell)
    document.getElementById('shell-refresh').addEventListener('click', refreshActiveShell)
    document.getElementById('shell-send').addEventListener('click', sendShellInput)
    document.getElementById('shell-input').addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' && ev.ctrlKey) {
            ev.preventDefault()
            sendShellInput()
        }
    })
    relayInput.addEventListener('change', saveLayout)
    document.getElementById('daemon-interval-input').addEventListener('change', saveLayout)

    Array.prototype.slice.call(document.querySelectorAll('[data-workspace-tab]')).forEach(function (btn) {
        btn.addEventListener('click', function () {
            applyWorkspace(btn.dataset.workspaceTab)
        })
    })

    sendBtn.addEventListener('click', function () {
        var body = {
            thread_id: (threadInput.value || '').trim(),
            message: messageInput.value || '',
            force: !!forceInput.checked,
        }
        sendStatus.textContent = 'sending...'
        fetch(relayBase() + '/api/thread/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
            .then(function (r) {
                return r.json().then(function (data) {
                    if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status))
                    return data
                })
            })
            .then(function (data) {
                sendStatus.textContent = 'sent'
                if (data.thread_lock) updateThreadLock(data.thread_lock)
                setHtml('thread-output', data.last_message || data.stdout || '')
                refreshLogs()
            })
            .catch(function (err) {
                sendStatus.textContent = err.message
            })
    })

    loadLayout()
    connectEvents()
    refreshLogs()
    refreshShellList()
})()
