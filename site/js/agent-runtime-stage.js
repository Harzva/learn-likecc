;(function () {
    var root = document.getElementById('agent-runtime-stage')
    if (!root) return

    var jsonUrl = root.getAttribute('data-json') || 'data/agent-runtime-stages.json'
    var stages = []
    var meta = { autoplay_base_ms: 3200, loop_autoplay: false }
    var idx = 0
    var playing = false
    var timeoutId = null
    var reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function esc(value) {
        if (value == null) return ''
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    }

    function clearTimer() {
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
    }

    function buildShell() {
        root.innerHTML =
            '<div class="agent-runtime-stage__head">' +
            '<div><p class="agent-runtime-stage__eyebrow">动态分层图 · 非实时运行</p><h3 class="agent-runtime-stage__title">终端 Agent Runtime 六层拆解</h3></div>' +
            '<p class="agent-runtime-stage__counter" aria-live="polite"></p>' +
            '</div>' +
            '<div class="agent-runtime-stage__strip" role="tablist" aria-label="Agent Runtime stages"></div>' +
            '<div class="agent-runtime-stage__board">' +
            '<div class="agent-runtime-stage__summary"></div>' +
            '<div class="agent-runtime-stage__detail"></div>' +
            '</div>' +
            '<div class="agent-runtime-stage__controls">' +
            '<button type="button" class="agent-runtime-stage__btn" data-act="prev">← 上一层</button>' +
            '<button type="button" class="agent-runtime-stage__btn agent-runtime-stage__btn--primary" data-act="play">播放</button>' +
            '<button type="button" class="agent-runtime-stage__btn" data-act="next">下一层 →</button>' +
            '</div>'
    }

    function renderFiles(files) {
        if (!files || !files.length) return '<p class="agent-runtime-stage__empty">这层暂时没有源码锚点。</p>'
        return (
            '<div class="agent-runtime-stage__files">' +
            files
                .map(function (file) {
                    return '<span class="agent-runtime-stage__file">' + esc(file) + '</span>'
                })
                .join('') +
            '</div>'
        )
    }

    function render() {
        if (!stages.length) return
        var stage = stages[idx]
        var strip = root.querySelector('.agent-runtime-stage__strip')
        var summary = root.querySelector('.agent-runtime-stage__summary')
        var detail = root.querySelector('.agent-runtime-stage__detail')
        var counter = root.querySelector('.agent-runtime-stage__counter')
        var playBtn = root.querySelector('[data-act="play"]')

        counter.textContent = idx + 1 + ' / ' + stages.length + ' · ' + stage.label
        strip.innerHTML = ''
        stages.forEach(function (item, i) {
            var btn = document.createElement('button')
            btn.type = 'button'
            btn.className =
                'agent-runtime-stage__tab' + (i === idx ? ' agent-runtime-stage__tab--active' : '')
            btn.textContent = item.label
            btn.setAttribute('role', 'tab')
            btn.setAttribute('aria-selected', i === idx ? 'true' : 'false')
            btn.addEventListener('click', function () {
                go(i)
            })
            strip.appendChild(btn)
        })

        summary.innerHTML =
            '<p class="agent-runtime-stage__label">' +
            esc(stage.label) +
            '</p>' +
            '<h4>' +
            esc(stage.title) +
            '</h4>' +
            '<p class="agent-runtime-stage__lead">' +
            esc(stage.summary) +
            '</p>'

        detail.innerHTML =
            '<div class="agent-runtime-stage__card">' +
            '<p class="agent-runtime-stage__card-label">这层为什么重要</p>' +
            '<p>' +
            esc(stage.why) +
            '</p>' +
            '</div>' +
            '<div class="agent-runtime-stage__card">' +
            '<p class="agent-runtime-stage__card-label">源码抓手</p>' +
            renderFiles(stage.files) +
            '</div>' +
            '<div class="agent-runtime-stage__card agent-runtime-stage__card--question">' +
            '<p class="agent-runtime-stage__card-label">阅读问题</p>' +
            '<p>' +
            esc(stage.question) +
            '</p>' +
            '</div>'

        playBtn.textContent = playing ? '暂停' : '播放'
        playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false')
    }

    function schedule() {
        if (!playing || !stages.length) return
        clearTimer()
        var delay = reduceMotion ? Math.round(meta.autoplay_base_ms * 1.5) : meta.autoplay_base_ms
        timeoutId = setTimeout(function () {
            timeoutId = null
            if (!playing) return
            if (idx >= stages.length - 1) {
                if (meta.loop_autoplay) {
                    go(0)
                    schedule()
                    return
                }
                playing = false
                render()
                return
            }
            go(idx + 1)
            schedule()
        }, delay)
    }

    function go(nextIdx) {
        if (!stages.length) return
        idx = ((nextIdx % stages.length) + stages.length) % stages.length
        render()
    }

    function bindControls() {
        root.addEventListener('click', function (event) {
            var target = event.target
            if (!(target instanceof HTMLElement)) return
            var act = target.getAttribute('data-act')
            if (!act) return
            if (act === 'prev') {
                go(idx - 1)
                if (playing) schedule()
            } else if (act === 'next') {
                go(idx + 1)
                if (playing) schedule()
            } else if (act === 'play') {
                playing = !playing
                render()
                if (playing) schedule()
                else clearTimer()
            }
        })
    }

    function fail(message) {
        root.innerHTML = '<p class="agent-runtime-stage__error">' + esc(message) + '</p>'
    }

    buildShell()
    bindControls()

    fetch(jsonUrl)
        .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status)
            return response.json()
        })
        .then(function (data) {
            stages = Array.isArray(data.stages) ? data.stages : []
            if (data.meta) meta = Object.assign(meta, data.meta)
            if (!stages.length) throw new Error('No stages found')
            render()
        })
        .catch(function (error) {
            fail('Agent Runtime 视图加载失败：' + error.message)
        })
})()
