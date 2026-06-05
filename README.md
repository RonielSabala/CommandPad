# CommandPad

A lightweight, variable-aware command management interface. Organize commands and scripts with dynamic variable substitution, making it easy to manage API endpoints, credentials, and other configuration parameters across multiple command blocks.

![Hero](docs/screenshots/hero.jpg)

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
  - [Requirements](#requirements)
  - [Run Locally](#run-locally)
- [Usage](#usage)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Instant Preview**: See variable substitutions applied immediately across all commands.
- **Collapsible Editor**: Expand or collapse command editors to keep your workspace clean.
- **JSON-based Format**: Store configurations in simple, portable JSON files.
- **Flexible Command Blocks**: Organize commands with notes and dividers.

---

## Quick Start

### Requirements

- [Visual Studio Code](https://code.visualstudio.com/) (Recommended)

---

### Run Locally

**Option A. Open `index.html` manually:**

Open the file directly in your browser by double-clicking it.

---

**Option B. Use a VS Code extension (recommended):**

1. Install the **Live Server** extension (`ritwickdey.liveserver`), listed in [.vscode/extensions.json](.vscode/extensions.json).
2. Open the Command Palette (`Ctrl+Shift+P`) and run **Live Server: Open with Live Server**.

Use **Live Server: Stop Live Server** to stop.

---

## Usage

Variables are defined in the left sidebar and can be referenced in any command block using curly brace syntax: `{VARIABLE_NAME}`.

Example:

```plain
curl http://{API_HOST}:{PORT}/users
```

When you update a variable value, all commands using that variable are instantly updated.

---

## Examples

Browse the [docs/examples/](/docs/examples/) folder for sample configurations.

To load an example click the **Import** button and select a JSON file.

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
