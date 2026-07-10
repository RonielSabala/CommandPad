# CommandPad

A lightweight, variable-aware command runbook tool. Define variables once, reference them across any number of command blocks, and copy fully resolved commands instantly. Designed for engineers who run the same sequences of commands repeatedly with different environments, credentials, or targets.

![Hero](docs/screenshots/hero.jpg)

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Run Locally](#run-locally)
- [Usage](#usage)
  - [Tabs](#tabs)
  - [Sidebar](#sidebar)
  - [Runbook Library](#runbook-library)
  - [Variables](#variables)
  - [Block Types](#block-types)
  - [Multi-select](#multi-select)
  - [Read Mode](#read-mode)
  - [Export](#export)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Tabs**: open multiple runbooks simultaneously in separate tabs.
- **Variables**: define named variables and reference them in any command block or other variable value.
- **Live resolved preview**: every command block shows the fully resolved command in real time as you type.
- **Three block types**: commands, notes, and dividers can be freely mixed to build structured, annotated runbooks.
- **Rich note blocks**: notes support three text styles (heading, subheading, body), auto-detect URLs, and inline markdown: `**bold**`, `_italic_`, `` `code` ``.
- **Secret variables**: mark any variable as secret to mask its value in the sidebar and in command previews.
- **Drag-and-drop reordering**: blocks, variables, and runbook library entries can each be reordered via their drag handles.
- **Multi-block selection**: hold `Shift` and click or lasso-drag across blocks to build a selection. Move, duplicate, or delete the group at once.
- **Read mode**: locks editing while still allowing variable values to change and runbooks to be switched.
- **Light and dark theme**: toggle between dark and light mode.
- **Adjustable sidebar**: collapse the sidebar to maximize workspace, or move it to the right side of the screen.
- **Persistent state**: tabs, workspace content, sidebar state, and app mode are all saved locally and restored on reload.
- **Export**: save the active workspace as `.json`, `.md`, or `.txt` via a native OS save dialog.

---

## Quick Start

### Requirements

- [Node.js](https://nodejs.org)
- [pnpm](https://pnpm.io)
- [Visual Studio Code](https://code.visualstudio.com) (Recommended)

---

### Installation

```bash
pnpm install
```

---

### Run Locally

```bash
pnpm dev
```

Access at `http://localhost:5173`. Use `Ctrl+C` to stop.

---

## Usage

### Tabs

Each tab holds one open runbook.

- Click a tab to switch to it.
- **Middle-click** a tab to close it.
- **Drag** a tab to reorder it.
- **Drop blocks on a tab** to copy them into it.
- An accent bar at the bottom of the active tab marks it at a glance.

---

### Sidebar

The sidebar holds the runbook library and variables panel.

- **Collapse / expand**: click the chevron button or press `Ctrl+S`.
- **Move left / right**: click the layout button or press `Ctrl+Shift+S` to move the sidebar to the other side of the screen.

---

### Runbook Library

The sidebar's **RUNBOOKS** section holds your imported runbooks.

- Click **Import** to load one or more `.json` files at once.
- Click any runbook entry to open it. If it's already open in a tab, that tab becomes active.
- Delete a runbook from the library with the button on row hover.
- Drag the handle on the left of an entry to reorder the list.
- Use the **search bar** to filter runbooks by name.

**Auto-labelling:** if a runbook's first block is a note, its text is used as the library label, so entries are self-describing. Otherwise the imported filename is used as the fallback.

> [!NOTE]
> Edits made to the active runbook are automatically saved back to the library entry.

---

### Variables

Variables are defined in the **VARIABLES** section of the sidebar. Each variable has a **key** and a **value**.

- Click **New** to create a variable.
- Reference a variable in any command block using curly braces:

  ```bash
  kubectl get pods -n {NAMESPACE}
  ```

- Variables can reference other variables:

  ```txt
  BASE_URL = https://{HOST}/api
  ```

- **Parameterized placeholders**: a variable's value can contain a `{;name}` placeholder that isn't filled in until it's referenced:

  ```txt
  A = generic_path/{;user_path}
  ```

  Fill it in per-reference with `{key;name=value}`:

  ```bash
  {A;user_path=my_path}
  ```

  resolves to `generic_path/my_path`. Supply multiple placeholders by separating them with `;`: `{A;p1=v1;p2=v2}`. If a reference omits a placeholder's value, the `{;name}` marker is left in place and the command is treated as unresolved.

- **Escaping braces**: prefix `{` or `}` with a backslash in a command block to output it literally instead of starting a variable reference. The backslash is dropped from the resolved command:

  ```bash
  awk '\{print $1\}'
  ```

  resolves to `awk '{print $1}'`. This also works inside a parameter value, so you can pass a literal brace instead of a nested reference. Escaping applies to command blocks only; backslashes inside variable values are always literal.

- **Key rename propagation**: renaming a key automatically updates all references across every command block and other variable value.
- **Unused variables**: a variable that isn't referenced by any command block, directly or through another variable's value, is dimmed and italicized in the sidebar, so stale entries are easy to spot.
- Keys are case-sensitive. Variables with empty keys are ignored.
- Hovering over a key or value shows the full content as a tooltip.
- Drag the handle on the left of a row to reorder variables.
- Delete a variable with the button on row hover.
- Use the **search bar** to filter variables by key or value.
- Click the **eye icon** on a variable row to mark it as **secret**. Secret values are masked in the sidebar and are substituted silently in command previews.

> [!TIP]
> If no tabs are open and you create a new variable, a new untitled tab is created automatically.

---

### Block Types

Blocks are the main content of a runbook. Add them using the **NEW BLOCK** row at the bottom of the main panel.

> [!TIP]
> If no tabs are open and you add a block, a new untitled tab is created automatically.

---

#### Command Block

A command block has two parts:

- **Preview** (always visible): the fully resolved command. Unresolved variable references are highlighted. Click **Copy** to copy the resolved text to the clipboard.
- **Editor** (collapsible): the raw command template, prefixed with `$`. Use the chevron button to collapse it, or toggle all editors globally with the header button.

Commands can span multiple lines. The editor scrolls horizontally when a line exceeds the panel width.

---

#### Note Block

A free-form text block. Note blocks expand horizontally and vertically as you type.

Three text styles are selectable on hover:

| Style        | Appearance       |
| ------------ | ---------------- |
| `heading`    | Large, bold      |
| `subheading` | Medium, accented |
| `body`       | Default prose    |

Supported inline markdown:

| Syntax               | Result         |
| -------------------- | -------------- |
| `**text**`           | **Bold**       |
| `_text_` or `*text*` | _Italic_       |
| `` `text` ``         | `Code pill`    |
| `https://...`        | Clickable link |
| `[label](https://…)` | Labelled link  |

To open a link, hold `Ctrl` and click it. In read mode, links are directly clickable without holding `Ctrl`.

**Wrap the selection:** with text selected in a note, these keys wrap it in one step:

| Keys             | Wraps selection in |
| ---------------- | ------------------ |
| `Ctrl+B`         | \*\*Bold\*\*       |
| `Ctrl+I`         | \_Italic\_         |
| `` Ctrl+` ``     | \`Code pill\`      |
| `(`, `[`, or `{` | that bracket pair  |

---

#### Divider Block

A visual separator. Stretches to match the width of the widest block. Useful for separating runbook sections visually.

---

### Multi-select

Hold `Shift` and click blocks to build a selection. You can also hold `Shift` and drag the mouse across blocks to lasso-select them. Lassoing already-selected blocks deselects them.

With a selection active:

- **Drag** any selected block's handle to move all selected blocks together, preserving relative order.
- **Copy to another tab**: drag any selected block's handle onto a tab in the tabs bar to copy the whole selection into that tab.
- **Duplicate** (`Ctrl+D`) any selected block to duplicate the entire group, inserted after the last selected block.
- **Delete** (`Del`) any selected block to delete the entire group.
- Press `Escape` or click outside block controls to clear the selection.

---

### Read Mode

Read mode locks editing, not navigation.

Click the **padlock icon** in the header to enter read mode:

- All command editors collapse and cannot be expanded.
- Block and note text cannot be edited.
- Block structure cannot be changed (no adding, deleting, or reordering).
- Variable values can still be changed.
- Runbooks can still be switched.
- Links in notes are directly clickable.

Click the **pencil icon** to return to edit mode.

---

### Export

Click **Export** in the header to open the format picker.

| Format         | Content                                                                            |
| -------------- | ---------------------------------------------------------------------------------- |
| **JSON**       | Full workspace (variables + blocks). Can be re-imported.                           |
| **Markdown**   | Human-readable `.md` file. Headings, subheadings, dividers, and resolved commands. |
| **Plain text** | Same content as Markdown, saved as `.txt`.                                         |

A native OS save dialog opens on supported browsers so you can choose the filename and folder. On other browsers the file downloads directly.

Press `Escape` or click outside the modal to cancel.

---

## Keyboard Shortcuts

The full shortcut list is available in-app via the **keyboard icon** in the header.

---

## Examples

Browse the [docs/examples/](/docs/examples/) folder for sample runbooks.

---

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository.
2. Create a feature branch: `feat/my-change`.
3. Make your changes following the existing code style.
4. Include appropriate documentation or tests.
5. Commit, push, and open a pull request describing the change and the reason for it.

### Pre-commit Hooks <!-- omit in toc -->

This project uses [pre-commit](https://pre-commit.com/) to enforce code quality checks before each commit. Run once from the **repo root** to set it up:

```bash
pip install pre-commit
pre-commit install
```

Checks run automatically on every `git commit`. To run them manually:

```bash
pre-commit run --all-files
```

---

## License

This project is available under the **MIT License**.
