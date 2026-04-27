#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SKILL_ROOT = path.resolve(
  process.env.HOME || "~",
  ".codex/skills/wechat-web-scrape/scripts"
);
const SAVE_STATE_SCRIPT = path.join(SKILL_ROOT, "save_wechat_state.js");
const SCRAPE_SCRIPT = path.join(SKILL_ROOT, "scrape_wechat_page.js");
const DEFAULT_OUT_DIR = path.join(ROOT, "tmp/wechat");
const DEFAULT_STATE = path.join(DEFAULT_OUT_DIR, "wechat-storage-state.json");
const DEFAULT_VERIFY_URL_FILE = "latest-verify-url.txt";

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }
  return args;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function quote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function runNodeScript(scriptPath, scriptArgs, options = {}) {
  const result = spawnSync(process.execPath, [scriptPath, ...scriptArgs], {
    cwd: ROOT,
    stdio: options.stdio || "pipe",
    encoding: "utf8",
    env: options.env || process.env,
  });

  if (options.stdio !== "inherit") {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  if (result.error) {
    throw result.error;
  }

  return result;
}

function canOpenBrowser() {
  return Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);
}

function detectForwardedDisplay() {
  if (process.env.DISPLAY) {
    return process.env.DISPLAY;
  }

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
      if (!hostHex || !portHex) continue;

      const port = Number.parseInt(portHex, 16);
      const isLoopbackV4 = hostHex === "0100007F";
      const isLoopbackV6 = hostHex === "00000000000000000000000001000000";
      if (!isLoopbackV4 && !isLoopbackV6) continue;
      if (port < 6010 || port > 6099) continue;

      return `localhost:${port - 6000}.0`;
    }
  }

  return null;
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, `${value}\n`, "utf8");
}

function tryOpenUrl(url) {
  const result = spawnSync("xdg-open", [url], {
    cwd: ROOT,
    stdio: "ignore",
    encoding: "utf8",
  });

  if (result.error) {
    return false;
  }

  return result.status === 0;
}

function usage() {
  console.log(`Usage:
  node tools/wechat_article_cli.js login [--state PATH] [--url URL]
  node tools/wechat_article_cli.js fetch --url URL [--state PATH] [--out-dir PATH] [--slug NAME] [--headless true|false] [--screenshot] [--open]

Defaults:
  --state   ${DEFAULT_STATE}
  --out-dir ${DEFAULT_OUT_DIR}
`);
}

function buildFetchCommand({ url, state, outDir, slug, headless, screenshot }) {
  const parts = [
    "node",
    "tools/wechat_article_cli.js",
    "fetch",
    "--url",
    quote(url),
    "--state",
    quote(state),
    "--out-dir",
    quote(outDir),
  ];

  if (slug) {
    parts.push("--slug", quote(slug));
  }

  if (headless !== undefined) {
    parts.push("--headless", quote(String(headless)));
  }

  if (screenshot) {
    parts.push("--screenshot");
  }

  return parts.join(" ");
}

function buildLoginCommand(state) {
  return `node tools/wechat_article_cli.js login --state ${quote(state)}`;
}

function parseJsonFromOutput(output) {
  const trimmed = (output || "").trim();
  if (!trimmed) return null;

  const start = trimmed.indexOf("{");
  if (start < 0) return null;

  try {
    return JSON.parse(trimmed.slice(start));
  } catch (_) {
    return null;
  }
}

function runLogin(args) {
  const statePath = path.resolve(args.state || DEFAULT_STATE);
  const loginUrl = args.url || "https://mp.weixin.qq.com/";
  ensureDir(path.dirname(statePath));
  const env = { ...process.env };
  const detectedDisplay = detectForwardedDisplay();
  if (!env.DISPLAY && detectedDisplay) {
    env.DISPLAY = detectedDisplay;
    console.log(`Detected forwarded X11 display: ${detectedDisplay}`);
  }

  console.log(`Opening browser for WeChat verification/login...`);
  console.log(`Storage state will be saved to ${statePath}`);

  const result = runNodeScript(
    SAVE_STATE_SCRIPT,
    ["--state", statePath, "--url", loginUrl],
    { stdio: "inherit", env }
  );

  process.exit(result.status || 0);
}

function runFetch(args) {
  if (!args.url) {
    usage();
    process.exit(1);
  }

  const url = args.url;
  const statePath = path.resolve(args.state || DEFAULT_STATE);
  const outDir = path.resolve(args["out-dir"] || DEFAULT_OUT_DIR);
  const slug = args.slug;
  const headless = args.headless === undefined ? "true" : String(args.headless);
  const screenshot = Boolean(args.screenshot);
  const shouldOpen = Boolean(args.open);

  ensureDir(outDir);

  const scriptArgs = ["--url", url, "--out-dir", outDir, "--headless", headless];
  if (fs.existsSync(statePath)) {
    scriptArgs.push("--storage-state", statePath);
  }
  if (slug) {
    scriptArgs.push("--slug", slug);
  }
  if (screenshot) {
    scriptArgs.push("--screenshot");
  }

  const result = runNodeScript(SCRAPE_SCRIPT, scriptArgs);
  const payload = parseJsonFromOutput(result.stdout);

  if (!payload) {
    console.error("\nUnable to parse scraper output.");
    process.exit(result.status || 1);
  }

  if (payload.detected_captcha) {
    const verifyUrl = payload.final_url || "";
    const verifyUrlPath = path.join(outDir, DEFAULT_VERIFY_URL_FILE);
    if (verifyUrl) {
      writeText(verifyUrlPath, verifyUrl);
    }

    console.error(`\nWeChat blocked this request with: ${payload.detected_captcha}`);
    if (verifyUrl) {
      console.error(`Verification URL:\n${verifyUrl}`);
      console.error(`Saved to:\n${verifyUrlPath}`);
    }
    if (fs.existsSync(statePath)) {
      console.error(`Saved state was used from ${statePath}, but verification is still required.`);
      console.error(`Refresh the state with:\n${buildLoginCommand(statePath)}`);
    } else {
      console.error(`No saved state found at ${statePath}.`);
      console.error(`Run this once in a visible browser, complete verification, then retry:`);
      console.error(buildLoginCommand(statePath));
    }
    if (shouldOpen) {
      if (!verifyUrl) {
        console.error(`\nNo verification URL was captured, so there is nothing to open.`);
      } else if (!canOpenBrowser()) {
        console.error(`\nBrowser open requested, but this shell has no GUI display. Open the verification URL manually in a browser session with desktop access.`);
      } else if (tryOpenUrl(verifyUrl)) {
        console.error(`\nOpened the verification URL in your default browser.`);
      } else {
        console.error(`\nTried to open the verification URL, but xdg-open did not succeed. Open it manually from the path above.`);
      }
    }
    console.error(`\nRetry command:\n${buildFetchCommand({ url, state: statePath, outDir, slug, headless, screenshot })}`);
    process.exit(2);
  }

  console.log(`\nFetch complete.`);
  console.log(`JSON: ${payload.files.json}`);
  console.log(`HTML: ${payload.files.html}`);
  if (payload.files.screenshot) {
    console.log(`PNG:  ${payload.files.screenshot}`);
  }
}

function main() {
  const args = parseArgs(process.argv);
  const command = args._[0];

  if (!command || command === "--help" || command === "-h" || command === "help") {
    usage();
    return;
  }

  if (command === "login") {
    runLogin(args);
    return;
  }

  if (command === "fetch" || command === "download") {
    runFetch(args);
    return;
  }

  usage();
  process.exit(1);
}

main();
