# Shulker Panel — AI Agent Instructions

A VS Code extension for the [ShulkerRDK](https://github.com/LiPolymer/Shulker-in-editor) Minecraft project framework. Provides a sidebar task panel, command shortcuts, and terminal integration for `.lvt` task files.

## Build & Quality

| Command         | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| `pnpm build`    | Compile TypeScript via esbuild → `dist/extension.js` |
| `pnpm watch`    | Build with `--watch` for development                 |
| `pnpm lint`     | Check with Biome                                     |
| `pnpm lint:fix` | Auto-fix lint issues                                 |
| `pnpm format`   | Format source with Biome                             |
| `pnpm package`  | Build + `vsce package` → `.vsix`                     |

- **Runtime target:** VS Code `^1.118.0`, Node 18+
- **Formatting:** Biome (2-space indent, double quotes, trailing commas, 120-char line width). Never add eslint or prettier configs.
- **TypeScript:** Strict mode, ES2022 target, CommonJS modules (required by VS Code extensions)
- **Bundle:** esbuild bundles everything into a single `dist/extension.js`. `vscode` module is externalized.

## Architecture

```
extension.ts          — activate/deactivate, command registration, wire-up
  config.ts            — VS Code settings access (shulkerPanel.*)
  detector/
    projectDetector.ts — scan workspace for shulker/ directory, parse proj.json
    taskDetector.ts    — scan shulker/tasks/ for .lvt files, watch for changes
  executor/
    terminalManager.ts — persistent "ShulkerRDK" terminal, wraps srdk CLI
  panel/
    taskTreeProvider.ts — TreeDataProvider for sidebar (6 categories + dynamic tasks)
    treeItem.ts         — CategoryTreeItem, TaskTreeItem, CommandTreeItem models
```

**Three-layer design:** Detection → Execution → UI Panel. Extension entry is `src/extension.ts`, output is `dist/extension.js`.

## Key Conventions

### Tree Item Routing via `contextValue`
Commands are dispatched through `contextValue` on tree items. When adding commands to `package.json`, match the `when` clause to the item's contextValue:
- `taskItem` — runnable `.lvt` task
- `configItem` — config file (no run action)
- `commandItem` — command without input
- `commandItemWithInput` — command that prompts for input
- `category` — folder (no actions)

### Platform-Aware Binary Path
The `srdk` binary is named `srdk.exe` on Windows, `srdk` on Unix. `TerminalManager.platformAwarePath()` handles this. Always use this method when referencing the binary path.

### Chinese UI Labels
All tree labels, tooltips, and user-facing prompts are in Simplified Chinese. This is intentional, not missing i18n.

### Persistent Terminal
One named "ShulkerRDK" terminal is reused across commands. Use `TerminalManager` for all srdk execution — never spawn ad-hoc terminals.

## Pitfalls

- **Cached project detection:** `ProjectDetector.getInfo()` caches result. Call `detect()` first if project structure may have changed.
- **Single workspace folder:** Only `workspace.workspaceFolders?.[0]` is used. Multi-root workspaces are not supported.
- **No srdk existence check:** Extension assumes the binary exists at the configured path. Commands fail silently if not found.
- **File watching debounce:** 300ms debounce on `.lvt` file watcher. Rapid file creates are coalesced.
