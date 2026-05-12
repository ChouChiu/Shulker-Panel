# Shulker Panel — AI Agent Instructions

VS Code extension for ShulkerRDK task-panel and terminal actions. For user-facing background, link instead of duplicating:
- [English README](.github/README.md)
- [中文 README](.github/README.zh-cn.md)
- [English contributing guide](.github/CONTRIBUTING.md)
- [中文 contributing guide](.github/CONTRIBUTING.zh-cn.md)

## Build & Quality

| Command         | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| `pnpm build`    | Bundle TypeScript to `dist/extension.js` with esbuild |
| `pnpm watch`    | Rebuild on file changes                               |
| `pnpm lint`     | Run Biome checks for `src/`                           |
| `pnpm lint:fix` | Run Biome checks with `--write` for `src/`            |
| `pnpm format`   | Run Biome formatter with `--write` for `src/`         |
| `pnpm package`  | Build and create a `.vsix` package                    |
| `pnpm publish`  | Build and publish a `.vsix` package                   |

- Runtime target: VS Code `^1.118.0`, Node 18+
- Formatting: Biome, 2-space indent, double quotes, trailing commas, 120-char line width. Do not add ESLint or Prettier configs.
- TypeScript: strict mode, ES2022 target, CommonJS modules
- Bundle: esbuild emits a single `dist/extension.js`; `vscode` stays external

## Architecture

```
src/extension.ts      — activate/deactivate, command registration, refresh flow
src/config.ts         — `shulkerPanel.*` settings
src/detector/         — project detection and `.lvt` file watching
src/executor/         — persistent ShulkerRDK terminal and `srdk` execution
src/panel/            — tree provider and tree item models
```

Three-layer design: Detection → Execution → UI Panel. Entry point: `src/extension.ts`. Build output: `dist/extension.js`.

## Codebase Rules

- Use `TerminalManager` for every `srdk` command. Never spawn ad-hoc terminals.
- Resolve the binary with `TerminalManager.platformAwarePath()` so Windows uses `srdk.exe`.
- Keep `contextValue` constants in `src/panel/treeItem.ts` in sync with `when` clauses in `package.json`.
- User-facing labels, tooltips, and prompts are Simplified Chinese.
- Keep command and setting titles/descriptions localized in `l10n/`; update both `bundle.l10n.json` and `bundle.l10n.zh-cn.json` together.
- Runtime strings that are not contributed metadata should go through `src/localize.ts`.
- The extension only reads `workspace.workspaceFolders?.[0]`; multi-root workspaces are not supported.
- `ProjectDetector.getInfo()` caches results; call `detect()` again after workspace or task-file changes.
- The extension does not preflight-check the configured `srdk` binary.
- `.lvt` file watching is debounced by 300ms.

## Editing Guidance

- Prefer small, local edits that preserve existing command ids and tree-item context values.
- When user-facing behavior changes, update the bilingual docs instead of duplicating instructions here.
- If a change touches command wiring, update `package.json`, `src/extension.ts`, and `src/panel/treeItem.ts` together.
