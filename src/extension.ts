import * as vscode from "vscode";
import { getAutoRefresh, getShowWarning, getSrdkPath } from "./config";
import { ProjectDetector } from "./detector/projectDetector";
import { TaskDetector } from "./detector/taskDetector";
import { TerminalManager } from "./executor/terminalManager";
import { localize } from "./localize";
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
    const typeLabel =
      info.type === "MP" ? localize("Modpack") : info.type === "RP" ? localize("Resource Pack") : localize("Project");
    treeView.message = localize("{0}: {1} @{2}", typeLabel, info.name, info.version ?? "?");
  } else if (info.isValid) {
    treeView.message = localize("ShulkerRDK project detected");
  } else {
    treeView.message = getShowWarning() ? localize("⚠ No ShulkerRDK project detected") : undefined;
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
        vscode.window.showInformationMessage(localize("Copied: {0}", commandStr));
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
      terminalManager.runWithInput("proj chname", [], localize("Enter new project name"), "My Project"),
    ),
    vscode.commands.registerCommand("shulkerPanel.projChroot", () =>
      terminalManager.runWithInput("proj chroot", [], localize("Enter new resource root path"), "./src/"),
    ),
    vscode.commands.registerCommand("shulkerPanel.projChout", () =>
      terminalManager.runWithInput("proj chout", [], localize("Enter new output directory path"), "./build/"),
    ),
  );

  // ─── Version commands ─────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.vermShow", () => executeRawCommand("srdk c verm show")),
    vscode.commands.registerCommand("shulkerPanel.vermSmajor", () => executeRawCommand("srdk c verm smajor")),
    vscode.commands.registerCommand("shulkerPanel.vermSminor", () => executeRawCommand("srdk c verm sminor")),
    vscode.commands.registerCommand("shulkerPanel.vermSfix", () => executeRawCommand("srdk c verm sfix")),
    vscode.commands.registerCommand("shulkerPanel.vermSet", () =>
      terminalManager.runWithInput("verm set", [], localize("Enter version number"), "1.0.0"),
    ),
  );

  // ─── Env commands ─────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.envList", () => executeRawCommand("srdk c env list")),
    vscode.commands.registerCommand("shulkerPanel.envGet", () =>
      terminalManager.runWithInput("env get", [], localize("Enter env variable name"), "project.name"),
    ),
    vscode.commands.registerCommand("shulkerPanel.envSet", () =>
      terminalManager.runWithTwoInputs(
        "env set",
        localize("Enter env variable name"),
        "my.var",
        localize("Enter env variable value"),
        "value",
      ),
    ),
    vscode.commands.registerCommand("shulkerPanel.envRemove", () =>
      terminalManager.runWithInput("env remove", [], localize("Enter env variable to remove"), "my.var"),
    ),
  );

  // ─── Modrinth commands ────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("shulkerPanel.mrpSerialize", () => executeRawCommand("srdk c mrp s")),
    vscode.commands.registerCommand("shulkerPanel.mrpRestore", () => executeRawCommand("srdk c mrp r")),
    vscode.commands.registerCommand("shulkerPanel.mrpExport", () => executeRawCommand("srdk c mrp e")),
    vscode.commands.registerCommand("shulkerPanel.mrpAdd", () =>
      terminalManager.runWithInput("mrp add", [], localize("Enter Modrinth slug/URL or project ID"), "sodium"),
    ),
    vscode.commands.registerCommand("shulkerPanel.mrpUpdate", () => executeRawCommand("srdk c mrp u")),
    vscode.commands.registerCommand("shulkerPanel.mrpLock", () =>
      terminalManager.runWithInput("mrp lock", [], localize("Enter filename to lock (partial match)"), "sodium"),
    ),
    vscode.commands.registerCommand("shulkerPanel.mrpUnlock", () =>
      terminalManager.runWithInput("mrp unlock", [], localize("Enter filename to unlock (partial match)"), "sodium"),
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
    terminalManager.runWithTwoInputs(
      "env set",
      localize("Enter env variable name"),
      "key",
      localize("Enter env variable value"),
      "value",
    );
  } else if (command.startsWith("env get")) {
    terminalManager.runWithInput("env get", [], localize("Enter env variable name"), "key");
  } else if (command.startsWith("env remove")) {
    terminalManager.runWithInput("env remove", [], localize("Enter env variable to remove"), "key");
  } else if (command.startsWith("verm set")) {
    terminalManager.runWithInput("verm set", [], localize("Enter version number"), "1.0.0");
  } else if (command.startsWith("proj chname")) {
    terminalManager.runWithInput("proj chname", [], localize("Enter new project name"), "My Project");
  } else if (command.startsWith("proj chroot")) {
    terminalManager.runWithInput("proj chroot", [], localize("Enter new resource root path"), "./src/");
  } else if (command.startsWith("proj chout")) {
    terminalManager.runWithInput("proj chout", [], localize("Enter new output directory path"), "./build/");
  } else if (command.startsWith("mrp add")) {
    terminalManager.runWithInput("mrp add", [], localize("Enter Modrinth slug/URL or project ID"), "sodium");
  } else if (command.startsWith("mrp lock")) {
    terminalManager.runWithInput("mrp lock", [], localize("Enter filename to lock (partial match)"), "");
  } else if (command.startsWith("mrp unlock")) {
    terminalManager.runWithInput("mrp unlock", [], localize("Enter filename to unlock (partial match)"), "");
  } else {
    // Generic: just ask for input
    terminalManager.runWithInput(command, [], localize("Enter parameter"), "");
  }
}

/**
 * Shows a quick pick to select and run tasks or commands.
 */
async function showQuickPick(): Promise<void> {
  const info = projectDetector.getInfo();
  if (!info?.isValid) {
    vscode.window.showWarningMessage(localize("Current workspace is not a ShulkerRDK project"));
    return;
  }

  const tasks = taskDetector.getTasks();
  const items: vscode.QuickPickItem[] = [];

  // Add discovered tasks
  for (const task of tasks) {
    if (!task.isConfig) {
      items.push({
        label: `$(file-code) ${task.name}`,
        description: localize("Task — {0}", task.description || task.filePath),
        detail: `srdk c task ${task.name}`,
      });
    }
  }

  // Add build commands
  for (const cmd of ["build", "dev", "publish", "run"]) {
    items.push({
      label: `$(rocket) ${cmd}`,
      description: localize("Build command"),
      detail: `srdk ${cmd}`,
    });
  }

  // Add proj commands
  for (const cmd of ["proj i", "verm show", "env list"]) {
    items.push({
      label: `$(info) ${cmd}`,
      description: localize("Info query"),
      detail: `srdk c ${cmd}`,
    });
  }

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: localize("Select a task or command..."),
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (!selected) return;

  // Execute based on detail
  if (selected.detail) {
    executeRawCommand(selected.detail);
  }
}
