/**
 * Autoresearch / ARIS 研究循环步进播放器
 * 挂载点：<div id="aris-loop-player" data-json="data/aris-loop-steps.json">
 * 改编自 ds-research-loop-player.js / cc-loop-player.js，保持交互契约一致。
 */
;(function () {
    var root = document.getElementById('aris-loop-player')
    if (!root) return

    var jsonUrl = root.getAttribute('data-json') || 'data/aris-loop-steps.json'
    var steps = []
    var meta = { autoplay_base_ms: 2800, loop_autoplay: true }
    var idx = 0
    var playing = false
    var speed = 1
    var playTimeoutId = null
    var progressRafId = null
    var reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function esc(s) {
        if (!s) return ''
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    }

    function renderTerminal(lines) {
        if (!lines || !lines.length) return '<span class="cc-loop-player__cursor">▌</span>'
        var parts = []
        for (var i = 0; i < lines.length; i++) {
            if (lines[i] === '▌') parts.push('<span class="cc-loop-player__cursor">▌</span>')
            else parts.push(esc(lines[i]))
        }
        return parts.join('\n')
    }

    function renderLinks(links) {
        if (!links || !links.length) return ''
        var parts = links.map(function (L) {
            return '<a href="' + esc(L.href) + '">' + esc(L.text) + '</a>'
        })
        return '<div class="cc-loop-player__links">→ ' + parts.join(' · ') + '</div>'
    }

    function renderCardSection(label, text, cls) {
        if (!text) return ''
        return (
            '<div class="cc-loop-player__section' +
            (cls ? ' ' + cls : '') +
            '">' +
            '<p class="cc-loop-player__section-label">' +
            esc(label) +
            '</p>' +
            '<p>' +
            esc(text) +
            '</p>' +
            '</div>'
        )
    }

    function buildChrome() {
        root.innerHTML =
            '<div class="cc-loop-player__head">' +
            '<span class="cc-loop-player__badge">讲解模式 · 非实时运行</span>' +
            '<span class="cc-loop-player__counter" aria-live="polite"></span>' +
            '</div>' +
            '<div class="cc-loop-player__strip" role="tablist" aria-label="ARIS 研究循环协议步骤"></div>' +
            '<div class="cc-loop-player__progress" aria-hidden="true" title="下一帧倒计时">' +
            '<span class="cc-loop-player__progress-fill"></span></div>' +
            '<div class="cc-loop-player__body">' +
            '<div class="cc-loop-player__terminal" aria-label="示意终端"></div>' +
            '<div class="cc-loop-player__card" aria-live="polite" aria-atomic="true"></div>' +
            '</div>' +
            '<div class="cc-loop-player__controls">' +
            '<button type="button" class="cc-loop-player__btn" data-act="prev" aria-label="上一步">← 上一步</button>' +
            '<button type="button" class="cc-loop-player__btn cc-loop-player__btn--primary" data-act="play" aria-label="播放/暂停">▶ 播放</button>' +
            '<button type="button" class="cc-loop-player__btn" data-act="next" aria-label="下一步">下一步 →</button>' +
            '<button type="button" class="cc-loop-player__btn" data-act="speed" aria-label="切换倍速">1×</button>' +
            '</div>'
    }

    function renderStep(i) {
        var s = steps[i]
        if (!s) return
        var strip = root.querySelector('.cc-loop-player__strip')
        var terminal = root.querySelector('.cc-loop-player__terminal')
        var card = root.querySelector('.cc-loop-player__card')
        var counter = root.querySelector('.cc-loop-player__counter')
        var fill = root.querySelector('.cc-loop-player__progress-fill')

        if (strip) {
            Array.from(strip.children).forEach(function (el, j) {
                el.classList.toggle('is-active', j === i)
                el.setAttribute('aria-selected', j === i ? 'true' : 'false')
            })
        }
        if (terminal) terminal.innerHTML = '<pre><code>' + renderTerminal(s.terminal) + '</code></pre>'
        if (card) {
            card.innerHTML =
                '<div class="cc-loop-player__card-title">' + esc(s.title) + '</div>' +
                '<div class="cc-loop-player__card-body">' + esc(s.body) + '</div>' +
                renderCardSection('设计意图', s.analysis, 'cc-loop-player__section--analysis') +
                renderCardSection('常见陷阱', s.pitfall, 'cc-loop-player__section--pitfall') +
                renderCardSection('阅读建议', s.read_hint, 'cc-loop-player__section--read') +
                renderLinks(s.links)
        }
        if (counter) counter.textContent = (i + 1) + ' / ' + steps.length
        if (fill) {
            fill.style.width = '0%'
            fill.style.transition = 'none'
        }
    }

    function buildStrip() {
        var strip = root.querySelector('.cc-loop-player__strip')
        if (!strip) return
        strip.innerHTML = steps
            .map(function (s, i) {
                return (
                    '<button class="cc-loop-player__step" role="tab" data-index="' + i + '" aria-selected="' +
                    (i === 0 ? 'true' : 'false') + '">' +
                    '<span class="cc-loop-player__step-num">' + (i + 1) + '</span>' +
                    '<span class="cc-loop-player__step-label">' + esc(s.label) + '</span>' +
                    '</button>'
                )
            })
            .join('')
    }

    function advance() {
        if (!playing) return
        var base = (meta.autoplay_base_ms || 2600)
        var interval = reduceMotion ? base * 2.2 : base / Math.max(speed, 0.5)

        var fill = root.querySelector('.cc-loop-player__progress-fill')
        if (fill) {
            fill.style.transition = 'width ' + (interval / 1000) + 's linear'
            fill.style.width = '100%'
        }

        playTimeoutId = setTimeout(function () {
            if (!playing) return
            var next = idx + 1
            if (next >= steps.length) {
                if (meta.loop_autoplay) {
                    next = 0
                } else {
                    playing = false
                    updatePlayBtn()
                    return
                }
            }
            idx = next
            renderStep(idx)
            advance()
        }, interval)
    }

    function updatePlayBtn() {
        var btn = root.querySelector('[data-act="play"]')
        if (!btn) return
        btn.textContent = playing ? '⏸ 暂停' : '▶ 播放'
        btn.classList.toggle('cc-loop-player__btn--active', playing)
    }

    function togglePlay() {
        playing = !playing
        updatePlayBtn()
        if (playing) advance()
        else {
            if (playTimeoutId) clearTimeout(playTimeoutId)
            if (progressRafId) cancelAnimationFrame(progressRafId)
            var fill = root.querySelector('.cc-loop-player__progress-fill')
            if (fill) {
                fill.style.transition = 'none'
                fill.style.width = '0%'
            }
        }
    }

    function bindEvents() {
        root.addEventListener('click', function (ev) {
            var t = ev.target.closest('[data-act]')
            if (!t) return
            var act = t.getAttribute('data-act')
            if (act === 'prev') {
                if (idx > 0) { idx--; renderStep(idx); if (playing) { clearTimeout(playTimeoutId); advance() } }
            } else if (act === 'next') {
                if (idx < steps.length - 1) { idx++; renderStep(idx); if (playing) { clearTimeout(playTimeoutId); advance() } }
            } else if (act === 'play') {
                togglePlay()
            } else if (act === 'speed') {
                var speeds = [1, 1.5, 2, 0.75]
                var cur = parseFloat(t.textContent.replace('×', '')) || 1
                var ni = (speeds.indexOf(cur) + 1) % speeds.length
                speed = speeds[ni]
                t.textContent = speed + '×'
                if (playing) { clearTimeout(playTimeoutId); advance() }
            }
        })

        var strip = root.querySelector('.cc-loop-player__strip')
        if (strip) {
            strip.addEventListener('click', function (ev) {
                var step = ev.target.closest('.cc-loop-player__step')
                if (!step) return
                var i = parseInt(step.getAttribute('data-index'), 10)
                if (!isNaN(i)) { idx = i; renderStep(idx); if (playing) { clearTimeout(playTimeoutId); advance() } }
            })
        }

        root.addEventListener('keydown', function (ev) {
            if (ev.key === 'ArrowLeft') {
                ev.preventDefault()
                if (idx > 0) { idx--; renderStep(idx); if (playing) { clearTimeout(playTimeoutId); advance() } }
            } else if (ev.key === 'ArrowRight') {
                ev.preventDefault()
                if (idx < steps.length - 1) { idx++; renderStep(idx); if (playing) { clearTimeout(playTimeoutId); advance() } }
            } else if (ev.key === ' ' || ev.key === 'Spacebar') {
                ev.preventDefault()
                togglePlay()
            }
        })

        root.setAttribute('tabindex', '0')
    }

    function init() {
        buildChrome()
        buildStrip()
        renderStep(0)
        bindEvents()
    }

    fetch(jsonUrl)
        .then(function (r) { return r.json() })
        .then(function (d) {
            steps = d.steps || []
            meta = d.meta || meta
            if (steps.length) init()
            else root.innerHTML = '<p class="section-desc" style="color:#f87171">步进数据为空</p>'
        })
        .catch(function (err) {
            root.innerHTML = '<p class="section-desc" style="color:#f87171">加载步进数据失败：' + esc(err.message) + '</p>'
        })
})();
