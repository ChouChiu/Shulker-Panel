# Shulker Panel 贡献指南

[English](CONTRIBUTING.md) | 中文

感谢你对 Shulker Panel 的关注！本指南将帮助你快速上手开发。

请注意，本项目发布了 [Contributor Covenant 行为准则](CODE_OF_CONDUCT.zh-cn.md)。参与本项目即表示你同意遵守其条款。

## 环境要求

- [Node.js](https://nodejs.org/)（推荐 LTS 版本）
- [Bun](https://bun.sh/)（包管理器 & 打包器）
- [Visual Studio Code](https://code.visualstudio.com/)

## 快速开始

1. 克隆仓库：

	```bash
	git clone https://github.com/LiPolymer/Shulker-in-editor.git
	cd Shulker-in-editor
	```

2. 安装依赖：

	```bash
	bun install
	```

3. 构建项目：

	```bash
	bun run build
	```

4. 在 VS Code 中打开项目，按 `F5` 启动 Extension Development Host。

## 项目架构

代码按功能组织：每个 feature 自带树分组、srdk 动作以及所依赖的 ShulkerRDK 扩展

| 模块           | 路径                            | 职责                                                      |
| -------------- | ------------------------------- | --------------------------------------------------------- |
| **扩展入口**   | `src/extension.ts`              | 组装 features、注册命令、执行刷新流程                     |
| **项目**       | `src/core/project/`             | 读取 `shulker/proj.json`、探测扩展、监听 `.lvt` 与 `proj.json` |
| **srdk**       | `src/core/srdk/`                | 解析启动器、复用终端、声明并执行 `SrdkAction`             |
| **Feature API** | `src/core/feature.ts`          | `Feature` 接口与 `defineActionFeature` 辅助函数           |
| **面板**       | `src/panel/`                    | 树提供器、树节点与 `contextValue` 常量                    |
| **功能**       | `src/features/<name>/`          | 任务、项目、版本、环境、netfile、Modrinth、Prismarine 等  |
| **本地化**     | `src/core/localize.ts`、`l10n/` | 英文与简体中文文本                                        |

## 开发流程

### 构建

构建扩展打包产物：

```bash
bun run build
```

### 监听模式

文件变更时自动重新构建：

```bash
bun run watch
```

### 代码检查与格式化

Biome 负责代码检查与格式化：

```bash
bun run lint
bun run format
```

### 打包

将扩展构建为 `.vsix` 文件：

```bash
bun run package
```

## 调试

### 扩展宿主

1. 在 VS Code 中打开项目。
2. 按 `F5` 启动 Extension Development Host。
3. 按需要在 `src/` 中设置断点。
4. 使用原始 VS Code 窗口中的 Debug Console 查看日志。

启动配置会在打开宿主前先运行 `bun run build`。

## 添加功能

### 添加 srdk 命令

1. 在 `src/features/<name>/index.ts` 对应 feature 中添加 `SrdkAction`（`label`、`icon`、`args`、可选 `inputs`）
2. 只有需要出现在命令面板时才设置 `commandId`，并在 `package.json` 中贡献该命令
3. 同时在 `l10n/bundle.l10n.json` 和 `l10n/bundle.l10n.zh-cn.json` 中添加本地化文本

### 添加 feature

1. 新建 `src/features/<name>/index.ts`，用 `defineActionFeature` 定义，需要自定义树或命令时直接实现 `Feature`
2. 命令来自外置扩展时，把 `requires` 设为扩展程序集名（如 `ShulkerRDK.Modrinth`）
3. 按显示顺序加入 `src/features/index.ts`
4. 如果行为对用户可见，更新 README

### 添加新设置

1. 在 `package.json` 中添加配置项。
2. 在 `l10n/` 的 bundle 文件中添加本地化说明。
3. 在 README 的配置表中记录该设置。

## 项目结构

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
│       ├── modrinth/
│       ├── prismarine/
│       ├── aseprite/
│       ├── magick/
│       └── quickPick/
├── assets/
├── l10n/
├── package.json
├── biome.json
└── dist/                    # 构建产物
```

## 代码风格

- **格式化工具**：Biome，使用 2 空格缩进和双引号。
- **TypeScript**：严格模式，目标为 ES2022，并使用 CommonJS 模块。
- **界面文本**：面向用户的标签、提示和树文本保持简体中文。
- **终端**：所有 `srdk` 执行都复用 `TerminalManager`。

## 提交变更

1. 从 `main` 创建一个分支。
2. 完成修改后，在 VS Code 中构建并测试。
3. 使用清晰的提交信息。
4. 推送分支并发起 Pull Request。

## 问题反馈

如果你发现了 bug 或有功能建议，请提交 issue，并包含：

- 问题或建议的清晰描述
- 针对 bug 的复现步骤
- 期望行为与实际行为
- VS Code 版本和操作系统

## 许可证

参与贡献即表示你同意你的贡献将依据 [MIT 许可证](LICENSE) 发布。
