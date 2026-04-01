// 应用脚本
document.addEventListener('DOMContentLoaded', () => {
    // 主题切换
    const themeToggle = document.getElementById('theme-toggle')
    const themes = ['warm', 'dark', 'light']
    let currentThemeIndex = 0

    // 从 localStorage 加载主题
    const savedTheme = localStorage.getItem('theme') || 'warm'
    currentThemeIndex = themes.indexOf(savedTheme)
    if (currentThemeIndex === -1) currentThemeIndex = 0
    document.documentElement.setAttribute('data-theme', savedTheme)

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length
            const newTheme = themes[currentThemeIndex]
            document.documentElement.setAttribute('data-theme', newTheme)
            localStorage.setItem('theme', newTheme)
        })
    }

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

    // 课程卡片点击
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            const number = card.querySelector('.course-number').textContent
            console.log(`Navigate to course: ${number}`)
            // TODO: 跳转到课程详情页
        })
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