# CommandPad

A lightweight, variable-aware command management interface. Organize commands and scripts with dynamic variable substitution, making it easy to manage API endpoints, credentials, and other configuration parameters across multiple command blocks.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
  - [Requirements](#requirements)
  - [Installation \& Setup](#installation--setup)
  - [Run Locally](#run-locally)
- [Usage](#usage)
  - [Variables](#variables)
  - [Command Blocks](#command-blocks)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Dynamic Variable Substitution**: Define variables once and watch all commands update in real-time.
- **Flexible Command Blocks**: Organize commands with notes, dividers, and command entries.
- **Collapsible Editor**: Expand or collapse command editors to keep your workspace clean.
- **JSON-based Format**: Store configurations in simple, portable JSON files.
- **Instant Preview**: See variable substitutions applied immediately across all commands.
- **Keyboard-first Design**: Efficient workflows with streamlined navigation.

---

## Quick Start

### Requirements

- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation & Setup

1. Clone or download this repository.
2. Open the project folder in your file explorer.

### Run Locally

1. Open `index.html` with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer):
   - Install the Live Server extension in VS Code (recommended extensions are listed in `.vscode/extensions.json`)
   - Right-click on `index.html` and select "Open with Live Server"
   - The application will open at `http://127.0.0.1:5500` (or the port shown in VS Code)

2. Alternatively, open `index.html` directly in your browser by double-clicking it.

---

## Usage

### Variables

Variables are defined in the left sidebar and can be referenced in any command block using curly brace syntax: `{VARIABLE_NAME}`.

**Example variable definition:**

```json
{
  "id": "var_1",
  "key": "API_HOST",
  "value": "api.example.com"
}
```

**Using variables in commands:**

```
curl http://{API_HOST}:{PORT}/users
```

When you update a variable value, all commands using that variable are instantly updated.

### Command Blocks

Command blocks are the main content area and support multiple element types:

| Type        | Purpose                                                                     |
| ----------- | --------------------------------------------------------------------------- |
| **note**    | Display informational text (supports `heading` and `body` styles)           |
| **divider** | Visual separator between sections                                           |
| **command** | Executable command with optional syntax highlighting and collapsible editor |

**Example block structure:**

```json
{
  "id": "block_1",
  "type": "command",
  "text": "curl http://{API_HOST}:{PORT}/status",
  "editorCollapsed": true
}
```

---

## Examples

Browse the [docs/examples/](/docs/examples/) folder for sample configurations:

- **example-quick-start.json** — A simple API testing setup with common curl commands
- **example-deploy-guide.json** — A deployment workflow with environment-specific variables

To load an example:

1. Open CommandPad in your browser
2. Use the application's import or load function to select a JSON file

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
