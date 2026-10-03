import * as vscode from "vscode";
import type { Feature, FeatureContext } from "../../core/feature";
import { localize } from "../../core/localize";
import { ALIASED_TASKS, CategoryTreeItem, TaskTreeItem } from "../../panel/treeItems";

/**
 * Levitate tasks from shulker/tasks/, including the build/dev/publish/run aliases.
 */
export const tasksFeature: Feature = {
  id: "tasks",

  category(ctx) {
    const tasks = ctx.tasks();
    if (tasks.length === 0) return undefined;

    const items: vscode.TreeItem[] = tasks.filter((t) => !t.isSubTask).map((t) => new TaskTreeItem(t));
    const subTasks = tasks.filter((t) => t.isSubTask).map((t) => new TaskTreeItem(t));
    if (subTasks.length > 0) {
      items.push(
        new CategoryTreeItem(
          localize("Sub-tasks"),
          "symbol-namespace",
          subTasks,
          vscode.TreeItemCollapsibleState.Collapsed,
        ),
      );
    }
    return new CategoryTreeItem(localize("Tasks"), "list-tree", items);
  },

  actions: () => [{ label: localize("List Tasks"), icon: "list-unordered", args: ["task", "list"] }],

  register(ctx) {
    const disposables = [
      vscode.commands.registerCommand("shulkerPanel.runTask", (item: TaskTreeItem) => {
        if (item?.taskName) {
          ctx.terminal.runTask(item.taskName);
        }
      }),
      vscode.commands.registerCommand("shulkerPanel.openTaskFile", (item: TaskTreeItem) => {
        if (item?.taskFilePath) {
          vscode.commands.executeCommand("vscode.open", vscode.Uri.file(item.taskFilePath));
        }
      }),
    ];

    for (const name of ALIASED_TASKS) {
      disposables.push(vscode.commands.registerCommand(`shulkerPanel.${name}`, () => runAliasedTask(ctx, name)));
    }
    return disposables;
  },
};

/**
 * Runs `task <name>` only when shulker/tasks/<name>.lvt exists, since the alias fails otherwise.
 */
function runAliasedTask(ctx: FeatureContext, name: string): void {
  if (!ctx.tasks().some((t) => t.name === name)) {
    vscode.window.showWarningMessage(localize("Task {0} not found in shulker/tasks/", name));
    return;
  }
  ctx.terminal.runTask(name);
}
