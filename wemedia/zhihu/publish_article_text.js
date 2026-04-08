/**
 * 知乎自动发布系统
 * 基于 Puppeteer + Stealth 插件，模拟真人浏览器操作
 *
 * 使用方法:
 *   node publish_article.js ./article.md
 *   node publish_article.js --config ./config.json
 *   node publish_article.js --title "标题" --content "内容"
 */

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { program } = require('commander')
const fs = require('fs')
const path = require('path')
const { marked } = require('marked')

// 使用 Stealth 插件避免被检测
puppeteer.use(StealthPlugin())

// 配置
const CONFIG = {
  zhihuUrl: 'https://zhuanlan.zhihu.com/write',
  headless: process.env.HEADLESS !== 'false',
  slowMo: 5,  // 输入延迟，先确保链路打通
  timeout: 30000,
}

/**
 * 加载 Cookie
 */
function loadCookies() {
  const cookiePath = path.join(__dirname, 'cookies.json')
  if (!fs.existsSync(cookiePath)) {
    console.error('❌ 未找到 cookies.json 文件')
    console.log('请按以下步骤获取 Cookie:')
    console.log('1. 打开 Chrome 浏览器，访问 https://zhuanlan.zhihu.com')
    console.log('2. 登录知乎账号')
    console.log('3. 使用 Cookie 编辑器插件导出 Cookie')
    console.log('4. 将 Cookie 保存到 cookies.json 文件')
    process.exit(1)
  }

  return JSON.parse(fs.readFileSync(cookiePath, 'utf-8'))
}

/**
 * 解析 Markdown 文件
 */
function parseMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // 提取标题（第一个 # 开头的行）
  let title = ''
  let bodyStart = 0

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) {
      title = lines[i].substring(2).trim()
      bodyStart = i + 1
      break
    }
  }

  // 提取正文
  const body = lines.slice(bodyStart).join('\n')

  // 转换 Markdown 为 HTML（知乎编辑器支持 HTML）
  const htmlContent = marked(body)

  return { title, content: body, htmlContent }
}

/**
 * 等待指定时间
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟真人输入
 */
async function humanType(page, selector, text, options = {}) {
  await page.click(selector)
  await sleep(200)

  // 分段输入，模拟真人节奏
  const chunks = text.split('\n')
  for (let i = 0; i < chunks.length; i++) {
    await page.keyboard.type(chunks[i], { delay: CONFIG.slowMo })
    if (i < chunks.length - 1) {
      await page.keyboard.press('Enter')
      await sleep(300)
    }
  }
}

async function clearAndType(page, selector, text) {
  await page.click(selector)
  await sleep(150)
  await page.keyboard.down(process.platform === 'darwin' ? 'Meta' : 'Control')
  await page.keyboard.press('KeyA')
  await page.keyboard.up(process.platform === 'darwin' ? 'Meta' : 'Control')
  await sleep(80)
  await page.keyboard.press('Backspace')
  await sleep(120)
  await humanType(page, selector, text)
}

async function insertEditorParagraph(page, selector, text) {
  await page.click(selector)
  await sleep(120)
  const ok = await page.evaluate((sel, value) => {
    const el = document.querySelector(sel)
    if (!el) return false
    el.focus()
    return document.execCommand('insertText', false, value)
  }, selector, text)

  if (!ok) {
    await page.keyboard.type(text, { delay: CONFIG.slowMo })
  }
}

async function tryImportMarkdown(page, sourceFile) {
  if (!sourceFile || !fs.existsSync(sourceFile)) return false

  try {
    const opened = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        el => ((el.textContent || '').includes('导入')) || el.getAttribute('aria-label') === '导入'
      )
      if (!btn) return false
      btn.click()
      return true
    })
    if (!opened) return false

    await sleep(800)
    const fileInputs = await page.$$('input[type="file"]')
    if (!fileInputs.length) return false

    await fileInputs[0].uploadFile(sourceFile)
    await sleep(6000)

    const imported = await page.evaluate(() => {
      const title = document.querySelector('textarea.Input[placeholder*="请输入标题"]')?.value || ''
      const content = document.querySelector('.public-DraftEditor-content')?.innerText || ''
      return Boolean(title.trim() || content.trim())
    })
    return imported
  } catch (_err) {
    return false
  }
}

async function clickButtonByText(page, text) {
  const buttons = await page.$$('button')
  for (const button of buttons) {
    const btnText = await page.evaluate(el => (el.textContent || '').trim(), button)
    if (btnText.includes(text)) {
      await button.click()
      return true
    }
  }
  return false
}

/**
 * 发布文章到知乎
 */
