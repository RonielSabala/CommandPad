# CommandPad

A lightweight, variable-aware command runbook tool. Define variables once, reference them across any number of command blocks, and copy fully resolved commands instantly. Designed for engineers who run the same sequences of commands repeatedly with different environments, credentials, or targets.

![Hero](docs/screenshots/hero.jpg)

---

## Table of Contents

- [Features](#features)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Run Locally](#run-locally)
- [Cloud Sync (Optional)](#cloud-sync-optional)
  - [SharePoint / OneDrive](#sharepoint--onedrive)
  - [Google Drive](#google-drive)
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
- **Multi-block selection**: hold <kbd>Shift</kbd> and click or lasso-drag across blocks to build a selection. Move, duplicate, or delete the group at once.
- **Read mode**: locks editing while still allowing variable values to change and runbooks to be switched.
- **Light and dark theme**: toggle between dark and light mode.
- **Multi-language UI**: switch between English and Spanish from the header.
- **Adjustable sidebar**: collapse the sidebar to maximize workspace, or move it to the right side of the screen.
- **Persistent state**: tabs, workspace content, sidebar state, and app mode are all saved locally and restored on reload.
- **Export**: save the active workspace as `.json`, `.md`, or `.txt` via a native OS save dialog.
- **Cloud sync (optional)**: export/import runbooks directly to SharePoint or Google Drive. See [Cloud Sync](#cloud-sync-optional).

---

## Documentation

Full usage documentation lives **inside the app**: click the book icon in the header, or open `/docs` directly. It covers every concept with live, interactive examples.

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

Access at `http://localhost:5173`. Use <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop.

---

## Cloud Sync (Optional)

CommandPad can export/import runbooks straight to SharePoint or Google Drive, in addition to the local device. Both are entirely optional: the app works normally with neither configured, and a provider only appears as a destination option once it's set up below.

Runbooks are stored as flat files inside a dedicated `CommandPad` folder in the signed-in account's own storage.

### SharePoint / OneDrive

1. In the [Azure Portal](https://portal.azure.com), go to **Microsoft Entra ID > App registrations > New registration**.
2. Set the **Redirect URI** platform to **Single-page application (SPA)** and its value to the URL CommandPad is served from (e.g. `http://localhost:5173`).
3. Under **API permissions**, add the delegated permissions **User.Read** and **Files.ReadWrite.AppFolder** (no admin consent is normally required for these).
4. Copy the **Application (client) ID** from the app's Overview page.
5. Set `VITE_MSAL_CLIENT_ID` to that value in a `.env.local` file (copy `.env.example` as a starting point), then rebuild. `VITE_MSAL_TENANT_ID` is optional and restricts sign-in to a single organization; it defaults to allowing any Microsoft account.

---

### Google Drive

1. In the [Google Cloud Console](https://console.cloud.google.com), create (or pick) a project, then open **APIs & Services > OAuth consent screen** and configure it.
2. Go to **Credentials > Create Credentials > OAuth client ID**, choose **Web application**, and add the URL CommandPad is served from under **Authorized JavaScript origins**.
3. Copy the generated **Client ID**.
4. Set `VITE_GOOGLE_CLIENT_ID` to that value in a `.env.local` file, then rebuild.

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
