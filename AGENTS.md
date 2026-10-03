# Shulker Panel — AI Agent Instructions

VS Code extension for ShulkerRDK task-panel and terminal actions. For user-facing background, link instead of duplicating:
- [English README](.github/README.md)
- [中文 README](.github/README.zh-cn.md)
- [English contributing guide](.github/CONTRIBUTING.md)
- [中文 contributing guide](.github/CONTRIBUTING.zh-cn.md)
- > READMEs under the root are SymbolicLink

## Build & Quality

| Command         | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| `bun run build`    | Bundle TypeScript to `dist/extension.js` with Bun |
| `bun run watch`    | Rebuild on file changes                            |
| `bun run lint`     | Run Biome checks for `src/`                        |
| `bun run lint:fix` | Run Biome checks with `--write` for `src/`         |
| `bun run format`   | Run Biome formatter with `--write` for `src/`      |
| `bun run package`  | Build and create a `.vsix` package                 |
| `bun run publish`  | Build and publish a `.vsix` package                |

- Runtime target: VS Code `^1.118.0`, Node 18+
- Formatting: Biome, 2-space indent, double quotes, trailing commas, 120-char line width. Do not add ESLint or Prettier configs.
- TypeScript: strict mode, ES2022 target, CommonJS modules
- Bundle: Bun emits a single `dist/extension.js`; `vscode` stays external

## Architecture

```
src/extension.ts      — activate/deactivate, wires features, refresh flow
src/core/config.ts    — `shulkerPanel.*` settings
src/core/feature.ts   — `Feature` interface, `defineActionFeature`
src/core/project/     — `proj.json` + extension detection, `.lvt` / `proj.json` watching
src/core/srdk/        — launcher resolution, persistent terminal, `SrdkAction`
src/panel/            — tree provider, tree items, `contextValue` constants
src/features/<name>/  — one folder per feature (tasks, project, version, env, netfile, extensions, init, modrinth, prismarine, aseprite, magick, quickPick)
```

Feature-driven: each feature declares its tree category, `SrdkAction`s and optional `requires` (extension assembly name such as `ShulkerRDK.Modrinth`). Entry point: `src/extension.ts`. Build output: `dist/extension.js`.

## Codebase Rules

- Declare srdk commands as `SrdkAction` in the owning feature and run them through `runAction` / `TerminalManager`. Never spawn ad-hoc terminals or parse command strings.
- Launcher resolution lives in `src/core/srdk/launcher.ts`: `shulkerPanel.srdkPath`, then root `srdk` (Unix) or `srdk.bat` / legacy `srdk.exe` (Windows). `TerminalManager.platformAwarePath()` turns bare names into `./srdk` / `.\srdk.bat`.
- Commands are always `<launcher> c <args...>`; the `build` / `dev` / `publish` / `run` aliases map to `task <name>` and only run when the `.lvt` exists.
- A project is valid when `shulker/proj.json` exists. Extensions come from `proj.json` `Extensions`, `shulker/local/extensions/<Asm>/` and legacy `shulker/extensions/<Asm>.dll`.
- Project init (`src/features/init/`) downloads launchers from upstream `main` (release tags may pin older binaries) and derives extension identifiers from the launcher's `RELEASE_SOURCE_ID`. The generated README follows `vscode.env.language` (zh / en).
- Leave `treeView.message` unset for non-projects: VS Code hides `viewsWelcome` (the init entry) while a message is set.
- `_`-prefixed tasks are sub-tasks: shown under a collapsed group, opened instead of run.
- `TerminalManager.exec()` refuses to send commands in an untrusted workspace (Restricted Mode terminals never run them); keep `capabilities.untrustedWorkspaces` as `limited`.
- Keep `contextValue` constants in `src/panel/treeItems.ts` in sync with `when` clauses in `package.json`.
- User-facing labels, tooltips, and prompts are Simplified Chinese.
- Keep command and setting titles/descriptions localized in `l10n/`; update both `bundle.l10n.json` and `bundle.l10n.zh-cn.json` together.
- Runtime strings that are not contributed metadata should go through `src/core/localize.ts`.
- The extension only reads `workspace.workspaceFolders?.[0]`; multi-root workspaces are not supported.
- `ProjectDetector.getInfo()` caches results; call `detect()` again after workspace or task-file changes.
- The extension does not preflight-check the configured `srdk` binary.
- `.lvt` and `proj.json` watching is debounced by 300ms.

## Editing Guidance

- Prefer small, local edits that preserve existing command ids and tree-item context values.
- When user-facing behavior changes, update the bilingual docs instead of duplicating instructions here.
- If a change touches command wiring, update `package.json`, the owning feature, and `src/panel/treeItems.ts` together.
