/**
 * Superset Overview 可视化组件
 * 包含卡片组件 + SVG 图表
 */

(function () {
  'use strict'

  // ========== 工具函数 ==========

  function createSVG (width, height) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', height)
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('role', 'img')
    return svg
  }

  function createRect (x, y, w, h, fill, radius = 8) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', x)
    rect.setAttribute('y', y)
    rect.setAttribute('width', w)
    rect.setAttribute('height', h)
    rect.setAttribute('fill', fill)
    rect.setAttribute('rx', radius)
    return rect
  }

  function createText (x, y, text, fontSize = 14, fill = '#1e293b', anchor = 'middle') {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    el.setAttribute('x', x)
    el.setAttribute('y', y)
    el.setAttribute('text-anchor', anchor)
    el.setAttribute('font-size', fontSize)
    el.setAttribute('font-family', 'ui-sans-serif, system-ui, sans-serif')
    el.setAttribute('fill', fill)
    el.textContent = text
    return el
  }

  function createLine (x1, y1, x2, y2, stroke = '#d1d5db', strokeWidth = 2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1)
    line.setAttribute('y1', y1)
    line.setAttribute('x2', x2)
    line.setAttribute('y2', y2)
    line.setAttribute('stroke', stroke)
    line.setAttribute('stroke-width', strokeWidth)
    return line
  }

  function createArrow (x1, y1, x2, y2, stroke = '#6366f1') {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const line = createLine(x1, y1, x2, y2, stroke, 2)
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const arrowSize = 8
    arrow.setAttribute('points', `${x2},${y2} ${x2 - arrowSize * Math.cos(angle - 0.5)},${y2 - arrowSize * Math.sin(angle - 0.5)} ${x2 - arrowSize * Math.cos(angle + 0.5)},${y2 - arrowSize * Math.sin(angle + 0.5)}`)
    arrow.setAttribute('fill', stroke)
    g.appendChild(line)
    g.appendChild(arrow)
    return g
  }

  // ========== 03 · 产品壳架构图 ==========

  class ShellAppsDiagram {
    constructor (mount, dataUrl) {
      this.mount = mount
      this.dataUrl = dataUrl
      this.data = null
    }

    async init () {
      try {
        const res = await fetch(this.dataUrl)
        this.data = await res.json()
        this.render()
      } catch (err) {
        this.renderError(err)
      }
    }

    render () {
      const { apps, observations } = this.data.shell_apps

      // 创建容器
      const container = document.createElement('div')
      container.className = 'superset-section'

      // 架构层次图
      const diagramTitle = document.createElement('h4')
      diagramTitle.className = 'diagram-title'
      diagramTitle.textContent = '🏗️ 产品矩阵架构图'
      container.appendChild(diagramTitle)

      const svg = createSVG(800, 280)

      // 产品壳层
      const layerY = 30
      svg.appendChild(createRect(50, layerY, 700, 50, '#fef3c7', 12))
      svg.appendChild(createText(400, layerY + 30, '产品壳层 (apps/)', 16, '#92400e'))

      // Apps 网格
      const appY = 100
      const appWidth = 90
      const appHeight = 70
      const gap = 15
      const startX = 50

      apps.forEach((app, i) => {
        const x = startX + i * (appWidth + gap)
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        g.setAttribute('class', 'app-block')

        // 背景
        g.appendChild(createRect(x, appY, appWidth, appHeight, app.color + '20', 8))
        g.appendChild(createRect(x, appY, appWidth, 4, app.color, 4))

        // 图标
        g.appendChild(createText(x + appWidth / 2, appY + 28, app.icon, 20))

        // 名称
        g.appendChild(createText(x + appWidth / 2, appY + 50, app.name, 11, '#1e293b'))

        svg.appendChild(g)
      })

      // packages 层
      const pkgY = 190
      svg.appendChild(createRect(50, pkgY, 700, 40, '#dbeafe', 12))
      svg.appendChild(createText(400, pkgY + 25, '核心包层 (packages/): panes · host-service · chat · workspace-fs · shared', 14, '#1e40af'))

      // 连接线
      svg.appendChild(createLine(400, 80, 400, 100, '#d1d5db', 1, true))
      svg.appendChild(createLine(400, 170, 400, 190, '#d1d5db', 1, true))

      container.appendChild(svg)

      // 观察卡片
      const obsDiv = document.createElement('div')
      obsDiv.className = 'superset-observations'
      obsDiv.innerHTML = `
        <h4 class="observations-title">📋 目录观察</h4>
        <div class="observations-grid">
          ${observations.map(obs => `
            <div class="observation-item">
              <span class="obs-signal">${obs.signal}</span>
              <span class="obs-arrow">→</span>
              <span class="obs-insight">${obs.insight}</span>
            </div>
          `).join('')}
        </div>
      `
      container.appendChild(obsDiv)

      this.mount.innerHTML = ''
      this.mount.appendChild(container)
    }

    renderError (err) {
      this.mount.innerHTML = `<div class="superset-error">⚠️ 加载失败: ${err.message}</div>`
    }
  }

  // ========== 04 · Pane 引擎流程图 ==========

  class PaneEngineDiagram {
    constructor (mount, dataUrl) {
      this.mount = mount
      this.dataUrl = dataUrl
      this.data = null
    }

    async init () {
      try {
        const res = await fetch(this.dataUrl)
        this.data = await res.json()
        this.render()
      } catch (err) {
        this.renderError(err)
      }
    }

    render () {
      const { concepts, key_insight } = this.data.pane_engine

      const container = document.createElement('div')
      container.className = 'superset-section'

      // 概念流程图
      const diagramTitle = document.createElement('h4')
      diagramTitle.className = 'diagram-title'
      diagramTitle.textContent = '🔄 工作位抽象流程图'
      container.appendChild(diagramTitle)

      const svg = createSVG(800, 200)

      const boxWidth = 160
      const boxHeight = 80
      const gap = 40
      const startX = 50
      const y = 60

      concepts.forEach((c, i) => {
        const x = startX + i * (boxWidth + gap)
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

        // 主框
        g.appendChild(createRect(x, y, boxWidth, boxHeight, c.color + '15', 12))
        g.appendChild(createRect(x, y, boxWidth, 6, c.color, 6))

        // 图标和名称
        g.appendChild(createText(x + boxWidth / 2, y + 30, c.icon + ' ' + c.name, 14, c.color))

        // 定义
        g.appendChild(createText(x + boxWidth / 2, y + 52, c.definition, 10, '#64748b'))

        // 箭头
        if (i < concepts.length - 1) {
          const arrowX = x + boxWidth + 5
          g.appendChild(createArrow(arrowX, y + boxHeight / 2, arrowX + gap - 10, y + boxHeight / 2, '#6366f1'))
        }

        svg.appendChild(g)
      })

      // 标注线
      svg.appendChild(createLine(400, 145, 400, 165, '#d1d5db', 1))
      svg.appendChild(createText(400, 180, '层层递进：容器 → 上下文 → 工位 → 布局', 12, '#64748b'))

      container.appendChild(svg)

      // 洞察框
      const insightDiv = document.createElement('div')
      insightDiv.className = 'pane-insight-box'
      insightDiv.innerHTML = `
        <div class="insight-icon">💡</div>
        <div class="insight-content">
          <h4>${key_insight.title}</h4>
          <p>${key_insight.content}</p>
        </div>
      `
      container.appendChild(insightDiv)

      this.mount.innerHTML = ''
      this.mount.appendChild(container)
    }

    renderError (err) {
      this.mount.innerHTML = `<div class="superset-error">⚠️ 加载失败: ${err.message}</div>`
    }
  }

  // ========== 05 · Host-Service 模块关系图 ==========

  class HostServiceDiagram {
    constructor (mount, dataUrl) {
      this.mount = mount
      this.dataUrl = dataUrl
      this.data = null
    }

    async init () {
      try {
        const res = await fetch(this.dataUrl)
        this.data = await res.json()
        this.render()
      } catch (err) {
        this.renderError(err)
      }
    }

    render () {
      const { subsystems, insight } = this.data.host_service

      const container = document.createElement('div')
      container.className = 'superset-section'

      // 模块关系图
      const diagramTitle = document.createElement('h4')
      diagramTitle.className = 'diagram-title'
      diagramTitle.textContent = '🎛️ 调度中枢模块关系图'
      container.appendChild(diagramTitle)

      const svg = createSVG(800, 300)

      // 中心：App Wiring
      const centerX = 400
      const centerY = 150
      const radius = 100

      // 中心节点
      svg.appendChild(createRect(centerX - 70, centerY - 25, 140, 50, '#f97316', 12))
      svg.appendChild(createText(centerX, centerY - 5, '🔗 App Wiring', 14, '#fff'))
      svg.appendChild(createText(centerX, centerY + 15, 'packages/host-service/src/app.ts', 9, '#fff'))

      // 周围子系统
      const others = subsystems.filter(s => s.id !== 'app-wiring')
      others.forEach((sys, i) => {
        const angle = (i * 2 * Math.PI / others.length) - Math.PI / 2
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)

        // 连接线
        svg.appendChild(createLine(centerX, centerY, x, y, sys.color + '60', 2))

        // 子系统节点
        const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        nodeG.appendChild(createRect(x - 55, y - 20, 110, 40, sys.color + '20', 8))
        nodeG.appendChild(createRect(x - 55, y - 20, 110, 4, sys.color, 4))
        nodeG.appendChild(createText(x, y + 2, sys.icon + ' ' + sys.name, 11, '#1e293b'))

        svg.appendChild(nodeG)
      })

      // 标注
      svg.appendChild(createText(400, 280, '所有子系统通过 App Wiring 统一组装，形成完整的控制面', 12, '#64748b'))

      container.appendChild(svg)

      // 洞察
      const insightDiv = document.createElement('div')
      insightDiv.className = 'subsystem-insight'
      insightDiv.innerHTML = `
        <span class="insight-icon">🎯</span>
        <p>${insight}</p>
      `
      container.appendChild(insightDiv)

      this.mount.innerHTML = ''
      this.mount.appendChild(container)
    }

    renderError (err) {
      this.mount.innerHTML = `<div class="superset-error">⚠️ 加载失败: ${err.message}</div>`
    }
  }

  // ========== 06 · Meta-Agent 层级图 ==========

  class MetaAgentDiagram {
    constructor (mount, dataUrl) {
      this.mount = mount
      this.dataUrl = dataUrl
      this.data = null
    }

    async init () {
      try {
        const res = await fetch(this.dataUrl)
        this.data = await res.json()
        this.render()
      } catch (err) {
        this.renderError(err)
      }
    }

    render () {
      const { layers, formula } = this.data.meta_agent

      const container = document.createElement('div')
      container.className = 'superset-section'

      // 层级图
      const diagramTitle = document.createElement('h4')
      diagramTitle.className = 'diagram-title'
      diagramTitle.textContent = '🧩 Meta-Agent 层级架构图'
      container.appendChild(diagramTitle)

      const svg = createSVG(800, 280)

      // 层级堆叠
      const layerHeight = 40
      const layerWidth = 600
      const startX = 100
      const startY = 30
      const gap = 10

      layers.forEach((layer, i) => {
        const y = startY + i * (layerHeight + gap)
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

        // 层级背景
        g.appendChild(createRect(startX, y, layerWidth, layerHeight, layer.color + '20', 8))
        g.appendChild(createRect(startX, y, 6, layerHeight, layer.color, 4))

        // 内容
        g.appendChild(createText(startX + 20, y + 18, layer.icon + ' ' + layer.name, 13, '#1e293b', 'start'))
        g.appendChild(createText(startX + 20, y + 32, layer.location, 9, '#64748b', 'start'))

        // 描述
        g.appendChild(createText(startX + layerWidth - 20, y + 25, layer.desc, 10, '#64748b', 'end'))

        svg.appendChild(g)
      })

      // 底部说明
      svg.appendChild(createText(400, 260, '三层叠加：Session Runtime + 控制协议 + 隔离机制 = Meta-Agent 能力', 12, '#6366f1'))

      container.appendChild(svg)

      // 五步公式
      const formulaDiv = document.createElement('div')
      formulaDiv.className = 'formula-steps-container'
      formulaDiv.innerHTML = `
        <h4 class="formula-title">📐 五步公式</h4>
        <div class="formula-steps">
          ${formula.map((f, i) => `
            <div class="formula-step">
              <span class="step-num">${i + 1}</span>
              <div class="step-content">
                <p class="step-action">${f.step}</p>
                <p class="step-result">→ ${f.result}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `
      container.appendChild(formulaDiv)

      this.mount.innerHTML = ''
      this.mount.appendChild(container)
    }

    renderError (err) {
      this.mount.innerHTML = `<div class="superset-error">⚠️ 加载失败: ${err.message}</div>`
    }
  }

  // ========== 自动挂载 ==========

  function autoMount () {
    // 03 · 产品壳架构图
    const shellMount = document.getElementById('superset-shell-apps-mount')
    if (shellMount) {
      const url = shellMount.getAttribute('data-json') || 'data/superset-overview.json'
      new ShellAppsDiagram(shellMount, url).init()
    }

    // 04 · Pane 引擎
    const paneMount = document.getElementById('superset-pane-engine-mount')
    if (paneMount) {
      const url = paneMount.getAttribute('data-json') || 'data/superset-overview.json'
      new PaneEngineDiagram(paneMount, url).init()
    }

    // 05 · Host-Service
    const hostMount = document.getElementById('superset-host-service-mount')
    if (hostMount) {
      const url = hostMount.getAttribute('data-json') || 'data/superset-overview.json'
      new HostServiceDiagram(hostMount, url).init()
    }

    // 06 · Meta-Agent
    const metaMount = document.getElementById('superset-meta-agent-mount')
    if (metaMount) {
      const url = metaMount.getAttribute('data-json') || 'data/superset-overview.json'
      new MetaAgentDiagram(metaMount, url).init()
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount)
  } else {
    autoMount()
  }
})()
