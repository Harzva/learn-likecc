;(function () {
    var activeHost = document.getElementById('loop-task-active')
    var zhihuHost = document.getElementById('loop-task-zhihu')
    var recurringHost = document.getElementById('loop-task-recurring')
    var inlineHost = document.getElementById('loop-task-inline')
    var searchInput = document.getElementById('task-board-search')
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-task-filter]'))
    var sortButtons = Array.prototype.slice.call(document.querySelectorAll('[data-task-sort]'))
    var viewButtons = Array.prototype.slice.call(document.querySelectorAll('[data-task-view]'))
    if (!activeHost || !zhihuHost || !recurringHost || !inlineHost) return

    var recurringData = []
    var activeFilter = 'all'
    var activeSort = 'progress'
    var activeView = 'all'
    var activeQuery = ''

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
    }

    function stateTone(state) {
        if (state === 'done') return 'done'
        if (state === 'deferred') return 'deferred'
        if (state === 'blocked') return 'blocked'
        if (state === 'active') return 'active'
        return 'queued'
    }

    function progressMarkup(progress) {
        if (typeof progress !== 'number') {
            return '<span class="task-board-progress__label">无 checklist 进度</span>'
        }

        return (
            '<div class="task-board-progress">' +
            '<div class="task-board-progress__track"><span class="task-board-progress__fill" style="width:' + progress + '%"></span></div>' +
            '<span class="task-board-progress__label">' + progress + '%</span>' +
            '</div>'
        )
    }

    function linksMarkup(task) {
        var chunks = []
        if (task.plan_path && task.plan_href) {
            chunks.push('<a href="' + esc(task.plan_href) + '" target="_blank" rel="noopener noreferrer">Plan Blob ↗</a>')
        }
        if (task.latest_evolution && task.latest_evolution.href) {
            chunks.push('<a href="' + esc(task.latest_evolution.href) + '" target="_blank" rel="noopener noreferrer">Evolution Blob ↗</a>')
        }
        ;(task.topic_links || []).forEach(function (link) {
            chunks.push('<a href="' + esc(link.live_href || link.href) + '" target="_blank" rel="noopener noreferrer">Live ↗</a>')
            chunks.push('<a href="' + esc(link.blob_href || link.href) + '" target="_blank" rel="noopener noreferrer">Topic Blob ↗</a>')
        })
        if (!chunks.length) return ''
        return '<div class="task-board-card__links">' + chunks.join('') + '</div>'
    }

    function listMarkup(items, emptyText) {
        if (!items || !items.length) {
            return '<p class="task-board-empty">' + esc(emptyText) + '</p>'
        }
        return '<ul>' + items.map(function (item) { return '<li>' + esc(item.replace(/^- \[[ x]\]\s*/, '')) + '</li>' }).join('') + '</ul>'
    }

    function recurringCard(task) {
        var plan = task.plan || {}
        var tone = stateTone(task.state)
        return (
            '<article class="task-board-card task-board-card--' + esc(tone) + '">' +
                '<div class="task-board-card__topline">' +
                    '<span class="task-board-card__id">Task ' + esc(task.id) + '</span>' +
                    '<span class="task-board-card__state task-board-card__state--' + esc(tone) + '">' + esc(plan.status || task.state) + '</span>' +
                '</div>' +
                '<h3>' + esc(plan.title || task.headline) + '</h3>' +
                '<p class="task-board-card__goal">' + esc(plan.goal || task.headline) + '</p>' +
                progressMarkup(plan.progress) +
                '<div class="task-board-card__meta">' +
                    '<span><strong>Group</strong> ' + esc(task.semantic_group || '未分组') + '</span>' +
                    '<span><strong>Checklist</strong> ' + esc(plan.completed_count || 0) + '/' + esc(plan.total_count || 0) + '</span>' +
                    '<span><strong>Updated</strong> ' + esc(plan.updated_at || 'unknown') + '</span>' +
                    '<span><strong>Plan</strong> <code>' + esc(task.plan_path || '') + '</code></span>' +
                '</div>' +
                linksMarkup(task) +
                '<div class="task-board-card__section">' +
                    '<strong>当前 focus</strong>' +
                    listMarkup(plan.current_focus, '当前 focus 还没结构化到 plan。') +
                '</div>' +
                (
                    task.latest_evolution
                        ? '<div class="task-board-card__section"><strong>最近 evolution note</strong><p class="task-board-card__evolution"><a href="' + esc(task.latest_evolution.href) + '" target="_blank" rel="noopener noreferrer">' + esc(task.latest_evolution.name) + ' ↗</a></p><p class="task-board-card__evolution-summary">' + esc(task.latest_evolution.summary || '暂无摘要。') + '</p></div>'
                        : ''
                ) +
                '<div class="task-board-card__section">' +
                    '<strong>长期 scope</strong>' +
                    listMarkup(plan.scope, '该 plan 还没写出结构化 scope。') +
                '</div>' +
                '<div class="task-board-card__section">' +
                    '<strong>验证</strong>' +
                    listMarkup(plan.validation, '暂无独立验证规则。') +
                '</div>' +
            '</article>'
        )
    }

    function inlineCard(task) {
        return (
            '<article class="task-board-card task-board-card--inline">' +
                '<div class="task-board-card__topline">' +
                    '<span class="task-board-card__id">Task ' + esc(task.id) + '</span>' +
                    '<span class="task-board-card__state task-board-card__state--queued">inline</span>' +
                    (task.is_zhihu_ready ? '<span class="task-board-card__state task-board-card__state--active">zhihu</span>' : '') +
                '</div>' +
                '<h3>' + esc(task.headline) + '</h3>' +
                '<pre class="task-board-card__excerpt">' + esc(task.prompt_excerpt) + '</pre>' +
            '</article>'
        )
    }

    function setText(id, value) {
        var el = document.getElementById(id)
        if (el) el.textContent = String(value)
    }

    function compareTasks(a, b) {
        var aProgress = typeof (a.plan || {}).progress === 'number' ? a.plan.progress : -1
        var bProgress = typeof (b.plan || {}).progress === 'number' ? b.plan.progress : -1
        var aUpdated = (a.plan || {}).updated_at || ''
        var bUpdated = (b.plan || {}).updated_at || ''
        var stateOrder = { active: 0, blocked: 1, deferred: 2, queued: 3, done: 4 }
        if (activeSort === 'updated') {
            if (aUpdated !== bUpdated) return aUpdated < bUpdated ? 1 : -1
            if (bProgress !== aProgress) return bProgress - aProgress
        } else if (activeSort === 'state') {
            var aState = stateOrder[a.state] != null ? stateOrder[a.state] : 99
            var bState = stateOrder[b.state] != null ? stateOrder[b.state] : 99
            if (aState !== bState) return aState - bState
            if (bProgress !== aProgress) return bProgress - aProgress
            if (aUpdated !== bUpdated) return aUpdated < bUpdated ? 1 : -1
        } else {
            if (bProgress !== aProgress) return bProgress - aProgress
            if (aUpdated !== bUpdated) return aUpdated < bUpdated ? 1 : -1
        }
        return (a.id || 0) - (b.id || 0)
    }

    function matchesView(task) {
        if (activeView === 'topic') return !!task.has_topic
        if (activeView === 'evolution') return !!task.has_evolution
        if (activeView === 'publish') return !!task.is_publish_ready
        if (activeView === 'zhihu') return !!task.is_zhihu_ready
        return true
    }

    function renderZhihuDesk(inlineData) {
        var recurringZhihu = recurringData
            .filter(function (task) { return !!task.is_zhihu_ready })
            .filter(matchesQuery)
            .sort(compareTasks)
        var inlineZhihu = (inlineData || [])
            .filter(function (task) { return !!task.is_zhihu_ready })
            .filter(matchesQuery)

        if (!recurringZhihu.length && !inlineZhihu.length) {
            zhihuHost.innerHTML = '<p class="task-board-empty">当前没有被标记成知乎待发布的任务。</p>'
            return
        }

        var chunks = []
        recurringZhihu.forEach(function (task) {
            chunks.push(recurringCard(task))
        })
        inlineZhihu.forEach(function (task) {
            chunks.push(inlineCard(task))
        })
        zhihuHost.innerHTML = chunks.join('')
    }

    function matchesQuery(task) {
        if (!activeQuery) return true
        return String(task.search_text || '').toLowerCase().indexOf(activeQuery) !== -1
    }

    function renderActiveDesk() {
        var active = recurringData
            .filter(function (task) { return task.state === 'active' })
            .filter(matchesView)
            .filter(matchesQuery)
            .sort(compareTasks)

        if (!active.length) {
            activeHost.innerHTML = '<p class="task-board-empty">当前没有 active 长循环任务。</p>'
            return
        }

        activeHost.innerHTML = active.map(recurringCard).join('')
    }

    function renderRecurring() {
        var visible = recurringData.filter(function (task) {
            return activeFilter === 'all' ? true : task.state === activeFilter
        })
        visible = visible.filter(matchesView).filter(matchesQuery)
        var nonActive = visible
            .filter(function (task) { return task.state !== 'active' })
            .sort(compareTasks)

        if (!nonActive.length) {
            recurringHost.innerHTML = '<p class="task-board-empty">当前过滤条件下没有匹配任务。</p>'
            return
        }

        var groups = {}
        nonActive.forEach(function (task) {
            var group = task.semantic_group || '其他循环任务'
            if (!groups[group]) groups[group] = []
            groups[group].push(task)
        })

        recurringHost.innerHTML = Object.keys(groups)
            .sort()
            .map(function (group) {
                return (
                    '<section class="task-board-group">' +
                        '<div class="task-board-group__header">' +
                            '<h3>' + esc(group) + '</h3>' +
                            '<span>' + esc(groups[group].length) + ' tasks</span>' +
                        '</div>' +
                        '<div class="task-board-grid">' + groups[group].map(recurringCard).join('') + '</div>' +
                    '</section>'
                )
            })
            .join('')
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-task-filter') || 'all'
            filterButtons.forEach(function (btn) {
                btn.classList.toggle('is-active', btn === button)
            })
            renderRecurring()
        })
    })

    sortButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeSort = button.getAttribute('data-task-sort') || 'progress'
            sortButtons.forEach(function (btn) {
                btn.classList.toggle('is-active', btn === button)
            })
            renderActiveDesk()
            renderRecurring()
        })
    })

    viewButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeView = button.getAttribute('data-task-view') || 'all'
            viewButtons.forEach(function (btn) {
                btn.classList.toggle('is-active', btn === button)
            })
            renderActiveDesk()
            renderRecurring()
        })
    })

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            activeQuery = String(searchInput.value || '').trim().toLowerCase()
            renderActiveDesk()
            renderRecurring()
            renderZhihuDesk((window.__loopTaskInlineData || []))
        })
    }

    fetch('data/loop-task-board.json')
        .then(function (res) { return res.json() })
        .then(function (payload) {
            var recurring = payload.recurring || []
            var inline = payload.inline || []
            var meta = payload.meta || {}
            var states = meta.state_counts || {}

            recurringData = recurring
            window.__loopTaskInlineData = inline
            renderActiveDesk()
            renderRecurring()
            renderZhihuDesk(inline)
            inlineHost.innerHTML = inline.map(inlineCard).join('')

            setText('task-board-total', meta.task_count || 0)
            setText('task-board-recurring', meta.recurring_count || 0)
            setText('task-board-inline', meta.inline_count || 0)
            setText('task-board-active', states.active || 0)
            setText('task-board-zhihu', meta.zhihu_ready_count || 0)
            setText('task-board-count-active', states.active || 0)
            setText('task-board-count-deferred', states.deferred || 0)
            setText('task-board-count-done', states.done || 0)
            setText('task-board-count-queued', states.queued || 0)
        })
        .catch(function () {
            activeHost.innerHTML = ''
            zhihuHost.innerHTML = ''
            recurringHost.innerHTML = '<div class="course-quote"><p>任务数据加载失败，请先运行 <code>python3 tools/build_loop_task_board.py</code>。</p></div>'
            inlineHost.innerHTML = ''
        })
})()
