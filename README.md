# CommandPad

A lightweight, variable-aware command runbook tool. Define variables once, reference them across any number of command blocks, and copy fully resolved commands instantly. Designed for engineers who run the same sequences of commands repeatedly with different environments, credentials, or targets.

![Hero](docs/screenshots/hero.jpg)

## Features

- **Variables** with live resolved previews, cross-references, parameterized placeholders, and secret masking.
- **Three block types** — commands, notes (with inline markdown), and dividers — freely mixed into structured runbooks.
- **Tabs** and a **runbook library** with import/export (JSON, Markdown, plain text).
- **Read mode**, multi-block selection, drag-and-drop reordering, light/dark theme, English/Spanish UI.
- **Persistent state** — everything is saved locally and restored on reload.

## Documentation

Full usage documentation lives **inside the app**: click the book icon in the header, or open `/docs` directly. It covers every concept with live, interactive examples.

## Quick Start

Requires [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Access at `http://localhost:5173`. Use <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop.

## Examples

Browse the [docs/examples/](/docs/examples/) folder for sample runbooks.

## Contributing

Contributions are welcome. Fork the repository, create a feature branch (`feat/my-change`), follow the existing code style, and open a pull request describing the change.

This project uses [pre-commit](https://pre-commit.com/) to enforce code quality checks before each commit. Run once from the **repo root** to set it up:

```bash
pip install pre-commit
pre-commit install
```

## License

This project is available under the **MIT License**.
