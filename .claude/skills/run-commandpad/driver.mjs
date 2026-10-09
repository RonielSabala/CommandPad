#!/usr/bin/env node

/**
 * CommandPad run driver: boots the Vite dev server, drives the real app in
 * headless Chromium (playwright-core) and writes screenshots. See SKILL.md.
 *
 *   node .claude/skills/run-commandpad/driver.mjs smoke
 *   node .claude/skills/run-commandpad/driver.mjs shot docs docs.png
 *   node .claude/skills/run-commandpad/driver.mjs script ./my-check.mjs
 *
 * A `script` file default-exports async ({ page, app, shot, log }) => {}.
 */
import {
  spawn,
  spawnSync
} from "node:child_process";
import fs from "node:fs";
import {
  createRequire
} from "node:module";
import os from "node:os";
import path from "node:path";
import {
  fileURLToPath,
  pathToFileURL
} from "node:url";

const SKILL_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SKILL_DIR, "..", "..", "..");
const DRIVER_HOME =
  process.env.COMMANDPAD_DRIVER_HOME ??
  path.join(os.tmpdir(), "commandpad-driver");
const OUT_DIR = process.env.COMMANDPAD_OUT_DIR ?? path.join(DRIVER_HOME, "out");
const PORT = Number(process.env.COMMANDPAD_PORT ?? 5199);
const BASE = `http://localhost:${PORT}`;

// Comfortably past DEBOUNCE_SAVE_MS (src/common/config.ts)
const SAVE_SETTLE_MS = 400;

// Index of each kind in BLOCK_TYPE_ORDER, i.e. its button in the add row
const BLOCK_BUTTON_INDEX = {
  command: 0,
  note: 1,
  image: 2,
  runbook: 3,
  divider: 4,
};

const log = (...args) => console.log(...args);

// --- playwright-core (installed outside the repo) ---

function loadChromium() {
  // playwright-core is CJS: importing its index.js by file URL yields a
  // namespace without the named exports, so require() it from each root
  for (const root of [ROOT, DRIVER_HOME]) {
    try {
      const require = createRequire(path.join(root, "driver-require.cjs"));
      const {
        chromium
      } = require("playwright-core");
      if (chromium) {
        return chromium;
      }
    } catch {
      // try the next location
    }
  }

  throw new Error(
    "playwright-core not found. Install it once, outside the repo:\n" +
    `  npm install --prefix "${DRIVER_HOME}" playwright-core`,
  );
}

/** Newest chromium build in the shared Playwright browser cache, if any. */
function findInstalledChromium() {
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    path.join(os.homedir(), "AppData", "Local", "ms-playwright"),
    path.join(os.homedir(), ".cache", "ms-playwright"),
    path.join(os.homedir(), "Library", "Caches", "ms-playwright"),
  ].filter(Boolean);

  const executables = [
    path.join("chrome-win64", "chrome.exe"),
    path.join("chrome-linux", "chrome"),
    path.join("chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"),
  ];

  for (const root of roots) {
    if (!fs.existsSync(root)) {
      continue;
    }

    const builds = fs
      .readdirSync(root)
      .filter((name) => /^chromium-\d+$/.test(name))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));

    for (const build of builds) {
      for (const executable of executables) {
        const file = path.join(root, build, executable);
        if (fs.existsSync(file)) {
          return file;
        }
      }
    }
  }

  return null;
}

async function launchBrowser(chromium) {
  try {
    return await chromium.launch();
  } catch (error) {
    // playwright-core pins a build number that rarely matches the cache
    const executablePath = findInstalledChromium();
    if (!executablePath) {
      throw new Error(
        `${error.message}\nNo chromium in the Playwright cache either. Install one:\n` +
        "  npx playwright install chromium",
      );
    }

    log(`chromium: ${executablePath}`);
    return chromium.launch({
      executablePath
    });
  }
}

// --- dev server ---

async function isUp() {
  try {
    return (await fetch(BASE, {
      signal: AbortSignal.timeout(1000)
    })).ok;
  } catch {
    return false;
  }
}

