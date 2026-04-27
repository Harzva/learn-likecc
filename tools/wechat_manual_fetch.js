#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function requirePlaywright() {
  const candidates = [
    path.join(process.cwd(), "node_modules", "playwright"),
    "playwright",
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      if (error.code !== "MODULE_NOT_FOUND") throw error;
    }
  }

  throw new Error("Cannot find Playwright.");
}

function detectForwardedDisplay() {
  if (process.env.DISPLAY) return process.env.DISPLAY;

  const procFiles = ["/proc/net/tcp", "/proc/net/tcp6"];
  for (const procFile of procFiles) {
    if (!fs.existsSync(procFile)) continue;
    const lines = fs.readFileSync(procFile, "utf8").trim().split("\n").slice(1);
    for (const line of lines) {
      const columns = line.trim().split(/\s+/);
      const local = columns[1] || "";
      const state = columns[3] || "";
      if (state !== "0A") continue;

      const [hostHex, portHex] = local.split(":");
      const port = Number.parseInt(portHex, 16);
      const isLoopbackV4 = hostHex === "0100007F";
      const isLoopbackV6 = hostHex === "00000000000000000000000001000000";
      if ((!isLoopbackV4 && !isLoopbackV6) || port < 6010 || port > 6099) continue;
      return `localhost:${port - 6000}.0`;
    }
  }

  return null;
}

function prompt(message) {
  return new Promise((resolve) => {
    process.stdout.write(message);
    process.stdin.setEncoding("utf8");
    process.stdin.resume();
    process.stdin.once("data", () => {
      process.stdin.pause();
      resolve();
    });
  });
}

function normalizeWhitespace(value) {
  return (value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function safeSlug(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "") || "wechat-article";
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function extractArticle(page) {
  return page.evaluate(() => {
    const pickText = (selectors) => {
      for (const selector of selectors) {
        const node = document.querySelector(selector);
        const text = node && node.textContent ? node.textContent.trim() : "";
        if (text) return text;
      }
      return "";
    };

    const getMeta = (name) => {
      const node =
        document.querySelector(`meta[property="${name}"]`) ||
        document.querySelector(`meta[name="${name}"]`);
      return node ? (node.getAttribute("content") || "").trim() : "";
    };

    const rich = document.querySelector("#js_content");
    const title = pickText(["#activity-name", ".rich_media_title", "h1"]) || document.title;
    const author = pickText(["#js_name", ".rich_media_meta_nickname", ".account_nickname_inner"]);
    const publishText = pickText(["#publish_time", ".rich_media_meta.rich_media_meta_text"]);
    const contentHtml = rich ? rich.innerHTML : "";
    const contentText = rich ? rich.innerText : (document.body ? document.body.innerText : "");

    return {
      title: title.trim(),
      author,
      publish_text: publishText,
      canonical_url: getMeta("og:url") || location.href,
      description: getMeta("description") || getMeta("og:description") || "",
      content_html: contentHtml,
      content_text: contentText,
      is_article: Boolean(rich),
    };
  });
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.url) throw new Error("Missing required --url");

  const storageStatePath = args["storage-state"] ? path.resolve(args["storage-state"]) : null;
  const outDir = path.resolve(args["out-dir"] || "tmp/wechat");
  const slugInput = args.slug || "";
  const screenshot = Boolean(args.screenshot);
  fs.mkdirSync(outDir, { recursive: true });

  if (!process.env.DISPLAY) {
    const detectedDisplay = detectForwardedDisplay();
    if (detectedDisplay) {
      process.env.DISPLAY = detectedDisplay;
      console.log(`Detected forwarded X11 display: ${detectedDisplay}`);
    }
  }

  if (!process.env.DISPLAY) {
    throw new Error("No DISPLAY detected. Start Xming/X11 forwarding first.");
  }

  const { chromium } = requirePlaywright();
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(
    storageStatePath && fs.existsSync(storageStatePath) ? { storageState: storageStatePath } : {}
  );

  try {
    const page = await context.newPage();
    await page.goto(args.url, { waitUntil: "domcontentloaded", timeout: 90000 });
    console.log(`Opened ${args.url}`);
    console.log("Finish any WeChat verification in the browser window until the article is visible.");
    await prompt("Press Enter here after the full article is on screen...\n");
    await page.waitForTimeout(1000);

    const article = await extractArticle(page);
    if (!article.is_article) {
      throw new Error("The page still does not look like a WeChat article. Make sure the article body is visible before pressing Enter.");
    }

    const slug = safeSlug(slugInput || article.title);
    const htmlPath = path.join(outDir, `${slug}.html`);
    const jsonPath = path.join(outDir, `${slug}.json`);
    const screenshotPath = path.join(outDir, `${slug}.png`);
    const pageHtml = await page.content();

    fs.writeFileSync(htmlPath, pageHtml, "utf8");
    writeJson(jsonPath, {
      requested_url: args.url,
      final_url: page.url(),
      fetched_at: new Date().toISOString(),
      page_type: "wechat_article",
      article: {
        ...article,
        content_text: normalizeWhitespace(article.content_text),
      },
      files: {
        html: htmlPath,
        json: jsonPath,
        screenshot: screenshot ? screenshotPath : null,
      },
    });

    if (screenshot) {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    console.log(`Saved article JSON to ${jsonPath}`);
    console.log(`Saved article HTML to ${htmlPath}`);
    if (screenshot) {
      console.log(`Saved screenshot to ${screenshotPath}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
