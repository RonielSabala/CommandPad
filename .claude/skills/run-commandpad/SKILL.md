---
name: run-commandpad
description: Build, launch, drive, and screenshot the CommandPad app. Use when asked to run or start CommandPad, take a screenshot of a change, verify UI/CSS/store behavior in the real app, or check the /docs route and its demos.
---

# Running CommandPad

CommandPad is a browser-only SPA, so verifying UI behavior means driving a
browser. [`driver.mjs`](driver.mjs) boots the Vite dev server, drives the real
app in headless Chromium via `playwright-core`, and writes screenshots. The unit
tests (`pnpm test`) only cover the variable engine; everything visual goes
through the driver.

Paths below are relative to the repo root.

## Prerequisites

```bash
pnpm install
npm install --prefix "$TEMP/commandpad-driver" playwright-core
```

`playwright-core` is installed **outside the repo** so it never lands in
`package.json`. The driver looks for it in the repo, then in
`$TEMP/commandpad-driver` (override with `COMMANDPAD_DRIVER_HOME`). It ships no
browsers: the driver uses the newest Chromium in the Playwright cache when its
pinned build is missing, and if there is none, run `npx playwright install chromium`.

## Run

```bash
node .claude/skills/run-commandpad/driver.mjs smoke
node .claude/skills/run-commandpad/driver.mjs shot workspace workspace.png
node .claude/skills/run-commandpad/driver.mjs script "$TEMP/my-check.mjs"
```

- `smoke` — adds two variables and a command block on `/workspace`, asserts
  `ssh {USER}@{SERVER}` resolves to `ssh admin@192.168.1.50`, screenshots it,
  then screenshots the `/docs#variables` page. Fails on any console or page error.
- `shot <route> [file]` — screenshot one route (`workspace`, `docs`,
  `docs#variables`; bare `/` is the home page, not the workspace).
- `script <file.mjs>` — your own flow.

Screenshots land in `$TEMP/commandpad-driver/out/` (the path is printed).
Env: `COMMANDPAD_PORT` (5199), `COMMANDPAD_OUT_DIR`, `COMMANDPAD_SCALE`
(deviceScaleFactor for `script`; use 4-6 for fine CSS detail),
`COMMANDPAD_DRIVER_HOME`.

The driver starts the dev server and kills it on exit, or reuses one already
listening on the port. Never hand-background `pnpm dev` for this.

### Writing a script

The file default-exports `async ({ page, app, shot, log }) => {}`. `page` is a
Playwright page; `app` provides:

- `open(page, route)` — navigate and wait for bootstrap.
- `addVariable(page, key, value)` — via the sidebar's new-variable button.
- `addBlock(page, kind, text)` — `kind` is `command`, `note`, `image`,
  `runbook` or `divider`; types `text` into a command's editor or fills a note.
- `settle(page)` — wait out the debounced save.
- `uiState(page)` — parsed `commandpad_ui_state`.
- `measure(page, selector, fn)` — `$$eval` passthrough.

```bash
cat > "$TEMP/my-check.mjs" <<'EOF'
export default async ({ page, app, shot, log }) => {
  await app.open(page, "/workspace");
  await app.addVariable(page, "SERVER", "1.1.1.1");
  log(await app.measure(page, ".variable-split-handle", (handles) =>
    handles.map((h) => getComputedStyle(h, "::before").backgroundColor)));
  await shot("detail.png", { clip: { x: 120, y: 390, width: 45, height: 110 } });
};
EOF
COMMANDPAD_SCALE=6 node .claude/skills/run-commandpad/driver.mjs script "$TEMP/my-check.mjs"
```

## Gotchas

- **The app is invisible until bootstrap finishes** (`body.app-ready`, set after
  IndexedDB rehydration), and routes are lazy, so the page itself may still be
  the `.page-spinner` Suspense fallback after that. `app.open()` waits for
  both; a raw `page.goto()` does neither, and counts read right after it come
  back empty.
- **Locators returned by `addBlock` are fixed indices**, so they keep pointing
  at that block after more are added. A hand-written `.last()` does not.
- **Don't write backslashes through a shell heredoc** into a script: the shell
  may collapse `\\` before Node sees it. Use `String.fromCharCode(92)` or
  `page.keyboard.press("Backslash")` when a command needs a literal `\`.
- **The workspace is `/workspace`.** `/` is the marketing home page.
- **The minimap renders every block and variable row a second time.** Scope
  locators to the real list (`#blocks-list .block-item`, not `.block-item`), or
  you may hit the static, `inert` mirror copy.
- **Code surfaces are Monaco.** `fill()` does nothing on them: click the
  `.monaco-editor` and use `page.keyboard.type()`. Editors mount
  asynchronously, so wait for them to be visible.
- **Prefer structural locators over text.** The driver forces `en-US`, but text
  still changes with copy edits. New variable:
  `#variables-section .sidebar-section-footer button`. New block:
  `#main-panel .add-row button` index 0-4 in `BLOCK_TYPE_ORDER`.
- **Saves are debounced** (`DEBOUNCE_SAVE_MS`). Call `app.settle(page)` before
  reading storage or reloading, or you read the previous value.
- **Measure, don't eyeball.** For 1-2px CSS details, assert with
  `app.measure()` (computed styles, `getBoundingClientRect`) and use screenshots
  only as confirmation, with `COMMANDPAD_SCALE=6` and a `clip`.
- **Each run is a fresh browser context**, so flows never inherit data, and any
  prior state a check needs must be recreated in the script.
- **`/docs` is one section per page** (`/docs#<section-id>`, ids in
  `src/common/constants/docs.ts`). Demos run on isolated stores and must never
  write `localStorage`: when touching demo code, compare
  `localStorage.getItem("commandpad_ui_state")` before and after driving one.
- **Git Bash mangles a leading-slash route** (`/docs` becomes
  `C:/Program Files/Git/docs`). The driver normalizes it; passing `docs` avoids it.

## Troubleshooting

| Symptom                                                  | Fix                                                                                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `playwright-core not found`                              | `npm install --prefix "$TEMP/commandpad-driver" playwright-core`                                                                 |
| `Executable doesn't exist at ...ms-playwright\chromium-` | The driver falls back to the newest cached build; if none, `npx playwright install chromium`                                     |
| `Cannot read properties of undefined (reading 'launch')` | Only when editing the driver: `playwright-core` is CJS, load it with `createRequire`, not `import(fileURL)`                      |
| `Timeout ... waiting for locator`                        | Missing `body.app-ready` wait, a text locator that no longer matches, or a locator hitting the minimap copy                      |
| Port 5199 already in use by a stray run                  | `Get-NetTCPConnection -LocalPort 5199 -State Listen \| ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }` (PowerShell) |
| Dev server survives a manual `pnpm dev` background run   | Vite is a grandchild of the pnpm shim; kill the tree (`taskkill /pid <pid> /T /F`), which is what the driver does                |
