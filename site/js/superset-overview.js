/**
 * Superset Overview 可视化组件
 * 用于美化 03、04、05 小节的展示
 */

(function () {
  'use strict'

  // ========== 03 · 产品壳卡片 ==========

  class ShellAppsCards {
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

      let html = `
        <div class="superset-section">
          <div class="superset-cards-grid">
            ${apps.map(app => `
              <div class="superset-app-card" style="--card-color: ${app.color}">
                <div class="app-card-header">
                  <span class="app-icon">${app.icon}</span>
                  <div class="app-meta">
                    <h4 class="app-name">${app.name}</h4>
                    <span class="app-role">${app.role}</span>
                  </div>
                </div>
                <p class="app-desc">${app.description}</p>
                <code class="app-path">${app.path}</code>
              </div>
            `).join('')}
          </div>

          <div class="superset-observations">
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
          </div>
        </div>
      `

      this.mount.innerHTML = html
    }

    renderError (err) {
      this.mount.innerHTML = `<div class="superset-error">⚠️ 加载失败: ${err.message}</div>`
    }
  }

  // ========== 04 · Pane 引擎概念图 ==========

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

      let html = `
        <div class="superset-section">
          <div class="pane-concepts-flow">
            <div class="concepts-chain">
              ${concepts.map((c, i) => `
                <div class="concept-node" style="--node-color: ${c.color}">
                  <div class="concept-icon">${c.icon}</div>
                  <div class="concept-body">
                    <h4 class="concept-name">${c.name}</h4>
                    <p class="concept-def">${c.definition}</p>
                    <p class="concept-value">${c.value}</p>
                  </div>
                  ${i < concepts.length - 1 ? '<span class="chain-arrow">→</span>' : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pane-insight-box">
            <div class="insight-icon">💡</div>
            <div class="insight-content">
              <h4>${key_insight.title}</h4>
              <p>${key_insight.content}</p>
            </div>
          </div>
        </div>
      `

      this.mount.innerHTML = html
    }

    renderError (err) {
      this.mount.innerHTML = `<div class="superset-error">⚠️ 加载失败: ${err.message}</div>`
    }
  }

  // ========== 05 · Host-Service 子系统卡片 ==========

  class HostServiceCards {
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

      let html = `
        <div class="superset-section">
          <div class="subsystem-grid">
            ${subsystems.map(sys => `
              <div class="subsystem-card" style="--sys-color: ${sys.color}">
                <div class="sys-header">
                  <span class="sys-icon">${sys.icon}</span>
                  <h4 class="sys-name">${sys.name}</h4>
                </div>
                <p class="sys-role">${sys.role}</p>
                <code class="sys-file">${sys.file}</code>
              </div>
            `).join('')}
          </div>

          <div class="subsystem-insight">
            <span class="insight-icon">🎯</span>
            <p>${insight}</p>
          </div>
        </div>
      `

      this.mount.innerHTML = html
    }

    renderError (err) {
      this.mount.innerHTML = `<div class="superset-error">⚠️ 加载失败: ${err.message}</div>`
    }
  }

  // ========== 06 · Meta-Agent 拼装图 ==========

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

      let html = `
        <div class="superset-section">
          <div class="meta-agent-layout">
            <div class="layers-panel">
              <h4 class="panel-title">🔄 能力层</h4>
              <div class="layers-stack">
                ${layers.map(layer => `
                  <div class="layer-item" style="--layer-color: ${layer.color}">
                    <span class="layer-icon">${layer.icon}</span>
                    <div class="layer-body">
                      <h5 class="layer-name">${layer.name}</h5>
                      <code class="layer-loc">${layer.location}</code>
                      <p class="layer-desc">${layer.desc}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="formula-panel">
              <h4 class="panel-title">📐 五步公式</h4>
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
            </div>
          </div>
        </div>
      `

      this.mount.innerHTML = html
    }

    renderError (err) {
      this.mount.innerHTML = `<div class="superset-error">⚠️ 加载失败: ${err.message}</div>`
    }
  }

  // ========== 自动挂载 ==========

  function autoMount () {
    // 03 · 产品壳卡片
    const shellMount = document.getElementById('superset-shell-apps-mount')
    if (shellMount) {
      const url = shellMount.getAttribute('data-json') || 'data/superset-overview.json'
      new ShellAppsCards(shellMount, url).init()
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
      new HostServiceCards(hostMount, url).init()
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
