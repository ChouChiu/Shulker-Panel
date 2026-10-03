# Shulker Panel

[English](README.md) | 中文

面向 ShulkerRDK 项目的 VS Code 扩展，提供侧边栏任务面板、命令快捷操作，以及对 `.lvt` 任务文件的终端集成。

## 功能

- **任务面板** — 列出 `shulker/tasks/*.lvt`，标出 `build` / `dev` / `publish` / `run` 别名，`_` 开头的子任务折叠到单独分组
- **核心命令** — `proj`、`verm`、`env`、`netfile`、`ext` 与 `help c`，必填与可选参数通过输入框填写
- **按扩展显示分组** — 项目声明或安装了对应扩展时才显示 Modrinth（`mrp`）、Prismarine（`pfm`）、Aseprite（`ase`）、ResourceMagick（`png2psd`）
- **快速执行** — 一个选择器汇总任务与所有可用命令
- **持久终端** — 复用名为 `ShulkerRDK` 的终端，调用项目启动器（Unix 为 `./srdk`，Windows 为 `.\srdk.bat` 或旧版 `.\srdk.exe`）
- **自动刷新** — 监听 `.lvt` 文件与 `shulker/proj.json`
- **工作区信任** — srdk 命令只在受信任的工作区执行，受限模式下会提示管理工作区信任
- **本地化** — 英文与简体中文

## 安装

### 从 VSIX 安装

先从 [Release](https://github.com/ChouChiu/Shulker-Panel/releases/latest)下载或者构建 VSIX 包，再用 VS Code 安装：

```bash
bun run package
code --install-extension shulker-panel-1.0.0.vsix
# VS Code Insiders
code-insiders --install-extension shulker-panel-1.0.0.vsix
```

### 从源码安装

```bash
bun install
bun run build
bun run watch
```

## 配置项

| 设置                                 | 默认值 | 说明                               |
| ------------------------------------ | ------ | ---------------------------------- |
| `shulkerPanel.srdkPath`              | ``     | 启动器自定义路径，留空则从根目录自动检测 |
| `shulkerPanel.autoRefresh`           | `true` | `.lvt` 或 `proj.json` 变化时自动刷新面板 |
| `shulkerPanel.showNonProjectWarning` | `true` | 在不是 ShulkerRDK 项目时显示警告。 |

## 相关项目

- [ShulkerRDK](https://github.com/LiPolymer/ShulkerRDK) — 这个扩展的宿主项目。
- [Levitate-Extension](https://github.com/ChouChiu/Levitate-Extension) — 推荐搭配的 Levitate DSL 扩展，提供语法高亮和语言服务器支持。

## 贡献

请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与贡献。

## 行为准则

本项目遵循 [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.zh-cn.md)。

## 许可证

代码：[MIT](../LICENSE) · [`assets/`](../assets/) 下图标：[保留所有权利](../LICENSE-ICONS)，作者 [LiPolymer](https://github.com/LiPolymer)。

## 致谢

感谢 [ShulkerRDK](https://github.com/LiPolymer/ShulkerRDK) 以及[图标](../assets/icon.svg)的作者 [LiPolymer](https://github.com/LiPolymer)。
