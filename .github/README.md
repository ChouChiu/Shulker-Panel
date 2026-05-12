# Shulker Panel

English | [中文](README.zh-cn.md)

VS Code extension for ShulkerRDK projects, providing a sidebar task panel, command shortcuts, and terminal integration for `.lvt` task files.

## Features

- **Task Panel** — Displays `.lvt` tasks in a sidebar tree and refreshes automatically when the workspace changes.
- **Command Shortcuts** — Runs tasks, copies commands, opens task files, and launches quick-pick execution.
- **Persistent Terminal** — Reuses the `ShulkerRDK` terminal for `srdk` commands.
- **Project Utilities** — Covers project info, name/root/output changes, version management, environment variables, and MRP actions.
- **Localization** — Ships English and Simplified Chinese text through VS Code localization files.

## Installation

### From VSIX

Download from [Release](https://github.com/ChouChiu/Shulker-Panel/releases/latest) or build a VSIX package and install it with VS Code:Dow

```bash
pnpm package
code --install-extension shulker-panel-1.0.0.vsix
# VS Code Insiders
code-insiders --install-extension shulker-panel-1.0.0.vsix
```

### From Source

```bash
pnpm install
pnpm build
pnpm watch
```

## Configuration

| Setting                              | Default | Description                                                    |
| ------------------------------------ | ------- | -------------------------------------------------------------- |
| `shulkerPanel.srdkPath`              | ``      | Custom path to `srdk` or `srdk.exe`.                           |
| `shulkerPanel.autoRefresh`           | `true`  | Refresh the panel automatically when `.lvt` files change.      |
| `shulkerPanel.showNonProjectWarning` | `true`  | Show a warning when the workspace is not a ShulkerRDK project. |

## Related Projects

- [ShulkerRDK](https://github.com/LiPolymer/ShulkerRDK) — Host project for this extension.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## License

Code: [MIT](LICENSE) · Icons under [`assets/`](assets/): [All Rights Reserved](LICENSE-ICONS) by [LiPolymer](https://github.com/LiPolymer).

## Acknowledgments

Thanks to [LiPolymer](https://github.com/LiPolymer), the author of [ShulkerRDK](https://github.com/LiPolymer/ShulkerRDK) and [icon](../assets/icon.svg).
