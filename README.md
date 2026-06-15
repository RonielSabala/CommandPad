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
  - [Variables](#variables)
  - [Block Types](#block-types)
  - [Multi-select](#multi-select)
  - [Read Mode](#read-mode)
  - [Export and Import](#export-and-import)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Variables**: define named variables and reference them in any other variable or command block.
- **Live resolved preview**: every command block shows the fully resolved command.
- **Three block types**: commands, notes, and dividers can be mixed freely to build structured, annotated runbooks.
- **Rich note blocks**: notes support three text styles (heading, subheading, body), auto-detect URLs, and support inline markdown: `**bold**`, `_italic_`, `` `code` ``.
- **Drag-and-drop reordering**: blocks and variables can each be reordered independently via their drag handles.
- **Multi-block selection**: hold `Ctrl` and click or lasso-drag across blocks to build a selection. Move, duplicate, or delete the whole group at once.
- **Read mode**: locks the entire interface.
- **Persistent state**: workspace, sidebar state, and app mode are all saved to `localStorage` and restored on reload.
- **Export / Import**: save the workspace to a `.json` file and load it back at any time.

---

## Quick Start

### Requirements

- Any modern browser (Chrome, Firefox, Edge, Safari).
- No server required.

---

### Run Locally

**Option A. Open directly:**

Double-click `index.html` to open it in your default browser.

---

**Option B. Use a VS Code extension (recommended):**

1. Install the **Live Server** extension (`ritwickdey.liveserver`), listed in [.vscode/extensions.json](.vscode/extensions.json).
2. Open the Command Palette (`Ctrl+Shift+P`) and run **Live Server: Open with Live Server**.

Use **Live Server: Stop Live Server** to stop.

---

## Usage

### Variables

Variables are defined in the left sidebar. Each variable has a **key** and a **value**.

- Click **New** to create a new one.
- Keys are case-sensitive.
- Variables with empty keys are ignored.
- Delete a variable with the button that appears on row hover.
- Drag the handle on the left to reorder variables.
- Variables can reference other variables: `URL=https://{HOST}/api`.
- Renaming a key propagates the change to all command blocks and other variable values automatically.

Reference a variable in any command block:

```plain
{VARIABLE_NAME}
```

---

### Block Types

Blocks are the main content of a runbook. Add them using the **NEW BLOCK** row at the bottom of the main panel.

---

#### Command Block

A command block has two parts:

- **Preview** (always visible): the resolved command. Click **Copy** to copy the resolved text to the clipboard.
- **Editor** (collapsible): the raw template prefixed with `$`. Collapse it with the chevron button in the preview row, or toggle all editors globally from the header.

---

#### Note Block

A free-form text block. Three styles are selectable on hover:

| Style        | Appearance       |
| ------------ | ---------------- |
| `heading`    | Large, bold      |
| `subheading` | Medium, accented |
| `body`       | Default prose    |

Supports inline markdown:

| Syntax        | Result         |
| ------------- | -------------- |
| `**text**`    | **Bold**       |
| `_text_`      | _Italic_       |
| `` `text` ``  | `Code pill`    |
| `https://...` | Clickable link |

To open a link, hold `Alt` and click it.

Note blocks auto-expand horizontally and vertically as you type.

---

#### Divider Block

A visual separator line. Stretches to match the width of the widest block. Useful for separating runbook sections.

---

### Multi-select

Hold `Ctrl` and click blocks to build a selection. You can also hold `Ctrl` and hold down the mouse button while moving the cursor across blocks (lasso select). Hold `Ctrl` over already-selected blocks and lasso to deselect them.

With a selection active:

- **Drag** any selected block's handle to move all selected blocks together, preserving their relative order.
- **Duplicate** any selected block to duplicate the entire group, inserted after the last selected block.
- **Delete** any selected block to delete the entire group.
- Press `Escape` or click anywhere outside block controls to clear the selection.

While `Ctrl` is held, the interface is in selection-only mode.

---

### Read Mode

Click the **padlock icon** in the header (or press `Ctrl+E`) to enter read mode.

In read mode:

- All command editors are collapsed and cannot be expanded.
- Note and command block text cannot be edited.
- Block structure cannot be changed (no adding, deleting, or reordering).
- Variable keys cannot be changed and new variables cannot be added or deleted.
- Variable **values** remain editable.
- Note style pickers are hidden.
- Links in notes are directly clickable.

Click the **pencil icon** (or press `Ctrl+E`) to return to edit mode. The mode is saved across page reloads.

---

### Export and Import

Click the **Export** button in the header to save the workspace. A native OS save dialog opens so you can choose the filename and folder.

Click **Import** to load a `.json` file. This replaces the current workspace entirely.

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
