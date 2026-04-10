/**
 * Superset architecture treemap (D3) — nested by teaching category, then per-folder leaves.
 * Mount: <div id="superset-arch-treemap-mount" data-json="data/superset-arch-treemap.json">
 */
;(function () {
    var mount = document.getElementById('superset-arch-treemap-mount')
    if (!mount) return

    var jsonUrl = mount.getAttribute('data-json') || 'data/superset-arch-treemap.json'
    var D3_SRC = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js'

    var COLORS = {
        shell_apps: '#cf9218',
        pane_surface: '#3a67df',
        control_plane: '#ea6a28',
        workspace_stack: '#26a269',
        shared_support: '#7a8ba5',
    }

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    }

    function setLoadingState(label) {
        mount.setAttribute('aria-busy', 'true')
        mount.innerHTML = '<div class="superset-loading">⏳ 正在加载' + esc(label) + '...</div>'
    }

    function clearBusy() {
        mount.removeAttribute('aria-busy')
    }

    function renderError(message) {
        clearBusy()
        mount.innerHTML = '<p class="cc-arch-treemap__err">' + esc(message) + '</p>'
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
            renderError('无法加载 D3 库（请检查网络或改用 HTTP 打开本站）。')
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
        var base = COLORS[d.data.cat] || COLORS.shared_support
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
            renderError('Treemap 数据为空。')
            return
        }

        mount.innerHTML =
            '<div class="cc-arch-treemap__head">' +
            '<h3 class="cc-arch-treemap__title">Superset Architecture Explorer（教学向 · 双层）</h3>' +
            '<p class="cc-arch-treemap__sub">大块 = 教学分区时可<strong>单击下钻</strong>；叶子块 = 子目录，<strong>单击复制</strong>目录名。顶部路径可返回上一级或全盘。</p>' +
            '</div>' +
            '<nav class="cc-arch-treemap__crumb" aria-label="Treemap 视图路径"></nav>' +
            '<div class="cc-arch-treemap__legend" role="list"></div>' +
            '<div class="cc-arch-treemap__svg-wrap">' +
            '<svg class="cc-arch-treemap__svg" aria-label="Superset 目录占比图"></svg>' +
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

        function breadcrumb(stack) {
            crumbEl.innerHTML = ''
            stack.forEach(function (item, i) {
                if (i > 0) {
                    var sep = document.createElement('span')
                    sep.className = 'cc-arch-treemap__crumb-sep'
                    sep.textContent = ' › '
                    crumbEl.appendChild(sep)
                }
                var isLast = i === stack.length - 1
                if (isLast) {
                    var cur = document.createElement('span')
                    cur.className = 'cc-arch-treemap__crumb-current'
                    cur.textContent = item.name
                    crumbEl.appendChild(cur)
                } else {
                    var btn = document.createElement('button')
                    btn.className = 'cc-arch-treemap__crumb-btn'
                    btn.textContent = item.name
                    btn.onclick = function () {
                        renderLevel(item.node, stack.slice(0, i + 1))
                    }
                    crumbEl.appendChild(btn)
                }
            })
        }

        function renderLevel(node, stack) {
            breadcrumb(stack)

            var rect = wrap.getBoundingClientRect()
            var width = Math.max(rect.width - 2, 200)
            var height = Math.max(rect.height - 2, 300)

            var root = d3
                .hierarchy(node)
                .sum(function (d) {
                    return d.value || 0
                })
                .sort(function (a, b) {
                    return b.value - a.value
                })

            d3.treemap().tile(d3.treemapSquarify).size([width, height]).paddingOuter(4).paddingInner(2)(
                root
            )

            svg.innerHTML = ''
            svg.setAttribute('width', width)
            svg.setAttribute('height', height)

            var g = d3.select(svg).append('g')

            var cells = g
                .selectAll('g')
                .data(root.leaves())
                .enter()
                .append('g')
                .attr('class', function (d) {
                    return 'cc-arch-treemap__cell' + (d.children ? ' cc-arch-treemap__cell--branch' : ' cc-arch-treemap__cell--leaf')
                })
                .attr('transform', function (d) {
                    return 'translate(' + d.x0 + ',' + d.y0 + ')'
                })

            cells
                .append('rect')
                .attr('width', function (d) {
                    return Math.max(d.x1 - d.x0 - 1, 0)
                })
                .attr('height', function (d) {
                    return Math.max(d.y1 - d.y0 - 1, 0)
                })
                .attr('fill', function (d) {
                    return fillFor(d3, d)
                })
                .attr('stroke', '#fff')
                .attr('stroke-width', 1)

            cells
                .append('text')
                .attr('x', 4)
                .attr('y', 14)
                .attr('font-size', '11px')
                .attr('fill', '#fff')
                .text(function (d) {
                    var w = d.x1 - d.x0
                    var name = d.data.name
                    if (w < 40) return ''
                    if (w < 80) return name.slice(0, 6) + '…'
                    return name
                })

            cells.on('click', function (event, d) {
                event.stopPropagation()
                if (d.data.children && d.data.children.length) {
                    var newStack = stack.concat([{ name: d.data.name, node: d.data }])
                    renderLevel(d.data, newStack)
                } else {
                    var name = d.data.name
                    navigator.clipboard.writeText(name).then(function () {
                        showToast('已复制: ' + name)
                    })
                }
            })
        }

        renderLevel(rootData, [{ name: 'superset', node: rootData }])
        clearBusy()
    }

    function load() {
        setLoadingState('Treemap 数据')
        fetch(jsonUrl)
            .then(function (r) {
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status)
                }
                return r.json()
            })
            .then(function (data) {
                render(data.treemap || data)
            })
            .catch(function (err) {
                console.error('Treemap load error:', err)
                renderError('无法加载 Treemap 数据（请用 HTTP 打开本站，并检查 data/superset-arch-treemap.json）。')
            })
    }

    loadScript(D3_SRC, load)
})()
