/**
 * Superset architecture knowledge graph.
 * Modes:
 * - contains: category -> folder structure
 * - cross: curated cross-block relationships
 * - hybrid: both together
 */
;(function () {
    var mount = document.getElementById('superset-arch-knowledge-mount')
    if (!mount) return

    var jsonUrl = mount.getAttribute('data-json') || 'data/superset-arch-knowledge.json'
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
        s.onload = cb
        s.onerror = function () {
            renderError('无法加载 D3，知识图谱未能渲染。')
        }
        document.head.appendChild(s)
    }

    function shortLabel(label) {
        return String(label || '').replace(/\/$/, '').replace(/^（/, '').replace(/）$/, '')
    }

    function colorWithAlpha(d3, hex, alpha) {
        var c = d3.color(hex)
        if (!c) return hex
        c.opacity = alpha
        return c.formatRgb()
    }

    function relationBadge(kind) {
        if (kind === 'cross') return ' · 跨块'
        if (kind === 'contains') return ' · 归属'
        return ' · 相关'
    }

    function relationRank(kind) {
        if (kind === 'cross') return 0
        if (kind === 'contains') return 4
        return 5
    }

    function isLowSignalNote(note) {
        var text = String(note || '').trim()
        if (!text) return true
        return /内部目录$/.test(text)
    }

    function render(payload) {
        var d3 = window.d3
        var modes = [
            { id: 'hybrid', label: '混合总览', desc: '同时看块内结构与跨块联系' },
            { id: 'contains', label: '块内结构', desc: '看每个教学分区下面有哪些主目录' },
            { id: 'cross', label: '块间联系', desc: '看不同块之间最值得一起读的连接' },
        ]
        var currentMode = 'hybrid'
        var selectedId = null

        mount.innerHTML =
            '<div class="cc-arch-knowledge__toolbar">' +
            '<div>' +
            '<h3 class="cc-arch-knowledge__title">Superset Architecture Knowledge Graph</h3>' +
            '<p class="cc-arch-knowledge__subtitle">用网络图补足 Treemap 看不到的"谁和谁经常一起读"。</p>' +
            '</div>' +
            '<div class="cc-arch-knowledge__controls"></div>' +
            '</div>' +
            '<div class="cc-arch-knowledge__layout">' +
            '<div class="cc-arch-knowledge__canvas"><svg class="cc-arch-knowledge__svg" aria-label="Superset 架构知识图谱"></svg></div>' +
            '<aside class="cc-arch-knowledge__panel">' +
            '<div class="cc-arch-knowledge__legend"></div>' +
            '<div class="cc-arch-knowledge__detail"></div>' +
            '<div class="cc-arch-knowledge__note"></div>' +
            '</aside>' +
            '</div>'

        var controlsEl = mount.querySelector('.cc-arch-knowledge__controls')
        var svgEl = mount.querySelector('.cc-arch-knowledge__svg')
        var legendEl = mount.querySelector('.cc-arch-knowledge__legend')
        var detailEl = mount.querySelector('.cc-arch-knowledge__detail')
        var noteEl = mount.querySelector('.cc-arch-knowledge__note')
        var canvasEl = mount.querySelector('.cc-arch-knowledge__canvas')

        modes.forEach(function (mode) {
            var btn = document.createElement('button')
            btn.type = 'button'
            btn.className = 'cc-arch-knowledge__btn' + (mode.id === currentMode ? ' is-active' : '')
            btn.textContent = mode.label
            btn.title = mode.desc
            btn.addEventListener('click', function () {
                currentMode = mode.id
                selectedId = null
                Array.prototype.forEach.call(controlsEl.querySelectorAll('.cc-arch-knowledge__btn'), function (node) {
                    node.classList.toggle('is-active', node === btn)
                })
                draw()
            })
            controlsEl.appendChild(btn)
        })

        ;(payload.legend || []).forEach(function (item) {
            var pill = document.createElement('div')
            pill.className = 'cc-arch-knowledge__legend-item'
            pill.innerHTML =
                '<span class="cc-arch-knowledge__legend-dot" style="background:' +
                esc(COLORS[item.key] || '#888') +
                '"></span>' +
                '<span>' +
                esc(item.label) +
                '</span>'
            legendEl.appendChild(pill)
        })

        noteEl.textContent =
            payload.meta && payload.meta.note_zh
                ? payload.meta.note_zh
                : '知识图谱用于建立阅读心智模型，不是严格的静态依赖图。'

        function getModeLinks() {
            if (currentMode === 'contains') return payload.contains_links || []
            if (currentMode === 'cross') return payload.cross_links || []
            return (payload.contains_links || []).concat(payload.cross_links || [])
        }

        function getModeNodes(links) {
            var need = {}
            links.forEach(function (link) {
                need[link.source] = true
                need[link.target] = true
            })
            return (payload.nodes || []).filter(function (node) {
                if (currentMode === 'hybrid') return true
                return !!need[node.id]
            })
        }

        function nodeRadius(node) {
            if (node.kind === 'category') return 18 + Math.min(16, Math.sqrt(node.size || 1) * 0.45)
            return 8 + Math.min(14, Math.sqrt(node.size || 1) * 0.45)
        }

        function buildAdjacency(links) {
            var map = {}
            links.forEach(function (link) {
                ;(map[link.source] = map[link.source] || []).push(link)
                ;(map[link.target] = map[link.target] || []).push(link)
            })
            return map
        }

        function renderDetail(node, adjacency, allNodes) {
            if (!node) {
                detailEl.innerHTML =
                    '<p class="cc-arch-knowledge__eyebrow">How To Read</p>' +
                    '<h4 class="cc-arch-knowledge__name">先点一个节点</h4>' +
                    '<p class="cc-arch-knowledge__desc">左边网络图负责显示结构和联系，右边这里负责解释这个块是什么、和谁连得最紧，以及为什么值得一起读。</p>' +
                    '<p class="cc-arch-knowledge__empty">推荐先点 <strong>desktop</strong>、<strong>panes</strong>、<strong>host-service</strong>，理解 Superset 的三层核心。</p>'
                return
            }

            var related = (adjacency[node.id] || [])
                .map(function (link) {
                    var srcId = typeof link.source === 'object' ? link.source.id : link.source
                    var dstId = typeof link.target === 'object' ? link.target.id : link.target
                    var otherId = srcId === node.id ? dstId : srcId
                    var other = allNodes[otherId]
                    return other
                        ? {
                              label: shortLabel(other.label),
                              note: link.note || '',
                              kind: link.kind || '',
                          }
                        : null
                })
                .filter(Boolean)
                .sort(function (a, b) {
                    var rankDiff = relationRank(a.kind) - relationRank(b.kind)
                    if (rankDiff) return rankDiff
                    return a.label.localeCompare(b.label, 'zh-Hans-CN')
                })

            var relatedExplained = related
                .filter(function (item) {
                    return item.note && !isLowSignalNote(item.note)
                })
                .slice(0, 8)
                .map(function (item) {
                    return (
                        '<li class="cc-arch-knowledge__bullet-item"><strong>' +
                        esc(item.label) +
                        '</strong>：' +
                        esc(item.note) +
                        '</li>'
                    )
                })
                .join('')

            detailEl.innerHTML =
                '<p class="cc-arch-knowledge__eyebrow">' +
                esc(node.kind === 'category' ? 'Category' : 'Folder') +
                '</p>' +
                '<h4 class="cc-arch-knowledge__name">' +
                esc(shortLabel(node.label)) +
                '</h4>' +
                '<p class="cc-arch-knowledge__meta">' +
                ('文件量约 <strong>' +
                  esc(node.size) +
                  '</strong> · 所属分区 <strong>' +
                  esc(node.kind === 'category' ? node.label : (allNodes[node.parent] ? allNodes[node.parent].label : node.cat)) +
                  '</strong>') +
                '</p>' +
                '<p class="cc-arch-knowledge__desc">' +
                esc(node.description || node.hint || '这是图谱中的一个结构节点。') +
                '</p>' +
                (node.analysis
                    ? '<p class="cc-arch-knowledge__why-title">为什么重要</p>' +
                      '<p class="cc-arch-knowledge__desc">' +
                      esc(node.analysis) +
                      '</p>'
                    : '') +
                (node.read_hint
                    ? '<p class="cc-arch-knowledge__why-title">建议先看</p>' +
                      '<p class="cc-arch-knowledge__desc">' +
                      esc(node.read_hint) +
                      '</p>'
                    : '') +
                '<p class="cc-arch-knowledge__related">相关节点：</p>' +
                '<div class="cc-arch-knowledge__related-list">' +
                (related.length
                    ? related
                          .slice(0, 10)
                          .map(function (item) {
                              return (
                                  '<span class="cc-arch-knowledge__chip">' +
                                  esc(item.label) +
                                  relationBadge(item.kind) +
                                  '</span>'
                              )
                          })
                          .join('')
                    : '<span class="cc-arch-knowledge__empty">当前模式下没有额外连接。</span>') +
                '</div>' +
                (relatedExplained
                    ? '<div class="cc-arch-knowledge__why-block">' +
                      '<p class="cc-arch-knowledge__why-title">为什么连到这些块</p>' +
                      '<ul class="cc-arch-knowledge__bullet-list">' +
                      relatedExplained +
                      '</ul>' +
                      '</div>'
                    : '')
        }

        function draw() {
            var width = Math.max(760, canvasEl.clientWidth - 8)
            var height = window.innerWidth <= 768 ? 560 : 760
            svgEl.setAttribute('viewBox', '0 0 ' + width + ' ' + height)

            noteEl.textContent =
                payload.meta && payload.meta.note_zh
                  ? payload.meta.note_zh
                  : '知识图谱用于建立阅读心智模型，不是严格的静态依赖图。'

            var links = getModeLinks().map(function (link) {
                return {
                    source: link.source,
                    target: link.target,
                    weight: link.weight || 1,
                    kind: link.kind || 'cross',
                    note: link.note || '',
                }
            })
            var nodes = getModeNodes(links).map(function (node) {
                return {
                    id: node.id,
                    key: node.key,
                    label: node.label,
                    kind: node.kind,
                    cat: node.cat,
                    parent: node.parent,
                    size: node.size,
                    analysis: node.analysis || '',
                    read_hint: node.read_hint || '',
                    hint: node.hint || '',
                    description: node.description || '',
                }
            })
            var nodeMap = {}
            nodes.forEach(function (node) {
                nodeMap[node.id] = node
            })
            var adjacency = buildAdjacency(links)

            renderDetail(selectedId ? nodeMap[selectedId] : null, adjacency, nodeMap)

            svgEl.innerHTML = ''
            var svg = d3.select(svgEl)
            var root = svg.append('g')
            var linkLayer = root.append('g')
            var nodeLayer = root.append('g')

            var cats = (payload.legend || []).map(function (item) {
                return item.key
            })
            function anchorForCat(cat) {
                var idx = Math.max(0, cats.indexOf(cat))
                var cols = 3
                var row = Math.floor(idx / cols)
                var col = idx % cols
                var xGap = width / (cols + 1)
                var yGap = height / 3
                return {
                    x: xGap * (col + 1),
                    y: row === 0 ? yGap * 0.82 : yGap * 1.88,
                }
            }

            var simulation = d3
                .forceSimulation(nodes)
                .force(
                    'link',
                    d3
                        .forceLink(links)
                        .id(function (d) {
                            return d.id
                        })
                        .distance(function (d) {
                            return d.kind === 'contains' ? 80 : 120
                        })
                        .strength(function (d) {
                            return d.kind === 'contains' ? 0.9 : 0.5
                        })
                )
                .force(
                    'charge',
                    d3.forceManyBody().strength(function (d) {
                        return d.kind === 'category' ? -900 : currentMode === 'cross' ? -260 : -180
                    })
                )
                .force(
                    'collide',
                    d3.forceCollide().radius(function (d) {
                        return nodeRadius(d) + (d.kind === 'category' ? 14 : 8)
                    })
                )
                .force(
                    'x',
                    d3.forceX().x(function (d) {
                        var a = anchorForCat(d.cat)
                        if (d.kind === 'category') return a.x
                        return currentMode === 'cross' ? a.x + (Math.random() - 0.5) * 80 : a.x
                    }).strength(function (d) {
                        return d.kind === 'category' ? 0.22 : currentMode === 'cross' ? 0.09 : 0.13
                    })
                )
                .force(
                    'y',
                    d3.forceY().y(function (d) {
                        var a = anchorForCat(d.cat)
                        if (d.kind === 'category') return a.y
                        return currentMode === 'cross' ? a.y + (Math.random() - 0.5) * 90 : a.y + 25
                    }).strength(function (d) {
                        return d.kind === 'category' ? 0.22 : currentMode === 'cross' ? 0.09 : 0.14
                    })
                )
                .force('center', d3.forceCenter(width / 2, height / 2))

            var link = linkLayer
                .selectAll('line')
                .data(links)
                .join('line')
                .attr('class', function (d) {
                    return 'cc-arch-knowledge__link cc-arch-knowledge__link--' + d.kind
                })
                .attr('stroke-width', function (d) {
                    return d.kind === 'contains' ? 1 + Math.min(3.5, d.weight / 70) : 1.2 + d.weight * 0.35
                })
                .attr('stroke-opacity', function (d) {
                    return d.kind === 'contains' ? 0.6 : 0.85
                })
                .attr('stroke', function (d) {
                    return null
                })

            var node = nodeLayer
                .selectAll('g')
                .data(nodes)
                .join('g')
                .attr('class', 'cc-arch-knowledge__node')
                .style('cursor', 'pointer')
                .call(
                    d3
                        .drag()
                        .on('start', function (event, d) {
                            if (!event.active) simulation.alphaTarget(0.24).restart()
                            d.fx = d.x
                            d.fy = d.y
                        })
                        .on('drag', function (event, d) {
                            d.fx = event.x
                            d.fy = event.y
                        })
                        .on('end', function (event, d) {
                            if (!event.active) simulation.alphaTarget(0)
                            d.fx = null
                            d.fy = null
                        })
                )
                .on('click', function (event, d) {
                    event.stopPropagation()
                    selectedId = d.id === selectedId ? null : d.id
                    refreshSelection()
                })

            node.append('circle')
                .attr('r', function (d) {
                    return nodeRadius(d)
                })
                .attr('fill', function (d) {
                    var base = COLORS[d.cat] || '#8994aa'
                    var c = d3.color(base)
                    if (!c) return base
                    return d.kind === 'category' ? c.darker(0.28).formatHex() : c.formatHex()
                })
                .attr('stroke', function (d) {
                    return d.kind === 'category' ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.16)'
                })
                .attr('stroke-width', function (d) {
                    return d.kind === 'category' ? 1.6 : 1
                })

            node.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', function (d) {
                    return d.kind === 'category' ? 4 : 3
                })
                .attr('font-size', function (d) {
                    return d.kind === 'category' ? 14 : 12
                })
                .attr('font-weight', function (d) {
                    return d.kind === 'category' ? 700 : 500
                })
                .attr('fill', 'rgba(246, 244, 238, 0.96)')
                .text(function (d) {
                    var label = shortLabel(d.label)
                    var maxLen = d.kind === 'category' ? 8 : 10
                    return label.length > maxLen ? label.slice(0, maxLen) + '…' : label
                })

            node.append('title').text(function (d) {
                return shortLabel(d.label) + ' · 约 ' + d.size + ' 文件'
            })

            function refreshSelection() {
                renderDetail(selectedId ? nodeMap[selectedId] : null, adjacency, nodeMap)
                if (!selectedId) {
                    node.classed('is-dim', false).classed('is-active', false)
                    link.classed('is-dim', false)
                    return
                }
                var near = {}
                ;(adjacency[selectedId] || []).forEach(function (edge) {
                    var srcId = typeof edge.source === 'object' ? edge.source.id : edge.source
                    var dstId = typeof edge.target === 'object' ? edge.target.id : edge.target
                    near[srcId] = true
                    near[dstId] = true
                })
                near[selectedId] = true
                node.classed('is-active', function (d) {
                    return d.id === selectedId
                })
                node.classed('is-dim', function (d) {
                    return !near[d.id]
                })
                link.classed('is-dim', function (d) {
                    return d.source.id !== selectedId && d.target.id !== selectedId
                })
            }

            svg.on('click', function () {
                selectedId = null
                refreshSelection()
            })

            simulation.on('tick', function () {
                link.attr('x1', function (d) {
                    return d.source.x
                })
                    .attr('y1', function (d) {
                        return d.source.y
                    })
                    .attr('x2', function (d) {
                        return d.target.x
                    })
                    .attr('y2', function (d) {
                        return d.target.y
                    })

                node.attr('transform', function (d) {
                    d.x = Math.max(40, Math.min(width - 40, d.x || width / 2))
                    d.y = Math.max(34, Math.min(height - 34, d.y || height / 2))
                    return 'translate(' + d.x + ',' + d.y + ')'
                })
            })

            refreshSelection()
        }

        draw()
        window.addEventListener('resize', function () {
            draw()
        })
        clearBusy()
    }

    setLoadingState('知识图谱')
    loadScript(D3_SRC, function () {
        fetch(jsonUrl)
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status)
                return res.json()
            })
            .then(render)
            .catch(function (err) {
                console.error('Knowledge graph load error:', err)
                renderError('无法加载知识图谱数据。')
            })
    })
})()