async function startDevServer() {
  if (await isUp()) {
    log(`dev server already running on ${BASE}`);
    return null;
  }

  // One command string with shell: true, since pnpm is a .cmd shim on Windows
  // (an args array with shell: true trips node's DEP0190 warning)
  const child = spawn(`pnpm dev --port ${PORT} --strictPort`, {
    cwd: ROOT,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));

  for (let i = 0; i < 60; i++) {
    if (await isUp()) {
      log(`dev server ready on ${BASE}`);
      return child;
    }
    if (child.exitCode !== null) {
      throw new Error(`dev server exited early:\n${output}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`dev server never came up:\n${output}`);
}

function stopDevServer(child) {
  if (!child) {
    return;
  }

  // Vite runs as a grandchild of the pnpm shim; child.kill() would orphan it.
  // Synchronous, so it still runs when the process is exiting on an error
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    child.kill("SIGTERM");
  }
}

// --- app helpers ---

const app = {
  /**
   * Navigate and wait until the page is usable: the app is hidden until
   * body.app-ready, and routes are lazy, so app-ready can land while the
   * Suspense fallback (.page-spinner) still stands in for the page.
   */
  async open(page, route = "/workspace") {
    await page.goto(BASE + route, {
      waitUntil: "domcontentloaded"
    });
    await page.waitForSelector("body.app-ready");
    await page.waitForSelector(".page-spinner", {
      state: "detached"
    });
    return page;
  },

  async addVariable(page, key, value) {
    await page
      .locator("#variables-section .sidebar-section-footer button")
      .first()
      .click();
    const row = page.locator("#variables-section .variable-row").last();
    await row.locator(".variable-key-input").fill(key);
    await row.locator(".variable-value-input").fill(value);
    return row;
  },

  /** kind: "command" | "note" | "image" | "runbook" | "divider". */
  async addBlock(page, kind, text = "") {
    // Scoped to the real list: the minimap mirrors every block statically
    const blocks = page.locator("#blocks-list .block-item");
    const index = await blocks.count();
    await page
      .locator("#main-panel .add-row button")
      .nth(BLOCK_BUTTON_INDEX[kind])
      .click();
    // A fixed index, not .last(): a lazy .last() would follow later blocks
    const block = blocks.nth(index);
    await block.waitFor();

    if (text && kind === "command") {
      // Monaco ignores fill() on its hidden textarea, and mounts asynchronously
      const editor = block.locator(".code-editor .monaco-editor").first();
      await editor.waitFor({
        state: "visible",
        timeout: 20000
      });
      await editor.click();
      await page.keyboard.type(text);
    } else if (text) {
      await block.locator("textarea").first().fill(text);
    }

    return block;
  },

  /** Wait out the debounced save. */
  settle: (page) => page.waitForTimeout(SAVE_SETTLE_MS),

  uiState: (page) =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem("commandpad_ui_state") ?? "null"),
    ),

  /** Geometry/computed style beats eyeballing a screenshot for 2px details. */
  measure: (page, selector, read) => page.$$eval(selector, read),
};

function makeShot(page) {
  fs.mkdirSync(OUT_DIR, {
    recursive: true
  });
  return async (name, options = {}) => {
    const file = path.join(OUT_DIR, name);
    await page.screenshot({
      path: file,
      ...options
    });
    log(`screenshot: ${file}`);
    return file;
  };
}

async function withApp(run, {
  deviceScaleFactor = 1
} = {}) {
  const chromium = loadChromium();
  const server = await startDevServer();
  const browser = await launchBrowser(chromium);
  // The UI language follows navigator.language
  const context = await browser.newContext({
    viewport: {
      width: 1280,
      height: 900
    },
    deviceScaleFactor,
    locale: "en-US",
  });
  const page = await context.newPage();

  const problems = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(`console: ${message.text()}`);
    }
  });

  try {
    await run({
      page,
      app,
      shot: makeShot(page),
      log
    });
    if (problems.length) {
      log(`\nBROWSER ERRORS:\n${problems.join("\n")}`);
      process.exitCode = 1;
    } else {
      log("\nno console or page errors");
    }
  } finally {
    await browser.close();
    stopDevServer(server);
  }
}

// --- commands ---

async function smoke() {
  await withApp(async ({
    page,
    app,
    shot
  }) => {
    await app.open(page, "/workspace");
    await app.addVariable(page, "SERVER", "192.168.1.50");
    await app.addVariable(page, "USER", "admin");
    await app.addBlock(page, "command", "ssh {USER}@{SERVER}");
    // Blur the editor so the preview shows the resolved command
    await page.locator("#blocks-list").click({
      position: {
        x: 5,
        y: 5
      }
    });

    const preview = await page
      .locator("#blocks-list .block-item .command-preview")
      .first()
      .innerText();
    log(`resolved preview: ${preview.trim()}`);
    if (!preview.includes("admin@192.168.1.50")) {
      throw new Error("variables did not resolve into the command preview");
    }
    await shot("workspace.png");

    await app.settle(page);
    log(`ui state: ${JSON.stringify(await app.uiState(page))}`);

    await app.open(page, "/docs#variables");
    await page.locator(".docs-demo-variables").first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await shot("docs.png");
    log(
      `docs demos on page: ${await page.locator(".docs-demo-variables").count()}`,
    );
  });
}

/** Git Bash rewrites a leading "/docs" into "C:/Program Files/Git/docs". */
function normalizeRoute(input = "/") {
  const route = /^[A-Za-z]:[\\/]/.test(input) ?
    input.split(/[\\/]/).pop() :
    input;
  return route.startsWith("/") ? route : `/${route}`;
}

async function shotCommand(route = "/workspace", name = "shot.png") {
  await withApp(async ({
    page,
    app,
    shot
  }) => {
    await app.open(page, normalizeRoute(route));
    await page.waitForTimeout(400);
    await shot(name);
  });
}

async function scriptCommand(file) {
  if (!file) {
    throw new Error("usage: driver.mjs script <file.mjs>");
  }

  const {
    default: run
  } = await import(pathToFileURL(path.resolve(file)).href);
  if (typeof run !== "function") {
    throw new Error(`${file} must default-export an async function`);
  }

  await withApp(run, {
    deviceScaleFactor: Number(process.env.COMMANDPAD_SCALE ?? 1),
  });
}

const [command = "smoke", ...args] = process.argv.slice(2);

const commands = {
  smoke,
  shot: () => shotCommand(...args),
  script: () => scriptCommand(args[0]),
};

if (!commands[command]) {
  console.error(`unknown command: ${command}`);
  console.error(
    "usage: driver.mjs [smoke | shot <route> [file] | script <file.mjs>]",
  );
  process.exit(2);
}

await commands[command]();
