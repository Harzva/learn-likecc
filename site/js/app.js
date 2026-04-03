// 应用脚本
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
})