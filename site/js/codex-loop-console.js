;(function () {
    var root = document.getElementById('codex-loop-console')
    if (!root) return

    var STORAGE_KEY = 'codex-loop-console-layout-v4'
    var PRESET_LABELS = {
        overview: 'Overview',
        thread: 'Thread Desk',
        shell: 'Shell Lab',
        debug: 'Debug',
        custom: 'Custom',
    }
    var PRESET_LAYOUTS = {
        overview: {
            workspace: 'overview',
            monitorSource: 'daemon',
            panels: {
                'daemon-status': { left: '0px', top: '0px', width: '300px', height: '230px' },
                'thread-preview': { left: '320px', top: '0px', width: '380px', height: '230px' },
                'session-stack': { left: '720px', top: '0px', width: '340px', height: '230px' },
                'daemon-log': { left: '0px', top: '250px', width: '340px', height: '300px' },
                'latest-tick': { left: '360px', top: '250px', width: '340px', height: '300px' },
                'event-timeline': { left: '720px', top: '250px', width: '340px', height: '300px' },
            },
        },
        thread: {
            workspace: 'thread',
            monitorSource: 'last-message',
            panels: {
                'thread-compose': { left: '0px', top: '0px', width: '520px', height: '550px' },
                'session-stack': { left: '540px', top: '0px', width: '360px', height: '260px' },
                'latest-tick': { left: '920px', top: '0px', width: '400px', height: '260px' },
                'event-timeline': { left: '540px', top: '280px', width: '380px', height: '270px' },
            },
        },
        shell: {
            workspace: 'shell',
            monitorSource: 'daemon',
            panels: {
                'shell-pane': { left: '0px', top: '0px', width: '680px', height: '550px' },
                'daemon-log': { left: '700px', top: '0px', width: '340px', height: '260px' },
                'monitor-1': { left: '1060px', top: '0px', width: '340px', height: '260px' },
                'event-timeline': { left: '700px', top: '280px', width: '340px', height: '270px' },
            },
        },
        debug: {
            workspace: 'debug',
            monitorSource: 'tick',
            panels: {
                'daemon-status': { left: '0px', top: '0px', width: '280px', height: '220px' },
                'thread-preview': { left: '300px', top: '0px', width: '320px', height: '220px' },
                'session-stack': { left: '0px', top: '240px', width: '280px', height: '310px' },
                'daemon-log': { left: '300px', top: '240px', width: '320px', height: '310px' },
                'latest-tick': { left: '640px', top: '240px', width: '320px', height: '310px' },
                'monitor-1': { left: '640px', top: '0px', width: '300px', height: '220px' },
                'event-timeline': { left: '960px', top: '0px', width: '340px', height: '270px' },
                'thread-compose': { left: '1320px', top: '0px', width: '360px', height: '550px' },
                'shell-pane': { left: '960px', top: '290px', width: '340px', height: '260px' },
            },
        },
    }
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
    var guardState = {
        relay: 'idle',
        daemonRunning: false,
        threadLockMode: '—',
        threadForce: false,
        shellCount: 0,
        shellActiveId: '',
        shellAlive: false,
    }
    var timelineState = []
    var lastTickTimelineKey = ''
    var currentPreset = 'overview'
    var sessionStackState = { lastActionText: 'idle', lastActionTime: '—' }
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

    function setStatusState(id, text, tone) {
        var el = document.getElementById(id)
        if (!el) return
        el.textContent = text || ''
        el.className = 'codex-console-status codex-console-status--' + (tone || 'neutral')
        renderSessionStack()
    }

    function setHtml(id, text) {
        var el = document.getElementById(id)
        if (el) el.innerHTML = esc(text || '')
    }

    function nowLabel() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    function setLastAction(text, tone) {
        sessionStackState.lastActionText = text || 'idle'
        sessionStackState.lastActionTime = nowLabel()
        setStatusState('last-action-status', text || 'idle', tone || 'neutral')
        setText('last-action-time', sessionStackState.lastActionTime)
        renderSessionStack()
    }

    function setStackChip(id, text, tone) {
        var el = document.getElementById(id)
        if (!el) return
        el.textContent = text || ''
        el.className = 'codex-console-chip codex-console-chip--guard-' + (tone || 'neutral')
    }

    function setStackPill(id, text, tone) {
        var el = document.getElementById(id)
        if (!el) return
        el.textContent = text || ''
        el.className = 'codex-console-stack-pill codex-console-stack-pill--' + (tone || 'neutral')
    }

    function shellWorkspaceLabel(session) {
        var cwd = session && session.cwd ? String(session.cwd) : ''
        if (!cwd || cwd === '—') return 'unknown cwd'
        var parts = cwd.split('/').filter(Boolean)
        if (!parts.length) return cwd
        return parts[parts.length - 1]
    }

    function shellRosterGroupMarkup(title, tone, sessions, activeId) {
        if (!sessions.length) return ''
        return (
            '<section class="codex-console-stack-group">' +
            '<div class="codex-console-stack-group__head">' +
            '<strong>' + esc(title) + '</strong>' +
            '<span class="codex-console-stack-pill codex-console-stack-pill--' + esc(tone) + '">' + esc(String(sessions.length)) + '</span>' +
            '</div>' +
            sessions
                .map(function (session) {
                    var isActive = session.session_id === activeId
                    var roleTone = isActive ? 'active' : (session.alive ? 'standby' : 'closed')
                    var roleLabel = isActive ? 'active seat' : (session.alive ? 'standby' : 'closed')
                    var active = isActive ? ' is-active' : ''
                    var workspaceLabel = shellWorkspaceLabel(session)
                    return (
                        '<article class="codex-console-stack-shell' + active + '">' +
                        '<div class="codex-console-stack-shell__head">' +
                        '<div class="codex-console-stack-shell__title">' +
                        '<strong>' + esc(session.session_id) + '</strong>' +
                        '<span class="codex-console-stack-shell__meta">' + esc(workspaceLabel) + '</span>' +
                        '</div>' +
                        '<div class="codex-console-stack-shell__controls">' +
                        '<span class="codex-console-stack-pill codex-console-stack-pill--neutral">' + esc(workspaceLabel) + '</span>' +
                        '<span class="codex-console-stack-pill codex-console-stack-pill--' + roleTone + '">' + roleLabel + '</span>' +
                        '<button type="button" class="btn btn-secondary codex-console-stack-shell__action" data-stack-focus-shell="' + esc(session.session_id) + '">Focus</button>' +
                        '</div>' +
                        '</div>' +
                        '<p><strong>pid</strong><span>' + esc(session.pid || '—') + '</span></p>' +
                        '<p><strong>cwd</strong><span>' + esc(session.cwd || '—') + '</span></p>' +
                        '</article>'
                    )
                })
                .join('') +
            '</section>'
        )
    }

    function renderSessionStack() {
        var host = document.getElementById('stack-shells')
        var badge = document.getElementById('session-stack-badge')
        var metrics = document.getElementById('stack-shell-metrics')
        var activeId = shellState.activeId || ''
        var relayState = guardState.relay || 'idle'
        var daemonSummary = { chip: 'manual desk', note: 'Daemon idle. Manual desk is the current write owner.', tone: 'ready' }
        var threadSummary = { chip: 'writable', note: 'Manual writes are allowed from the desk.', tone: 'ready' }
        var shellSummary = { chip: 'no shell', note: 'Spawn one from Session Stack or Shell Lab.', tone: 'neutral' }
        var boundThread = ((threadInput.value || '').trim() || (document.getElementById('daemon-thread') ? document.getElementById('daemon-thread').textContent : 'thread pending') || 'thread pending')
        var relayQueue = { title: 'Reconnect relay', note: 'Refresh relay state before trusting ownership.', chip: 'attention', tone: 'attention' }
        var threadQueue = { title: 'Review thread guard', note: 'Check whether manual writes should stay readonly or writable.', chip: 'review', tone: 'neutral' }
        var shellQueue = { title: 'Spawn shell', note: 'Bring a live shell seat online if local PTY work is needed.', chip: 'standby', tone: 'standby' }
        var daemonIdentity = { title: 'daemon idle', note: 'No live daemon run is attached yet.', chip: 'manual', tone: 'neutral' }
        var threadIdentity = { title: boundThread, note: 'Thread Desk is waiting for a clearer session state.', chip: 'pending', tone: 'neutral' }
        var shellIdentity = { title: 'no active shell', note: 'Shell Lab has not claimed a live PTY seat yet.', chip: 'idle', tone: 'neutral' }
        var daemonAssignment = { owner: 'daemon idle', note: 'No daemon run is active yet.', chip: 'manual', tone: 'neutral', aux: 'relay idle', auxTone: 'neutral' }
        var threadAssignment = { owner: 'thread pending', note: 'No thread binding yet.', chip: 'pending', tone: 'neutral', aux: 'readonly', auxTone: 'neutral' }
        var shellAssignment = { owner: 'no active shell', note: 'Create or focus a shell session.', chip: 'idle', tone: 'neutral', aux: '0 standby', auxTone: 'neutral' }
        if (!host || !badge || !metrics) return

        setText('stack-relay', document.getElementById('relay-status') ? document.getElementById('relay-status').textContent : 'idle')
        setText('stack-daemon', document.getElementById('daemon-running') ? document.getElementById('daemon-running').textContent : '—')
        setText('stack-tick', tickBadge ? tickBadge.textContent : '—')
        setText('stack-workspace', PRESET_LABELS[currentWorkspace] || currentWorkspace)
        setText('stack-preset', PRESET_LABELS[currentPreset] || currentPreset)
        setText('stack-thread', (threadInput.value || '').trim() || (document.getElementById('daemon-thread') ? document.getElementById('daemon-thread').textContent : '—'))
        setText('stack-lock', document.getElementById('thread-lock-mode') ? document.getElementById('thread-lock-mode').textContent : '—')
        setText('stack-last-action', sessionStackState.lastActionText)
        setText('stack-last-action-time', sessionStackState.lastActionTime)
        setText('stack-shell-focus', activeId ? activeId : 'no active session')
        badge.textContent = shellState.sessions.length + ' shell' + (shellState.sessions.length === 1 ? '' : 's')
        setStackChip('session-stack-daemon-badge', guardState.daemonRunning ? 'daemon live' : 'daemon idle', guardState.daemonRunning ? 'ready' : 'neutral')
        setStackChip(
            'session-stack-thread-badge',
            guardState.threadForce ? 'thread force' : ('thread ' + (guardState.threadLockMode || '—')),
            guardState.threadForce ? 'risk' : (guardState.threadLockMode === 'readonly' ? 'attention' : 'neutral')
        )

        if (relayState === 'idle' || relayState === 'connection error' || relayState === 'manual refresh failed') {
            daemonSummary = {
                chip: 'relay stale',
                note: 'Ownership may be outdated until relay state is refreshed.',
                tone: 'attention',
            }
            relayQueue = {
                title: 'Reconnect relay',
                note: 'Status is stale, so daemon and thread ownership cannot be trusted yet.',
                chip: 'attention',
                tone: 'attention',
            }
        } else if (relayState === 'connecting') {
            daemonSummary = {
                chip: 'syncing',
                note: 'Relay is connecting. Wait before trusting operator ownership.',
                tone: 'attention',
            }
            relayQueue = {
                title: 'Wait for sync',
                note: 'Hold state-changing actions until the relay settles into a readable state.',
                chip: 'syncing',
                tone: 'standby',
            }
        } else if (guardState.daemonRunning && guardState.threadForce) {
            daemonSummary = {
                chip: 'shared path',
                note: 'Daemon is active and force send is armed, so writes are no longer single-owner.',
                tone: 'risk',
            }
            relayQueue = {
                title: 'Relay clear',
                note: 'Status feed is healthy; the next operator decision is about write collisions, not connectivity.',
                chip: 'ready',
                tone: 'active',
            }
        } else if (guardState.daemonRunning && guardState.threadLockMode === 'readonly') {
            daemonSummary = {
                chip: 'daemon lead',
                note: 'Daemon owns the write path while Thread Desk stays guarded readonly.',
                tone: 'ready',
            }
            relayQueue = {
                title: 'Relay clear',
                note: 'Feed is live and the daemon lane is being tracked correctly from the overview surface.',
                chip: 'ready',
                tone: 'active',
            }
        } else if (guardState.daemonRunning) {
            daemonSummary = {
                chip: 'daemon lead',
                note: 'Daemon is active, but the thread is still writable from the desk.',
                tone: 'attention',
            }
            relayQueue = {
                title: 'Relay clear',
                note: 'Connectivity is not the blocker; the next decision is whether thread writes should stay open.',
                chip: 'ready',
                tone: 'active',
            }
        } else {
            relayQueue = {
                title: 'Relay clear',
                note: 'Connectivity is healthy, so the desk state can be scanned without forcing another refresh.',
                chip: 'ready',
                tone: 'active',
            }
        }

        daemonIdentity = {
            title: guardState.daemonRunning
                ? ('pid ' + (document.getElementById('daemon-pid') ? document.getElementById('daemon-pid').textContent : '—'))
                : 'daemon idle',
            note: guardState.daemonRunning
                ? 'Overview is attached to the live daemon run' + (tickBadge && tickBadge.textContent ? ' while tick is ' + tickBadge.textContent + '.' : '.')
                : 'Overview remains the manual control seat until the daemon starts.',
            chip: guardState.daemonRunning ? 'live run' : 'manual',
            tone: guardState.daemonRunning ? 'active' : 'neutral',
        }

        daemonAssignment = {
            owner: guardState.daemonRunning ? 'daemon running' : 'daemon idle',
            note: guardState.daemonRunning
                ? 'Overview is tracking the live daemon lane' + (tickBadge && tickBadge.textContent ? ' with ' + tickBadge.textContent + '.' : '.')
                : 'Overview is the manual control surface until the daemon starts.',
            chip: guardState.daemonRunning ? 'live run' : 'manual',
            tone: guardState.daemonRunning ? 'active' : 'neutral',
            aux: relayState === 'connected' || relayState === 'manual refresh ok' ? 'relay ready' : relayState,
            auxTone: relayState === 'connected' || relayState === 'manual refresh ok' ? 'standby' : (relayState === 'connecting' ? 'standby' : 'neutral'),
        }

        if (guardState.threadForce) {
            threadSummary = {
                chip: 'force armed',
                note: 'Manual sends can bypass the daemon/write guard.',
                tone: 'risk',
            }
            threadQueue = {
                title: 'Disarm force send',
                note: 'Force is armed, so the next manual send can bypass the normal protection path.',
                chip: 'risk',
                tone: 'risk',
            }
        } else if (guardState.threadLockMode === 'readonly' && guardState.daemonRunning) {
            threadSummary = {
                chip: 'readonly',
                note: 'Thread writes are guarded while the daemon is running.',
                tone: 'ready',
            }
            threadQueue = {
                title: 'Thread guarded',
                note: 'Readonly protection is already restored while the daemon owns the write lane.',
                chip: 'clear',
                tone: 'active',
            }
        } else if (guardState.threadLockMode === 'readonly') {
            threadSummary = {
                chip: 'readonly',
                note: 'Thread writes are paused until you switch back to writable.',
                tone: 'neutral',
            }
            threadQueue = {
                title: 'Reopen writes if needed',
                note: 'Daemon is not currently active, so readonly is now a deliberate manual hold.',
                chip: 'hold',
                tone: 'standby',
            }
        } else if (guardState.daemonRunning) {
            threadSummary = {
                chip: 'writable',
                note: 'Manual sends risk colliding with daemon ticks until readonly is restored.',
                tone: 'risk',
            }
            threadQueue = {
                title: 'Restore readonly',
                note: 'Daemon is active while the thread remains writable from the manual desk.',
                chip: 'risk',
                tone: 'risk',
            }
        } else if (boundThread === 'thread pending' || boundThread === '—') {
            threadQueue = {
                title: 'Bind thread',
                note: 'Thread Desk still lacks a concrete thread target to guard or reopen.',
                chip: 'pending',
                tone: 'attention',
            }
        } else {
            threadQueue = {
                title: 'Thread clear',
                note: 'Manual writes are available and no daemon-collision signal is currently active.',
                chip: 'ready',
                tone: 'active',
            }
        }

        threadIdentity = {
            title: boundThread,
            note: guardState.threadForce
                ? 'Thread Desk is attached, but force send is currently armed.'
                : (guardState.threadLockMode === 'readonly'
                    ? 'Thread Desk is attached and guarded readonly.'
                    : 'Thread Desk is attached and currently writable.'),
            chip: guardState.threadForce ? 'force' : (guardState.threadLockMode === 'readonly' ? 'readonly' : (boundThread === 'thread pending' ? 'pending' : 'bound')),
            tone: guardState.threadForce ? 'risk' : (guardState.threadLockMode === 'readonly' ? 'standby' : (boundThread === 'thread pending' ? 'neutral' : 'active')),
        }

        threadAssignment = {
            owner: ((threadInput.value || '').trim() || (document.getElementById('daemon-thread') ? document.getElementById('daemon-thread').textContent : 'thread pending') || 'thread pending'),
            note:
                (guardState.threadLockMode === 'readonly'
                    ? 'Thread Desk is currently guarded readonly.'
                    : 'Thread Desk can still write from the manual surface.') +
                (guardState.threadForce ? ' Force send is armed.' : ''),
            chip: guardState.threadForce ? 'force' : (guardState.threadLockMode === 'readonly' ? 'readonly' : 'writable'),
            tone: guardState.threadForce ? 'risk' : (guardState.threadLockMode === 'readonly' ? 'standby' : 'active'),
            aux: guardState.threadForce ? 'daemon bypass' : (guardState.daemonRunning ? 'daemon linked' : 'manual only'),
            auxTone: guardState.threadForce ? 'risk' : (guardState.daemonRunning ? 'standby' : 'neutral'),
        }

        if (guardState.shellCount && guardState.shellActiveId && !guardState.shellAlive) {
            shellSummary = {
                chip: 'reopen',
                note: guardState.shellActiveId + ' ended. Focus another shell or create a fresh one.',
                tone: 'attention',
            }
            shellQueue = {
                title: 'Replace ended shell',
                note: guardState.shellActiveId + ' has ended, so the live PTY seat needs a new owner.',
                chip: 'attention',
                tone: 'attention',
            }
        } else if (guardState.shellCount && guardState.shellActiveId) {
            shellSummary = {
                chip: 'active shell',
                note: guardState.shellActiveId + ' currently owns the live PTY seat.',
                tone: 'ready',
            }
            shellQueue = {
                title: 'Shell clear',
                note: guardState.shellActiveId + ' already owns the live seat; standby sessions can stay parked.',
                chip: 'ready',
                tone: 'active',
            }
        } else if (guardState.shellCount) {
            shellSummary = {
                chip: 'parked',
                note: guardState.shellCount + ' shell session' + (guardState.shellCount === 1 ? ' is' : 's are') + ' available to focus.',
                tone: 'neutral',
            }
            shellQueue = {
                title: 'Focus standby shell',
                note: guardState.shellCount + ' parked shell session' + (guardState.shellCount === 1 ? ' is' : 's are') + ' available, but none owns the live seat.',
                chip: 'standby',
                tone: 'standby',
            }
        }

        if (guardState.shellCount && guardState.shellActiveId && guardState.shellAlive) {
            shellIdentity = {
                title: guardState.shellActiveId,
                note: 'Shell Lab is attached to the live PTY seat.',
                chip: 'active seat',
                tone: 'active',
            }
        } else if (guardState.shellCount) {
            shellIdentity = {
                title: 'standby roster',
                note: guardState.shellCount + ' shell session' + (guardState.shellCount === 1 ? ' is' : 's are') + ' available, but none currently owns the live seat.',
                chip: 'parked',
                tone: 'standby',
            }
        }

        var activeSessions = shellState.sessions.filter(function (session) {
            return session.session_id === activeId
        })
        var standbySessions = shellState.sessions.filter(function (session) {
            return session.alive && session.session_id !== activeId
        })
        var closedSessions = shellState.sessions.filter(function (session) {
            return !session.alive
        })

        if (guardState.shellCount && guardState.shellActiveId && guardState.shellAlive) {
            shellAssignment = {
                owner: guardState.shellActiveId,
                note: 'Shell Lab currently owns the live PTY seat while ' + Math.max(shellState.sessions.length - 1, 0) + ' other session' + (shellState.sessions.length - 1 === 1 ? ' is' : 's are') + ' parked.',
                chip: 'active seat',
                tone: 'active',
                aux: Math.max(shellState.sessions.length - 1, 0) + ' standby',
                auxTone: 'standby',
            }
        } else if (guardState.shellCount) {
            shellAssignment = {
                owner: 'standby roster',
                note: guardState.shellCount + ' shell session' + (guardState.shellCount === 1 ? ' is' : 's are') + ' available, but none currently owns the live seat.',
                chip: 'parked',
                tone: 'standby',
                aux: closedSessions.length + ' closed',
                auxTone: 'neutral',
            }
        }

        setStackChip('stack-summary-daemon', daemonSummary.chip, daemonSummary.tone)
        setText('stack-summary-daemon-note', daemonSummary.note)
        setStackChip('stack-summary-thread', threadSummary.chip, threadSummary.tone)
        setText('stack-summary-thread-note', threadSummary.note)
        setStackChip('stack-summary-shell', shellSummary.chip, shellSummary.tone)
        setText('stack-summary-shell-note', shellSummary.note)
        setText('stack-pulse-workspace', PRESET_LABELS[currentWorkspace] || currentWorkspace)
        setText('stack-pulse-workspace-note', 'Preset ' + (PRESET_LABELS[currentPreset] || currentPreset) + ' is currently loaded.')
        setText('stack-pulse-thread', boundThread)
        setText('stack-pulse-thread-note', guardState.threadLockMode === 'readonly' ? 'Thread is guarded readonly.' : 'Thread is writable from the desk.')
        setText('stack-pulse-daemon', guardState.daemonRunning ? 'daemon live' : 'manual lane')
        setText('stack-pulse-daemon-note', guardState.daemonRunning ? (tickBadge && tickBadge.textContent ? 'Latest tick: ' + tickBadge.textContent + '.' : 'Daemon run is active.') : 'Overview remains the manual control lane.')
        setText('stack-queue-relay', relayQueue.title)
        setText('stack-queue-relay-note', relayQueue.note)
        setStackPill('stack-queue-relay-chip', relayQueue.chip, relayQueue.tone)
        setText('stack-queue-thread', threadQueue.title)
        setText('stack-queue-thread-note', threadQueue.note)
        setStackPill('stack-queue-thread-chip', threadQueue.chip, threadQueue.tone)
        setText('stack-queue-shell', shellQueue.title)
        setText('stack-queue-shell-note', shellQueue.note)
        setStackPill('stack-queue-shell-chip', shellQueue.chip, shellQueue.tone)
        setText('stack-identity-daemon', daemonIdentity.title)
        setText('stack-identity-daemon-note', daemonIdentity.note)
        setStackPill('stack-identity-daemon-chip', daemonIdentity.chip, daemonIdentity.tone)
        setText('stack-identity-thread', threadIdentity.title)
        setText('stack-identity-thread-note', threadIdentity.note)
        setStackPill('stack-identity-thread-chip', threadIdentity.chip, threadIdentity.tone)
        setText('stack-identity-shell', shellIdentity.title)
        setText('stack-identity-shell-note', shellIdentity.note)
        setStackPill('stack-identity-shell-chip', shellIdentity.chip, shellIdentity.tone)
        setText('stack-ledger-daemon-owner', daemonAssignment.owner)
        setText('stack-ledger-daemon-note', daemonAssignment.note)
        setStackPill('stack-ledger-daemon-chip', daemonAssignment.chip, daemonAssignment.tone)
        setStackPill('stack-ledger-daemon-chip-aux', daemonAssignment.aux, daemonAssignment.auxTone)
        setText('stack-ledger-thread-owner', threadAssignment.owner)
        setText('stack-ledger-thread-note', threadAssignment.note)
        setStackPill('stack-ledger-thread-chip', threadAssignment.chip, threadAssignment.tone)
        setStackPill('stack-ledger-thread-chip-aux', threadAssignment.aux, threadAssignment.auxTone)
        setText('stack-ledger-shell-owner', shellAssignment.owner)
        setText('stack-ledger-shell-note', shellAssignment.note)
        setStackPill('stack-ledger-shell-chip', shellAssignment.chip, shellAssignment.tone)
        setStackPill('stack-ledger-shell-chip-aux', shellAssignment.aux, shellAssignment.auxTone)
        setText('stack-pulse-shell', shellState.sessions.length + ' session' + (shellState.sessions.length === 1 ? '' : 's'))
        setText(
            'stack-pulse-shell-note',
            activeSessions.length
                ? activeSessions[0].session_id + ' owns the live seat; ' + standbySessions.length + ' standby.'
                : (shellState.sessions.length ? standbySessions.length + ' standby, ' + closedSessions.length + ' closed.' : 'No active shell seat.')
        )
        metrics.innerHTML =
            '<span class="codex-console-stack-pill codex-console-stack-pill--active">' + activeSessions.length + ' active</span>' +
            '<span class="codex-console-stack-pill codex-console-stack-pill--standby">' + standbySessions.length + ' standby</span>' +
            '<span class="codex-console-stack-pill codex-console-stack-pill--closed">' + closedSessions.length + ' closed</span>'

        if (!shellState.sessions.length) {
            host.innerHTML = '<div class="codex-console-stack-shell codex-console-stack-shell--empty">当前没有 shell session。</div>'
            return
        }

        host.innerHTML =
            shellRosterGroupMarkup('Active Seat', 'active', activeSessions, activeId) +
            shellRosterGroupMarkup('Standby Sessions', 'standby', standbySessions, activeId) +
            shellRosterGroupMarkup('Closed Sessions', 'closed', closedSessions, activeId)

        Array.prototype.slice.call(host.querySelectorAll('[data-stack-focus-shell]')).forEach(function (btn) {
            btn.addEventListener('click', function () {
                shellState.activeId = btn.dataset.stackFocusShell
                renderShellTabs()
                renderShellOutput()
                renderSessionStack()
                applyWorkspace('shell')
                setLastAction('shell session focused', 'success')
                pushTimeline('workspace', 'shell session focused', shellState.activeId)
            })
        })
    }

    function renderTimeline() {
        var host = document.getElementById('event-timeline-list')
        var count = document.getElementById('timeline-count')
        if (!host || !count) return
        count.textContent = String(timelineState.length)
        if (!timelineState.length) {
            host.innerHTML = '<div class="codex-console-timeline__empty">暂无事件。先连接 relay 或执行一次本地操作。</div>'
            return
        }
        host.innerHTML = timelineState
            .map(function (item) {
                var detail = item.detail ? '<div class="codex-console-timeline__detail">' + esc(item.detail) + '</div>' : ''
                return (
                    '<article class="codex-console-timeline__item">' +
                    '<div class="codex-console-timeline__meta">' +
                    '<span class="codex-console-timeline__time">' + esc(item.time) + '</span>' +
                    '<span class="codex-console-timeline__kind codex-console-timeline__kind--' + esc(item.kind) + '">' + esc(item.kind) + '</span>' +
                    '</div>' +
                    '<strong class="codex-console-timeline__title">' + esc(item.title) + '</strong>' +
                    detail +
                    '</article>'
                )
            })
            .join('')
    }

    function pushTimeline(kind, title, detail) {
        timelineState.unshift({
            kind: kind || 'info',
            title: title || 'event',
            detail: detail || '',
            time: nowLabel(),
        })
        timelineState = timelineState.slice(0, 24)
        renderTimeline()
    }

    function setGuardRelay(state) {
        guardState.relay = state || 'idle'
        renderGuardrail()
    }

    function renderGuardrail() {
        var overallEl = document.getElementById('guard-overall')
        var hintsEl = document.getElementById('guard-hints')
        var hints = []
        var overall = 'ready'
        var threadState = 'writable'
        var shellStateText = 'no session'

        if (!overallEl || !hintsEl) return

        if (guardState.daemonRunning && guardState.threadForce) threadState = 'force armed'
        else if (guardState.daemonRunning && guardState.threadLockMode !== 'readonly') threadState = 'conflict risk'
        else if (guardState.daemonRunning && guardState.threadLockMode === 'readonly') threadState = 'guarded readonly'
        else if (guardState.threadLockMode === 'readonly') threadState = 'readonly'

        if (!guardState.shellCount) shellStateText = 'no session'
        else if (guardState.shellActiveId && !guardState.shellAlive) shellStateText = 'needs reopen'
        else shellStateText = 'active'

        if (guardState.relay === 'connection error' || guardState.relay === 'idle' || guardState.relay === 'manual refresh failed') {
            overall = 'attention'
            hints.push('Relay 还没稳定连上。先点“连接”或“刷新”，不要把 thread / shell 状态当成最新。')
        } else if (guardState.relay === 'connecting') {
            overall = 'attention'
            hints.push('Relay 正在连接中。等状态进入 connected 或 reachable 再判断 daemon 与 thread。')
        }

        if (guardState.daemonRunning && guardState.threadLockMode !== 'readonly' && !guardState.threadForce) {
            overall = 'risk'
            hints.push('daemon 正在跑，而 thread 不是只读。现在人工发消息最容易和后台 tick 撞写。')
        } else if (guardState.daemonRunning && guardState.threadLockMode === 'readonly') {
            hints.push('daemon 正在跑，但 thread 已被只读保护。要人工写入，先停 daemon 或明确解除只读。')
        } else if (!guardState.daemonRunning && guardState.threadLockMode === 'readonly') {
            hints.push('daemon 已停，但 thread 仍是只读。要手动发消息，先点“解除只读”。')
        }

        if (guardState.threadForce) {
            overall = 'risk'
            hints.push('你已经勾上 force。下一次 thread 发送会绕过默认保护，确认这是有意为之。')
        }

        if (!guardState.shellCount) {
            hints.push('当前没有 shell session。需要本地命令面板时，先点“新建 Shell”。')
        } else if (guardState.shellActiveId && !guardState.shellAlive) {
            overall = overall === 'risk' ? 'risk' : 'attention'
            hints.push('当前 shell session 已结束。建议先关闭当前 session，再新建一个干净 shell。')
        }

        if (!hints.length) {
            hints.push('当前控制面没有明显冲突信号，可以按正常顺序操作 relay、thread 和 shell。')
        }

        setText('guard-relay', guardState.relay)
        setText('guard-thread', threadState)
        setText('guard-shell', shellStateText)
        overallEl.textContent = overall
        overallEl.className = 'codex-console-chip codex-console-chip--guard-' + overall
        hintsEl.innerHTML = hints.map(function (item) {
            return '<li>' + esc(item) + '</li>'
        }).join('')
    }

    function setPresetBadge() {
        setText('workspace-preset-status', PRESET_LABELS[currentPreset] || currentPreset)
        Array.prototype.slice.call(document.querySelectorAll('[data-workspace-preset]')).forEach(function (btn) {
            btn.classList.toggle('is-active', btn.dataset.workspacePreset === currentPreset)
        })
    }

    function markPresetCustom() {
        if (currentPreset === 'custom') return
        currentPreset = 'custom'
        setPresetBadge()
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
            markPresetCustom()
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
                markPresetCustom()
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
            preset: currentPreset,
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

    function applyPreset(name, options) {
        var preset = PRESET_LAYOUTS[name]
        var monitorPanel
        var monitorSelect
        var silent = options && options.silent
        if (!preset) return
        currentPreset = name
        removeDynamicMonitors()
        Object.keys(preset.panels).forEach(function (panelId) {
            var panel = root.querySelector('[data-panel-id="' + panelId + '"]')
            var state = preset.panels[panelId]
            if (!panel || !state) return
            panel.style.left = state.left || panel.style.left
            panel.style.top = state.top || panel.style.top
            panel.style.width = state.width || panel.style.width
            panel.style.height = state.height || panel.style.height
        })
        monitorPanel = root.querySelector('[data-panel-id="monitor-1"]')
        if (monitorPanel && preset.monitorSource) {
            monitorPanel.dataset.monitorSource = preset.monitorSource
            monitorSelect = monitorPanel.querySelector('[data-monitor-select]')
            if (monitorSelect) monitorSelect.value = preset.monitorSource
            updateMonitorPane(monitorPanel)
        }
        setPresetBadge()
        applyWorkspace(preset.workspace)
        renderSessionStack()
        if (!silent) {
            setStatusState('daemon-control-status', 'preset ' + (PRESET_LABELS[name] || name), 'success')
            setLastAction('workspace preset restored', 'success')
            pushTimeline('workspace', 'workspace preset restored', PRESET_LABELS[name] || name)
        }
    }

    function loadLayout() {
        var raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            syncMonitorCounter()
            allPanels().forEach(panelDrag)
            bindMonitorPane(document.querySelector('[data-panel-id="monitor-1"]'))
            applyPreset('overview', { silent: true })
            return
        }

        try {
            var payload = JSON.parse(raw)
            if (payload.relayUrl) relayInput.value = payload.relayUrl
            if (payload.interval) document.getElementById('daemon-interval-input').value = payload.interval
            currentPreset = payload.preset || 'overview'
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
            setPresetBadge()
            applyWorkspace(payload.workspace || 'overview')
            renderSessionStack()
        } catch (err) {
            console.warn('layout restore failed', err)
            allPanels().forEach(panelDrag)
            bindMonitorPane(document.querySelector('[data-panel-id="monitor-1"]'))
            setPresetBadge()
            applyPreset('overview', { silent: true })
            renderSessionStack()
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
        markPresetCustom()
        saveLayout()
    }

    function updateThreadLock(lockState) {
        var lock = lockState || {}
        setText('thread-lock-mode', lock.mode || '—')
        setText('thread-lock-source', lock.source || '—')
        setText('thread-lock-note', lock.note || '—')
        guardState.threadLockMode = lock.mode || '—'
        renderGuardrail()
    }

    function updateStatus(data) {
        if (!data || !data.status) return
        var status = data.status
        setText('daemon-running', String(status.daemon_running))
        guardState.daemonRunning = !!status.daemon_running
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
        renderSessionStack()
        var tickKey = [tick.phase || '', tick.started_at || '', tick.finished_at || '', tick.returncode].join('|')
        if (tickKey !== '|||' && tickKey !== lastTickTimelineKey) {
            lastTickTimelineKey = tickKey
            pushTimeline('tick', 'daemon tick ' + (tick.phase || 'unknown'), (tick.finished_at || tick.started_at || '—') + ' · returncode=' + (typeof tick.returncode === 'number' ? tick.returncode : '—'))
        }
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
            setText('shell-output', '暂无 shell session。\n\n$ 点击“新建 Shell”创建一个本地 PTY。\n$ Ctrl+Enter 会把下方 composer 的内容送进当前 session。')
            setText('shell-session-meta', 'none')
            setText('shell-cwd', 'cwd: —')
            setText('shell-lines', '0 lines')
            setText('shell-mode', 'mode: standby')
            setText('shell-alive-badge', 'standby')
            document.getElementById('shell-alive-badge').className = 'codex-console-chip codex-console-chip--guard-neutral'
            guardState.shellActiveId = ''
            guardState.shellAlive = false
            guardState.shellCount = shellState.sessions.length
            renderGuardrail()
            return
        }
        setHtml('shell-output', session.buffer || '')
        setText('shell-session-meta', session.session_id + ' · pid=' + session.pid + ' · ' + (session.alive ? 'alive' : 'done'))
        setText('shell-cwd', 'cwd: ' + (session.cwd || '—'))
        var lineCount = session.buffer ? session.buffer.split(/\r?\n/).length : 0
        setText('shell-lines', String(lineCount) + ' lines')
        setText('shell-mode', 'mode: ' + (session.alive ? 'interactive' : 'session ended'))
        setText('shell-alive-badge', session.alive ? 'live' : 'done')
        document.getElementById('shell-alive-badge').className = 'codex-console-chip ' + (session.alive ? 'codex-console-chip--guard-ready' : 'codex-console-chip--guard-attention')
        guardState.shellActiveId = session.session_id
        guardState.shellAlive = !!session.alive
        guardState.shellCount = shellState.sessions.length
        renderGuardrail()
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
                renderSessionStack()
            })
            .catch(function (err) {
                setStatusState('shell-status', err.message, 'error')
                setLastAction('shell list failed', 'error')
                guardState.shellCount = shellState.sessions.length
                renderGuardrail()
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
                setStatusState('shell-status', err.message, 'error')
                setLastAction('shell refresh failed', 'error')
                renderGuardrail()
            })
    }

    function createShell() {
        setStatusState('shell-status', 'creating...', 'pending')
        setLastAction('shell create started', 'pending')
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
                renderSessionStack()
                setStatusState('shell-status', 'shell ready', 'success')
                setLastAction('shell created', 'success')
                pushTimeline('shell', 'shell created', data.session.session_id + ' · pid=' + data.session.pid)
                applyWorkspace('shell')
            })
            .catch(function (err) {
                setStatusState('shell-status', err.message, 'error')
                setLastAction('shell create failed', 'error')
                pushTimeline('error', 'shell create failed', err.message)
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
                renderSessionStack()
                setStatusState('shell-status', 'shell closed', 'success')
                setLastAction('shell closed', 'success')
                pushTimeline('shell', 'shell closed', sessionId)
            })
            .catch(function (err) {
                setStatusState('shell-status', err.message, 'error')
                setLastAction('shell close failed', 'error')
                pushTimeline('error', 'shell close failed', err.message)
            })
    }

    function sendShellInput() {
        var input = document.getElementById('shell-input').value || ''
        if (!shellState.activeId || !input.trim()) return
        setStatusState('shell-status', 'sending...', 'pending')
        setLastAction('shell input sending', 'pending')
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
                renderSessionStack()
                setStatusState('shell-status', 'sent', 'success')
                setLastAction('shell input sent', 'success')
                pushTimeline('shell', 'shell input sent', shellState.activeId)
            })
            .catch(function (err) {
                setStatusState('shell-status', err.message, 'error')
                setLastAction('shell input failed', 'error')
                pushTimeline('error', 'shell input failed', err.message)
            })
    }

    function connectEvents() {
        if (es) es.close()
        es = new EventSource(relayBase() + '/events')
        setStatusState('relay-status', 'connecting', 'pending')
        setLastAction('relay connecting', 'pending')
        setGuardRelay('connecting')
        es.onopen = function () {
            setStatusState('relay-status', 'connected', 'success')
            setLastAction('relay connected', 'success')
            setGuardRelay('connected')
            pushTimeline('relay', 'relay connected', relayBase())
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
                setStatusState('relay-status', 'event parse error', 'error')
                setLastAction('relay event parse error', 'error')
            }
        }
        es.onerror = function () {
            setStatusState('relay-status', 'connection error', 'error')
            setLastAction('relay connection error', 'error')
            setGuardRelay('connection error')
            pushTimeline('error', 'relay connection error', relayBase())
        }
    }

    function daemonAction(action) {
        var interval = Number(document.getElementById('daemon-interval-input').value || 10)
        setStatusState('daemon-control-status', action + '...', 'pending')
        setLastAction('daemon ' + action + ' started', 'pending')
        fetchJson('/api/daemon/' + action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interval_minutes: interval }),
        })
            .then(function (data) {
                setStatusState('daemon-control-status', data.stdout || (action + ' ok'), 'success')
                setLastAction('daemon ' + action + ' ok', 'success')
                pushTimeline('daemon', 'daemon ' + action + ' ok', (data.stdout || '').trim().slice(0, 180))
                updateStatus({ status: data.status })
                refreshLogs()
            })
            .catch(function (err) {
                setStatusState('daemon-control-status', err.message, 'error')
                setLastAction('daemon ' + action + ' failed', 'error')
                pushTimeline('error', 'daemon ' + action + ' failed', err.message)
            })
    }

    function setThreadLock(mode) {
        var path = mode === 'readonly' ? '/api/thread/lock' : '/api/thread/unlock'
        setStatusState('thread-lock-status', 'updating...', 'pending')
        setLastAction('thread lock update started', 'pending')
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
                setStatusState('thread-lock-status', 'ok', 'success')
                setLastAction('thread lock updated', 'success')
                pushTimeline('thread', 'thread lock ' + mode, (data.thread_lock && data.thread_lock.note) || '')
            })
            .catch(function (err) {
                setStatusState('thread-lock-status', err.message, 'error')
                setLastAction('thread lock update failed', 'error')
                pushTimeline('error', 'thread lock update failed', err.message)
            })
    }

    document.getElementById('relay-connect').addEventListener('click', connectEvents)
    document.getElementById('relay-refresh').addEventListener('click', function () {
        fetchJson('/api/status')
            .then(function (data) {
                updateStatus({ status: data })
                refreshLogs()
                refreshShellList()
                setStatusState('relay-status', 'manual refresh ok', 'success')
                setLastAction('manual refresh ok', 'success')
                setGuardRelay('reachable')
                pushTimeline('relay', 'manual refresh', 'status + logs + shell list')
            })
            .catch(function (err) {
                setStatusState('relay-status', err.message, 'error')
                setLastAction('manual refresh failed', 'error')
                setGuardRelay('manual refresh failed')
                pushTimeline('error', 'manual refresh failed', err.message)
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
        setStatusState('daemon-control-status', 'layout saved', 'success')
        setLastAction('layout saved', 'success')
    })
    document.getElementById('stack-open-thread').addEventListener('click', function () {
        applyPreset('thread')
    })
    document.getElementById('stack-open-shell').addEventListener('click', function () {
        applyPreset('shell')
    })
    document.getElementById('stack-ledger-open-overview').addEventListener('click', function () {
        applyPreset('overview')
    })
    document.getElementById('stack-ledger-open-thread').addEventListener('click', function () {
        applyPreset('thread')
    })
    document.getElementById('stack-ledger-open-shell').addEventListener('click', function () {
        applyPreset('shell')
    })
    document.getElementById('stack-new-shell').addEventListener('click', createShell)
    document.getElementById('stack-lock-readonly').addEventListener('click', function () {
        setThreadLock('readonly')
    })
    document.getElementById('stack-lock-writable').addEventListener('click', function () {
        setThreadLock('writable')
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
    forceInput.addEventListener('change', function () {
        guardState.threadForce = !!forceInput.checked
        renderGuardrail()
    })

    Array.prototype.slice.call(document.querySelectorAll('[data-workspace-tab]')).forEach(function (btn) {
        btn.addEventListener('click', function () {
            markPresetCustom()
            applyWorkspace(btn.dataset.workspaceTab)
        })
    })

    Array.prototype.slice.call(document.querySelectorAll('[data-workspace-preset]')).forEach(function (btn) {
        btn.addEventListener('click', function () {
            applyPreset(btn.dataset.workspacePreset)
        })
    })

    sendBtn.addEventListener('click', function () {
        var body = {
            thread_id: (threadInput.value || '').trim(),
            message: messageInput.value || '',
            force: !!forceInput.checked,
        }
        setStatusState('thread-send-status', 'sending...', 'pending')
        setLastAction('thread send started', 'pending')
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
                setStatusState('thread-send-status', 'sent', 'success')
                setLastAction('thread message sent', 'success')
                if (data.thread_lock) updateThreadLock(data.thread_lock)
                setHtml('thread-output', data.last_message || data.stdout || '')
                pushTimeline('thread', 'thread message sent', body.thread_id || 'unknown thread')
                refreshLogs()
            })
            .catch(function (err) {
                setStatusState('thread-send-status', err.message, 'error')
                setLastAction('thread send failed', 'error')
                pushTimeline('error', 'thread send failed', err.message)
            })
    })

    setPresetBadge()
    renderGuardrail()
    loadLayout()
    renderSessionStack()
    renderTimeline()
    connectEvents()
    refreshLogs()
    refreshShellList()
})()
