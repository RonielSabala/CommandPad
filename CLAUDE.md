# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CommandPad is a variable-aware command runbook tool: define variables once, reference them with `{NAME}` across command blocks, and copy fully resolved commands. It is a **React + TypeScript single-page app** built with **Vite**, using **pnpm**. State lives in a single **Zustand** store; there is no backend, everything runs in the browser and must work offline.

## Workflow

- Whenever the user asks for a feat/fix (or any change worth committing), propose a good commit name (Conventional Commits style, e.g. `feat: ...` / `fix: ...`) **both as the first thing in the response and again at the very end** — before any explanation, investigation, or diving into the change, and restated as the last line after the work is done. Never hold it back until only the end, and never drop it from the end either.
- After landing a reasonably big feature (new architecture, a new subsystem, a new cross-cutting convention), update this file to document it. Keep it about **rules and invariants**, not history: no "used to", no measurements, no rejected alternatives unless they stop someone from reintroducing a bug.
- Whenever a change touches **what a runbook may contain** — the import/export JSON shape, a block type or one of its fields, a variable field, or anything in the variable reference grammar (a new operation, placeholder rule, escape) — update the AI agent prompt (`src/components/docs/agentPrompt.md`) in the same change. See [The AI agent prompt](#the-ai-agent-prompt).
- Whenever a feature is added or changed, update the in-app docs (`/docs`) in **both** locales. The README stays a high-level overview; don't grow feature documentation there.
- Don't reach for the `run-commandpad` skill (browser automation) to verify something the user can trivially eyeball themselves. Save it for layout/CSS specifics, computed styles, multi-step flows.

## Running / Developing

- Install: `pnpm install` (esbuild's build script is allowed via `allowBuilds` in `pnpm-workspace.yaml`).
- Dev server: `pnpm dev`. Checks: `pnpm typecheck` (`tsc -b --noEmit`), `pnpm lint` (ESLint flat config), `pnpm build` (`tsc -b && vite build`).
- Tests: `pnpm test` (Vitest, one run) / `pnpm test:watch`. See [Testing](#testing).
- Formatting: Prettier defaults (double quotes, 80 columns), `editor.formatOnSave` on, LF line endings. Match existing formatting. The pre-commit hook runs Prettier on CSS/JSON plus whitespace/EOF/line-ending fixers.
- Import alias: `@/` → `src/`.
- Cloud providers are opt-in at build time via `VITE_MSAL_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` (`.env.local`, see `.env.example`).

## Architecture

`main.tsx` (wraps the app in `BrowserRouter`) → `App.tsx`. `App` applies the theme class, kicks off `bootstrap()`, reveals the app (`body.app-ready`), mounts the global `TooltipLayer`, and routes (`AppRoute`, lazily loaded and prefetched on idle by `useRoutePrefetch`): `/` → `HomePage`, `/workspace` → `WorkspacePage`, `/docs` → `DocsPage`, `/privacy`, `/terms`; anything else redirects to `/workspace`.

`WorkspacePage` (`components/workspace/`) owns the workspace shell — `Header` / `Sidebar` / `MainPanel`, the always-mounted modals, and the **workspace-only hooks** (`useWorkspaceBodyClasses`, `useKeybindings`, `useDocumentInteractions`) so keybindings/lasso/read-mode body classes never leak into `/docs`. Element ids (`#app-shell`, `#tabs-content`, …) are used by id-scoped CSS — don't rename them casually.

### Directory map

- `src/common/` — framework-free definitions:
  - `enums.ts` — domain enums as frozen `as const` objects (**never** TS `enum`) paired with a derived union type. `types.ts` — `Tab`, `Block` (discriminated union), `Variable`, `RunbookEntry`, `RunbookContent`, …
  - `constants/` — `css.ts` (`CssClass`), `dom.ts` (`ElementId`, `Selector`, `DataAttr`, …), `events.ts` (`EventType`, `Key`, `PASSIVE`/`PASSIVE_CAPTURE`, …), `routes.ts`, `docs.ts` (the docs section registry).
  - `config.ts` (storage keys, timing, per-feature configs), `editorConfig.ts` (code languages, Monaco options/constants), `regex.ts` (regex composition primitives), `markdownSyntax.ts`, `variableSyntax.ts` (see [Syntax tables](#syntax-tables-and-composed-regexes)), `keybindings.ts` (`KEYBINDINGS`, `formatBinding`, `matchesKeybinding`; descriptions live in i18n).
- `src/blocks/` — the block **model** registry. See [Block types](#block-types-the-registry).
- `src/i18n/` — translations. See [Internationalization](#internationalization-i18n).
- `src/store/` — `store.ts` (the Zustand store), `persistence.ts` (localStorage), `runbookDb.ts` (IndexedDB).
- `src/services/` — `cloud/` (one `CloudClient` per provider) and `vault/` (WebCrypto encryption of secrets).
- `src/monaco/` — the code editor subsystem. See [The code editor](#the-code-editor-monaco).
- `src/utils/` — pure helpers. Notable: `resolution/` (the variable engine), `markdown/` (note markdown → nodes), `arithmetic.ts` (the `calc` evaluator), `string.ts` / `stringCase.ts` / `stringTest.ts` / `hash.ts` (primitives behind `|` operations; `string.ts` also has `classNames` and `buildDuplicateName`), `runbookSource.ts` (runbook ⇄ JSON text), `export.ts`, `embeddedRunbook.ts`, `variableSections.ts`, `dom.ts` (`getNoteCaretAtPoint`, `scrollRowIntoView`, `whenElementSettles`), `scrollParent.ts`, `zip.ts`, `download.ts`, `typeGuards.ts`.
- `src/hooks/` — cross-cutting effects: keybindings, lasso selection (`useLassoSelection` + `selectionGroups.ts` + `lasso.ts`), panels (`usePanelResize`, `usePanelKeybindings`), `useRowReorder`, `useClampSurface`/`useKeepInView`, `useEditorActions`, `useWorkspaceContextMenu`, `useLinkActivation`, `useFileDrop`, scroll persistence (`useScrollPersistence`, `useMonacoScrollPersistence`), textarea helpers (`useTabInsertion`, `useNoteFormatting`, `usePairWrapping`), `useVariableSplitResize` (sidebar key/value split, one shared ratio), `useTabUnresolved` (the tab's warning dot), `useScrollingClass`.
- `src/components/` — feature folders only, no loose files at the root: `workspace/` (+ `minimap/`), `blocks/` (one folder per block type), `variables/`, `sidebar/`, `tabs/`, `header/`, `modals/` (`cloud/`, `dialogs/`, `vault/`), `docs/`, `home/`, `legal/`, `site/`, `icons/`, `common/` (`panel/`, `contextMenu/`, `codeEditor/`, `tooltip/` are one-mechanism-split-across-files folders; the rest are flat single-purpose primitives). A folder that grows a distinct sub-concern gets a nested folder, not prefixed filenames. CSS is co-located and imported by its component.
- `src/test/` — test helpers (never imported by app code).
- `src/styles/` — `tokens.css` (design tokens), `index.css` (reset, shared classes, cross-cutting `read-mode` / select-key rules).

### The Zustand store

`src/store/store.ts` holds everything: `tabs`, `activeTabId`, `runbookLibrary`, UI flags (`mode`, `theme`, `language`, `panels`, minimap, spell check), interaction state (`selectedBlockIds`, `selectedVariableIds`, `selectKeyHeld`, `linkKeyHeld`, `expandedClampSurfaces`), search queries, modal/dialog state, cloud state and all actions.

- **Factory + context**: `createAppStore(options)` builds a store; `appStore` is the real one. Components resolve their store from a React context: `useStore(selector)` for reactive reads, `useStoreApi()` for `getState()` in handlers. **Never import `appStore` directly in a component**, or it breaks inside docs demos. `createAppStore({ isDemo: true, contentSeed })` powers docs playgrounds: persistence is a no-op, content lives in memory, `confirm`/`alert` auto-resolve, `clearAllData` never wipes real data.
- **Active tab**: `getActiveTab(state)` (falls back to `tabs[0]`).
- **Immutable updates**: `withActiveTab(state, mutate)`; actions replace only the objects that change, so `React.memo` rows skip and the `variableMap` memo stays stable.
- **Selector stability**: never return a fresh array/object from a `useStore` selector (React 19 loops). Select the tab, then derive with a module-level `EMPTY_*` fallback.
- **Read mode**: mutating actions early-return when `mode === AppMode.READ`. Exceptions on purpose: variable values (`updateVariable`), runbook-block overrides (`setRunbookOverrides`), folding sections, clamp toggles.
- **Labels**: `relabelActive` recomputes a runbook's label from its first block that provides `getLabelText` (a note).
- **Duplicating**: `duplicateVariable` gives the copy a distinct key via `uniqueCopyKey` (`_COPY`, `_COPY1`, …) because renaming a key rewrites every reference **by key**; a copy sharing the key would rename the original's references too. `duplicateRunbook` reads from the open tab when there is one, regenerates every id, and names the copy with `buildDuplicateName` (shared with the cloud browser).
- **Extracting a variable** (`extractVariable(value)`): appends a variable holding the selected text and returns its id/key; the caller replaces the selection with a reference through the editor's undo history and starts an inline rename (see Monaco). The guessed key comes from `extractedVariableKey`. It clears `variableSearchQuery` and expands the sidebar's variables section (only when the sidebar is the surface showing the row), but never expands a collapsed sidebar panel.
- **Adding a variable** also clears `variableSearchQuery`, or a filter would hide the new empty row.

### Persistence

- **localStorage** (`persistence.ts`, `StorageKey`): `commandpad_ui_state` (theme, language, panels, …), `commandpad_tabs` (tab meta incl. per-view scroll and embed views), `commandpad_runbook_library` (entries incl. `sync`, `secured`, `vault` record), `commandpad_sidebar_sections`, `commandpad_visited_home`, `commandpad_google_session`.
- **IndexedDB** (`runbookDb.ts`, db `commandpad_runbooks_db`, store `runbooks`) — runbook **content** (variables, sections, blocks) keyed by runbook id.
- `saveState()` persists meta + UI state + active content; edits go through a per-instance `debouncedSaveState`. `bootstrap()` loads localStorage synchronously, then rehydrates content from IndexedDB, then flips `initialized` (which gates saving).
- **Every content write goes through `writeRunbookContent`** (put + `markRunbookSecured` + embed invalidation). Adding a raw `contentDb.put` elsewhere drifts the secured badge and embeds.
- Build content from a tab with `tabContent(tab)`, never by hand, or `variableSections` get dropped.
- `clearAllData` is a full unconditional wipe: delete the IndexedDB database, `localStorage.clear()`, `sessionStorage.clear()`, and lock every vault.
- Untrusted data (storage, imports) is narrowed with `utils/typeGuards.ts` (`isString`, `isObject`, `isEnumValue`, …); a malformed `sync` link is dropped on load.

### Encrypting secret values (the vault)

A `secret` variable is masked on screen; the **vault** protects its value **at rest** with AES-GCM under a PBKDF2-stretched passphrase (WebCrypto). **A vault belongs to one runbook**: the runbook id is the vault scope, and every entry point in `services/vault/` takes it first.

- **The in-memory model is always plaintext.** Resolution, previews, Copy, renaming and completions never know a vault exists. Encryption lives only at the serialization boundaries: IndexedDB (`REAL_CONTENT_DB` wraps `runbookDb`: put encrypts, get decrypts; the demo memory DB is unwrapped), JSON export (`buildSecuredRunbookExportContent`), cloud pushes, and Markdown/text export (`buildMarkdownExport` encrypts first, so a referenced secret bakes in as ciphertext). `buildRunbookSource` is the plaintext serialization (source view, change comparison).
- **Session keys live in a module-level `Map<runbookId, session>`** (key + passphrase), never persisted: closing the tab locks everything.
- **The record (salt + verifier) rides in `RunbookEntry.vault`**, so it lives and dies with the runbook. `vaultStatus` in the store is recomputed by `refreshVaultStatus` (session state isn't subscribable).
- **A payload carries its own salt**: `cpv1.<salt>.<iv>.<ciphertext>`. Imports try open sessions by salt, then by each open session's passphrase, before prompting; the passphrase that worked unlocks the imported runbook's own record.
- **Transforms are idempotent and fail closed**: `encryptContent` skips payloads and is a no-op while locked, so a save before unlocking writes the same ciphertext back. A value that fails to decrypt is kept as ciphertext, silently.
- **Ciphertext is tracked by the payload (`isEncryptedValue`), never by the `secret` flag**; only `encryptContent`/`hasPlainSecrets` read the flag.
- **Sync dedupe compares plaintext** (fresh IV per encryption); ciphertext is produced only at push time.
- **The prompt** is `promptVault(prompt, verify, filename)`, a promise dialog like `confirm`. Each caller supplies its own `verify(VaultPassphrases)`. `VAULT_PROMPT_FIELDS` maps `VaultPrompt` (`CREATE`/`UNLOCK`/`CHANGE`) to the `VaultField`s shown, so a new flow is a registry entry + locale strings. `VaultModal` renders the last non-null dialog while fading out; each `PassphraseField` reveals independently.
- **Triggers**: marking the first value secret (`ensureVaultForSecrets`), load finding a locked secret in the **active tab only**, an import no open vault can read, and the sidebar shield badge. Declining is always allowed (value stays plaintext at rest) and a declined CREATE is remembered per runbook for the session (`declinedVaultSetup`). A locked existing vault is only unlocked from the badge.
- **Creating** a vault re-encrypts that runbook's stored copy and re-queues its cloud push. **Re-keying** reads the content to plaintext under the old key _before_ minting the new one, then writes back and re-queues.
- **`RunbookEntry.secured`** lets a closed runbook wear the badge; it flips with `holdsSecrets` (flagged secret or ciphertext). Losing the last secret also drops the vault record and session.
- `RunbookSecretBadge` is per runbook: green shield unlocked (click re-keys), plain locked (click unlocks), orange `ShieldSlash` absent (click sets one up).
- A lost passphrase is unrecoverable. An unlocked session is plaintext in memory by design.

### Rendering & derived state

Previews are **derived, not pushed**: command previews recompute from `block.text` + a per-render `variableMap` (`useMemo` in `BlocksList`, threaded as props). `getVariableMap`/`getSecretKeys` are expensive: compute once per render, never per block. Everything renders parsed segments as real elements — no `innerHTML`.

### Collapsible / resizable panels

One mechanism for every side panel (the workspace **sidebar** and the `/docs` **contents** panel); a new panel costs a `PanelId` and a `<ResizablePanel>`.

- `PanelId` + `PANEL_DEFINITIONS` (`defaultWidth`, `defaultSide`, `maxScreenFraction`, `collapseSnap`); `createDefaultPanels()` is the single source of resting geometry.
- State: `panels: Record<PanelId, PanelState>` (`collapsed`, `side`, `width`) driven by `togglePanel`, `togglePanelSide`, `setPanelWidth`, `resetPanelWidth` through `withPanel`. Persisted in UI state; `restorePanels` starts from defaults.
- Components: `ResizablePanel` (the `<aside>` + edge handle), `PanelShell` (the `header / panel / main` grid; owns `--panel-width`), `PanelActions` (collapse/move buttons). Both publish `data-panel-side` / `data-panel-collapsed`; **direction-dependent CSS keys off those attributes**, never an ancestor class.
- `min-height: 0` on `.resizable-panel` is load-bearing (it keeps `overflow: visible` for its handle; without it the inner list never scrolls). The docs TOC scrolls on `#docs-toc-nav`, not the aside.
- **Layout**: the page is a recess (`--color-app-bg` on `.panel-shell`), the header sits on the recess, and everything else is a `.panel-card` (border only, no shadow): each sidebar section, the docs TOC card, and the main card (`main.panel-card`, which keeps `--color-bg`). `--panel-inset` lives on `.panel-shell` and spaces cards; a collapsed panel sets it to `0px` (otherwise its cards show through as a sliver).
- `--panel-content-width` survives a collapse so content slides off intact. A collapsed grab band is `--panel-scroll-gutter` wide (it must stay narrower than the inset, or it covers main's scrollbar / drag handles); read mode widens a left-docked band since drag handles are hidden there.
- Double-click on the handle: a panel wider than default resets first, only then toggles collapsed. `usePanelResize` measures from the outer edge.
- `usePanelKeybindings(panelId)` owns the toggle/move chords **per route**; `useKeybindings` does not handle them.
- Labels: `Messages.panel.names[PanelId]` + interpolating `expand`/`collapse`/`moveLeft`/`moveRight`.

### Block types (the registry)

A block type is **data in two complete `Record`s over `BlockType`**, never a scattered `switch`:

- **Model** — `src/blocks/`, one `BlockDefinition` per type: `create(id)`, `normalize(block)` (coerce untrusted data or return `null` to drop it), `toMarkdown(block, context)`, `jsonSchema` (required), and optionally `commandTexts` (which fields hold variable references → usage scanning + key renaming), `getLabelText`, `folding`, `runtimeFields` (machine-local fields excluded from JSON). `index.ts` exposes the lookups (`createBlock`, `normalizeBlock`, `blockToJson`, `blockToMarkdown`, `getBlockCommandTexts`, `mapBlockCommandTexts`, `getBlockJsonSchemas`, `isBlockFoldable`, …) and `BLOCK_TYPE_ORDER` (Command / Note / Image / Runbook / Divider).
- **View** — `components/blocks/blockViews.tsx`, `{ icon, Component }` per type (`getBlockComponent`, `getBlockIcon`). Every view is registered **memoized**; all take `BlockViewProps` (`block`, `variableMap`, `secretKeys`).

The split is forced by the import graph: the model must be reachable from the store and `utils/`, the view imports the store. **A definition never imports `utils/resolution`**; the caller supplies the grammar.

- Editing goes through one generic `updateBlock(blockId, type, patch)` (type-safe patch). Folding all goes through `toggleAllBlocksFolded`.
- CSS: every block's root carries `block-surface` (selection outlines); a bordered card block (command, runbook) also carries `block-card`, whose rules let the selection outline replace the border. Both rules live in `BlockItem.css`.

**Adding a block type**: `BlockType` + `Block` union member, a definition (+ `BLOCK_DEFINITIONS`, `BLOCK_TYPE_ORDER`, `jsonSchema`), a view + icon in `BLOCK_VIEWS`, `blocks.typeLabel[type]` in both locales, a `/docs` subsection, and the agent prompt.

#### The note block

Free-form text rendered as markdown (`utils/markdown/`). Two parsing levels, only the outer is public: `parseNoteNodes(text)` splits into block nodes (table, list, inline run); the private `parseNoteText(run, offset)` tokenizes inline marks. Use `parseNoteNodes` (or `noteToPlainText`) everywhere.

- **Every segment's `start` is an index into the raw note**, including inside table cells, which is what the click → caret mapping needs.
- **Click → caret** (`NoteEditor`): the preview is `pointer-events: none` over the textarea. While the note is unfocused (and not in read mode, not on a link), mousedown is prevented and the click maps the point to a raw-text offset via `getNoteCaretAtPoint` (measures per character with a `Range`; each segment carries `DataAttr.NOTE_OFFSET`), then focuses and places the caret.
- `NotePreview` is the rendered half alone; `standalone` (embedded note, embedded section name) restores pointer events/selection. `NotePreview.css` owns the shared text metrics for preview, textarea and the width ghost, so they can't disagree. `NoteEditor` is reused for variable section names.
- Inline tokens are named captures (`MarkdownToken`), the code span closes with a backreference so `` `x´ `` isn't code; second spellings use `_ALT`.
- **Tables** (line-based, parsed before inline): header row + delimiter row (alignment via `:`), rectangular; `\|` escapes a bar in a cell before inline parsing.
- **Lists** (line-based): `*`/`-`/`1.`; one line per item, indent nests via a stack (tab = `MarkdownList.TAB_WIDTH`), switching marker kind starts a new list; ordered lists keep `start`.
- **Escapes**: a leading backslash escapes an opening mark (`*`, `_`, a backtick, `´`, `[`, `|`, or `http(s)://`); nothing is unescaped inside a code span.
- One table style `.note-table`, one list style `.note-list` (`NoteText.css`), reused by the docs. Don't add a second.
- Spell check: `spellcheckEnabled` (persisted, default on, toggled from `WorkspaceContextMenu`) binds **only** the note textarea, with `lang={language}`. Every other field is `spellCheck={false}`.
- Textarea keys: `useTabInsertion` (Tab inserts a tab), `useNoteFormatting` (Ctrl+B/I/backtick wrap the selection, pair wrapping).

#### The image block

One picture, **attached** (`data:` URI on the block) or **linked** (`http(s)`), derived from `src`.

- Ways in: drop (`useFileDrop`), paste (on the focusable dropzone; auto-focused on creation), the picker, the URL box. Replacing a filled block via drop/paste asks first (after validation).
- `utils/image.ts#normalizeImageSrc` is the gate (only `data:image/` and `http(s)`), used by UI and `normalize`. Attachments capped at `ImageBlockConfig.MAX_BYTES`. Markdown export writes `![alt](src)`.
- Hover controls are a sticky group; **`.image-frame` must never get an `overflow`** (it would become the sticky scrollport). `.image-block` is `vertical-align: top`.
- Read mode drops the controls; `ImageView` with `onExpand` becomes the button (`asButton`). Empty state is `ImageEmpty`.
- **Full screen is one global `ImageLightbox`** (mounted beside the modals, also in `DemoWorkspace`) driven by `imageViewerBlockId`; it slides across every image in the active tab (or an embed's `imageViewerSlides`), Left/Right keys, `n / total`. Stepping scrolls the real list (scoped to `listRef`, never the document) to that image. CSS: `.modal-lightbox` cancels `.modal`'s transform so nav/close pin to the viewport, sits in the gutter left by `--image-lightbox-max-width`, and the dialog is widened to `--image-lightbox-safe-width` so near-misses on the arrows don't close it.

#### The runbook block

Embeds **another runbook**, read-only, resolving against its own variables.

- **Two sources**: `label` (+ runtime `runbookId`) for a library runbook, or `cloud: { provider, path }` for a `.json` in a provider's app folder. `resolveEmbedSource(library, block)` returns the `EmbedSource` (`local:<id>` / `cloud:<provider>:<path>` key) used by every store action.
- A label resolves by stored id first, then by trimmed label; `RunbookBlock` writes the id back and follows renames; typing in the label box clears `runbookId`.
- Label box and cloud path box are one-line Monaco choice editors (`EditorLanguage.CHOICE`, `ChoiceSource`: a fixed list, or an async function for folder-by-folder cloud completion via `listEmbeddableCloudFolder` → `listCloudFolder`, which never signs in). Choice stats (size, block/variable counts) are lazy via `describe()` → cached `readRunbookStats`. The path commits on blur/Enter/pick; an emptied path commits immediately.
- **Overrides** (`{ KEY: value }`) are edited in the block's variables view (`EmbeddedVariables`, built from `VariableValueField`/`VariableSectionHeader`/`VariableOptionsSelect`). Written through `setRunbookOverrides` (not read-gated — never route through `updateBlock`). `applyOverrides` substitutes them; an override resolves as an embedded value whose references read the **host** first (`OuterScope` via `overrideScope`). The view per block per tab is `Tab.embedViews` (tab meta, not a block field).
- **Loaded content is global store state** (`embeddedRunbooks`, keyed by source, never persisted). Loads run once per key; invalidation marks an entry `stale` and keeps showing the old copy while reloading (ids carried over). A library runbook open in a tab is read live from the tab; `EmbeddedRunbook.runbookId` links a cloud file to the library runbook synced with it, so it's read through that tab too. Closing a runbook's last tab seeds existing entries from it.
- Cloud embeds never sign in on render (they show **Sign in**). **Open** imports a cloud file and links it for sync (or opens the already-linked runbook), never prompts for a passphrase, and always ends by opening a tab.
- Unlock once, reuse everywhere: a cloud file's vault scope is its source key; every unlock decrypts already-loaded embeds (`decryptLoadedEmbeds`).
- **Embedded rendering is `EMBEDDED_VIEWS`** (`EmbeddedBlockViews.tsx`/`RunbookEmbed.tsx`), a complete `Record` that reuses each block's rendering half (`CommandPreview` in `.command-card`, `NotePreview`, `DividerLine`, `ImageView`). **No embedded copy carries `block-surface`** or any class host rules key off. Cycles stop via a `trail` of source keys; depth via `RunbookBlockConfig.MAX_DEPTH`.
- The drag image is a static off-screen stand-in (`DataAttr.DRAG_IMAGE`), not the header: rasterizing Monaco is too slow.
- Read mode shrinks the header to the view toggle and Open; the view itself is unchanged.
- Markdown export inlines embeds up front (`renderMarkdownBlocks` + an `EmbeddedReader` from the store), each level resolved and encrypted under its own scope; unreadable/cyclic embeds fall back to `MarkdownSyntax.RUNBOOK_REFERENCE`.
- `.blocks-list` is the shared list geometry for the real list, the minimap mirror and embeds; `--block-row-gutter` is the one knob. Divider stretch rules use child combinators on purpose.

### Variable reference syntax

A reference is `{KEY[;params][|operations]}`, parsed entirely in `utils/resolution/`:

- **`;` fills template blanks** in the variable's value (`{PROJECT;name=cp}` against `projects/{;name}/src`).
- **`|` transforms the result**, left to right. **A lowercase operation transforms the incoming value; an UPPERCASE one is a combinator over its own arguments** and ignores the value (normally written unnamed, `{|AND(...)}`). Matching is exact and case-sensitive.

Operation families (each in `operations/`, syntax in `variableSyntax.ts`):

- `slice(start;stop;step)` — Python slicing over code points; a lone argument is one index; arguments arrive unpadded.
- `len` (code-point length), `count(x)` (non-overlapping occurrences), `key` (the variable's own key), `hash` (SHA-256 hex via `@noble/hashes`, synchronous), `date(FORMAT)` (current local time, `DateToken` placeholders, default `YYYY-MM-DD`, read at transform time).
- `calc(expr)` — `+ - * / %`, unary signs, parentheses; evaluated once at parse time (`utils/arithmetic.ts`); non-finite or malformed renders raw; no `**`. A number may carry an exponent (`1e-7`, `CalcSyntax.EXPONENT`/`EXPONENT_ALT`), because `formatArithmetic` writes very small/large results that way and every number reader (`calc`, `parseNumber`, numeric arguments) shares `CALC_NUMBER`, so what `calc` writes is always readable back.
- `round(n)` / `floor` / `ceil` — half away from zero, value must be a plain number (`parseNumber`); this introduced **apply-time failure** (a transform may return `null`).
- Case: `snakecase`, `kebabcase`, `camelcase`, `pascalcase` (rebuild from words) and `capitalize`, `title`, `lowercase`, `uppercase`, `swapcase` (Python re-casing; `title` keeps inner apostrophes).
- `strip(x)` / `lstrip` / `rstrip` (literal string, repeated; bare/empty trims whitespace), `fill(text; n)` / `lfill` / `rfill` (n copies), `just(text; width)` / `ljust` / `rjust` (pad to width), `replace(a;b)`, `remove(a)`, `index(x)` (code-point position or `-1`), `insert(text; pos)`.
- Predicates: `isdigit`, `isnumeric`, `isalpha`, `isalnum`, `isspace`, `isascii`, `isupper`, `islower`, `istitle`, `isempty` (Python semantics). Matching: `startswith`/`endswith`/`contains` (variadic, any matches). Logic: `AND`/`OR`/`XOR` (variadic), `NOT` (exactly one). Comparison: `EQUALS`, `NOTEQUALS`, `EQUALSIGNORECASE`. `IF(cond; then; else?)`.
- **`!` negates a boolean operation** (`{A|!isempty}`, `{|!AND(...)}`). It is dispatch in `parseOperation`: definitions declare `negatable: true`; anything else with `!` fails at parse; the prefix is blanked with spaces (never cut) to keep offsets; `!!` fails.

Grammar rules:

- **Arguments are a call `keyword(a;b;c)`** (`CallSyntax`), split only outside parentheses, `maxsplit`-shaped (separators past the declared arity are content). Verbatim arguments (`strip`, `count`, `replace`, fill text, …) keep interior spaces; numbers and match candidates are trimmed.
- **Everything nests**: param values and operation chunks are resolved as text before being parsed, to any depth.
- **Blanks carry operations** (`{;name|uppercase}`) run with the resolving variable's key as context. `parseBlank` returning `null` means "not a blank" (shell text like `awk '{;a;b}'` stays literal). `readBlanks` scans brace-balanced, descends into non-blank groups, takes a blank whole.
- **Blank defaults** `{;name=default}`: a supplied param wins; a default belongs to the **name** (first written wins, order irrelevant); counts as a fill; may hold other blanks (memoized, cycle-guarded; unresolvable default leaves the blank as written). `getTemplateParamNames` descends into defaults.
- **A blank belongs to the variable whose value writes it**: `applyTemplateParams` marks a blank `foreign` when `spanAt` says another key wrote it (a hole that came through a reference), and a foreign blank takes neither a param nor its default. So with `B = {T}`, `{B;x=z}` leaves `T`'s hole red; forwarding is explicit, `B = {T;x={;x}}`.
- **An unfilled blank without a default is a hole**, not a failure: on the command surface it's painted unresolved one level in with a `KEY;param` source. **A reference whose value still holds anything unresolved (a hole, or a reference that failed) and carries a `|` operation fails**, read off the template spans (`hasUnresolvedSpans`); no operation runs, and it renders `{` + the value as far as it resolved + every operation as written + `}` (`NAME = x{;p}`: `{x{;p}|uppercase}`, `x` green, the hole red one level in). Literal braces reach an operation only escaped. On the value surface blanks pass through.
- **Filling a blank re-resolves what the fill produced** (`resolveFilledTemplate`), only when something was filled, leniently. It threads the chain of keys being refilled: **a key met again inside its own refill is a loop and fails** (so `{;p={P}}` in `P` can't recurse), and the chain is capped by `ReferenceConfig.MAX_TEMPLATE_DEPTH` (past it the text is red, never silently kept). A refill keeps the red spans of what failed inside it, or the unresolved state is lost. Inside a filled template every `\{` loses its backslash (documented cost).
- **Unnamed references** `{|date()}` look nothing up and start from `""`; they **must carry an operation** so a shell `{}` stays literal. `{;...}` is a blank, never unnamed.
- **Escaping**: `\{KEY}` renders `{KEY}`; only the opening brace is escapable. The backslash is consumed by the **command** surface, kept on the **value** surface (so it survives chains), the same for escaped blanks `\{;name}`. **An operation always reads escaped braces as literal ones** (its input and its arguments, `literalBraceSpans`), so it answers the same on both surfaces; on the value surface its output gets every `{` escaped again (`escapeLiteralBraceSpans`) so the result stays literal down the chain. `ReferenceSurface` drives this via `CONSUMES_ESCAPES` / `BLANKS_ARE_FINAL` records; callers pass the surface, never flags.
- **Empty values are unfilled** on both surfaces, but only if the result is still empty after params/operations (`{EMPTY|isempty}` answers, `{EMPTY}` stays raw).
- **A param chunk that doesn't fully resolve fails the reference. An operation chunk with an unresolved reference fails unless that argument is `verbatimFrom`** (only `IF`'s branches are), so `IF` can hand back a raw red branch and never reads the branch not taken.
- **Layout is not meaning**: whitespace around parts is trimmed (references may span lines). Trim, never strip, keys: keys may contain interior spaces.
- **One resolver**: `reference.ts#resolveReference(token, raw, context)`; `command.ts` and `variables.ts` supply a `ReferenceContext` (`surface` + `lookup(key)`). The key itself is never resolved (`{{X}}` looks up `{X}`).
- **There is no regex for a reference — `token.ts` has a scanner**: `scanReferences` balances braces (escaped opens pair but can't open; an unclosed `{` is literal, handled by a stack-based fallback pass to stay linear), `splitReferenceBody` splits key/params/operations at the body's own depth (chunks keep separators verbatim so renames rewrite in place), `openReferenceAt` serves completions, `escapableReferenceAt`/`escapeBraces` serve the escape action.
- Secrets need no special handling: segments keep their `key`, so previews mask and Copy gets the real value. Known limitation: a literal `|` in a param value reads as an operation separator (fails loudly).

**Module split** (`utils/resolution/`, re-exported from `index.ts`): `token.ts` (grammar floor), `spans.ts` (nesting depth), `params.ts` (`;` half and blanks), `operations/` (`|` half), `reference.ts` (one whole reference), `variables.ts` (`variableMap`), `usage.ts`, `rename.ts`, `carry.ts`, `keys.ts`, `overrides.ts`, `command.ts`, `segments.ts`. Anything two parts share belongs in `token.ts`.

**Three things must move together when the grammar changes**: `resolveReference`, `usage.ts#collectRefs` (or variables get dimmed as unused), and `rename.ts#renameTokens` (or renames orphan references). Renames come in surface pairs: `renameCommandTokens` (skips escaped references) and `renameValueTokens`.

#### Nesting depth in the resolved preview

Resolved text is green and **tinted by depth**: level 1 is text the referenced variable wrote, level 2 a reference inside it, level 3+ shares level 3 (`ReferenceConfig.MAX_NESTING_DEPTH`). Failures use the same ramp in red.

- A `ResolvedSpan` is text + relative depth + `source` (the key that wrote it, or `KEY;param` for a blank — `KEY` being the variable whose value declares the blank, read via `spanAt`) + `unresolved`. `VariableMap` is `Record<string, ResolvedValue>` (text + spans). Spans are assigned where text is created and carried, never recomputed.
- Filling a blank nests the filler one level under the blank's span; a `|` operation flattens to one level-0 span. A re-resolved fill nests each reference it holds one level down, exactly like a value (`getVariableMap`). A transform may return `{ text, spans }` (only `IF` does); `applyOperations` keeps spans only if `spansText(spans) === text`.
- A failed reference renders raw but **each reference inside it is shown resolved, one level deeper** (`failedSpans`), green or red; key references and non-reference brace groups stay as written. A chain that breaks after an operation applied (`applyOperations` reports `failedAt` and what applied before it) renders `{` + that output (green, escaped again on the value surface) + the body from the failing `|` on, red: `{|calc(1 + 2)|round(a)}` → `{3|round(a)}`; a chain failing at its first operation stays raw. An output that came out empty under a named key keeps the whole reference as written, its key one level in (red when the variable is empty, green when the chain emptied it), so `{NAME|uppercase|slice}` never reads as the unnamed `{|slice}`. Braces that spell no reference (`ResolvedReference.isReference` false) are plain text.
- `hasUnresolvedSegments` reports a command as unresolved (a resolved segment may hold red spans); the tab warning dot reads it.
- Rendering (`CommandPreview`): one resolved segment stays one segment (masking/line counts); `NestedText` wraps every level in its own `.token-nesting-N` (flat siblings, so tints don't composite), split **per line** as `inline-block` boxes so multi-line highlights meet exactly; empty edge lines get no filler box; the hover tooltip is the span's `source`.
- CSS: `.token-nesting-N { background: var(--nesting-bg-N) }`; `.token-resolved` points those at `--resolved-bg-*`, `.token-unresolved`/`.token-nesting-unresolved` at `--unresolved-bg-*`. Alphas are tuned per hue to equal luminance and to keep text ≥ 4.5:1 (re-check contrast before raising one). `--resolved-color` exists because `--success` fails contrast on light tints; `--unresolved-color` must not point at `--danger`. A fourth level needs a tint **and** `MAX_NESTING_DEPTH`.

#### Numeric arguments

`operations/number.ts`: `readNumberArgument(raw)` → `undefined` (invalid), `null` (blank, use default), or the value; `readNumberArguments` for all-numeric calls. A number is any `calc` expression (delegates to `evaluateArithmetic`) and must be a whole number. Blank ≠ 0. `boolean.ts` mirrors this for booleans (`readBoolean`, `writeBoolean`, `negateTransform`).

#### The operation registry

`utils/resolution/operations/`: `types.ts` (protocol), `call.ts` (`defineCallOperation`), `number.ts`, `boolean.ts`, one file per operation **shape** (`case.ts` covers nine keywords; split a file when its shape differs), and `index.ts` (registry + `applyOperations`, the only export).

- `OperationDefinition.parse(chunk)` returns an `OperationTransform` closure `(text, context) => string | { text, spans } | null`, or `null` for malformed. `context` is `{ key }`.
- Calls never parse their own parentheses: `defineCallOperation({ arity, verbatimFrom?, negatable?, builders })`. `CallSyntax.VARIADIC` (`Infinity`) for variadic calls. **Don't hand-roll a parenthesis regex.**
- Dispatch is by leading keyword (`OperationKeywordRegex` → `DEFINITIONS_BY_KEYWORD`); a keyword belongs to exactly one definition (asserted in `index.test.ts`).
- Syntax (keywords, arity) lives in the tables in `variableSyntax.ts`; definitions hold behavior only. Each operation owns its whitespace rules.

**Adding an operation**: a file exporting an `OperationDefinition`, its keyword/arity in a syntax table, one entry in `OPERATION_DEFINITIONS`, `negatable: true` if it answers true/false, a `/docs` subsection in both locales, the agent prompt, and tests.

### The language of a command block

`CommandBlock.language` (and `Variable.language`) is a `CodeLanguage` = a Monaco language id (Bash is `"shell"`). It only affects highlighting and validation; resolution, Copy and export ignore it.

- `COMMAND_LANGUAGE_ORDER` (`editorConfig.ts`) is the one selectable list (menu, `jsonSchema` enum, `isCommandLanguage` coercion, completion registrations); `CODE_LANGUAGE_LABEL` holds names (proper nouns, not i18n). Defaults: `DEFAULT_COMMAND_LANGUAGE` is Bash, `DEFAULT_VARIABLE_LANGUAGE` is plain text (a value is usually a text fragment, not a script).
- Grammars are bundled basic-language contributions (shell, powershell, sql, xml, yaml), lazily tokenized; JSON uses its own contribution.
- **A model's path never encodes its language**: `modelPath(modelId)` gives `.runbook.json` only to `RUNBOOK_JSON_SCOPES` (paste, cloud file, runbook source) and `.txt` to everything else. Changing the path would drop undo history, and a language-derived suffix would validate command JSON against the runbook schema.
- Variable completions are registered for every language in the list.
- The selector is `CodeLanguageSelect` (`components/common/codeEditor/`), rendered in `CodeEditor`'s `header` slot: a sticky, transparent band spanning the editor's grid (so it pins down long commands), with a halo pill colored via `--code-editor-header-halo`. It's an editor control: hidden in read mode, when collapsed, inert under select-key. `StaticCodeView` renders it too (height parity).

#### Spotting an error in the chosen language

`src/monaco/validation/`: `VALIDATORS` is a complete `Record<CodeLanguage, CodeValidator | null>`. JSON is `null` (Monaco validates it), shell/PowerShell/plaintext are `null` by design, YAML is `null` (no parser bundled), XML uses `DOMParser` (`validateXml`, first well-formedness error only). `validateModel` always writes (clearing stale markers) under `MonacoMarker.OWNER`. `renderValidationDecorations` must be `"editable"` on flowing editors. A validator checks the text as written, references included.

### Clamping long code surfaces

A command block has two independently clampable surfaces (`ClampSurface`: preview and editor); a variable's value is clamped the same way. Anything taller than `CommandClampConfig.MAX_LINES` is clipped behind its own show-more toggle.

- Overflow is a **line count**, not a measurement (no soft wrap): `countCommandLines(segments, secretKeys)` for the preview (skips masked secrets via `isMaskedSegment`), `countLines` for the editor.
- Heights are CSS from `--command-clamp-line-height` × `--command-clamp-max-lines` (set inline from the TS constant). The fade is a `mask-image` on the clipped content (`in oklab`).
- Each toggle is the **last child of its surface, below its content row**, so both center on the block's axis; sticky with only `bottom` set, on `--z-raised` (below the scrollbar's `--z-sticky`), a halo pill.
- **Expansion state is global** (`expandedClampSurfaces`, `toggleClampSurfaceExpanded`), transient, because the minimap renders every block twice.
- Collapsing keeps the surface in view: `useClampSurface` uses `useKeepInView(ref, state)` (arm on toggle, `scrollIntoView` in a layout effect; arming keeps the mirror from scrolling). The runbook block reuses `useKeepInView` for its fold and view switch.
- Toggles stay live in read mode except the editor's (which goes with the editor).

### The runbook minimap

The blocks view and the variables editor wear a miniature of their content in place of the scrollbar (the source view uses Monaco's own minimap instead).

- `Minimap` owns measuring, overscroll, wheel, scrubbing and the slider; it takes a `listId` and a stable memoized `mirror: ComponentType<{ width }>` (it re-renders per scroll tick). `MinimapMirror` is the shared frame (`CodeRendering.STATIC`, `inert`). Mirrors re-derive their own data and render rows wearing the list's class (`.blocks-list` / `.variables-list`), never the list element (ids are unique).
- **Everything a row owns must be global**, and row lookups must be scoped to the real list ref (never `document`), because the mirror duplicates rows.
- Mirrors mask secrets (`StaticCodeView` `masked`).
- One switch for all views: `minimapEnabled`/`minimapPosition`, toggled from `WorkspaceContextMenu`. Hidden when the list is empty.
- Performance rules: scroll ticks never render (`place` writes transforms directly); `.minimap` is `overflow: clip`; the mirror drops `.item-control`s; scrollers get `is-scrolling` (no pointer events) while moving (`useScrollingClass`).

### The runbook source view

`RunbookView` (`PREVIEW` / `SOURCE` / `VARIABLES`) is **per tab** (`Tab.view`, `getRunbookView`), persisted with per-view `scrollTop`. `MainPanel` is a complete `Record<RunbookView, ComponentType>`; non-preview views fall back to the preview with no tab. `toggleRunbookView(view)` swaps between that view and the preview; the tabs bar has a button pair (`Braces` → variables, `FileEarmarkCode` → source), neither shown as "pressed".

- `utils/runbookSource.ts` owns both directions: `buildRunbookSource(content)` and `parseRunbookSource(raw, previous?)`. **Ids are carried over positionally** from `previous` so live editing keeps selection, focus and memo.
- `applyRunbookSource(text)` parses and applies, returning its own serialization so `RunbookSource` can tell its edits from external ones (reseed during render). Invalid text is never applied nor discarded (`hasError`). Read-only in read mode. Per-tab models (`CodeModelScope.RUNBOOK_SOURCE`).
- Secrets appear in the clear (it's the plaintext model).

### The variables editor

`RunbookView.VARIABLES`: each variable as key above a real `CodeEditor` value. The sidebar list stays the quick one-line view.

- `components/variables/`: `RunbookVariables` (list, add row, lasso root), `VariableItem` (row chrome), `VariableEditor`, plus `VariableKeyInput`/`VariableActionsMenu`/`VariableOptionsSelect` shared with the sidebar row.
- **`VariableValueField`** is the shared "key above value" shape (frame, clamp, options vs. editor, masking, gutter) used by the editor and by runbook-block overrides; the key row is a slot. **`onChange` present means somebody else owns the value** (an override): no language selector, no editor actions, no option editing.
- `.variables-list` (`VariablesList.css`) is shared by the editor, its mirror and embeds; `--variable-row-gutter` is the knob.
- Same completions as commands (minus the variable's own key) and the same `useEditorActions` (Extract, Escape).
- `pendingFocusVariableId` is consumed by the visible surface (sidebar row skips it in the variables view); new rows are scrolled to with `scrollRowIntoView` and focused with `preventScroll`.
- One-line values have no gutter (`gutter` off, `--code-editor-indent: --space-4`) so text aligns with the key.
- Masked secrets via `CodeEditor`'s `masked`; the eye button un-secrets. The language header is not rendered in read mode.
- Documented inside the docs Tabs section (its demo's `DemoRunbookPanel` mirrors `MainPanel`'s record).

#### Enum variables

A variable with an `options` array (even empty) is an enum; `value` stays the selected option, so resolution sees no difference. `VariableOptionsSelect` (the shared `Select` + `optionAction` remove `x` + `footer` add input) replaces the value field on both surfaces. Read mode locks the list but not the choice. Removing the selected option falls back to the first; options are trimmed and deduped. Renaming a key rewrites references inside options.

- **The kind is chosen at creation and never converted**: `VariableKind` is only an argument to `addVariable` / `insertVariableRow`, built by the store's one `createVariable(kind)`. Entry points: the NEW row, the Insert above/below submenus, and the sidebar footer's **Enum** button.
- **An enum is only `key`, `value`, `options`** — never `secret` or `language`. Enforced at the JSON boundary both ways (`normalizeVariable` on parse, `buildRunbookSource` on write, and the `oneOf` text/enum schemas in `runbookSchema.ts`), and in the store (`toggleVariableSecret` skips enums). Menus offer text-only actions (mask) only to text variables.

#### Variable sections

Named, collapsible groups in the variables editor only (the sidebar stays flat). A section is `{ id, name, start, collapsed? }` in `Tab.variableSections` / `RunbookContent.variableSections`; `variables` stays pure, so resolution never sees sections.

- **Anything that moves a variable goes through the interleaved list** (`utils/variableSections.ts`: `toVariableEntries` / `fromVariableEntries(entries, previous)` / `mapVariableEntries`), which recomputes `start` and returns unchanged arrays/objects by identity. Editing `tab.variables` positionally shifts variables across sections.
- A section is a row like any other (`VARIABLE_ITEM`, `DataAttr.VARIABLE_ID`), so lasso, duplicate, remove and drag work; moving a header moves where the section starts.
- The name is a `NoteEditor` (markdown). New/duplicated variables reveal their section; collapsing drops hidden rows from the selection; `toggleCollapseAll` folds sections in the variables view; folding stays live in read mode.
- **In JSON a section is written in place** among variables as `{ "section": "Name", "collapsed": true }`, never as a `start` index.
- Menus read `countVariableTargets` to pluralize / show mixed-selection items; `SelectionCount` says variables / sections / items.

#### Selecting rows: one lasso, two groups

`useLassoSelection(root, group)` + `SELECTION_GROUPS` (`BLOCK`, `VARIABLE`) is the only multi-select implementation. `lasso` state is per group. The block lasso is armed on `document`, the variable lasso scoped to `#runbook-variables` (docs demos scope to their element via `pointerInside`). `targetVariableIds(state, id)` is the whole rule for bulk actions (selection if the clicked row is in it, else that row); labels are `(count) => string`. Bulk secret toggling lands all on the clicked row's target state. `DUPLICATE_BLOCK`/`DELETE_BLOCK` act on whichever selection is non-empty.

### The code editor (Monaco)

Every code surface is **Monaco, bundled locally** (never a CDN). `src/monaco/` is the subsystem; `components/common/codeEditor/` (`CodeEditor`, `StaticCodeView`, `CodeLanguageSelect`, …) is the React surface.

- **`monaco-editor` is pinned exactly (`0.55.0`)**: minor bumps have broken deep import paths. Deep imports spell out `.js`.
- `setup.ts` imports the JSON contribution (which pulls the core) plus the basic-language contributions — never `editor.main.js`. `monacoJson.d.ts` / `monacoServices.d.ts` declare the slivers of untyped internals used.
- **Metrics are rounded once and published to `:root`** (`metrics.ts`): line heights and gutter metrics, so CSS, the editor and static mirrors agree.
- **The theme is derived from CSS tokens** (`theme.ts`, resolved through a probe element, redefined on theme change) and passed per editor (`monacoThemeName`). Editor/gutter backgrounds are transparent (CSS paints surfaces). Token rules key off bare scopes mapped to app tokens (`--string-text`, `--flag-text`, `--constant-text`, `--accent-text`, …) with a few SQL/JSON overrides, so no base-theme pure red leaks through. Minimap slider colors come from scrollbar tokens, translucent.
- **Load-bearing options**: `editContext: false` (keeps a real textarea; `InputSelector.EDITABLE` and keybinding guards depend on it), `accessibilitySupport: "off"` (with `"auto"`, typing over a backward selection drops the first keystroke), `fixedOverflowWidgets: true`, `smoothScrolling: false`, `wordBasedSuggestions: "off"`, `suggestOnTriggerCharacters: true` (`{`, `;`, `|`). Options are memoized; the placeholder is only passed to an empty model.
- **Flowing vs bounded**: unbounded editors never scroll vertically; they grow to content height (`onDidContentSizeChange`) and a `useLayoutEffect` calls `layout()` before paint. `bounded` lets Monaco own the viewport (virtualization), sized via `--code-editor-max-height`/`--code-editor-min-height`; only bounded editors get `scrollBeyondLastLine` and an optional minimap (`minimapSide`, which hides the vertical scrollbar).
- Because a flowing editor has no viewport, three Monaco behaviours are mirrored onto the page: drag-select auto-scroll (`dragScroll.ts`, replays pointermoves on `.view-lines`), caret reveal (`revealScroll.ts`: API moves center, keyboard moves minimal, mouse moves skipped, only with live DOM focus inside), and the find widget's position (`stickyWidgets.ts`: `translate` via `--code-editor-widget-offset`, parked under the header, bound only while revealed).
- **The `$` prompt** is line 1's `lineNumbers` text plus a decoration, re-pinned after every edit; prompt and gutter width are applied from `beforeMount` (`onDidCreateEditor`) to avoid a flash.
- **Keys**: `Ctrl+Enter` is intercepted in `onKeyDown` for `onSubmit`. Monaco wins `ctrl+d` and `ctrl+g` inside an editor. The global Escape-blur skips code editors (`InputSelector.CODE`). `Ctrl/Cmd+.` opens the context menu at the caret (bound on `onKeyDown`, **not** `addCommand`, which registers globally) and preselects its first item.
- **Context menu actions**: `EditorAction` (`monaco/actions.ts`) via `CodeEditor`'s memoized `actions` prop; an action gets its text (selection, else word, else its own `caretRange`), `replace`, and `rename`. Actions declare no `precondition` (Monaco would hide them). `useEditorActions` provides **Extract into a variable** (replace + `rename` → `trackInlineRename` keeps the new key's span live, calling `updateVariable` per keystroke) and **Escape the reference** (`escapableReferenceAt` + `escapeBraces`, recursive, idempotent).
- **Blur handling** (`maybeBlur`): deferred a frame; ignored while the context menu is opening/open (it lives in a shadow root, found by `contextMenu.ts`) and while the editor is in use (`editorIsInUse`: focus inside the editor node or the find widget open). Three signals re-ask: text blur, widget blur, find closing. After the menu closes, focus is restored and the selection re-applied only if the model version is unchanged (polled via rAF, not MutationObserver).
- **Suggestions wait for the editor to settle** (`whenElementSettles`) before opening, since the widget doesn't follow page scroll.
- **Two body-level layers** (`layers.ts`): overflow widgets (suggest, hover, context menu shadow root) and widget hovers (`routeHoversToHoverLayer`). They must stay separate or the context menu leaves its shadow root.
- **Static rendering**: under `CodeRendering.STATIC` (minimap mirrors) `CodeEditor` returns `StaticCodeView`. Height parity relies on shared line height, padding on `.code-editor-surface`, and `wordWrap: "off"`.
- **Runbook JSON schema** is composed from block `jsonSchema`s (`runbookSchema.ts`), scoped by `fileMatch` to `*.runbook.json`; `enableSchemaRequest: false`.
- **Completions** (`monaco/completions/`): one provider per language reading a per-model registry (`modelCompletions` / `modelChoices`, filed by model path via `useModelEntries`). Context comes from `openReferenceAt` + `splitReferenceBody` (the last chunk's separator decides key / param / operation), never a hand-rolled scan; params stop past `=`, operations past `(`; multi-line references complete only on lines starting with a separator, in a bounded window. Editors with no variables still offer operations. Suggestions insert only the name (call keywords get parentheses with the caret inside), sorted alphabetically. Operation keywords come from the registry (`getOperationKeywords`); negated spellings are not listed.
- Modals gate their editor on being open.

### Syntax tables and composed regexes

**A syntax character is declared once and every pattern is derived.** The tables (`MarkdownDelimiter` in `markdownSyntax.ts`; `VariableSyntax`, `CallSyntax`, `SliceSyntax`, `OperationSyntax`, `CaseSyntax`, `StripSyntax`, … in `variableSyntax.ts`) hold delimiters, keywords and arities, and no regex hardcodes a character a table names. Patterns are composed from `common/regex.ts` primitives (`escapeSyntax`, `sequence`, `either`, `named`, `optional`, lookarounds, `globalRegex`, …). `escapeSyntax(table)` yields a private escaped view per section that patterns interpolate. A ready-made regex never lives inside a table. The backslash escape is declared once (`ESCAPE_CHAR` / `ESCAPE` / `unescaped()`). Need a new character? Add it to a table. Patterns unrelated to a shared grammar may live beside their consumer (`stringCase.ts`).

### Testing

`pnpm test` runs Vitest (`environment: "node"`, `src/**/*.test.ts`). The suite covers the **variable engine** (`utils/resolution/`), plus `utils/embeddedRunbook.test.ts` and `components/docs/agentPrompt.test.ts`. There are no component/DOM/browser tests; don't pull a DOM implementation in.

- Tests sit beside their module (`<module>.test.ts`) and are typechecked by `tsc -b`.
- Primitives (`string.ts`, `stringCase.ts`, `stringTest.ts`, `hash.ts`) are tested **through the operation that exposes them**, not separately.
- Assert through the grammar: `checkResolution` (command surface) / `checkValues` (value surface) tables from `@/test`, one row per command. `RAW` asserts a reference renders verbatim **and** is unresolved; `partial("text")` asserts a resolved result that still holds an unresolved part.
- `runbook(spec)` (`{ KEY: value }`, `secret("…")`) is the fixture; hand-build `Variable[]` only for cases a `Record` can't express.
- `src/test/setup.ts` stubs only `window.location.origin`. Don't grow it.
- Expectations read constants from `common/` (`FillSyntax.MAX_TIMES`, …), but the grammar in a row stays spelled out literally.
- A failing test is a claim; confirm which side is wrong before changing either.

### Conventions to follow

- **No magic values.** Strings/numbers go in frozen `as const` objects in `common/`; regex characters go in syntax tables.
- **Icons**: `react-bootstrap-icons` named imports (solid glyphs, size via CSS `width`/`height`/`color`); no hand-written `<svg>` except flags/favicons.
- **Theming touches only `styles/tokens.css`**; components use CSS variables, never hardcoded colors (except `data:` URI SVGs).
- **Every color is a published GitHub Primer value**, never a hand-mixed hex (the one exception is the hand-tuned dark main card `#0b0e12`). Surfaces (dark): `--color-bg` `#0b0e12` (main card, wells, deepest), `--color-app-bg` `#161b22` (frame), `--color-surface` `#22272e` (cards), `--color-surface-alt` `#2d333b` (fills/hover), border `#373e47`. Light: frame `#eaeef2`, main `#f6f8fa`, cards white, fills `#eaeef2`, border `#d0d7de`. Text uses Primer `fg` steps; accents/semantic colors are Primer `fg`, `-solid` fills are `emphasis` values (use `-solid` for filled surfaces, never derive a fill from a text token). Neutral gray and slate were both rejected.
- **Stacking goes through the elevation scale** (`--z-behind`, `--z-base`, `--z-raised`, `--z-sticky`, `--z-docked`, `--z-dropdown`, `--z-modal`, `--z-popover`, `--z-tooltip`), never a raw `z-index`; insert a named layer if needed.
- **Sticky controls inside a row pin at `--sticky-inset`** (tops read `var(--sticky-inset-top, var(--sticky-inset))`, which a runbook block raises below its header).
- **Item controls** (drag handle, actions menu beside a block/variable row) carry `item-control` plus their own class; group rules (hover reveal, suppressions, mirror, lasso keep-selection) key off `item-control`.
- **Select-key suppressions** are utility classes (`select-key-inert`, `select-key-hidden`, `select-key-inert-children`) with rules in `index.css`; don't write per-component `body.select-key-held` blocks.
- **Read mode** is mostly CSS via `body.read-mode`, plus store early-returns.
- **Shared components, never re-implemented**: `CodeEditor` (all code fields), `Select` (all combo boxes; `portal` when inside a clipping container; closes on mode change), `ContextMenu` / `ContextMenuItem` / `ContextMenuSubmenu` (portalled, fixed, viewport-clamped; submenus render inside the parent and are arbitrated by `SubmenuActivationContext`), `ActionsMenu` (every three-dots trigger; adds `menu-open` while open), `useWorkspaceContextMenu` (right-click empty space), `Modal` (+ `useModalDismiss`), `AddRow` (list-ending "add" rows), `EditorToggle` (fold chevron; not `ClampToggle`), `asButton(activate)` (non-button elements acting as buttons), `ResizablePanel`/`PanelShell`, `Minimap`, `useLassoSelection`, `useRowReorder` (variable/runbook rows; tabs and blocks have bespoke drag).
- **Destructive row actions live in menus**, never as a bare button (`TrashIcon` + `danger`). The variable mask eye stays a bare button because it doubles as a state indicator.
- **Dialogs are typed by severity**: `confirm`/`alert` take a `DialogTone` (`DANGER` irreversible, `WARNING` replacing content, `INFO` reversible); `DialogModal` maps the tone to `--dialog-*` variables. Messages are note markdown (code spans for names, bold for stakes; don't nest), lists via `i18n/lists.ts#codeBulletList`.
- **Tooltips** go through `tooltip(text)`, never a native `title`. See [Tooltips](#tooltips).
- **Type-check unknown values** with `utils/typeGuards.ts`.

### The in-app documentation (`/docs`)

A route styled like Microsoft Learn: a numbered TOC panel (`DocsToc`, a `ResizablePanel` with `PanelId.DOCS_TOC`), **one section per page** with previous/next navigation, prose, and live demos. Docs prose uses `--font-docs`; demos keep the app fonts.

- **Registry**: `DocsSectionId` (ids are `#anchor` deep links, don't rename) + `DOCS_SECTION_ORDER` (id + level) in `common/constants/docs.ts`; numbering is derived (`getDocsSectionNumbers`), parents too (`getDocsSectionParents`).
- **Adding a section**: id + order entry, a component in `components/docs/sections/`, registration in `DOCS_SECTION_CONTENT` (`docsSections.tsx`, a complete `Record`), and `docs.toc.<id>` + prose in `types.ts`/`en.ts`/`es.ts`.
- **Pagination** (`useDocsPagination`): a page is a section; the hash is read at mount and written on navigation (`replaceState`); `hashchange` navigates. Only same-page scrolls animate. `DocsPageNav` (`#docs-page-bar`, pinned below `#docs-scroll`) holds previous / `n of total` / next (next tinted) and the `DocsFooter`; `DocsPageBack` sits above the heading. The TOC highlights the current page (or its folded parent) and scrolls it into view.
- **Folding is the TOC's alone** (`useDocsCollapse`, in-memory): a chevron hit area inside each parent row toggles its subsection rows; the header folds all. Section headings are plain text.
- **Section shape: essentials → `TRY IT` demo → details.** Don't put a wall of prose before the playground.
- **Sample data should make the feature self-evident**, stay in the app's domain (commands, deploys, errors) without requiring tool-specific knowledge, and preferably let the reader drive it (type into a variable and watch the output change).
- **Prose** lives under `Messages.docs`, may contain note markdown (incl. tables and `*` lists inside the string), rendered by the one `Prose` component. **No em dashes in docs prose.** Never retype a UI label: make the field a function and pass the real catalog string (`longCommands: (showMoreLines: string) => string`).
- **Demos mount real components on isolated stores**: `DemoWorkspace` creates `createAppStore({ isDemo: true })` + `StoreProvider`; seeds via `demoCommand`/`demoNote`/`demoDivider`/`demoVariable`. Selection and link activation use the same hooks as the workspace, scoped to the demo element. A language switch never remounts: the store syncs `language`, and only demos whose seed signature changed get a rebuilt store with carried-over ids. Demos must never touch `localStorage`.
- The keyboard shortcuts section renders the real `KEYBINDINGS` + `t.keybindings`.

#### The AI agent prompt

The **AI agent** section hands out a prompt that turns any AI assistant into a CommandPad runbook generator (the JSON shape and the whole reference grammar). It lives at `src/components/docs/agentPrompt.md` (imported with `?raw` in `agentPrompt.ts`), is **English only** (a specification, not UI), and is shown in a collapsed plain-text command block so the reader gets Copy. **Every `{` in the block text is escaped** (`AGENT_PROMPT_BLOCK_TEXT`), or unnamed references like `{|date()}` would resolve on copy; `agentPrompt.test.ts` guards the round trip.

### Tooltips

One app-wide layer replaces native `title`.

- `tooltip(text, variant?)` (`components/common/tooltip/tooltip.ts`) returns the `data-` props; a falsy text returns `{}`. It does **not** set `aria-label`; icon-only controls add their own.
- `TooltipLayer` is mounted once in `App`, delegates `pointerover`/`focusin` on `document` via `closest([data-tooltip])`, renders one portalled bubble, and renders nothing until first used.
- Timing: `TooltipConfig.SHOW_DELAY_MS`, then `WARM_DELAY_MS` (non-zero) within `WARM_WINDOW_MS`; moving to another trigger hides the current one immediately; warm hand-offs skip the fade (`is-instant`). Leaving before the delay cancels without arming the warm window.
- Opens only on keyboard focus (`:focus-visible`), hides on pointerdown, keys, scroll, resize, blur; doesn't follow its anchor.
- **All listeners passive** (`PASSIVE`/`PASSIVE_CAPTURE`); the idle `hide()` path is one comparison.
- The bubble is shrunk to its longest line (`longestLineWidth` on `.tooltip-label`, never named `tooltip-text`) before pure placement (`tooltipPlacement.ts`, with `arrowX`). `is-unplaced` hides it for the measuring frame; on hide it keeps its last text and placement to fade in place.
- `TooltipVariant.CODE` left-aligns data. `--tooltip-gap` comes from `TooltipConfig.GAP`. `--z-tooltip` is the top layer.
- **Rich tooltips** (`useRichTooltip`, `richTooltip.ts`) hold any React tree and take the pointer. The anchor spreads `tip.props` (`DataAttr.TOOLTIP_RICH`) and renders `tip.render(() => content)`, which **portals into the bubble from the anchor's own tree**, so the content keeps the anchor's context (its store inside docs demos). Never move content rendering into `TooltipLayer`. The layer publishes its content element through a module-level slot (`publishRichTooltipSlot`), and only the matching anchor renders into it.
- A rich bubble is `is-interactive`: leaving the anchor hides it after `TooltipConfig.HIDE_DELAY_MS` (a `::before` bridges the gap), and pointer, focus, keys and scroll inside it don't hide it. Escape does, unless the content called `preventDefault`. Its content has no tooltips of its own. It is placed by a `ResizeObserver`, since its content renders after the bubble, and the lasso keeps the selection on clicks inside it.

### Cloud sync

Runbooks can be exported to / imported from a provider's **app-scoped folder**, directly from the browser.

- `CloudProvider`: `ONEDRIVE` (MSAL popup auth, Graph, `/me/drive/special/approot`, `Files.ReadWrite.AppFolder`) and `GOOGLE_DRIVE` (Google Identity Services token, `drive.file`, session token in `StorageKey.GOOGLE_SESSION`). Both are build-time opt-in. Stale persisted provider ids simply fail validation.
- `services/cloud/`: a `CloudClient` per provider (`listEntries` returns **unsorted**, `createFolder` returns the entry, `fileExists`, `readFile`/`writeFile`/`renameEntry`/`deleteEntry`), `entries.ts`, `search.ts` (`walkCloudTree`, uncached), `path.ts` (`resolveCloudFile`, `listCloudFolder`), `cache.ts`, `transfer.ts` (client-side recursive copy and zip download), `authRedirect.ts`.
- **MSAL redirect**: `main.tsx` checks `isCloudAuthRedirect()` and runs `completeCloudAuthRedirect()` instead of booting the app.
- Store requests are guarded by a request id (`isCurrentCloudRequest`).
- **Listings are cached** per provider/folder with one invalidation, `clearCachedCloudEntries(provider)`; `refreshCloudEntries` is clear + load, which every mutation calls.
- Sorting is a view concern (`compareCloudEntries` against `cloudSort`); entries missing the sorted value sink in both directions.
- The provider name in the modal title is a `ProviderSelect` (via `MessageSlot` slots).
- Export probes for a same-named file (`fileExists`, bypassing the `.json` filter) and confirms before overwriting.
- **Editing in place**: `CloudFileEditorModal` (bounded JSON editor); the parent folder id is resolved on open; save requires valid JSON; dirty close confirms.
- **Linked sync**: `RunbookEntry.sync = { provider, filename, folderId }`, set by cloud import, a JSON cloud export, and Open on a cloud runbook block; removed by **Stop syncing**; not carried by duplicates. Pushes go through a debounced queue (`queueCloudSync`, deduped against the last pushed plaintext), drained one file at a time (`flushQueuedSyncs`, never signs in on its own); `bootstrap` queues a catch-up push per open linked tab. `runbookSyncStatus` drives the row badge (clickable retry via `syncRunbookNow`). Removing a linked runbook skips the confirm but flushes first; it never deletes the cloud file. Sync is push-only.
- **Browser UI**: `CloudBrowser/` (breadcrumbs, sortable list, inline rename/create, `CloudRowMenu`: Rename, Edit, Duplicate, Download, Delete).
- **Selection**: explorer-style (click, Ctrl, Shift, circles); stored as a placed `Map` (entry + the folder path it was picked from) so it survives search and navigation; only a provider switch, fresh open or sign-out clears it (`clearedCloudListing`). `CloudSelectionPills` shows picks not on screen. Row order and the Shift anchor live in `CloudBrowser` (`CloudSelectionContext`). All row actions take `CloudEntry[]`; targets are the selection if the clicked row is in it. Row click handlers must check `currentTarget.contains(target)` (portalled menus bubble through React).
- Imports read and parse every file before adding any; bulk duplicate confirms; multi-delete lists names via `codeBulletList`.
- `utils/zip.ts` is a dependency-free stored zip writer.

### The import/export JSON schema

`RunbookContent` is `{ variables[], blocks[] }` (examples in `docs/examples/*.json`). `variables` may contain section markers `{ section, collapsed? }`. A variable is `{ key, value, secret?, language? }` or, as an enum, `{ key, value, options }` (`value` is a `cpv1.…` payload for a secret exported with an open vault). A block is `{ type, ... }`: `command` (`text`, `language?`, `editorCollapsed?`), `note` (`text`, `style?`), `image` (`src`, `alt?`), `runbook` (`label`, `cloud?`, `overrides?`, `collapsed?`), `divider`. **Ids are runtime-only**: omitted from exports, regenerated on import. Unknown block types are dropped by `normalizeBlock`.

### Internationalization (i18n)

English and Spanish; adding a language is data-only.

- `i18n/types.ts`: `Language`, `LANGUAGE_ORDER`, `LANGUAGE_LABELS`, `LANGUAGE_NAMES`, and the `Messages` interface (every string). `locales/en.ts`, `es.ts` implement it, so the compiler flags missing keys.
- `messages.ts`: `MESSAGES`, `detectLanguage()`, `isLanguage()`, `getMessages(language)`. Components use `useTranslation()`; outside React use `getMessages(get().language)`.
- **Adding a string**: key in `Messages`, then every locale. **Adding a language**: a locale file, `MESSAGES`, the `LANGUAGE_*` maps, and a flag in `components/icons/flags.tsx`.
- No inline ternaries over translated fragments: one key per full phrase. Interpolated strings are functions (type-checked params, per-locale pluralization). Sentences wrapping an element use slots (`i18n/slots.ts`, `splitAtSlot`).
- Language is persisted UI state. "Untitled" sentinels stay language-neutral in storage and are localized at render (`displayLabel`).
- Keybinding descriptions live in `Messages.keybindings`. Proper nouns and command syntax examples aren't translated.
- `LanguageSelect` (header) wraps `Select` with hand-drawn SVG flags (not emoji).
