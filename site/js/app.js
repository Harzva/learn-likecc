// 应用脚本
// Mermaid 流程图定义（key 对应 data-mermaid-diagram）
const MERMAID_DIAGRAMS = {
    'agent-loop': `graph TD
    classDef yellowBox fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef blueBox fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef greenBox fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;

    Step1[1 用户输入]:::blueBox --> Step2[2 查询初始化]:::blueBox
    Step2 --> Step3[3 上下文准备]:::yellowBox
    Step3 --> Step4[4 API 调用]:::greenBox

    subgraph Loop [循环执行]
        Step4 --> Step5[5 流式处理]:::greenBox
    end

    style Loop fill:#313244,stroke:#89b4fa,stroke-dasharray: 5 5`,

    /** 12 章源码课程总览：运行时主链 + Part1–3 + Source Map 契机 + Agent 生态扩展 */
    'course-map': `graph TB
    classDef yellowBox fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef blueBox fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef greenBox fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    classDef purpleBox fill:#2b2035,stroke:#cba6f7,stroke-width:2px,color:#cba6f7;

    SM["Source Map 事件 2026.03<br/>约 57MB cli.js.map 误入正式包"]:::purpleBox

    subgraph RT ["运行时主链 · 对照 S01"]
        R1["1 用户输入"]:::blueBox --> R2["2 查询初始化"]:::blueBox
        R2 --> R3["3 上下文准备"]:::yellowBox
        R3 --> R4["4 API 调用"]:::greenBox
        R4 --> R5["5 流式处理 · 循环"]:::greenBox
    end

    SM -.->|学习契机| R1

    subgraph P1 ["Part 1 · 核心架构"]
        S01["S01 Agent Loop<br/>主循环与状态"]:::blueBox --> S02["S02 Tool System<br/>工具定义与调用"]:::blueBox
        S02 --> S03["S03 Permission Model<br/>权限与用户交互"]:::yellowBox --> S04["S04 Command Interface<br/>CLI 命令处理"]:::greenBox
    end

    R5 --> S01

    subgraph P2 ["Part 2 · 高级特性"]
        S05["S05 Context Compression<br/>消息压缩"]:::yellowBox --> S06["S06 Subagent Fork<br/>子代理与分支"]:::blueBox
        S06 --> S07["S07 MCP Protocol<br/>模型上下文协议"]:::greenBox --> S08["S08 Task Management<br/>任务队列与调度"]:::greenBox
    end

    subgraph P3 ["Part 3 · 扩展集成"]
        S09["S09 Bridge IDE<br/>IDE 集成与通信"]:::blueBox --> S10["S10 Hooks Extension<br/>钩子扩展"]:::yellowBox
        S10 --> S11["S11 Vim Mode<br/>Vim 键绑定"]:::greenBox --> S12["S12 Git Integration<br/>Git 工作流"]:::greenBox
    end

    S04 --> S05
    S08 --> S09

    EXT["Agent 生态对比<br/>技能包 · Subagents / Teams"]:::purpleBox
    S06 -.->|扩展阅读| EXT

    style RT fill:#181825,stroke:#89b4fa,stroke-width:1px
    style P1 fill:#13131a,stroke:#e2b953,stroke-dasharray:5 4
    style P2 fill:#13131a,stroke:#3b82f6,stroke-dasharray:5 4
    style P3 fill:#13131a,stroke:#10b981,stroke-dasharray:5 4`
}

function fillMermaidPlaceholders() {
    document.querySelectorAll('[data-mermaid-diagram]').forEach((host) => {
        const key = host.getAttribute('data-mermaid-diagram')
        const text = MERMAID_DIAGRAMS[key]
        if (!text) return
        host.replaceChildren()
        const el = document.createElement('div')
        el.className = 'mermaid mermaid-flowchart'
        el.textContent = text.trim()
        host.appendChild(el)
    })
}

function initMermaidFlowcharts() {
    if (typeof mermaid === 'undefined') return
    const hasHost = document.querySelector('[data-mermaid-diagram]')
    if (!hasHost) return
    fillMermaidPlaceholders()
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        themeVariables: {
            background: '#11111b',
            primaryColor: '#1e1e2e',
            primaryTextColor: '#cdd6f4',
            primaryBorderColor: '#89b4fa',
            lineColor: '#f5e0dc',
            secondaryColor: '#313244',
            tertiaryColor: '#11111b',
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        }
    })
    mermaid.run({ querySelector: '.mermaid-flowchart' }).catch((err) => {
        console.warn('Mermaid render failed:', err)
    })
}

