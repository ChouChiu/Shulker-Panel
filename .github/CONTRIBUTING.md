# Contributing to Shulker Panel

English | [中文](CONTRIBUTING.zh-cn.md)

Thank you for your interest in contributing to Shulker Panel. This guide will help you get started.

Please note that this project is released with a [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/) (package manager)
- [Visual Studio Code](https://code.visualstudio.com/)

## Getting Started

1. Clone the repository:

	```bash
	git clone https://github.com/LiPolymer/Shulker-in-editor.git
	cd Shulker-in-editor
	```

2. Install dependencies:

	```bash
	pnpm install
	```

3. Build the project:

	```bash
	pnpm build
	```

4. Open the project in VS Code and press `F5` to launch the Extension Development Host.

## Project Architecture

| Module           | Path                              | Responsibility                                                        |
| ---------------- | --------------------------------- | --------------------------------------------------------------------- |
| **Extension**    | `src/extension.ts`                | Activates the extension, registers commands, and refreshes the panel. |
| **Detectors**    | `src/detector/`                   | Detects ShulkerRDK projects and `.lvt` task files.                    |
| **Executor**     | `src/executor/terminalManager.ts` | Reuses the persistent terminal and runs `srdk`.                       |
| **Panel**        | `src/panel/`                      | Renders the sidebar tree and tree items.                              |
| **Localization** | `src/localize.ts`, `l10n/`        | Supplies English and Simplified Chinese strings.                      |

## Development Workflow

### Build

Builds the extension bundle:

```bash
pnpm build
```

### Watch Mode

Rebuilds automatically on file changes:

```bash
pnpm watch
```

### Lint & Format

Biome handles linting and formatting:

```bash
pnpm lint
pnpm format
```

### Package

Build and package the extension into a `.vsix` file:

```bash
pnpm package
```

## Debugging

### Extension Host

1. Open the project in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. Set breakpoints in `src/` as needed.
4. Use the Debug Console in the original VS Code window to inspect logs.

The launch configuration runs `pnpm build` before opening the host.

## Adding Features

### Adding a New Command

1. Register the command in `package.json`.
2. Implement the handler in `src/extension.ts` or the relevant module.
3. Add localized titles to `l10n/bundle.l10n.json` and `l10n/bundle.l10n.zh-cn.json`.

### Adding a New Task Action

1. Update the detector or tree provider in `src/detector/` or `src/panel/`.
2. Add the action to the command registration list if it needs user access.
3. Update the README if the action changes user-facing behavior.

### Adding a New Setting

1. Add the configuration entry in `package.json`.
2. Add localized descriptions in the `l10n/` bundle files.
3. Document the setting in the README configuration table.

## Project Structure

```
Shulker-in-editor/
├── src/
│   ├── extension.ts
│   ├── config.ts
│   ├── localize.ts
│   ├── detector/
│   ├── executor/
│   └── panel/
├── assets/
├── l10n/
├── package.json
├── esbuild.config.mts
├── biome.json
└── dist/                    # Build output
```

## Code Style

- **Formatter**: Biome with 2-space indentation and double quotes.
- **TypeScript**: Strict mode with ES2022 targeting and CommonJS modules.
- **UI Text**: Keep user-facing labels, prompts, and tree text in Simplified Chinese.
- **Terminal**: Reuse `TerminalManager` for all `srdk` execution.

## Submitting Changes

1. Create a branch from `main`.
2. Make your changes, build, and test in VS Code.
3. Commit with a clear message.
4. Push your branch and open a Pull Request.

## Reporting Issues

If you find a bug or have a feature request, please open an issue with:

- A clear description of the problem or suggestion
- Steps to reproduce for bugs
- Expected and actual behavior
- VS Code version and operating system

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
