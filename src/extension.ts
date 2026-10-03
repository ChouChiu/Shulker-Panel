import * as vscode from "vscode";
import { CONFIG_SECTION, getAutoRefresh } from "./core/config";
import { type FeatureContext, isFeatureEnabled } from "./core/feature";
import { localize } from "./core/localize";
import { EXT_MODRINTH, ProjectDetector, type ProjectInfo } from "./core/project/projectDetector";
import { ProjectWatcher } from "./core/project/projectWatcher";
import { runAction } from "./core/srdk/action";
import { TerminalManager } from "./core/srdk/terminalManager";
import { features } from "./features";
import { createQuickPickFeature } from "./features/quickPick";
import { TaskScanner } from "./features/tasks/taskScanner";
import { registerPanelCommands, ShulkerTreeProvider } from "./panel/shulkerTreeProvider";

let projectDetector: ProjectDetector;
let taskScanner: TaskScanner;
let terminalManager: TerminalManager;
let projectWatcher: ProjectWatcher;
let treeProvider: ShulkerTreeProvider;
let treeView: vscode.TreeView<vscode.TreeItem>;

export function activate(context: vscode.ExtensionContext): void {
  projectDetector = new ProjectDetector();
  taskScanner = new TaskScanner();
  terminalManager = new TerminalManager(TerminalManager.platformAwarePath("srdk"));
  projectWatcher = new ProjectWatcher();

  const ctx: FeatureContext = {
    terminal: terminalManager,
    project: () =>
      projectDetector.getInfo() ?? { isValid: false, type: "generic", launcher: "", extensions: new Set() },
    tasks: () => taskScanner.getTasks(),
    refresh: () => refreshPanel(),
  };

  treeProvider = new ShulkerTreeProvider(features, ctx);
  treeView = vscode.window.createTreeView("shulkerPanel.tasks", {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  context.subscriptions.push(
    treeView,
    projectWatcher,
    projectWatcher.onDidChange(() => refreshPanel()),
    vscode.commands.registerCommand("shulkerPanel.refreshTasks", () => refreshPanel()),
    ...registerPanelCommands(ctx),
  );

  // Feature commands: contributed action commands plus each feature's own registrations
  for (const feature of [...features, createQuickPickFeature(features)]) {
    for (const action of feature.actions?.(ctx) ?? []) {
      if (action.commandId) {
        context.subscriptions.push(
          vscode.commands.registerCommand(action.commandId, () => {
            const project = ctx.project();
            if (isFeatureEnabled(feature, project)) {
              runAction(action, terminalManager);
            } else if (!project.isValid) {
              vscode.window.showWarningMessage(localize("Current workspace is not a ShulkerRDK project"));
            } else if (feature.requires) {
              vscode.window.showWarningMessage(localize("This command needs the {0} extension", feature.requires));
            }
          }),
        );
      }
    }
    context.subscriptions.push(...(feature.register?.(ctx) ?? []));
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_SECTION)) {
        refreshPanel();
      }
    }),
  );

  refreshPanel();
}

export function deactivate(): void {
  terminalManager?.dispose();
}

// ─── Panel Refresh ────────────────────────────────────────────────

async function refreshPanel(): Promise<void> {
  const info = await projectDetector.detect();
  terminalManager.setLauncher(info.launcher);
  await taskScanner.scan(info.isValid ? info.tasksDir : undefined);

  treeView.message = projectMessage(info);
  treeProvider.refresh();
  vscode.commands.executeCommand("setContext", "shulkerPanel.isProject", info.isValid);
  vscode.commands.executeCommand("setContext", "shulkerPanel.hasModrinth", info.extensions.has(EXT_MODRINTH));

  if (info.shulkerDir && getAutoRefresh()) {
    projectWatcher.watch(info.shulkerDir);
  } else {
    projectWatcher.stop();
  }
}

function projectMessage(info: ProjectInfo): string | undefined {
  if (info.isValid && info.name) {
    const typeLabel = info.type === "MP" ? localize("Modpack") : localize("Project");
    return localize("{0}: {1} @{2}", typeLabel, info.name, info.version ?? "?");
  }
  if (info.isValid) {
    return localize("ShulkerRDK project detected");
  }
  // VS Code hides the welcome view (with the init button) while a message is set
  return undefined;
}
