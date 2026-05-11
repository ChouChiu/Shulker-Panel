import * as vscode from "vscode";
import { getAutoRefresh, getShowWarning, getSrdkPath } from "./config";
import { ProjectDetector } from "./detector/projectDetector";
import { TaskDetector } from "./detector/taskDetector";
import { TerminalManager } from "./executor/terminalManager";
import { TaskTreeProvider } from "./panel/taskTreeProvider";
import { CommandTreeItem, TaskTreeItem } from "./panel/treeItem";

let projectDetector: ProjectDetector;
let taskDetector: TaskDetector;
let treeProvider: TaskTreeProvider;
let terminalManager: TerminalManager;
let treeView: vscode.TreeView<vscode.TreeItem>;

export function activate(context: vscode.ExtensionContext): void {
  // Initialize detectors
  projectDetector = new ProjectDetector();
  taskDetector = new TaskDetector();
  treeProvider = new TaskTreeProvider(taskDetector);

  // Initialize terminal manager
  terminalManager = new TerminalManager(getSrdkPath());

  // Register TreeView
  treeView = vscode.window.createTreeView("shulkerPanel.tasks", {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  // Register all commands
  registerCommands(context);

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("shulkerPanel.srdkPath")) {
        terminalManager.setSrdkPath(getSrdkPath());
      }
      if (e.affectsConfiguration("shulkerPanel.autoRefresh") || e.affectsConfiguration("shulkerPanel")) {
        refreshPanel();
      }
    }),
  );

  // Initial project detection and panel refresh
  refreshPanel();
}

export function deactivate(): void {
  if (taskDetector) {
    taskDetector.dispose();
  }
  if (terminalManager) {
    terminalManager.dispose();
  }
}

// ─── Panel Refresh ────────────────────────────────────────────────

async function refreshPanel(): Promise<void> {
  const info = await projectDetector.detect();

  // Update TreeView message with project info
  if (info.isValid && info.name) {
    const typeLabel = info.type === "MP" ? "整合包" : info.type === "RP" ? "资源包" : "项目";
    treeView.message = `${typeLabel}: ${info.name} @${info.version ?? "?"}`;
  } else if (info.isValid) {
    treeView.message = "ShulkerRDK 项目已检测到";
  } else {
    treeView.message = getShowWarning() ? "⚠ 未检测到 ShulkerRDK 项目" : undefined;
  }

  // Refresh tree data
  await treeProvider.refresh(info);

  // Set up file watching if auto-refresh is enabled
  if (info.isValid && info.tasksDir && getAutoRefresh()) {
    taskDetector.watch(info.tasksDir);
    taskDetector.onDidChange(() => {
      treeProvider.refresh(projectDetector.getInfo()!);
    });
  }
}

// ─── Command Registration ─────────────────────────────────────────

