;(function () {
  var storageKey = 'learn-likecc.loop-lab.progress.v1'
  var lessons = [
    {
      id: 'agent-loop',
      order: '01',
      title: 'Agent Loop',
      label: '理解循环',
      path: 'agent-loop-simulator/',
      minutes: 12,
      hint: '先建立模型、工具、观察、回答的运行直觉。',
      status: '12 步动态回放',
      output: '运行链路心智图'
    },
    {
      id: 'agent-script',
      order: '02',
      title: 'Script Insight',
      label: '练命令',
      path: 'agent-script-insight/',
      minutes: 18,
      hint: '再把命令、配置、测验放到浏览器里练熟。',
      status: '命令与配置实验',
      output: '可练习的命令套路'
    },
    {
      id: 'agent-trace',
      order: '03',
      title: 'Trace Prompt',
      label: '拆请求',
      path: 'agent-trace-simulator/',
      minutes: 20,
      hint: '最后回到真实 trace，检查 prompt 如何被拼出来。',
      status: '真实请求分层',
      output: 'prompt 结构阅读能力'
    }
  ]

  function isSimulatorPage() {
    return Boolean(document.body.getAttribute('data-sim-id'))
  }

  function lessonHref(lesson) {
    return (isSimulatorPage() ? '../' : '') + lesson.path
  }

  function loopLabHref() {
    return isSimulatorPage() ? '../topic-cc-loop-lab.html' : 'topic-cc-loop-lab.html'
  }

  function isResumeRequest() {
    try {
      return new URLSearchParams(window.location.search).get('resume') === '1'
    } catch (err) {
      return window.location.search.indexOf('resume=1') !== -1
    }
  }

  function isVisible(el) {
    if (!el) return false
    var rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }

  function esc(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function normaliseText(text, maxLength) {
    var clean = String(text || '').replace(/\s+/g, ' ').trim()
    var limit = maxLength || 72
    return clean.length > limit ? clean.slice(0, limit - 1) + '…' : clean
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function closestElement(target, selector) {
    var node = target && target.nodeType === 1 ? target : target && target.parentElement
    return node && node.closest ? node.closest(selector) : null
  }

  function sanitiseHash(hash) {
    hash = String(hash || '')
    if (!hash || hash.charAt(0) !== '#') return ''
    return hash.replace(/[\s"'<>]/g, '')
  }

  function hashLabel(hash) {
    var value = sanitiseHash(hash).replace(/^#\/?/, '').split(/[?#/]/)[0]
    if (!value) return ''
    return normaliseText(value.replace(/[-_]+/g, ' '), 36)
  }

  function readState() {
    try {
      var raw = window.localStorage.getItem(storageKey)
      var parsed = raw ? JSON.parse(raw) : {}
      if (!parsed || typeof parsed !== 'object') parsed = {}
      if (!parsed.lessons || typeof parsed.lessons !== 'object') parsed.lessons = {}
      return {
        version: 1,
        updatedAt: parsed.updatedAt || '',
        lastLessonId: parsed.lastLessonId || '',
        lessons: parsed.lessons
      }
    } catch (err) {
      return { version: 1, updatedAt: '', lastLessonId: '', lessons: {} }
    }
  }

  function writeState(state) {
    try {
      state.updatedAt = new Date().toISOString()
      window.localStorage.setItem(storageKey, JSON.stringify(state))
      window.dispatchEvent(new CustomEvent('loop-lab-progress-updated', { detail: state }))
    } catch (err) {
      // localStorage may be unavailable in private or restricted contexts.
    }
  }

  function blankRecord(lesson) {
    return {
      id: lesson.id,
      title: lesson.title,
      label: lesson.label,
      visits: 0,
      interactions: 0,
      maxScrollRatio: 0,
      currentScrollRatio: 0,
      scrollY: 0,
      progress: 0,
      status: '未开始',
      resume: {},
      updatedAt: '',
      completedAt: ''
    }
  }

  function getRecord(state, lesson) {
    var record = state.lessons[lesson.id] || blankRecord(lesson)
    record.id = lesson.id
    record.title = lesson.title
    record.label = lesson.label
    record.visits = Number(record.visits) || 0
    record.interactions = Number(record.interactions) || 0
    record.maxScrollRatio = clamp(Number(record.maxScrollRatio) || 0, 0, 1)
    record.currentScrollRatio = clamp(Number(record.currentScrollRatio) || 0, 0, 1)
    record.scrollY = Math.max(0, Math.round(Number(record.scrollY) || 0))
    record.progress = clamp(Number(record.progress) || 0, 0, 100)
    if (!record.resume || typeof record.resume !== 'object') record.resume = {}
    return record
  }

  function computeProgress(record) {
    var readPercent = Math.round((Number(record.maxScrollRatio) || 0) * 100)
    var visitFloor = record.visits > 0 ? 8 : 0
    var interactionFloor = record.interactions > 0 ? 38 : 0
    var progress = Math.max(record.progress || 0, readPercent, visitFloor, interactionFloor)
    if ((record.maxScrollRatio || 0) >= 0.92) progress = 100
    return clamp(progress, 0, 100)
  }

  function recordLabel(record) {
    var progress = computeProgress(record)
    if (progress >= 100) return '已完成'
    if (progress >= 72) return '接近完成'
    if (progress >= 38) return '练习中'
    if (progress >= 8) return '已打开'
    return '未开始'
  }

  function formatTime(iso) {
    if (!iso) return '暂无记录'
    var date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '暂无记录'
    var now = Date.now()
    var diff = Math.max(0, now - date.getTime())
    var minute = 60 * 1000
    var hour = 60 * minute
    var day = 24 * hour
    if (diff < minute) return '刚刚'
    if (diff < hour) return Math.floor(diff / minute) + ' 分钟前'
    if (diff < day) return Math.floor(diff / hour) + ' 小时前'
    return date.getMonth() + 1 + ' 月 ' + date.getDate() + ' 日'
  }

  function mergeResume(record, resume) {
    var next = Object.assign({}, record.resume || {})
    Object.keys(resume || {}).forEach(function (key) {
      var value = resume[key]
      if (key === 'scrollY') {
        next.scrollY = Math.max(0, Math.round(Number(value) || 0))
        return
      }
      if (key === 'scrollRatio') {
        next.scrollRatio = clamp(Number(value) || 0, 0, 1)
        return
      }
      if (key === 'hash') {
        next.hash = sanitiseHash(value)
        return
      }
      if (value === '' || typeof value === 'undefined' || value === null) return
      next[key] = typeof value === 'string' ? normaliseText(value, 72) : value
    })
    next.updatedAt = resume && resume.updatedAt ? resume.updatedAt : new Date().toISOString()
    record.resume = next
  }

  function hasResume(record) {
    var resume = record && record.resume
    if (!record || !record.updatedAt || !resume) return false
    return Boolean(
      Number(resume.scrollY) > 24 ||
      Number(resume.scrollRatio) > 0.04 ||
      resume.hash ||
      resume.traceTab ||
      resume.scriptStep ||
      resume.loopStep ||
      resume.actionLabel
    )
  }

  function resumeLabel(record, lesson) {
    if (!hasResume(record)) return ''
    var resume = record.resume || {}
    if (lesson.id === 'agent-trace' && resume.traceTab) return '断点：Trace · ' + resume.traceTab
    if (lesson.id === 'agent-script' && (resume.scriptStep || resume.hash)) {
      return '断点：Script · ' + (resume.scriptStep || hashLabel(resume.hash) || '上次步骤')
    }
    if (lesson.id === 'agent-loop' && resume.loopStep) return '断点：Loop · ' + resume.loopStep
    if (resume.actionLabel) return '断点：' + resume.actionLabel
    return '断点：页面 ' + Math.round(clamp(Number(resume.scrollRatio) || 0, 0, 1) * 100) + '%'
  }

  function buildResumeHref(lesson, record) {
    var href = lessonHref(lesson)
    if (!hasResume(record)) return href
    var hash = sanitiseHash(record.resume && record.resume.hash)
    return href + (href.indexOf('?') === -1 ? '?' : '&') + 'resume=1' + hash
  }

  function getActiveTraceTab() {
    var candidates = Array.from(document.querySelectorAll('[role="tab"][aria-selected="true"], [role="tab"][data-state="active"], [role="tab"].active'))
      .filter(isVisible)
    return candidates[0] ? normaliseText(candidates[0].textContent, 40) : ''
  }

  function getActionLabel(event) {
    if (!event) return ''
    var control = closestElement(event.target, 'button, a, [role="tab"], [role="button"]')
    if (!control || closestElement(control, '#sim-course-shell')) return ''
    return normaliseText(control.textContent, 56)
  }

  function captureResumeContext(current, event) {
    var actionLabel = getActionLabel(event)
    var hash = sanitiseHash(window.location.hash)
    var traceTab = current.id === 'agent-trace' ? getActiveTraceTab() : ''
    var scriptStep = current.id === 'agent-script' ? (hashLabel(hash) || actionLabel || '脚本首页') : ''
    var loopStep = current.id === 'agent-loop' ? actionLabel : ''
    return {
      scrollY: Math.round(window.scrollY || 0),
      scrollRatio: getScrollRatio(),
      hash: hash,
      actionLabel: actionLabel,
      traceTab: traceTab,
      scriptStep: scriptStep,
      loopStep: loopStep,
      updatedAt: new Date().toISOString()
    }
  }

  function updateLesson(lesson, patch) {
    var state = readState()
    var record = getRecord(state, lesson)
    if (patch.visit) record.visits += 1
    if (patch.interaction) record.interactions = clamp(record.interactions + 1, 0, 999)
    if (typeof patch.maxScrollRatio === 'number') {
      record.maxScrollRatio = Math.max(record.maxScrollRatio || 0, clamp(patch.maxScrollRatio, 0, 1))
    }
    if (typeof patch.currentScrollRatio === 'number') {
      record.currentScrollRatio = clamp(patch.currentScrollRatio, 0, 1)
    }
    if (typeof patch.scrollY === 'number') {
      record.scrollY = Math.max(0, Math.round(patch.scrollY))
    }
    if (patch.resume) mergeResume(record, patch.resume)
    if (patch.status) record.status = patch.status
    record.progress = computeProgress(record)
    record.updatedAt = new Date().toISOString()
    if (record.progress >= 100 && !record.completedAt) record.completedAt = record.updatedAt
    state.lessons[lesson.id] = record
    state.lastLessonId = lesson.id
    writeState(state)
    return state
  }

  function getCurrentLesson() {
    var id = document.body.getAttribute('data-sim-id')
    return lessons.find(function (lesson) { return lesson.id === id }) || null
  }

  function getRecommendedLesson(state) {
    return lessons.find(function (lesson) {
      return computeProgress(getRecord(state, lesson)) < 100
    }) || lessons[0]
  }

  function getSequentialNextLesson(current) {
    var index = lessons.findIndex(function (lesson) { return lesson.id === current.id })
    return lessons[(index + 1) % lessons.length]
  }

  function getCourseSummary(state) {
    var records = lessons.map(function (lesson) { return getRecord(state, lesson) })
    var total = Math.round(records.reduce(function (sum, record) {
      return sum + computeProgress(record)
    }, 0) / lessons.length)
    var completed = records.filter(function (record) { return computeProgress(record) >= 100 }).length
    var lastRecord = null
    if (state.lastLessonId) {
      var lastLesson = lessons.find(function (lesson) { return lesson.id === state.lastLessonId })
      if (lastLesson) lastRecord = getRecord(state, lastLesson)
    }
    if (!lastRecord || !lastRecord.updatedAt) {
      lastRecord = records
        .filter(function (record) { return record.updatedAt })
        .sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt) })[0] || null
    }
    var nextLesson = getRecommendedLesson(state)
    return { total: total, completed: completed, lastRecord: lastRecord, nextLesson: nextLesson, records: records }
  }

  function buildLessonLinks(current, state) {
    return lessons.map(function (lesson) {
      var active = lesson.id === current.id
      var record = getRecord(state, lesson)
      var progress = computeProgress(record)
      return (
        '<a class="sim-course-link' + (active ? ' is-active' : '') + (progress >= 100 ? ' is-done' : '') + '" href="' + esc(lessonHref(lesson)) + '" data-sim-course-link="' + esc(lesson.id) + '" style="--sim-link-progress:' + (progress / 100).toFixed(2) + '"' +
          (active ? ' aria-current="page"' : '') + '>' +
          '<span>' + esc(lesson.order) + ' · ' + esc(lesson.label) + '</span>' +
          '<strong>' + esc(lesson.title) + '</strong>' +
          '<em data-sim-course-percent>' + progress + '%</em>' +
        '</a>'
      )
    }).join('')
  }

  function readInteractionStatus(current) {
    var buttons = Array.from(document.querySelectorAll('button'))
      .filter(isVisible)
      .map(function (button) { return (button.textContent || '').replace(/\s+/g, ' ').trim() })
      .filter(Boolean)

    if (buttons.some(function (text) { return /下一步|Next|Continue/i.test(text) })) return '可继续下一步'
    if (buttons.some(function (text) { return /开始|Start|Play/i.test(text) })) return '可开始交互'
    if (buttons.some(function (text) { return /重播|Reset|Restart/i.test(text) })) return '可重播复盘'
    if (current.id === 'agent-script' && location.hash) return '练习模块：' + (hashLabel(location.hash) || '当前步骤')
    if (current.id === 'agent-trace') {
      var traceTab = getActiveTraceTab()
      return traceTab ? '正在阅读：' + traceTab : '可切换 Map / Step / Tools / Raw'
    }
    return current.status
  }

  function getScrollRatio() {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    return clamp(window.scrollY / max, 0, 1)
  }

  function scrollToResume(resume) {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    var targetY = Math.round(Number(resume.scrollY) || 0)
    if (targetY <= 0 && Number(resume.scrollRatio) > 0) {
      targetY = Math.round(max * clamp(Number(resume.scrollRatio) || 0, 0, 1))
    }
    window.scrollTo({ top: clamp(targetY, 0, max), left: 0, behavior: 'auto' })
  }

  function findVisibleControl(selector, label) {
    label = normaliseText(label, 72).toLowerCase()
    if (!label) return null
    var controls = Array.from(document.querySelectorAll(selector)).filter(isVisible)
    return controls.find(function (control) {
      return normaliseText(control.textContent, 72).toLowerCase() === label
    }) || controls.find(function (control) {
      var text = normaliseText(control.textContent, 72).toLowerCase()
      return text.indexOf(label) !== -1 || label.indexOf(text) !== -1
    }) || null
  }

  function activateResumeTarget(current, resume) {
    if (current.id === 'agent-script' && resume.hash && window.location.hash !== resume.hash) {
      window.location.hash = resume.hash
    }
    if (current.id === 'agent-trace' && resume.traceTab) {
      var traceTab = findVisibleControl('[role="tab"]', resume.traceTab)
      var active = traceTab && (traceTab.getAttribute('aria-selected') === 'true' || traceTab.getAttribute('data-state') === 'active')
      if (traceTab && !active) {
        traceTab.click()
      }
    }
    if (current.id === 'agent-loop' && resume.loopStep) {
      var loopStep = findVisibleControl('button', resume.loopStep)
      if (loopStep) loopStep.click()
    }
  }

  function restoreResume(current, record, onRestored) {
    if (!isResumeRequest() || !hasResume(record)) return false
    var resume = record.resume || {}
    var attempts = 0
    document.documentElement.classList.add('sim-course-restoring')
    var tick = function () {
      attempts += 1
      activateResumeTarget(current, resume)
      scrollToResume(resume)
      if (attempts < 4) {
        window.setTimeout(tick, attempts === 1 ? 420 : 680)
      } else {
        document.documentElement.classList.remove('sim-course-restoring')
        if (typeof onRestored === 'function') onRestored()
      }
    }
    window.setTimeout(tick, 260)
    return true
  }

  function syncShellRecords(shell, state) {
    Array.from(shell.querySelectorAll('[data-sim-course-link]')).forEach(function (node) {
      var lesson = lessons.find(function (item) { return item.id === node.getAttribute('data-sim-course-link') })
      if (!lesson) return
      var record = getRecord(state, lesson)
      var progress = computeProgress(record)
      node.style.setProperty('--sim-link-progress', (progress / 100).toFixed(2))
      node.classList.toggle('is-done', progress >= 100)
      node.classList.toggle('has-resume', hasResume(record))
      node.href = buildResumeHref(lesson, record)
      node.title = resumeLabel(record, lesson) || lesson.hint
      var percent = node.querySelector('[data-sim-course-percent]')
      if (percent) percent.textContent = progress + '%'
    })
  }

  function initCourseShell() {
    var current = getCurrentLesson()
    if (!current || document.getElementById('sim-course-shell')) return

    var previousState = readState()
    var resumeRecord = getRecord(previousState, current)
    var state = updateLesson(current, {
      visit: true,
      maxScrollRatio: getScrollRatio(),
      currentScrollRatio: getScrollRatio(),
      scrollY: window.scrollY,
      status: readInteractionStatus(current)
    })
    var next = getSequentialNextLesson(current)
    document.documentElement.classList.add('sim-course-enhanced')
    document.body.classList.add('sim-course-page', 'sim-course-page--' + current.id)

    var shell = document.createElement('aside')
    shell.id = 'sim-course-shell'
    shell.className = 'sim-course-shell'
    shell.setAttribute('aria-label', '仿真课程系统导航')
    shell.innerHTML =
      '<div class="sim-course-shell__panel">' +
        '<div class="sim-course-shell__summary">' +
          '<span class="sim-course-shell__eyebrow">Loop Lab Simulation Course</span>' +
          '<p class="sim-course-shell__title">' + esc(current.order) + ' / 03 · ' + esc(current.title) + '</p>' +
          '<p class="sim-course-shell__hint">' + esc(current.hint) + '</p>' +
          '<p class="sim-course-shell__status" data-sim-status>' + esc(current.status) + '</p>' +
          '<p class="sim-course-shell__resume" data-sim-resume></p>' +
        '</div>' +
        '<nav class="sim-course-links" aria-label="三段仿真课程">' +
          '<a class="sim-course-link sim-course-link--home" href="' + esc(loopLabHref()) + '"><span>00 · 总入口</span><strong>Loop Lab</strong><em>仪表盘</em></a>' +
          buildLessonLinks(current, state) +
        '</nav>' +
        '<div class="sim-course-shell__next">' +
          '<span>推荐下一课</span>' +
          '<a class="sim-course-shell__next-link" href="' + esc(buildResumeHref(next, getRecord(state, next))) + '">' +
            '<strong>' + esc(next.label) + ' · ' + esc(next.title) + '</strong>' +
            '<em>' + esc(next.hint) + '</em>' +
          '</a>' +
        '</div>' +
      '</div>'

    document.body.appendChild(shell)

    var status = shell.querySelector('[data-sim-status]')
    var resumeNode = shell.querySelector('[data-sim-resume]')
    var persistTimer = 0
    var updateProgress = function () {
      var ratio = getScrollRatio()
      document.documentElement.style.setProperty('--sim-progress', ratio.toFixed(4))
      shell.style.setProperty('--sim-progress', ratio.toFixed(4))
      window.clearTimeout(persistTimer)
      persistTimer = window.setTimeout(function () {
        state = updateLesson(current, {
          maxScrollRatio: ratio,
          currentScrollRatio: ratio,
          scrollY: window.scrollY,
          status: readInteractionStatus(current),
          resume: captureResumeContext(current)
        })
        updateStatus()
      }, 260)
    }
    var updateStatus = function () {
      var record = getRecord(state, current)
      var progress = computeProgress(record)
      if (status) status.textContent = progress + '% · ' + readInteractionStatus(current)
      if (resumeNode) {
        var text = resumeLabel(record, current)
        resumeNode.textContent = text
        resumeNode.hidden = !text
      }
      syncShellRecords(shell, state)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('hashchange', function () {
      state = updateLesson(current, {
        maxScrollRatio: getScrollRatio(),
        currentScrollRatio: getScrollRatio(),
        scrollY: window.scrollY,
        status: readInteractionStatus(current),
        resume: captureResumeContext(current)
      })
      updateStatus()
    })
    document.addEventListener('click', function (event) {
      if (document.documentElement.classList.contains('sim-course-restoring')) return
      if (closestElement(event.target, '#sim-course-shell')) return
      window.setTimeout(function () {
        state = updateLesson(current, {
          interaction: true,
          maxScrollRatio: getScrollRatio(),
          currentScrollRatio: getScrollRatio(),
          scrollY: window.scrollY,
          status: readInteractionStatus(current),
          resume: captureResumeContext(current, event)
        })
        updateProgress()
        updateStatus()
      }, 180)
    }, true)

    window.addEventListener('pagehide', function () {
      state = updateLesson(current, {
        maxScrollRatio: getScrollRatio(),
        currentScrollRatio: getScrollRatio(),
        scrollY: window.scrollY,
        status: readInteractionStatus(current),
        resume: captureResumeContext(current)
      })
    })

    var scheduled = false
    var observer = new MutationObserver(function () {
      if (scheduled) return
      scheduled = true
      window.setTimeout(function () {
        scheduled = false
        updateStatus()
      }, 240)
    })
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })

    updateProgress()
    updateStatus()
    restoreResume(current, resumeRecord, function () {
      state = updateLesson(current, {
        maxScrollRatio: getScrollRatio(),
        currentScrollRatio: getScrollRatio(),
        scrollY: window.scrollY,
        status: readInteractionStatus(current),
        resume: captureResumeContext(current)
      })
      updateStatus()
    })
  }

  function renderDashboard() {
    var root = document.querySelector('[data-loop-lab-dashboard]')
    if (!root) return
    var state = readState()
    var summary = getCourseSummary(state)
    var total = root.querySelector('[data-loop-lab-total]')
    var completed = root.querySelector('[data-loop-lab-complete]')
    var last = root.querySelector('[data-loop-lab-last]')
    var next = root.querySelector('[data-loop-lab-next]')
    var ring = root.querySelector('[data-loop-lab-ring]')
    var list = root.querySelector('[data-loop-lab-lessons]')
    var nextLink = document.querySelector('[data-loop-lab-next-link]')
    var primaryCta = document.querySelector('[data-loop-lab-primary-cta]')
    var reset = root.querySelector('[data-loop-lab-reset]')
    var continueLesson = summary.lastRecord
      ? lessons.find(function (lesson) { return lesson.id === summary.lastRecord.id }) || summary.nextLesson
      : summary.nextLesson
    var continueRecord = getRecord(state, continueLesson)
    var continueHref = summary.lastRecord ? buildResumeHref(continueLesson, continueRecord) : lessonHref(continueLesson)
    var continueResume = resumeLabel(continueRecord, continueLesson)

    if (total) total.textContent = summary.total + '%'
    if (completed) completed.textContent = summary.completed + ' / ' + lessons.length
    if (last) {
      last.textContent = summary.lastRecord
        ? summary.lastRecord.title + ' · ' + formatTime(summary.lastRecord.updatedAt) + (continueResume ? ' · ' + continueResume.replace('断点：', '') : '')
        : '还没有开始'
    }
    if (next) next.textContent = summary.nextLesson.label + ' · ' + summary.nextLesson.title
    if (ring) ring.style.setProperty('--loop-progress', summary.total + '%')
    if (nextLink) {
      nextLink.href = continueHref
      nextLink.textContent = summary.lastRecord ? '回到断点：' + continueLesson.label : '继续：' + summary.nextLesson.label
      nextLink.title = continueResume || continueLesson.hint
    }
    if (primaryCta) {
      primaryCta.href = continueHref
      primaryCta.textContent = summary.lastRecord ? '继续上次断点' : (summary.total > 0 ? '继续学习' : '从第一课开始')
      primaryCta.title = continueResume || continueLesson.hint
    }

    if (list) {
      list.innerHTML = lessons.map(function (lesson) {
        var record = getRecord(state, lesson)
        var progress = computeProgress(record)
        var label = recordLabel(record)
        var resumeText = resumeLabel(record, lesson)
        var href = buildResumeHref(lesson, record)
        return (
          '<a class="loop-lab-lesson-card' + (progress >= 100 ? ' is-complete' : '') + (resumeText ? ' has-resume' : '') + '" href="' + esc(href) + '" title="' + esc(resumeText || lesson.hint) + '" style="--lesson-progress:' + progress + '%">' +
            '<span class="loop-lab-lesson-card__order">' + esc(lesson.order) + '</span>' +
            '<div class="loop-lab-lesson-card__body">' +
              '<span class="loop-lab-lesson-card__eyebrow">' + esc(lesson.label) + ' · ' + lesson.minutes + ' min</span>' +
              '<h3>' + esc(lesson.title) + '</h3>' +
              '<p>' + esc(lesson.output) + '</p>' +
              (resumeText ? '<span class="loop-lab-lesson-card__resume">' + esc(resumeText) + '</span>' : '') +
              '<div class="loop-lab-lesson-card__bar" aria-hidden="true"><span></span></div>' +
              '<div class="loop-lab-lesson-card__meta"><b>' + progress + '% · ' + esc(label) + '</b><em>' + esc(formatTime(record.updatedAt)) + '</em></div>' +
            '</div>' +
          '</a>'
        )
      }).join('')
    }

    Array.from(document.querySelectorAll('[data-loop-lab-mini]')).forEach(function (node) {
      var lesson = lessons.find(function (item) { return item.id === node.getAttribute('data-loop-lab-mini') })
      if (!lesson) return
      var record = getRecord(state, lesson)
      var progress = computeProgress(record)
      var miniResume = resumeLabel(record, lesson)
      node.style.setProperty('--lesson-progress', progress + '%')
      node.classList.toggle('is-complete', progress >= 100)
      node.classList.toggle('has-resume', Boolean(miniResume))
      node.href = buildResumeHref(lesson, record)
      node.title = miniResume || lesson.hint
      var status = node.querySelector('[data-loop-lab-mini-status]')
      if (status) status.textContent = miniResume ? progress + '% · 断点' : progress + '%'
    })

    if (reset && !reset.dataset.bound) {
      reset.dataset.bound = 'true'
      reset.addEventListener('click', function () {
        try {
          window.localStorage.removeItem(storageKey)
        } catch (err) {
          // Ignore storage errors and still re-render the empty dashboard.
        }
        renderDashboard()
        reset.textContent = '已重置'
        window.setTimeout(function () { reset.textContent = '重置本机记录' }, 1200)
      })
    }
  }

  function initDashboard() {
    if (!document.querySelector('[data-loop-lab-dashboard]')) return
    renderDashboard()
    window.addEventListener('storage', function (event) {
      if (event.key === storageKey) renderDashboard()
    })
    window.addEventListener('loop-lab-progress-updated', renderDashboard)
  }

  function boot() {
    initCourseShell()
    initDashboard()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.setTimeout(boot, 450)
    })
  } else {
    window.setTimeout(boot, 450)
  }
})()
