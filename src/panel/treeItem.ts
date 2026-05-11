import * as vscode from "vscode";
import { localize } from "../localize";

/**
 * Context values used for view/item/context menu when clauses.
 */
export const CONTEXT_TASK = "taskItem";
export const CONTEXT_CONFIG = "configItem";
export const CONTEXT_COMMAND = "commandItem";
export const CONTEXT_COMMAND_INPUT = "commandItemWithInput";

/**
 * A TreeItem representing a scanned .lvt task file.
 */
export class TaskTreeItem extends vscode.TreeItem {
  constructor(
    public readonly taskName: string,
    public readonly taskFilePath: string,
    description: string,
    lineCount: number,
    isConfig: boolean,
  ) {
    super(taskName, vscode.TreeItemCollapsibleState.None);

    if (isConfig) {
      this.label = `$(gear) ${taskName}`;
      this.description = `[${lineCount} lines] ${description}`;
      this.tooltip = localize("Config file: {0}\nClick to open", taskFilePath);
      this.iconPath = new vscode.ThemeIcon("settings-gear");
      this.contextValue = CONTEXT_CONFIG;
      this.command = {
        command: "shulkerPanel.openTaskFile",
        title: localize("Open Config File"),
        arguments: [this],
      };
    } else {
      this.label = `$(file-code) ${taskName}`;
      this.description = `[${lineCount} lines]`;
      this.tooltip = description
        ? localize("Task: {0}\n{1}\n{2}", taskName, description, taskFilePath)
        : localize("Task: {0}\n{1}", taskName, taskFilePath);
      this.iconPath = this.getTaskIcon(taskName);
      this.contextValue = CONTEXT_TASK;
      this.command = {
        command: "shulkerPanel.runTask",
        title: localize("Run Task"),
        arguments: [this],
      };
    }
  }

  private getTaskIcon(name: string): vscode.ThemeIcon {
    const lower = name.toLowerCase();
    if (lower.includes("build")) return new vscode.ThemeIcon("tools");
    if (lower.includes("dev")) return new vscode.ThemeIcon("zap");
    if (lower.includes("deploy") || lower.includes("publish")) return new vscode.ThemeIcon("package");
    if (lower.includes("run") || lower.includes("start")) return new vscode.ThemeIcon("play");
    if (lower.includes("test")) return new vscode.ThemeIcon("beaker");
    if (lower.includes("clean")) return new vscode.ThemeIcon("clear-all");
    if (lower.includes("hot") || lower.includes("partial")) return new vscode.ThemeIcon("sync");
    return new vscode.ThemeIcon("file-code");
  }
}

/**
 * A TreeItem representing a clickable command in the panel.
 */
export class CommandTreeItem extends vscode.TreeItem {
  constructor(
    public readonly commandLabel: string,
    public readonly commandString: string,
    iconId: string,
    requiresInput: boolean,
  ) {
    super(commandLabel, vscode.TreeItemCollapsibleState.None);

    this.description = commandString;
    this.tooltip = localize("Execute: {0}", commandString);
    this.iconPath = new vscode.ThemeIcon(iconId);
    this.contextValue = requiresInput ? CONTEXT_COMMAND_INPUT : CONTEXT_COMMAND;
    this.command = {
      command: "shulkerPanel.runCommand",
      title: localize("Run Command"),
      arguments: [this],
    };
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
    this.contextValue = "category";
  }
}
