# Contributing to Shulker Panel

English | [中文](CONTRIBUTING.zh-cn.md)

Thank you for your interest in contributing to Shulker Panel. This guide will help you get started.

Please note that this project is released with a [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Bun](https://bun.sh/) (package manager & bundler)
- [Visual Studio Code](https://code.visualstudio.com/)

## Getting Started

1. Clone the repository:

	```bash
	git clone https://github.com/LiPolymer/Shulker-in-editor.git
	cd Shulker-in-editor
	```

2. Install dependencies:

	```bash
	bun install
	```

3. Build the project:

	```bash
	bun run build
	```

4. Open the project in VS Code and press `F5` to launch the Extension Development Host.

## Project Architecture

The code is organized by feature: each feature owns its tree category, its srdk actions and the extension it depends on

| Module           | Path                                | Responsibility                                                               |
| ---------------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| **Entry**        | `src/extension.ts`                  | Wires features, registers commands and runs the refresh flow                 |
| **Project**      | `src/core/project/`                 | Reads `shulker/proj.json`, detects extensions, watches `.lvt`, `proj.json` and extensions |
| **srdk**         | `src/core/srdk/`                    | Resolves the launcher, reuses the terminal, declares and runs `SrdkAction`s  |
| **Feature API**  | `src/core/feature.ts`               | `Feature` interface and `defineActionFeature` helper                         |
| **Panel**        | `src/panel/`                        | Tree provider, tree items and `contextValue` constants                       |
| **Features**     | `src/features/<name>/`              | Tasks, project, version, env, netfile, Modrinth, Prismarine and more         |
| **Localization** | `src/core/localize.ts`, `l10n/`     | English and Simplified Chinese strings                                       |

## Development Workflow

### Build

Builds the extension bundle:

```bash
bun run build
```

### Watch Mode

Rebuilds automatically on file changes:

```bash
bun run watch
```

### Lint & Format

Biome handles linting and formatting:

```bash
bun run lint
bun run format
```

### Package

Build and package the extension into a `.vsix` file:

```bash
bun run package
```

## Debugging

### Extension Host

1. Open the project in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. Set breakpoints in `src/` as needed.
4. Use the Debug Console in the original VS Code window to inspect logs.

The launch configuration runs `bun run build` before opening the host.

## Adding Features

### Adding a srdk Command

1. Add a `SrdkAction` (`label`, `icon`, `args`, optional `inputs`) to the matching feature in `src/features/<name>/index.ts`
2. Set `commandId` only if the action should also appear in the command palette, then contribute it in `package.json`
3. Add localized strings to both `l10n/bundle.l10n.json` and `l10n/bundle.l10n.zh-cn.json`

### Adding a Feature

1. Create `src/features/<name>/index.ts` with `defineActionFeature`, or implement `Feature` directly for custom trees and commands
2. Set `requires` to the extension assembly name (e.g. `ShulkerRDK.Modrinth`) if the commands come from an external extension
3. Add the feature to `src/features/index.ts` in display order
4. Update the README if the feature changes user-facing behavior

### Adding a New Setting

1. Add the configuration entry in `package.json`.
2. Add localized descriptions in the `l10n/` bundle files.
3. Document the setting in the README configuration table.

## Project Structure

```
Shulker-in-editor/
├── src/
│   ├── extension.ts
│   ├── core/
│   │   ├── config.ts
│   │   ├── localize.ts
│   │   ├── feature.ts
│   │   ├── project/
│   │   └── srdk/
│   ├── panel/
│   └── features/
│       ├── tasks/
│       ├── project/
│       ├── version/
│       ├── env/
│       ├── netfile/
│       ├── extensions/
│       ├── init/
│       ├── modrinth/
│       ├── prismarine/
│       ├── aseprite/
│       ├── magick/
│       └── quickPick/
├── assets/
├── l10n/
├── package.json
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