function registerCommands(context: vscode.ExtensionContext): void {
  // Panel commands
  context.subscriptions.push(vscode.commands.registerCommand("shulkerPanel.refreshTasks", () => refreshPanel()));

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.runTask", (item: TaskTreeItem) => {
      if (item?.taskName) {
        terminalManager.runTask(item.taskName);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.runCommand", (item: CommandTreeItem) => {
      if (!item?.commandString) return;

      // Detect commands that need input based on the contextValue
      const cmd = item.commandString;

      if (item.contextValue === "commandItemWithInput") {
        handleInputCommand(cmd);
      } else {
        executeRawCommand(cmd);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.openTaskFile", (item: TaskTreeItem) => {
      if (item?.taskFilePath) {
        vscode.commands.executeCommand("vscode.open", vscode.Uri.file(item.taskFilePath));
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.copyCommand", (item: TaskTreeItem | CommandTreeItem) => {
      let commandStr = "";
      if (item instanceof TaskTreeItem) {
        commandStr = `srdk c task ${item.taskName}`;
      } else if (item instanceof CommandTreeItem) {
        commandStr = item.commandString;
      }
      if (commandStr) {
        vscode.env.clipboard.writeText(commandStr);
        vscode.window.showInformationMessage(`已复制: ${commandStr}`);
      }
    }),
  );

  // Quick Pick
  context.subscriptions.push(vscode.commands.registerCommand("shulkerPanel.runQuickPick", () => showQuickPick()));

  // ─── Build commands ───────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.build", () => terminalManager.runTask("build")),
    vscode.commands.registerCommand("shulkerPanel.dev", () => terminalManager.runTask("dev")),
    vscode.commands.registerCommand("shulkerPanel.publish", () => terminalManager.runTask("publish")),
    vscode.commands.registerCommand("shulkerPanel.run", () => terminalManager.runTask("run")),
  );

  // ─── Project commands ─────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.projInfo", () => executeRawCommand("srdk c proj i")),
    vscode.commands.registerCommand("shulkerPanel.projChname", () =>
      terminalManager.runWithInput("proj chname", [], "输入新的项目名称", "My Project"),
    ),
    vscode.commands.registerCommand("shulkerPanel.projChroot", () =>
      terminalManager.runWithInput("proj chroot", [], "输入新的资源根目录路径", "./src/"),
    ),
    vscode.commands.registerCommand("shulkerPanel.projChout", () =>
      terminalManager.runWithInput("proj chout", [], "输入新的输出目录路径", "./build/"),
    ),
  );

  // ─── Version commands ─────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.vermShow", () => executeRawCommand("srdk c verm show")),
    vscode.commands.registerCommand("shulkerPanel.vermSmajor", () => executeRawCommand("srdk c verm smajor")),
    vscode.commands.registerCommand("shulkerPanel.vermSminor", () => executeRawCommand("srdk c verm sminor")),
    vscode.commands.registerCommand("shulkerPanel.vermSfix", () => executeRawCommand("srdk c verm sfix")),
    vscode.commands.registerCommand("shulkerPanel.vermSet", () =>
      terminalManager.runWithInput("verm set", [], "输入版本号", "1.0.0"),
    ),
  );

  // ─── Env commands ─────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.envList", () => executeRawCommand("srdk c env list")),
    vscode.commands.registerCommand("shulkerPanel.envGet", () =>
      terminalManager.runWithInput("env get", [], "输入环境变量名", "project.name"),
    ),
    vscode.commands.registerCommand("shulkerPanel.envSet", () =>
      terminalManager.runWithTwoInputs("env set", "输入环境变量名", "my.var", "输入环境变量值", "value"),
    ),
    vscode.commands.registerCommand("shulkerPanel.envRemove", () =>
      terminalManager.runWithInput("env remove", [], "输入要删除的环境变量名", "my.var"),
    ),
  );

  // ─── Modrinth commands ────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.mrpSerialize", () => executeRawCommand("srdk c mrp s")),
    vscode.commands.registerCommand("shulkerPanel.mrpRestore", () => executeRawCommand("srdk c mrp r")),
    vscode.commands.registerCommand("shulkerPanel.mrpExport", () => executeRawCommand("srdk c mrp e")),
    vscode.commands.registerCommand("shulkerPanel.mrpAdd", () =>
      terminalManager.runWithInput("mrp add", [], "输入 Modrinth slug/URL 或项目ID", "sodium"),
    ),
    vscode.commands.registerCommand("shulkerPanel.mrpUpdate", () => executeRawCommand("srdk c mrp u")),
    vscode.commands.registerCommand("shulkerPanel.mrpLock", () =>
      terminalManager.runWithInput("mrp lock", [], "输入要锁定的文件名（部分匹配）", "sodium"),
    ),
    vscode.commands.registerCommand("shulkerPanel.mrpUnlock", () =>
      terminalManager.runWithInput("mrp unlock", [], "输入要解锁的文件名（部分匹配）", "sodium"),
    ),
    vscode.commands.registerCommand("shulkerPanel.mrpClean", () => executeRawCommand("srdk c mrp clean")),
  );
}

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Executes a raw srdk command string by parsing it into args.
 */
