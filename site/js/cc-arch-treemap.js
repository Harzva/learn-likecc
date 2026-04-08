/**
 * Architecture treemap (D3) for topic-cc-unpacked-zh.html
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
            '<h3 class="cc-arch-treemap__title">Architecture Explorer（教学向）</h3>' +
            '<p class="cc-arch-treemap__sub">点击色块复制目录名；面积 ≈ 各文件夹下 TS/TSX 文件数。</p>' +
            '</div>' +
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

        function draw() {
            var w = Math.max(280, wrap.clientWidth || mount.clientWidth || 640)
            var h = Math.min(480, Math.max(280, Math.round(w * 0.58)))
            svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h)
            svg.setAttribute('width', '100%')
            svg.setAttribute('height', String(h))

            var root = d3
                .hierarchy(rootData)
                .sum(function (d) {
                    return d.value || 0
                })
                .sort(function (a, b) {
                    return (b.value || 0) - (a.value || 0)
                })

            d3.treemap().tile(d3.treemapSquarify).size([w, h]).paddingOuter(3).paddingInner(1).round(true)(
                root
            )

            svg.innerHTML = ''

            var nodes = root.descendants().filter(function (d) {
                return d.depth === 1
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

            cell.append('rect')
                .attr('width', function (d) {
                    return Math.max(0, d.x1 - d.x0)
                })
                .attr('height', function (d) {
                    return Math.max(0, d.y1 - d.y0)
                })
                .attr('fill', function (d) {
                    return COLORS[d.data.cat] || COLORS.support
                })
                .attr('stroke', 'rgba(0,0,0,0.55)')
                .attr('stroke-width', 1)
                .attr('rx', 2)
                .attr('ry', 2)

            cell.append('title').text(function (d) {
                return d.data.name + ' — ' + d.value + ' 个 TS/TSX 文件'
            })

            cell.filter(function (d) {
                return d.x1 - d.x0 > 56 && d.y1 - d.y0 > 36
            })
                .append('text')
                .attr('x', 6)
                .attr('y', 14)
                .attr('fill', 'rgba(255,255,255,0.95)')
                .attr('font-size', 11)
                .attr('font-family', 'ui-monospace, monospace')
                .style('pointer-events', 'none')
                .each(function (d) {
                    var name = d.data.name.replace(/\/$/, '')
                    var lines = [name, d.value + ' 文件']
                    var t = d3.select(this)
                    lines.forEach(function (line, i) {
                        t.append('tspan')
                            .attr('x', 6)
                            .attr('dy', i === 0 ? 0 : 13)
                            .text(line)
                    })
                })

            cell.on('click', function (ev, d) {
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
