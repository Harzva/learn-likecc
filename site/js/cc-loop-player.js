/**
 * 讲解型主循环步进播放器：数据来自 site/data/cc-loop-steps.json
 * 挂载点：<div id="cc-loop-player" data-json="data/cc-loop-steps.json">
 */
;(function () {
    var root = document.getElementById('cc-loop-player')
    if (!root) return

    var jsonUrl = root.getAttribute('data-json') || 'data/cc-loop-steps.json'
    var steps = []
    var meta = { autoplay_base_ms: 2600, loop_autoplay: false }
    var idx = 0
    var playing = false
    var speed = 1
    var timer = null
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

    function buildChrome() {
        root.innerHTML =
            '<div class="cc-loop-player__head">' +
            '<span class="cc-loop-player__badge">讲解模式 · 非实时运行</span>' +
            '<span class="cc-loop-player__counter" aria-live="polite"></span>' +
            '</div>' +
            '<div class="cc-loop-player__strip" role="tablist" aria-label="主循环步骤"></div>' +
            '<div class="cc-loop-player__body">' +
            '<div class="cc-loop-player__terminal" aria-label="示意终端"></div>' +
            '<div class="cc-loop-player__card" aria-live="polite" aria-atomic="true"></div>' +
            '</div>' +
            '<div class="cc-loop-player__controls">' +
            '<button type="button" class="cc-loop-player__btn" data-act="prev" aria-label="上一步">← 上一步</button>' +
            '<button type="button" class="cc-loop-player__btn cc-loop-player__btn--primary" data-act="play" aria-label="播放或暂停">播放</button>' +
            '<button type="button" class="cc-loop-player__btn" data-act="next" aria-label="下一步">下一步 →</button>' +
            '<span class="cc-loop-player__speed">倍速 ' +
            '<button type="button" class="cc-loop-player__btn" data-speed="0.5">0.5×</button>' +
            '<button type="button" class="cc-loop-player__btn" data-speed="1">1×</button>' +
            '<button type="button" class="cc-loop-player__btn" data-speed="2">2×</button>' +
            '</span></div>'
    }

    function updateUI() {
        var strip = root.querySelector('.cc-loop-player__strip')
        var term = root.querySelector('.cc-loop-player__terminal')
        var card = root.querySelector('.cc-loop-player__card')
        var counter = root.querySelector('.cc-loop-player__counter')
        var playBtn = root.querySelector('[data-act="play"]')
        if (!steps.length) return

        var st = steps[idx]
        counter.textContent = idx + 1 + ' / ' + steps.length + ' · ' + st.label

        strip.innerHTML = ''
        steps.forEach(function (s, i) {
            var b = document.createElement('button')
            b.type = 'button'
            b.className = 'cc-loop-player__dot' + (i === idx ? ' cc-loop-player__dot--active' : '')
            b.textContent = s.label
            b.setAttribute('role', 'tab')
            b.setAttribute('aria-selected', i === idx ? 'true' : 'false')
            b.addEventListener('click', function () {
                go(i)
            })
            strip.appendChild(b)
        })

        term.innerHTML = renderTerminal(st.terminal)
        card.innerHTML =
            '<h3>' + esc(st.title) + '</h3><p>' + esc(st.body) + '</p>' + renderLinks(st.links)

        playBtn.textContent = playing ? '暂停' : '播放'
        playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false')

        root.querySelectorAll('[data-speed]').forEach(function (btn) {
            var v = parseFloat(btn.getAttribute('data-speed'))
            btn.classList.toggle('cc-loop-player__btn--speed-active', Math.abs(v - speed) < 0.01)
            btn.setAttribute('aria-pressed', Math.abs(v - speed) < 0.01 ? 'true' : 'false')
        })
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer)
            timer = null
        }
    }

    function go(i) {
        idx = ((i % steps.length) + steps.length) % steps.length
        updateUI()
    }

    function next() {
        go(idx + 1)
    }

    function prev() {
        go(idx - 1)
    }

    function tickPlay() {
        if (!playing || !steps.length) return
        stopTimer()
        var ms = Math.max(800, meta.autoplay_base_ms / speed)
        if (reduceMotion) ms = Math.round(ms * 1.75)
        timer = setInterval(function () {
            if (idx >= steps.length - 1) {
                if (meta.loop_autoplay) {
                    go(0)
                    return
                }
                playing = false
                stopTimer()
                updateUI()
                return
            }
            next()
        }, ms)
    }

    function setPlaying(p) {
        playing = p
        updateUI()
        if (playing) tickPlay()
        else stopTimer()
    }

    function fail(msg) {
        root.innerHTML = '<p class="cc-loop-player__err">' + esc(msg) + '</p>'
        root.classList.add('is-reduced')
    }

    buildChrome()

    fetch(jsonUrl)
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status)
            return r.json()
        })
        .then(function (data) {
            steps = data.steps || []
            if (data.meta) {
                if (data.meta.autoplay_base_ms) meta.autoplay_base_ms = data.meta.autoplay_base_ms
                if (typeof data.meta.loop_autoplay === 'boolean')
                    meta.loop_autoplay = data.meta.loop_autoplay
            }
            if (!steps.length) {
                fail('未找到步骤数据')
                return
            }
            var badge = root.querySelector('.cc-loop-player__badge')
            if (badge) {
                badge.textContent = meta.loop_autoplay
                    ? '讲解模式 · 自动循环 · 非实时运行'
                    : '讲解模式 · 非实时运行'
            }
            updateUI()

            root.addEventListener('click', function () {
                try {
                    root.focus({ preventScroll: true })
                } catch (e) {
                    root.focus()
                }
            })

            root.querySelector('[data-act="prev"]').addEventListener('click', function () {
                prev()
            })
            root.querySelector('[data-act="next"]').addEventListener('click', function () {
                next()
            })
            root.querySelector('[data-act="play"]').addEventListener('click', function () {
                if (playing) {
                    setPlaying(false)
                    return
                }
                if (idx >= steps.length - 1) go(0)
                setPlaying(true)
            })
            root.querySelectorAll('[data-speed]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    speed = parseFloat(btn.getAttribute('data-speed')) || 1
                    updateUI()
                    if (playing) tickPlay()
                })
            })

            root.setAttribute('tabindex', '-1')
            document.addEventListener('keydown', function (ev) {
                if (!root.matches(':focus-within')) return
                var t = ev.target
                if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
                if (ev.key === 'ArrowRight') {
                    ev.preventDefault()
                    next()
                } else if (ev.key === 'ArrowLeft') {
                    ev.preventDefault()
                    prev()
                } else if (ev.key === ' ' || ev.key === 'Spacebar') {
                    ev.preventDefault()
                    root.querySelector('[data-act="play"]').click()
                }
            })
        })
        .catch(function () {
            fail('无法加载步进数据（请用 HTTP 打开本站，或检查 data/cc-loop-steps.json）')
        })
})()