function executeRawCommand(commandString: string): void {
  // Parse command string: strip "srdk" and "c" prefixes — TerminalManager adds them back
  const parts = commandString.split(/\s+/);
  let args: string[];

  if (parts[0] === "srdk" || parts[0] === "srdk.exe" || parts[0] === "./srdk" || parts[0] === ".\\srdk.exe") {
    args = parts.slice(1);
  } else {
    args = parts;
  }

  // Strip the "c" subcommand — TerminalManager.executeCommand prepends it automatically
  if (args[0] === "c") {
    args = args.slice(1);
  }

  terminalManager.executeCommand(args);
}

/**
 * Handles commands that require user input based on the command type.
 */
function handleInputCommand(commandString: string): void {
  const parts = commandString.split(/\s+/);
  // Strip srdk prefix
  const cmdParts = parts[0] === "srdk" || parts[0] === "srdk.exe" ? parts.slice(1) : parts;
  // cmdParts example: ["c", "proj", "chname"]

  const command = cmdParts.slice(1).join(" "); // "proj chname"

  // Determine input type based on command
  if (command.startsWith("env set")) {
    terminalManager.runWithTwoInputs("env set", "环境变量名", "key", "环境变量值", "value");
  } else if (command.startsWith("env get")) {
    terminalManager.runWithInput("env get", [], "环境变量名", "key");
  } else if (command.startsWith("env remove")) {
    terminalManager.runWithInput("env remove", [], "要删除的变量名", "key");
  } else if (command.startsWith("verm set")) {
    terminalManager.runWithInput("verm set", [], "版本号", "1.0.0");
  } else if (command.startsWith("proj chname")) {
    terminalManager.runWithInput("proj chname", [], "项目名称", "My Project");
  } else if (command.startsWith("proj chroot")) {
    terminalManager.runWithInput("proj chroot", [], "资源根目录", "./src/");
  } else if (command.startsWith("proj chout")) {
    terminalManager.runWithInput("proj chout", [], "输出目录", "./build/");
  } else if (command.startsWith("mrp add")) {
    terminalManager.runWithInput("mrp add", [], "Modrinth slug/URL", "sodium");
  } else if (command.startsWith("mrp lock")) {
    terminalManager.runWithInput("mrp lock", [], "文件名匹配", "");
  } else if (command.startsWith("mrp unlock")) {
    terminalManager.runWithInput("mrp unlock", [], "文件名匹配", "");
  } else {
    // Generic: just ask for input
    terminalManager.runWithInput(command, [], "输入参数", "");
  }
}

/**
 * Shows a quick pick to select and run tasks or commands.
 */
async function showQuickPick(): Promise<void> {
  const info = projectDetector.getInfo();
  if (!info?.isValid) {
    vscode.window.showWarningMessage("当前工作区不是 ShulkerRDK 项目");
    return;
  }

  const tasks = taskDetector.getTasks();
  const items: vscode.QuickPickItem[] = [];

  // Add discovered tasks
  for (const task of tasks) {
    if (!task.isConfig) {
      items.push({
        label: `$(file-code) ${task.name}`,
        description: `任务 — ${task.description || task.filePath}`,
        detail: `srdk c task ${task.name}`,
      });
    }
  }

  // Add build commands
  for (const cmd of ["build", "dev", "publish", "run"]) {
    items.push({
      label: `$(rocket) ${cmd}`,
      description: "构建命令",
      detail: `srdk ${cmd}`,
    });
  }

  // Add proj commands
  for (const cmd of ["proj i", "verm show", "env list"]) {
    items.push({
      label: `$(info) ${cmd}`,
      description: "信息查询",
      detail: `srdk c ${cmd}`,
    });
  }

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "选择要执行的任务或命令...",
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (!selected) return;

  // Execute based on detail
  if (selected.detail) {
    executeRawCommand(selected.detail);
  }
}
