/**
 * 知乎已发布文章多模态编辑系统
 * 支持覆盖更新旧文章正文与图片
 *
 * 使用方法:
 *   node edit_article_multimodal.js --article-id 2025288497372643675 ./article.md
 *   node edit_article_multimodal.js --edit-url https://zhuanlan.zhihu.com/p/2025288497372643675/edit ./article.md
 */

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { program } = require('commander')
const fs = require('fs')
const path = require('path')

puppeteer.use(StealthPlugin())

const CONFIG = {
  headless: process.env.HEADLESS !== 'false',
  slowMo: 5,
  timeout: 30000,
}

function loadCookies() {
  const cookiePath = path.join(__dirname, 'cookies.json')
  if (!fs.existsSync(cookiePath)) {
    console.error('❌ 未找到 cookies.json 文件')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(cookiePath, 'utf-8'))
}

function parseMarkdownBlocks(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const lines = raw.split('\n')

  let title = ''
  let bodyStart = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) {
      title = lines[i].substring(2).trim()
      bodyStart = i + 1
      break
    }
  }

  const body = lines.slice(bodyStart).join('\n')
  const baseDir = path.dirname(filePath)
  const blocks = []
  const imagePattern = /^!\[([^\]]*)\]\(([^)]+)\)$/
  let textBuffer = []

  function flushTextBuffer() {
    const text = textBuffer.join('\n').trim()
    if (text) {
      blocks.push({ type: 'text', text })
    }
    textBuffer = []
  }

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim()

    if (!line) {
      flushTextBuffer()
      continue
    }

    const imageMatch = line.match(imagePattern)
    if (imageMatch) {
      flushTextBuffer()
      blocks.push({
        type: 'image',
        alt: imageMatch[1].trim(),
        src: imageMatch[2].trim(),
        filePath: path.resolve(baseDir, imageMatch[2].trim()),
      })
      continue
    }

    textBuffer.push(line)
  }

  flushTextBuffer()

  return { title, content: body, blocks, sourceFile: filePath }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function pressEnterTimes(page, times, delay = 80) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press('Enter')
    await sleep(delay)
  }
}

function normalizeEditUrl({ articleId, editUrl }) {
  if (editUrl) return editUrl
  if (articleId) return `https://zhuanlan.zhihu.com/p/${articleId}/edit`
  throw new Error('需要提供 --article-id 或 --edit-url')
}

async function humanType(page, selector, text) {
  await page.click(selector)
  await sleep(200)
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

async function placeCursorAtEnd(page, selector) {
  const ok = await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return false
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const selection = window.getSelection()
    if (!selection) return false
    selection.removeAllRanges()
    selection.addRange(range)
    return true
  }, selector)
  if (ok) await sleep(120)
  return ok
}

async function clearEditorContent(page, selector) {
  await page.click(selector)
  await sleep(200)
  await page.keyboard.down(process.platform === 'darwin' ? 'Meta' : 'Control')
  await page.keyboard.press('KeyA')
  await page.keyboard.up(process.platform === 'darwin' ? 'Meta' : 'Control')
  await sleep(120)
  await page.keyboard.press('Backspace')
  await sleep(1200)
}

async function insertEditorParagraph(page, selector, text) {
  await placeCursorAtEnd(page, selector)
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

async function uploadEditorImage(page, filePath, contentSelector, options = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`图片文件不存在: ${filePath}`)
  }
  const { leadingBreaks = 1, trailingBreaks = 1 } = options
  await placeCursorAtEnd(page, contentSelector)
  if (leadingBreaks > 0) {
    await pressEnterTimes(page, leadingBreaks)
  }
  await sleep(120)

  const beforeCount = await page.evaluate(
    () => document.querySelectorAll('.public-DraftEditor-content img').length
  )
  const fileInputs = await page.$$('input[type="file"]')
  if (fileInputs.length < 2) {
    throw new Error('未找到正文图片上传输入框')
  }
  await fileInputs[1].uploadFile(filePath)
  await page.waitForFunction(
    count => document.querySelectorAll('.public-DraftEditor-content img').length > count,
    { timeout: 30000 },
    beforeCount
  )
  await sleep(1500)
  await placeCursorAtEnd(page, contentSelector)
  if (trailingBreaks > 0) {
    await pressEnterTimes(page, trailingBreaks)
  }
  await sleep(120)
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

