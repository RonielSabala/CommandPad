# CommandPad

A lightweight, variable-aware command runbook tool. Define variables once, reference them across any number of command blocks, and copy resolved commands instantly.

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
  - [Read Mode](#read-mode)
  - [Export and Import](#export-and-import)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Variable substitution**: Define named variables and reference them in any command block using `{VARIABLE_NAME}` syntax.
- **Live preview**: Every command block shows the fully resolved command on top of the template.
- **Three block types**: Commands, notes, and dividers can be mixed freely to build structured, readable runbooks.
- **Drag-and-drop reordering**: Blocks can be reordered by holding the drag handle that appears on hover.
- **Read mode**: A toggle locks the entire interface. Useful for running through a checklist without accidental changes.
- **Persistent state**: The full workspace is saved to `localStorage` automatically and restored on reload.
- **Export / Import**: Save the current workspace to a `.json` file and reload it at any time.

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

Variables are defined in the left sidebar. Each variable has a **name** and a **value**.

- Click **Add variable** to create a new one.
- Names are case-sensitive.
- Delete a variable with the `x` button on its row.
- Variables with empty names are ignored.

Reference a variable in any command block using curly brace syntax:

```plain
{VARIABLE_NAME}
```

---

### Block Types

Blocks are the main content of a runbook. Add them using the **NEW BLOCK** row at the bottom of the main panel.

---

#### Command Block

It has two parts:

- **Template**: the raw command with `{VARIABLE}` tokens.
- **Preview**: the resolved command with variables substituted in.

The editor row can be collapsed with the chevron button in the preview row, or globally using **Toggle editors** in the header.

Unresolved tokens are highlighted in red in the preview.

---

#### Note Block

A free-form text. It supports three styles selectable on hover:

| Style        | Appearance                 |
| ------------ | -------------------------- |
| `heading`    | Large, bold, primary color |
| `subheading` | Medium, accented color     |
| `body`       | Default, secondary color   |

URLs are automatically detected and rendered as links. Hold `Ctrl` and click a link to open it.

Note blocks auto-expand horizontally and vertically as you type.

---

#### Divider Block

A visual separator line. Useful for grouping steps or sections. Stretches to match the width of the widest block in the list.

---

### Read Mode

Click the **padlock icon** in the header to toggle read mode.

In read mode:

- All command editors are collapsed and cannot be expanded.
- Note blocks and command templates cannot be edited.
- Variables cannot be added or deleted.
- Blocks cannot be added, reordered, or deleted.
- Note style pickers are hidden.
- Links in note blocks are directly clickable.

The mode is saved across page reloads. Click the **pencil icon** to return to edit mode.

---

### Export and Import

Click the **Export** button in the header to download the current workspace as `commandpad-export.json`.

Click the **Import** button to load a `.json` file. This replaces the current workspace entirely.

---

## Examples

Browse the [docs/examples/](/docs/examples/) folder for sample runbooks covering common workflows.

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
