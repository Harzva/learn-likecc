/**
 * Claude Code architecture knowledge graph.
 * Modes:
 * - contains: category -> folder structure
 * - cross: curated cross-block relationships
 * - hybrid: both together
 */
;(function () {
    var mount = document.getElementById('cc-arch-knowledge-mount')
    if (!mount) return

    var jsonUrl = mount.getAttribute('data-json') || 'data/cc-arch-knowledge.json'
    var D3_SRC = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js'
    var COLORS = {
        tools_commands: '#cf9218',
        core: '#26a269',
        ui: '#3a67df',
        bridge: '#ea6a28',
        infra: '#7a8ba5',
        support: '#55657d',
        personality: '#8b5cf6',
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
        s.onload = cb
        s.onerror = function () {
            mount.innerHTML = '<p class="cc-arch-treemap__err">无法加载 D3，知识图谱未能渲染。</p>'
        }
        document.head.appendChild(s)
    }

    function shortLabel(label) {
        return String(label || '').replace(/\/$/, '').replace(/^（/, '').replace(/）$/, '')
    }

    function loopStepLabel(node) {
        if (!node || node.kind !== 'loop') return shortLabel(node && node.label)
        var idx = Number(node.step_index || 0) + 1
        var no = idx < 10 ? '0' + idx : String(idx)
        return no + ' ' + shortLabel(node.label)
    }

    function render(payload) {
        var d3 = window.d3
        var modes = [
            { id: 'hybrid', label: '混合总览', desc: '同时看块内结构与跨块联系' },
            { id: 'contains', label: '块内结构', desc: '看每个教学分区下面有哪些主目录' },
            { id: 'cross', label: '块间联系', desc: '看不同块之间最值得一起读的连接' },
            { id: 'loopline', label: '主线映射', desc: '把 01 主循环各阶段映射到 02 架构导览目录块' },
        ]
        var currentMode = 'hybrid'
        var selectedId = null

        mount.innerHTML =
            '<div class="cc-arch-knowledge__toolbar">' +
            '<div>' +
            '<h3 class="cc-arch-knowledge__title">Architecture Knowledge Graph</h3>' +
            '<p class="cc-arch-knowledge__subtitle">用网络图补足 Treemap 看不到的“谁和谁经常一起读”。</p>' +
            '</div>' +
            '<div class="cc-arch-knowledge__controls"></div>' +
            '</div>' +
            '<div class="cc-arch-knowledge__layout">' +
            '<div class="cc-arch-knowledge__canvas"><svg class="cc-arch-knowledge__svg" aria-label="Claude Code 架构知识图谱"></svg></div>' +
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
            if (currentMode === 'loopline') return payload.loop_links || []
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
            if (node.kind === 'loop') return 18
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
                    '<p class="cc-arch-knowledge__empty">推荐先点 <strong>services</strong>、<strong>components</strong>、<strong>commands</strong>，或者切到 <strong>主线映射</strong> 看主循环每一步主要落在哪些目录块上。</p>'
                return
            }

            var related = (adjacency[node.id] || [])
                .map(function (link) {
                    var otherId = link.source === node.id ? link.target : link.source
                    var other = allNodes[otherId]
                    return other
                        ? {
                              label: other.kind === 'loop' ? loopStepLabel(other) : shortLabel(other.label),
                              note: link.note || '',
                              kind: link.kind || '',
                          }
                        : null
                })
                .filter(Boolean)

            detailEl.innerHTML =
                '<p class="cc-arch-knowledge__eyebrow">' +
                esc(node.kind === 'category' ? 'Category' : node.kind === 'loop' ? 'Loop Step' : 'Folder') +
                '</p>' +
                '<h4 class="cc-arch-knowledge__name">' +
                esc(node.kind === 'loop' ? loopStepLabel(node) : shortLabel(node.label)) +
                '</h4>' +
                '<p class="cc-arch-knowledge__meta">' +
                (node.kind === 'loop'
                    ? '主循环阶段 · 用来回答“这一轮主要依赖哪些目录块？”'
                    : '文件量约 <strong>' +
                      esc(node.size) +
                      '</strong> · 所属分区 <strong>' +
                      esc(node.kind === 'category' ? node.label : (allNodes[node.parent] ? allNodes[node.parent].label : node.cat)) +
                      '</strong>') +
                '</p>' +
                '<p class="cc-arch-knowledge__desc">' +
                esc(node.description || node.hint || '这是图谱中的一个结构节点。') +
                '</p>' +
                '<p class="cc-arch-knowledge__related">相关节点：</p>' +
                '<div class="cc-arch-knowledge__related-list">' +
                (related.length
                    ? related
                          .slice(0, 10)
                          .map(function (item) {
                              return (
                                  '<span class="cc-arch-knowledge__chip">' +
                                  esc(item.label) +
                                  (item.kind === 'cross' ? ' · 跨块' : item.kind === 'loop_map' ? ' · 映射' : item.kind === 'loop' ? ' · 主线' : ' · 内部') +
                                  '</span>'
                              )
                          })
                          .join('')
                    : '<span class="cc-arch-knowledge__empty">当前模式下没有额外连接。</span>') +
                '</div>'
        }

        function draw() {
            var width = Math.max(760, canvasEl.clientWidth - 8)
            var height = window.innerWidth <= 768 ? 560 : 760
            svgEl.setAttribute('viewBox', '0 0 ' + width + ' ' + height)

            noteEl.textContent =
                currentMode === 'loopline'
                    ? '主线映射把“输入 → 消息 → 历史 → 系统 → 工具集 → API → Token → 判工具 → 执行 → 回流 → 循环 → 呈现”串成一条流程带，再连接到真正承载它们的目录块。'
                    : payload.meta && payload.meta.note_zh
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
                            if (d.kind === 'loop') return 72
                            if (d.kind === 'loop_map') return 170
                            return d.kind === 'contains' ? 80 : 120
                        })
                        .strength(function (d) {
                            if (d.kind === 'loop') return 1
                            if (d.kind === 'loop_map') return 0.5
                            return d.kind === 'contains' ? 0.9 : 0.5
                        })
                )
                .force(
                    'charge',
                    d3.forceManyBody().strength(function (d) {
                        if (d.kind === 'loop') return -520
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
                        if (currentMode === 'loopline' && d.kind === 'loop') {
                            var count = 12
                            return ((d.step_index || 0) + 1) * (width / (count + 1))
                        }
                        var a = anchorForCat(d.cat)
                        if (d.kind === 'category') return a.x
                        if (currentMode === 'loopline') return a.x
                        return currentMode === 'cross' ? a.x + (Math.random() - 0.5) * 80 : a.x
                    }).strength(function (d) {
                        if (currentMode === 'loopline' && d.kind === 'loop') return 0.7
                        return d.kind === 'category' ? 0.22 : currentMode === 'cross' ? 0.09 : 0.13
                    })
                )
                .force(
                    'y',
                    d3.forceY().y(function (d) {
                        if (currentMode === 'loopline' && d.kind === 'loop') return window.innerWidth <= 768 ? 88 : 96
                        var a = anchorForCat(d.cat)
                        if (d.kind === 'category') return a.y
                        if (currentMode === 'loopline') return a.y + 170
                        return currentMode === 'cross' ? a.y + (Math.random() - 0.5) * 90 : a.y + 25
                    }).strength(function (d) {
                        if (currentMode === 'loopline' && d.kind === 'loop') return 0.78
                        if (currentMode === 'loopline') return 0.24
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
                    if (d.kind === 'loop') return 3.2
                    if (d.kind === 'loop_map') return 1.1 + d.weight * 0.26
                    return d.kind === 'contains' ? 1 + Math.min(3.5, d.weight / 70) : 1.2 + d.weight * 0.35
                })
                .attr('stroke-opacity', function (d) {
                    if (d.kind === 'loop') return 0.95
                    if (d.kind === 'loop_map') return 0.72
                    return d.kind === 'contains' ? 0.6 : 0.85
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
                    if (d.kind === 'loop') return '#f2cf95'
                    var base = COLORS[d.cat] || '#8994aa'
                    var c = d3.color(base)
                    if (!c) return base
                    return d.kind === 'category' ? c.darker(0.28).formatHex() : c.formatHex()
                })
                .attr('stroke', function (d) {
                    if (d.kind === 'loop') return 'rgba(255,239,211,0.92)'
                    return d.kind === 'category' ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.16)'
                })
                .attr('stroke-width', function (d) {
                    if (d.kind === 'loop') return 1.8
                    return d.kind === 'category' ? 1.6 : 1
                })

            node.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', function (d) {
                    return d.kind === 'category' ? 4 : d.kind === 'loop' ? 4 : 3
                })
                .attr('font-size', function (d) {
                    return d.kind === 'category' ? 12 : d.kind === 'loop' ? 11 : 10.5
                })
                .attr('font-weight', function (d) {
                    return d.kind === 'category' || d.kind === 'loop' ? 700 : 500
                })
                .attr('fill', function (d) {
                    return d.kind === 'loop' ? '#1d2940' : 'rgba(246, 244, 238, 0.96)'
                })
                .text(function (d) {
                    var label = d.kind === 'loop' ? loopStepLabel(d) : shortLabel(d.label)
                    var maxLen = d.kind === 'category' ? 8 : d.kind === 'loop' ? 8 : 10
                    return label.length > maxLen ? label.slice(0, maxLen) + '…' : label
                })

            node.append('title').text(function (d) {
                return (d.kind === 'loop' ? loopStepLabel(d) + ' · 主循环阶段' : shortLabel(d.label) + ' · 约 ' + d.size + ' 文件')
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
                    near[edge.source] = true
                    near[edge.target] = true
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
    }

    loadScript(D3_SRC, function () {
        fetch(jsonUrl)
            .then(function (res) {
                if (!res.ok) throw new Error('bad response')
                return res.json()
            })
            .then(render)
            .catch(function () {
                mount.innerHTML = '<p class="cc-arch-treemap__err">无法加载知识图谱数据。</p>'
            })
    })
})()
