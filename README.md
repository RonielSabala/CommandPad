# CommandPad

A lightweight, variable-aware command runbook tool. Define variables once, reference them across any number of command blocks, and copy fully resolved commands instantly. Designed for engineers who run the same sequences of commands repeatedly with different environments, credentials, or targets.

![Hero](docs/screenshots/hero.jpg)

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
  - [Requirements](#requirements)
  - [Run Locally](#run-locally)
- [Usage](#usage)
  - [Tabs](#tabs)
  - [Runbook Library](#runbook-library)
  - [Variables](#variables)
  - [Block Types](#block-types)
  - [Multi-select](#multi-select)
  - [Read Mode](#read-mode)
  - [Export](#export)
  - [Sidebar](#sidebar)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Tabs**: open multiple runbooks simultaneously in separate tabs.
- **Runbook library**: import one or many `.json` runbooks into a persistent sidebar list.
- **Variables**: define named variables and reference them in any command block or other variable value.
- **Live resolved preview**: every command block shows the fully resolved command in real time as you type.
- **Three block types**: commands, notes, and dividers can be freely mixed to build structured, annotated runbooks.
- **Rich note blocks**: notes support three text styles (heading, subheading, body), auto-detect URLs, and inline markdown: `**bold**`, `_italic_`, `` `code` ``.
- **Secret variables**: mark any variable as secret to mask its value in the sidebar and in command previews.
- **Sidebar search**: filter both the runbook list and the variable list instantly with the search bars.
- **Drag-and-drop reordering**: blocks, variables, and runbook library entries can each be reordered via their drag handles.
- **Multi-block selection**: hold `Ctrl` and click or lasso-drag across blocks to build a selection. Move, duplicate, or delete the group at once.
- **Read mode**: locks editing while still allowing variable values to change and runbooks to be switched.
- **Light and dark theme**: toggle between dark and light mode. The preference is saved and restored on reload.
- **Adjustable sidebar**: collapse the sidebar to maximize workspace, or move it to the right side of the screen.
- **Persistent state**: tabs, workspace content, sidebar state, and app mode are all saved locally and restored on reload.
- **Export**: save the active workspace as `.json`, `.md`, or `.txt` via a native OS save dialog.

---

## Quick Start

### Requirements

- [Node.js](https://nodejs.org) 20+ and [pnpm](https://pnpm.io) 9+.
- Any modern browser (Chrome, Firefox, Edge, Safari).

---

### Run Locally

```bash
pnpm install
pnpm dev
```

Then open the printed local URL (default <http://localhost:5173>).

To create a production build:

```bash
pnpm build
pnpm preview
```

---

## Usage

### Tabs

Each tab holds one open runbook. Tabs appear at the top of the main panel.

- Click **+** to open a new untitled tab.
- Click a tab to switch to it.
- **Middle-click** a tab to close it.
- Click the **x** button that appears on hover to close a tab.
- **Drag** a tab to reorder it.
- An accent bar at the bottom of the active tab marks it at a glance.
- Tabs and their active content are persisted across page reloads.

> If you open a runbook from the sidebar that is already open in another tab, the app switches to the existing tab instead of opening a duplicate.

---

### Runbook Library

The sidebar's **RUNBOOKS** section holds your imported runbooks.

- Click **Import** to load one or more `.json` files at once.
- Click any runbook entry to open it. If it's already open in a tab, that tab becomes active.
- Delete a runbook from the library with the button on row hover.
- Drag the handle on the left of an entry to reorder the list.
- Use the **search bar** to filter runbooks by name.

**Auto-labelling:** if a runbook's first block is a note, its text is used as the library label, so entries are self-describing. Otherwise the imported filename is used as the fallback.

Edits made to the active runbook are automatically saved back to the library entry.

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

- **Key rename propagation**: renaming a key automatically updates all references across every command block and other variable value.
- Keys are case-sensitive. Variables with empty keys are ignored.
- Hovering over a key or value shows the full content as a tooltip.
- Drag the handle on the left of a row to reorder variables.
- Use the **search bar** to filter variables by key or value.
- Delete a variable with the button on row hover.
- Click the **eye-slash icon** on a variable row to mark it as **secret**. Secret values are masked in the sidebar and are substituted silently in command previews.

> If no tabs are open and you create a variable, a new untitled tab is created automatically.

---

### Block Types

Blocks are the main content of a runbook. Add them using the **NEW BLOCK** row at the bottom of the main panel.

> If no tabs are open and you add a block, a new untitled tab is created automatically.

---

#### Command Block

A command block has two parts:

- **Preview** (always visible): the fully resolved command. Unresolved variable references are highlighted. Click **Copy** to copy the resolved text to the clipboard.
- **Editor** (collapsible): the raw command template, prefixed with `$`. Use the chevron button to collapse it, or toggle all editors globally with the header button.

Commands can span multiple lines. The editor scrolls horizontally when a line exceeds the panel width.

---

#### Note Block

A free-form text block. Three text styles are selectable on hover:

| Style        | Appearance       |
| ------------ | ---------------- |
| `heading`    | Large, bold      |
| `subheading` | Medium, accented |
| `body`       | Default prose    |

Supported inline markdown:

| Syntax        | Result         |
| ------------- | -------------- |
| `**text**`    | **Bold**       |
| `_text_`      | _Italic_       |
| `` `text` ``  | `Code pill`    |
| `https://...` | Clickable link |

To open a link, hold `Alt` and click it. In read mode, links are directly clickable without holding `Alt`.

Note blocks expand horizontally and vertically as you type.

---

#### Divider Block

A visual separator. Stretches to match the width of the widest block. Useful for separating runbook sections visually.

---

### Multi-select

Hold `Ctrl` and click blocks to build a selection. You can also hold `Ctrl` and drag the mouse across blocks to lasso-select them. Lassoing already-selected blocks deselects them.

With a selection active:

- **Drag** any selected block's handle to move all selected blocks together, preserving relative order.
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

Click the **pencil icon** to return to edit mode. The mode persists across page reloads.

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

### Sidebar

The sidebar holds the runbook library and variables panel.

- **Collapse / expand**: click the chevron button or press `Ctrl+S`.
- **Move left / right**: click the layout button or press `Ctrl+Shift+S` to move the sidebar to the other side of the screen.

Both preferences persist across page reloads.

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

---

## License

This project is available under the **MIT License**.
