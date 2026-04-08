const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

async function main() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox'],
    })

    const page = await browser.newPage()
    await page.setViewport({
        width: 1440,
        height: 2200,
        deviceScaleFactor: 1.5,
    })

    const url = process.argv[2] || 'http://127.0.0.1:8766/topic-cc-unpacked-zh.html'
    const outDir = path.join(__dirname, 'images')

    fs.mkdirSync(outDir, { recursive: true })

    const shots = [
        { selector: '.hero', file: 'topic-cc-unpacked-hero.png' },
        { selector: '#cc-loop-player', file: 'topic-cc-unpacked-loop-player.png' },
        { selector: '#cc-arch-knowledge-mount', file: 'topic-cc-unpacked-knowledge-graph.png' },
        { selector: '#cc-tool-tiles-mount', file: 'topic-cc-unpacked-tool-system.png' },
        { selector: '#cc-command-pills-mount', file: 'topic-cc-unpacked-command-catalog.png' },
    ]

    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 120000,
    })

    await page.evaluate(() => window.scrollTo(0, 0))
    await new Promise((resolve) => setTimeout(resolve, 1200))

    for (const shot of shots) {
        const el = await page.waitForSelector(shot.selector, { timeout: 120000 })
        await el.evaluate((node) => {
            node.scrollIntoView({ behavior: 'instant', block: 'center' })
        })
        await new Promise((resolve) => setTimeout(resolve, 900))
        await el.screenshot({
            path: path.join(outDir, shot.file),
        })
        console.log('saved', shot.file)
    }

    await browser.close()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
