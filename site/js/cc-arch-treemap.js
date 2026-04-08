/**
 * Architecture treemap (D3) — nested by teaching category, then per-folder leaves.
 * Mount: <div id="cc-arch-treemap-mount" data-json="data/cc-arch-treemap.json">
 */
;(function () {
    var mount = document.getElementById('cc-arch-treemap-mount')
    if (!mount) return

    var jsonUrl = mount.getAttribute('data-json') || 'data/cc-arch-treemap.json'
    var D3_SRC = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js'

    var COLORS = {
        tools_commands: '#ca8a04',
        core: '#16a34a',
        ui: '#2563eb',
        bridge: '#ea580c',
        infra: '#64748b',
        support: '#475569',
        personality: '#9333ea',
    }

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    }

    function loadScript(src, cb) {
        if (window.d3) return cb()
        var s = document.createElement('script')
        s.src = src
        s.async = true
        s.onload = function () {
            cb()
        }
        s.onerror = function () {
            mount.innerHTML =
                '<p class="cc-arch-treemap__err">无法加载 D3 库（请检查网络或改用 HTTP 打开本站）。</p>'
        }
        document.head.appendChild(s)
    }

    function showToast(msg) {
        var t = mount.querySelector('.cc-arch-treemap__toast')
        if (!t) return
        t.textContent = msg
        t.hidden = false
        clearTimeout(showToast._id)
        showToast._id = setTimeout(function () {
            t.hidden = true
        }, 1600)
    }

    function fillFor(d3, d) {
        var base = COLORS[d.data.cat] || COLORS.support
        var c = d3.color(base)
        if (!c) return base
        if (d.children) return c.darker(0.4).formatHex()
        return base
    }

    function render(payload) {
        var d3 = window.d3
        var legend = payload.legend || []
        var rootData = payload.root
        if (!rootData || !rootData.children || !rootData.children.length) {
            mount.innerHTML = '<p class="cc-arch-treemap__err">Treemap 数据为空。</p>'
            return
        }

        mount.innerHTML =
            '<div class="cc-arch-treemap__head">' +
            '<h3 class="cc-arch-treemap__title">Architecture Explorer（教学向 · 双层）</h3>' +
            '<p class="cc-arch-treemap__sub">大块 = 教学分区时可<strong>单击下钻</strong>；叶子块 = 子目录，<strong>单击复制</strong>目录名。顶部路径可返回上一级或全盘。</p>' +
            '</div>' +
            '<nav class="cc-arch-treemap__crumb" aria-label="Treemap 视图路径"></nav>' +
            '<div class="cc-arch-treemap__legend" role="list"></div>' +
            '<div class="cc-arch-treemap__svg-wrap">' +
            '<svg class="cc-arch-treemap__svg" aria-label="src 目录占比图"></svg>' +
            '</div>' +
            '<p class="cc-arch-treemap__toast" role="status" aria-live="polite" hidden></p>'

        var legEl = mount.querySelector('.cc-arch-treemap__legend')
        legend.forEach(function (L) {
            var dot = COLORS[L.key] || '#888'
            var item = document.createElement('div')
            item.className = 'cc-arch-treemap__legend-item'
            item.setAttribute('role', 'listitem')
            item.innerHTML =
                '<span class="cc-arch-treemap__legend-swatch" style="background:' +
                esc(dot) +
                '"></span>' +
                '<span class="cc-arch-treemap__legend-text"><strong>' +
                esc(L.label) +
                '</strong>' +
                (L.hint ? ' · ' + esc(L.hint) : '') +
                '</span>'
            legEl.appendChild(item)
        })

        var svg = mount.querySelector('.cc-arch-treemap__svg')
        var wrap = mount.querySelector('.cc-arch-treemap__svg-wrap')
        var crumbEl = mount.querySelector('.cc-arch-treemap__crumb')

        /** @type {object[]} 下钻栈，最后一项为当前 treemap 根数据节点 */
        var stack = [rootData]

        function syncBreadcrumb() {
            crumbEl.innerHTML = ''
            stack.forEach(function (node, i) {
                if (i > 0) {
                    var sep = document.createElement('span')
                    sep.className = 'cc-arch-treemap__crumb-sep'
                    sep.setAttribute('aria-hidden', 'true')
                    sep.textContent = ' / '
                    crumbEl.appendChild(sep)
                }
                var isLast = i === stack.length - 1
                if (isLast) {
                    var cur = document.createElement('span')
                    cur.className = 'cc-arch-treemap__crumb-current'
                    cur.textContent = node.name || 'root'
                    crumbEl.appendChild(cur)
                } else {
                    var btn = document.createElement('button')
                    btn.type = 'button'
                    btn.className = 'cc-arch-treemap__crumb-btn'
                    btn.textContent = node.name || 'root'
                    btn.setAttribute('aria-label', '返回：' + (node.name || 'root'))
                    ;(function (idx) {
                        btn.addEventListener('click', function () {
                            stack = stack.slice(0, idx + 1)
                            draw()
                        })
                    })(i)
                    crumbEl.appendChild(btn)
                }
            })
        }

        function draw() {
            var viewRoot = stack[stack.length - 1]
            syncBreadcrumb()

            var w = Math.max(280, wrap.clientWidth || mount.clientWidth || 640)
            var vh = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 800
            /* 随宽度增高，并用视口高度封顶，避免大屏上 Treemap 过扁 */
            var byWidth = Math.max(380, Math.round(w * 0.62))
            var byViewport = Math.round(vh * 0.58)
            var h = Math.min(1120, Math.max(360, byWidth, byViewport))
            svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h)
            svg.setAttribute('width', '100%')
            svg.setAttribute('height', String(h))

            var root = d3
                .hierarchy(viewRoot)
                .sum(function (d) {
                    return d.value || 0
                })
                .sort(function (a, b) {
                    return (b.value || 0) - (a.value || 0)
                })

            d3.treemap()
                .tile(d3.treemapSquarify)
                .size([w, h])
                .paddingOuter(6)
                .paddingTop(34)
                .paddingInner(3)
                .round(true)(root)

            svg.innerHTML = ''

            var nodes = root.descendants().filter(function (d) {
                return d.depth >= 1
            })

            var g = d3.select(svg).append('g')

            var cell = g
                .selectAll('g')
                .data(nodes)
                .join('g')
                .attr('transform', function (d) {
                    return 'translate(' + d.x0 + ',' + d.y0 + ')'
                })
                .style('cursor', 'pointer')
                .attr('class', function (d) {
                    return 'cc-arch-treemap__cell' + (d.children ? ' cc-arch-treemap__cell--branch' : ' cc-arch-treemap__cell--leaf')
                })

            cell.append('rect')
                .attr('width', function (d) {
                    return Math.max(0, d.x1 - d.x0)
                })
                .attr('height', function (d) {
                    return Math.max(0, d.y1 - d.y0)
                })
                .attr('fill', function (d) {
                    return fillFor(d3, d)
                })
                .attr('stroke', 'rgba(255,255,255,0.1)')
                .attr('stroke-width', function (d) {
                    return d.children ? 1.25 : 0.75
                })
                .attr('rx', 4)
                .attr('ry', 4)

            cell.append('title').text(function (d) {
                if (d.children) {
                    return d.data.name + ' — 合计 ' + d.value + ' 个文件 · 单击下钻'
                }
                return d.data.name + ' — ' + d.value + ' 个 TS/TSX 文件 · 单击复制名称'
            })

            cell.filter(function (d) {
                return d.children && d.x1 - d.x0 > 110 && d.y1 - d.y0 > 44
            })
                .append('text')
                .attr('x', 9)
                .attr('y', 24)
                .attr('fill', 'rgba(255,255,255,0.88)')
                .attr('font-size', 18)
                .attr('font-weight', 700)
                .attr('font-family', 'system-ui, sans-serif')
                .style('pointer-events', 'none')
                .text(function (d) {
                    return d.data.name
                })

            cell.filter(function (d) {
                return d.children && d.x1 - d.x0 > 132 && d.y1 - d.y0 > 68
            })
                .append('text')
                .attr('x', 9)
                .attr('y', 49)
                .attr('fill', 'rgba(255,255,255,0.55)')
                .attr('font-size', 12.5)
                .attr('font-family', 'system-ui, sans-serif')
                .style('pointer-events', 'none')
                .text('单击下钻')

            cell.filter(function (d) {
                return !d.children && d.x1 - d.x0 > 74 && d.y1 - d.y0 > 52
            })
                .append('text')
                .attr('x', 8)
                .attr('y', 18)
                .attr('fill', 'rgba(255,255,255,0.95)')
                .attr('font-size', 15)
                .attr('font-family', 'ui-monospace, monospace')
                .style('pointer-events', 'none')
                .each(function (d) {
                    var name = String(d.data.name).replace(/\/$/, '')
                    var lines = [name, d.value + ' 文件']
                    var t = d3.select(this)
                    lines.forEach(function (line, i) {
                        t.append('tspan')
                            .attr('x', 8)
                            .attr('dy', i === 0 ? 0 : 21)
                            .text(line)
                    })
                })

            cell.on('click', function (ev, d) {
                ev.stopPropagation()
                if (d.children) {
                    stack.push(d.data)
                    draw()
                    return
                }
                var name = d.data.name || ''
                var copy = name.replace(/\/$/, '')
                function done() {
                    showToast('已复制：' + copy)
                }
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(copy).then(done).catch(done)
                } else {
                    done()
                }
            })
        }

        draw()
        if (typeof ResizeObserver !== 'undefined') {
            var ro = new ResizeObserver(function () {
                draw()
            })
            ro.observe(wrap)
        } else {
            window.addEventListener('resize', draw)
        }
    }

    loadScript(D3_SRC, function () {
        fetch(jsonUrl)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status)
                return r.json()
            })
            .then(render)
            .catch(function () {
                mount.innerHTML =
                    '<p class="cc-arch-treemap__err">无法加载 Treemap 数据（请用 HTTP 打开本站，并检查 data/cc-arch-treemap.json）。</p>'
            })
    })
})()
