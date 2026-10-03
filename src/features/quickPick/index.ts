import * as vscode from "vscode";
import { type Feature, type FeatureContext, isFeatureEnabled } from "../../core/feature";
import { localize } from "../../core/localize";
import { actionCommandLine, runAction, type SrdkAction } from "../../core/srdk/action";
import { formatCommand } from "../../core/srdk/terminalManager";

interface QuickRunItem extends vscode.QuickPickItem {
  run: () => void;
}

/**
 * Quick Run — one picker over runnable tasks and every enabled feature's actions.
 */
export function createQuickPickFeature(features: Feature[]): Feature {
  return {
    id: "quickPick",
    register: (ctx) => [
      vscode.commands.registerCommand("shulkerPanel.runQuickPick", () => showQuickPick(ctx, features)),
    ],
  };
}

async function showQuickPick(ctx: FeatureContext, features: Feature[]): Promise<void> {
  const project = ctx.project();
  if (!project.isValid) {
    vscode.window.showWarningMessage(localize("Current workspace is not a ShulkerRDK project"));
    return;
  }

  const items: QuickRunItem[] = ctx
    .tasks()
    .filter((task) => !task.isSubTask)
    .map((task) => ({
      label: `$(file-code) ${task.name}`,
      description: task.description ? localize("Task — {0}", task.description) : localize("Task"),
      detail: formatCommand(["task", task.name]),
      run: () => ctx.terminal.runTask(task.name),
    }));

  for (const feature of features) {
    if (!isFeatureEnabled(feature, project)) continue;
    for (const action of feature.actions?.(ctx) ?? []) {
      items.push(toItem(action, ctx));
    }
  }

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: localize("Select a task or command..."),
    matchOnDescription: true,
    matchOnDetail: true,
  });
  selected?.run();
}

function toItem(action: SrdkAction, ctx: FeatureContext): QuickRunItem {
  return {
    label: `$(${action.icon}) ${action.label}`,
    detail: actionCommandLine(action),
    run: () => runAction(action, ctx.terminal),
  };
}