async function publishArticle(options) {
  const { title, content, coverImage, sourceFile } = options

  console.log('🚀 开始发布文章到知乎...')
  console.log(`📝 标题: ${title}`)

  // 加载 Cookie
  const cookies = loadCookies()

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  })

  const page = await browser.newPage()

  try {
    // 设置 Cookie
    await page.setCookie(...cookies)

    // 访问知乎创作中心
    console.log('📡 正在访问知乎创作中心...')
    await page.goto(CONFIG.zhihuUrl, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout,
    })

    // 检查是否登录成功
    await sleep(2000)
    const currentUrl = page.url()
    if (currentUrl.includes('signin')) {
      console.error('❌ 登录已过期，请更新 cookies.json')
      await page.screenshot({ path: 'debug-login-expired.png' })
      process.exit(1)
    }

    // 输入标题
    console.log('✍️ 正在输入标题...')
    const titleSelector = 'textarea.Input[placeholder*="请输入标题"], textarea[placeholder*="标题"], .Input[placeholder*="标题"]'
    await page.waitForSelector(titleSelector, { timeout: 15000 })
    const contentSelector = '.public-DraftEditor-content[contenteditable="true"], .public-DraftEditor-content, [contenteditable="true"][role="textbox"]'
    await page.waitForSelector(contentSelector, { timeout: 15000 })

    console.log('✍️ 正在输入标题...')
    const imported = await tryImportMarkdown(page, sourceFile)
    if (imported) {
      console.log('📥 已尝试通过导入 Markdown 填充正文')
    }

    await clearAndType(page, titleSelector, title)
    await sleep(500)

    if (!imported) {
      console.log('✍️ 正在输入正文...')
      await page.click(contentSelector)
      await sleep(300)

      const paragraphs = content.split('\n\n')
      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i].trim()
        if (para) {
          await insertEditorParagraph(page, contentSelector, para)
          if (i < paragraphs.length - 1) {
            await page.keyboard.press('Enter')
            await page.keyboard.press('Enter')
            await sleep(120)
          }
        }
      }
    }

    // 上传封面图（如果有）
    if (coverImage && fs.existsSync(coverImage)) {
      console.log('🖼️ 正在上传封面图...')
      try {
        const coverSelector = 'input[type="file"][accept*="image"]'
        const fileInput = await page.$(coverSelector)
        if (fileInput) {
          await fileInput.uploadFile(coverImage)
          await sleep(2000)
        }
      } catch (err) {
        console.log('⚠️ 封面图上传失败，继续发布...')
      }
    }

    await sleep(1000)

    // 点击发布按钮
    console.log('📤 正在发布...')

    // 查找发布按钮（知乎的按钮选择器可能变化）
    const publishButtonSelectors = [
      '.Button--primary',
      '.PublishButton',
      'button[class*="Button--primary"]',
      '[class*="publish"] button',
    ]

    let published = false
    for (const selector of publishButtonSelectors) {
      try {
        const button = await page.$(selector)
        if (button) {
          await button.click()
          published = true
          break
        }
      } catch (err) {
        continue
      }
    }

    if (!published) {
      published = await clickButtonByText(page, '发布')
    }

    if (!published) {
      console.error('❌ 未找到发布按钮')
      await page.screenshot({ path: 'debug-no-publish-button.png' })
      process.exit(1)
    }

    // 等待发布完成
    console.log('⏳ 等待发布完成...')
    await sleep(3000)

    // 检查是否发布成功
    const finalUrl = page.url()
    if (finalUrl.includes('/p/')) {
      console.log('✅ 文章发布成功！')
      console.log(`🔗 文章链接: ${finalUrl}`)
    } else {
      console.log('⚠️ 发布状态未知，请手动检查')
      await page.screenshot({ path: 'debug-publish-result.png' })
    }

  } catch (error) {
    console.error('❌ 发布失败:', error.message)
    await page.screenshot({ path: 'debug-error.png' })
    throw error
  } finally {
    await browser.close()
  }
}

// 命令行参数解析
program
  .name('zhihu-publisher')
  .description('知乎自动发布系统')
  .version('1.0.0')
  .argument('[file]', 'Markdown 文件路径')
  .option('-t, --title <title>', '文章标题')
  .option('-c, --content <content>', '文章内容')
  .option('--cover <image>', '封面图路径')
  .option('--config <file>', '配置文件路径')
  .action(async (file, options) => {
    let articleOptions = {}

    if (options.config) {
      // 从配置文件读取
      const config = JSON.parse(fs.readFileSync(options.config, 'utf-8'))
      articleOptions = { ...config }
    } else if (file) {
      // 从 Markdown 文件读取
      const parsed = parseMarkdown(file)
      articleOptions = {
        title: options.title || parsed.title,
        content: options.content || parsed.content,
        coverImage: options.cover,
        sourceFile: path.resolve(file),
      }
    } else if (options.title && options.content) {
      // 从命令行参数读取
      articleOptions = {
        title: options.title,
        content: options.content,
        coverImage: options.cover,
      }
    } else {
      console.error('❌ 请提供文章内容')
      console.log('使用方法:')
      console.log('  node publish_article.js ./article.md')
      console.log('  node publish_article.js --config ./config.json')
      console.log('  node publish_article.js -t "标题" -c "内容"')
      process.exit(1)
    }

    await publishArticle(articleOptions)
  })

program.parse()
