# Shulker Panel

[English](README.md) | 中文

面向 ShulkerRDK 项目的 VS Code 扩展，提供侧边栏任务面板、命令快捷操作，以及对 `.lvt` 任务文件的终端集成。

## 功能

- **任务面板** — 在侧边栏中显示 `.lvt` 任务，并在工作区变化时自动刷新。
- **命令快捷操作** — 执行任务、复制命令、打开任务文件，并提供快速执行入口。
- **持久终端** — 复用名为 `ShulkerRDK` 的终端执行 `srdk` 命令。
- **项目工具** — 支持项目信息、名称/资源根目录/输出目录、版本号、环境变量以及 MRP 相关操作。
- **本地化** — 通过 VS Code 本地化文件提供英文和简体中文文本。

## 安装

### 从 VSIX 安装

先从 [Release](https://github.com/ChouChiu/Shulker-Panel/releases/latest)下载或者构建 VSIX 包，再用 VS Code 安装：

```bash
pnpm package
code --install-extension shulker-panel-1.0.0.vsix
# VS Code Insiders
code-insiders --install-extension shulker-panel-1.0.0.vsix
```

### 从源码安装

```bash
pnpm install
pnpm build
pnpm watch
```

## 配置项

| 设置                                 | 默认值 | 说明                               |
| ------------------------------------ | ------ | ---------------------------------- |
| `shulkerPanel.srdkPath`              | ``     | `srdk` / `srdk.exe` 的自定义路径。 |
| `shulkerPanel.autoRefresh`           | `true` | 当 `.lvt` 文件变化时自动刷新面板。 |
| `shulkerPanel.showNonProjectWarning` | `true` | 在不是 ShulkerRDK 项目时显示警告。 |

## 相关项目

- [ShulkerRDK](https://github.com/LiPolymer/ShulkerRDK) — 这个扩展的宿主项目。

## 贡献

请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与贡献。

## 行为准则

本项目遵循 [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.zh-cn.md)。

## 许可证

代码：[MIT](LICENSE) · `assets/` 下图标：[保留所有权利](LICENSE-ICONS)，作者 [LiPolymer](https://github.com/LiPolymer)。

## 致谢

感谢 [ShulkerRDK](https://github.com/LiPolymer/ShulkerRDK) 以及[图标](../assets/icon.svg)的作者 [LiPolymer](https://github.com/LiPolymer)。
