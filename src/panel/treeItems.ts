import * as vscode from "vscode";
import { localize } from "../core/localize";
import { actionCommandLine, type SrdkAction } from "../core/srdk/action";
import { formatCommand } from "../core/srdk/terminalManager";
import type { TaskInfo } from "../features/tasks/taskScanner";

/**
 * Context values used for view/item/context menu when clauses.
 */
export const CONTEXT_TASK = "taskItem";
export const CONTEXT_SUB_TASK = "subTaskItem";
export const CONTEXT_COMMAND = "commandItem";
export const CONTEXT_COMMAND_INPUT = "commandItemWithInput";
export const CONTEXT_CATEGORY = "category";

/**
 * Task names with contributed shortcut commands (shulkerPanel.build etc.).
 */
export const ALIASED_TASKS = new Set(["build", "dev", "publish", "run"]);

/**
 * Task names ShulkerRDK accepts directly as startup actions, e.g. `srdk build`.
 */
const STARTUP_ALIASES = new Set(["build", "publish", "run"]);

/**
 * A TreeItem representing a scanned .lvt task file.
 * Sub-tasks (`_` prefix) are meant to be called with `run` from other tasks, so clicking opens them instead.
 */
export class TaskTreeItem extends vscode.TreeItem {
  readonly taskName: string;
  readonly taskFilePath: string;

  constructor(task: TaskInfo) {
    super(task.name, vscode.TreeItemCollapsibleState.None);
    this.taskName = task.name;
    this.taskFilePath = task.filePath;

    const alias = STARTUP_ALIASES.has(task.name) ? `srdk ${task.name}` : "";
    this.description = [alias, task.description].filter((part) => part.length > 0).join(" · ");
    this.tooltip = [
      localize("Task: {0}", task.name),
      task.description,
      localize("{0} lines", task.lineCount),
      task.filePath,
    ]
      .filter((part) => part.length > 0)
      .join("\n");

    if (task.isSubTask) {
      this.iconPath = new vscode.ThemeIcon("symbol-method");
      this.contextValue = CONTEXT_SUB_TASK;
      this.command = {
        command: "shulkerPanel.openTaskFile",
        title: localize("Open Task File"),
        arguments: [this],
      };
    } else {
      this.iconPath = getTaskIcon(task.name);
      this.contextValue = CONTEXT_TASK;
      this.command = {
        command: "shulkerPanel.runTask",
        title: localize("Run Task"),
        arguments: [this],
      };
    }
  }

  /**
   * The command line that runs this task.
   */
  get commandLine(): string {
    return formatCommand(["task", this.taskName]);
  }
}

function getTaskIcon(name: string): vscode.ThemeIcon {
  const lower = name.toLowerCase();
  if (lower.includes("build")) return new vscode.ThemeIcon("tools");
  if (lower.includes("dev")) return new vscode.ThemeIcon("zap");
  if (lower.includes("deploy") || lower.includes("publish")) return new vscode.ThemeIcon("package");
  if (lower.includes("update")) return new vscode.ThemeIcon("sync");
  if (lower.includes("run") || lower.includes("start")) return new vscode.ThemeIcon("play");
  if (lower.includes("test")) return new vscode.ThemeIcon("beaker");
  if (lower.includes("clean")) return new vscode.ThemeIcon("clear-all");
  if (lower.includes("hot") || lower.includes("partial")) return new vscode.ThemeIcon("sync");
  return new vscode.ThemeIcon("file-code");
}

/**
 * A TreeItem representing a clickable srdk action in the panel.
 */
export class CommandTreeItem extends vscode.TreeItem {
  constructor(public readonly action: SrdkAction) {
    super(action.label, vscode.TreeItemCollapsibleState.None);

    this.description = this.commandLine;
    this.tooltip = localize("Execute: {0}", this.commandLine);
    this.iconPath = new vscode.ThemeIcon(action.icon);
    this.contextValue = action.inputs?.length ? CONTEXT_COMMAND_INPUT : CONTEXT_COMMAND;
    this.command = {
      command: "shulkerPanel.runCommand",
      title: localize("Run Command"),
      arguments: [this],
    };
  }

  /**
   * The command line without user-provided parameters.
   */
  get commandLine(): string {
    return actionCommandLine(this.action);
  }
}

/**
 * A TreeItem representing a category group (expandable).
 */
export class CategoryTreeItem extends vscode.TreeItem {
  constructor(
    public readonly categoryName: string,
    iconId: string,
    public readonly children: vscode.TreeItem[],
    collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded,
  ) {
    super(categoryName, collapsibleState);

    this.iconPath = new vscode.ThemeIcon(iconId);
    this.contextValue = CONTEXT_CATEGORY;
  }
}
