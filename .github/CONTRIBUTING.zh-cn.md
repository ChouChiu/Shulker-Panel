# Shulker Panel 贡献指南

[English](CONTRIBUTING.md) | 中文

感谢你对 Shulker Panel 的关注！本指南将帮助你快速上手开发。

请注意，本项目发布了 [Contributor Covenant 行为准则](CODE_OF_CONDUCT.zh-cn.md)。参与本项目即表示你同意遵守其条款。

## 环境要求

- [Node.js](https://nodejs.org/)（推荐 LTS 版本）
- [pnpm](https://pnpm.io/)（包管理器）
- [Visual Studio Code](https://code.visualstudio.com/)

## 快速开始

1. 克隆仓库：

	```bash
	git clone https://github.com/LiPolymer/Shulker-in-editor.git
	cd Shulker-in-editor
	```

2. 安装依赖：

	```bash
	pnpm install
	```

3. 构建项目：

	```bash
	pnpm build
	```

4. 在 VS Code 中打开项目，按 `F5` 启动 Extension Development Host。

## 项目架构

| 模块         | 路径                              | 职责                                     |
| ------------ | --------------------------------- | ---------------------------------------- |
| **扩展入口** | `src/extension.ts`                | 激活扩展、注册命令并刷新任务面板。       |
| **检测器**   | `src/detector/`                   | 检测 ShulkerRDK 项目和 `.lvt` 任务文件。 |
| **执行器**   | `src/executor/terminalManager.ts` | 复用持久终端并执行 `srdk`。              |
| **面板**     | `src/panel/`                      | 渲染侧边栏树和树项。                     |
| **本地化**   | `src/localize.ts`、`l10n/`        | 提供英文和简体中文文本。                 |

## 开发流程

### 构建

构建扩展打包产物：

```bash
pnpm build
```

### 监听模式

文件变更时自动重新构建：

```bash
pnpm watch
```

### 代码检查与格式化

Biome 负责代码检查与格式化：

```bash
pnpm lint
pnpm format
```

### 打包

将扩展构建为 `.vsix` 文件：

```bash
pnpm package
```

## 调试

### 扩展宿主

1. 在 VS Code 中打开项目。
2. 按 `F5` 启动 Extension Development Host。
3. 按需要在 `src/` 中设置断点。
4. 使用原始 VS Code 窗口中的 Debug Console 查看日志。

启动配置会在打开宿主前先运行 `pnpm build`。

## 添加功能

### 添加新命令

1. 在 `package.json` 中注册命令。
2. 在 `src/extension.ts` 或相关模块中实现处理逻辑。
3. 在 `l10n/bundle.l10n.json` 和 `l10n/bundle.l10n.zh-cn.json` 中添加本地化标题。

### 添加新的任务操作

1. 在 `src/detector/` 或 `src/panel/` 中更新检测器或树提供器。
2. 如果需要让用户直接访问，将该操作加入命令注册列表。
3. 如果行为对用户可见，更新 README。

### 添加新设置

1. 在 `package.json` 中添加配置项。
2. 在 `l10n/` 的 bundle 文件中添加本地化说明。
3. 在 README 的配置表中记录该设置。

## 项目结构

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