async function editArticle(options) {
  const { title, blocks, content, editUrl } = options
  const cookies = loadCookies()

  console.log('🛠️ 开始编辑知乎已发布文章...')
  console.log(`🔗 编辑地址: ${editUrl}`)

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
    await page.setCookie(...cookies)
    await page.goto(editUrl, { waitUntil: 'networkidle2', timeout: 60000 })
    await sleep(2500)

    if (page.url().includes('signin')) {
      console.error('❌ 登录已过期，请更新 cookies.json')
      await page.screenshot({ path: 'debug-login-expired.png' })
      process.exit(1)
    }

    const titleSelector = 'textarea.Input[placeholder*="请输入标题"], textarea[placeholder*="标题"], .Input[placeholder*="标题"]'
    const contentSelector = '.public-DraftEditor-content[contenteditable="true"], .public-DraftEditor-content, [contenteditable="true"][role="textbox"]'
    await page.waitForSelector(titleSelector, { timeout: 15000 })
    await page.waitForSelector(contentSelector, { timeout: 15000 })

    console.log('✍️ 更新标题...')
    await clearAndType(page, titleSelector, title)

    console.log('🧹 清空旧正文...')
    await clearEditorContent(page, contentSelector)

    console.log('🧩 写入新图文正文...')
    const workBlocks = Array.isArray(blocks) && blocks.length
      ? blocks
      : [{ type: 'text', text: content || '' }]

    for (let i = 0; i < workBlocks.length; i++) {
      const block = workBlocks[i]
      const nextBlock = workBlocks[i + 1]
      if (block.type === 'image') {
        console.log(`🖼️ 上传正文图片 ${i + 1}/${workBlocks.length}: ${path.basename(block.filePath)}`)
        await uploadEditorImage(page, block.filePath, contentSelector, {
          leadingBreaks: i === 0 ? 0 : 1,
          trailingBreaks: nextBlock && nextBlock.type === 'text' ? 1 : 0,
        })
      } else if (block.type === 'text' && block.text.trim()) {
        const paragraphs = block.text.split('\n').map(x => x.trim()).filter(Boolean)
        for (let j = 0; j < paragraphs.length; j++) {
          await insertEditorParagraph(page, contentSelector, paragraphs[j])
          if (j < paragraphs.length - 1) {
            await placeCursorAtEnd(page, contentSelector)
            await pressEnterTimes(page, 1)
          }
        }
        if (nextBlock && nextBlock.type === 'text') {
          await placeCursorAtEnd(page, contentSelector)
          await pressEnterTimes(page, 1)
        }
      }
    }

    await sleep(1200)
    console.log('📤 正在更新文章...')
    let updated = await clickButtonByText(page, '更新')
    if (!updated) {
      updated = await clickButtonByText(page, '发布')
    }
    if (!updated) {
      console.error('❌ 未找到更新按钮')
      await page.screenshot({ path: 'debug-no-update-button.png' })
      process.exit(1)
    }

    console.log('⏳ 等待更新完成...')
    await sleep(3000)
    console.log(`✅ 更新流程已提交: ${page.url()}`)
  } catch (error) {
    console.error('❌ 更新失败:', error.message)
    await page.screenshot({ path: 'debug-edit-error.png' })
    throw error
  } finally {
    await browser.close()
  }
}

program
  .name('zhihu-editor-multimodal')
  .description('知乎已发布文章图文更新系统')
  .argument('[file]', 'Markdown 文件路径')
  .requiredOption('--article-id <id>', '已发布文章 ID', undefined)
  .option('--edit-url <url>', '已发布文章编辑地址')
  .action(async (file, options) => {
    if (!file) {
      console.error('❌ 需要提供 Markdown 文件')
      process.exit(1)
    }
    const parsed = parseMarkdownBlocks(path.resolve(file))
    await editArticle({
      title: parsed.title,
      content: parsed.content,
      blocks: parsed.blocks,
      editUrl: normalizeEditUrl({
        articleId: options.articleId,
        editUrl: options.editUrl,
      }),
    })
  })

program.parse()