document.addEventListener('DOMContentLoaded', () => {
    // 主题切换 - 支持8种主题
    const themeToggle = document.getElementById('theme-toggle')
    const themes = ['warm', 'light', 'dark', 'ocean', 'forest', 'lavender', 'sunset', 'midnight']
    const themeNames = {
        'warm': '☀️ 暖光',
        'light': '🌞 明亮',
        'dark': '🌙 暗夜',
        'ocean': '🌊 海洋',
        'forest': '🌲 森林',
        'lavender': '💜 薰衣草',
        'sunset': '🌅 日落',
        'midnight': '🌃 午夜'
    }
    let currentThemeIndex = 0

    // 从 localStorage 加载主题
    const savedTheme = localStorage.getItem('theme') || 'warm'
    currentThemeIndex = themes.indexOf(savedTheme)
    if (currentThemeIndex === -1) currentThemeIndex = 0
    document.documentElement.setAttribute('data-theme', savedTheme)
    updateThemeIcon(savedTheme)

    function updateThemeIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle')
        if (themeToggle) {
            themeToggle.innerHTML = `<span>${themeNames[theme] || '🎨'}</span>`
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length
            const newTheme = themes[currentThemeIndex]
            document.documentElement.setAttribute('data-theme', newTheme)
            localStorage.setItem('theme', newTheme)
            updateThemeIcon(newTheme)

            // 添加切换动画
            document.body.style.transition = 'background 0.3s ease, color 0.3s ease'
        })
    }

    // 初始化主题图标
    updateThemeIcon(savedTheme)

    // 代码语言切换 - 从 localStorage 加载
    const savedLang = localStorage.getItem('codeLang') || 'typescript'
    switchCodeLanguage(savedLang)
    const langSwitch = document.getElementById('code-lang-switch')
    if (langSwitch) {
        langSwitch.value = savedLang
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault()
            const target = document.querySelector(this.getAttribute('href'))
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        })
    })

    // 导航栏滚动效果
    let lastScroll = 0
    const navbar = document.querySelector('.navbar')

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset

        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)'
        } else {
            navbar.style.transform = 'translateY(0)'
        }

        lastScroll = currentScroll
    })

    // 课程卡片动画
    document.querySelectorAll('.course-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`
        card.classList.add('animate-fade-in')
    })

    // 代码窗口动画
    const codeWindow = document.querySelector('.code-window')
    if (codeWindow) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate')
                }
            })
        }, { threshold: 0.3 })

        observer.observe(codeWindow)
    }

    // 语言切换
    const langSelect = document.getElementById('lang-switch')
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            console.log(`Language switched to: ${e.target.value}`)
            // TODO: 实现语言切换
        })
    }

    // 添加滚动动画
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.overview-card, .course-card, .resource-card')
        elements.forEach(el => {
            const rect = el.getBoundingClientRect()
            if (rect.top < window.innerHeight - 100) {
                el.style.opacity = '1'
                el.style.transform = 'translateY(0)'
            }
        })
    }

    window.addEventListener('scroll', animateOnScroll)
    animateOnScroll() // 初始检查
})

// 代码语言切换函数
function switchCodeLanguage(lang) {
    localStorage.setItem('codeLang', lang)

    // 切换所有代码块
    document.querySelectorAll('code[data-lang]').forEach(code => {
        if (code.getAttribute('data-lang') === lang) {
            code.style.display = 'block'
        } else {
            code.style.display = 'none'
        }
    })

    // 更新代码块标签
    document.querySelectorAll('.code-lang').forEach(label => {
        label.textContent = lang === 'typescript' ? 'TypeScript' : 'Python'
    })
}

// 教程选项卡切换
function initTutorialsTabs() {
    const tabBtns = document.querySelectorAll('.tutorials-tabs .tab-btn')
    const tabContents = document.querySelectorAll('.tutorials-content .tab-content')

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab')

            // 移除所有 active
            tabBtns.forEach(b => b.classList.remove('active'))
            tabContents.forEach(c => c.classList.remove('active'))

            // 添加 active
            btn.classList.add('active')
            document.getElementById(targetTab)?.classList.add('active')
        })
    })
}

// 面试问题分类切换
function initInterviewCategories() {
    const categoryBtns = document.querySelectorAll('.interview-categories .category-btn')
    const categoryContents = document.querySelectorAll('.interview-content .category-content')

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetCategory = btn.getAttribute('data-category')

            // 移除所有 active
            categoryBtns.forEach(b => b.classList.remove('active'))
            categoryContents.forEach(c => c.classList.remove('active'))

            // 添加 active
            btn.classList.add('active')
            document.getElementById(targetCategory)?.classList.add('active')
        })
    })
}

// 展开答案按钮
function initExpandButtons() {
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.question-card')
            const preview = card.querySelector('.answer-preview')

            if (btn.textContent.includes('展开')) {
                // 展开逻辑
                preview.style.maxHeight = 'none'
                btn.textContent = '收起答案'
            } else {
                // 收起逻辑
                preview.style.maxHeight = '200px'
                btn.textContent = '展开完整答案'
            }
        })
    })
}

// 初始化新功能
document.addEventListener('DOMContentLoaded', () => {
    initTutorialsTabs()
    initInterviewCategories()
    initExpandButtons()
    initMermaidFlowcharts()
})