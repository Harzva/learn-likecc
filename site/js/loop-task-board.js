;(function () {
    var recurringHost = document.getElementById('loop-task-recurring')
    var inlineHost = document.getElementById('loop-task-inline')
    if (!recurringHost || !inlineHost) return

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
                    '<span><strong>Checklist</strong> ' + esc(plan.completed_count || 0) + '/' + esc(plan.total_count || 0) + '</span>' +
                    '<span><strong>Plan</strong> <code>' + esc(task.plan_path || '') + '</code></span>' +
                '</div>' +
                '<div class="task-board-card__section">' +
                    '<strong>当前 focus</strong>' +
                    listMarkup(plan.current_focus, '当前 focus 还没结构化到 plan。') +
                '</div>' +
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

    fetch('data/loop-task-board.json')
        .then(function (res) { return res.json() })
        .then(function (payload) {
            var recurring = payload.recurring || []
            var inline = payload.inline || []
            var meta = payload.meta || {}
            var states = meta.state_counts || {}

            recurringHost.innerHTML = recurring.map(recurringCard).join('')
            inlineHost.innerHTML = inline.map(inlineCard).join('')

            setText('task-board-total', meta.task_count || 0)
            setText('task-board-recurring', meta.recurring_count || 0)
            setText('task-board-inline', meta.inline_count || 0)
            setText('task-board-active', states.active || 0)
            setText('task-board-count-active', states.active || 0)
            setText('task-board-count-deferred', states.deferred || 0)
            setText('task-board-count-done', states.done || 0)
            setText('task-board-count-queued', states.queued || 0)
        })
        .catch(function () {
            recurringHost.innerHTML = '<div class="course-quote"><p>任务数据加载失败，请先运行 <code>python3 tools/build_loop_task_board.py</code>。</p></div>'
            inlineHost.innerHTML = ''
        })
})()
