# Shulker Panel

English | [中文](README.zh-cn.md)

VS Code extension for ShulkerRDK projects, providing a sidebar task panel, command shortcuts, and terminal integration for `.lvt` task files.

## Features

- **Task Panel** — Lists `shulker/tasks/*.lvt`, marks the `build` / `dev` / `publish` / `run` aliases, and folds `_`-prefixed sub-tasks into their own group
- **Core Commands** — `proj`, `verm`, `env`, `netfile`, `ext` and `help c`, with input boxes for required and optional parameters
- **Extension-aware Groups** — Shows Modrinth (`mrp`), Prismarine (`pfm`), Aseprite (`ase`) and ResourceMagick (`png2psd`) only when the project declares or installs that extension
- **Quick Run** — One picker over tasks and every available command
- **Persistent Terminal** — Reuses the `ShulkerRDK` terminal and runs the project launcher (`./srdk` on Unix, `.\srdk.bat` or legacy `.\srdk.exe` on Windows)
- **Auto Refresh** — Watches `.lvt` files and `shulker/proj.json`
- **Workspace Trust** — srdk commands only run in a trusted workspace; in Restricted Mode the panel offers to manage trust instead
- **Localization** — English and Simplified Chinese

## Installation

### From VSIX

Download from [Release](https://github.com/ChouChiu/Shulker-Panel/releases/latest) or build a VSIX package and install it with VS Code:Dow

```bash
bun run package
code --install-extension shulker-panel-1.0.0.vsix
# VS Code Insiders
code-insiders --install-extension shulker-panel-1.0.0.vsix
```

### From Source

```bash
bun install
bun run build
bun run watch
```

## Configuration

| Setting                              | Default | Description                                                    |
| ------------------------------------ | ------- | -------------------------------------------------------------- |
| `shulkerPanel.srdkPath`              | ``      | Custom launcher path; empty means auto-detect from the root    |
| `shulkerPanel.autoRefresh`           | `true`  | Refresh when `.lvt` files or `proj.json` change                |
| `shulkerPanel.showNonProjectWarning` | `true`  | Show a warning when the workspace is not a ShulkerRDK project. |

## Related Projects

- [ShulkerRDK](https://github.com/LiPolymer/ShulkerRDK) — Host project for this extension.
- [Levitate-Extension](https://github.com/ChouChiu/Levitate-Extension) — Recommended companion for Levitate DSL; provides syntax highlighting and language server support.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## License

Code: [MIT](../LICENSE) · Icons under [`assets/`](../assets/): [All Rights Reserved](../LICENSE-ICONS) by [LiPolymer](https://github.com/LiPolymer).

## Acknowledgments

Thanks to [LiPolymer](https://github.com/LiPolymer), the author of [ShulkerRDK](https://github.com/LiPolymer/ShulkerRDK) and [icon](../assets/icon.svg).
