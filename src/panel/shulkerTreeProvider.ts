import * as vscode from "vscode";
import { type Feature, type FeatureContext, isFeatureEnabled } from "../core/feature";
import { localize } from "../core/localize";
import { runAction } from "../core/srdk/action";
import { CategoryTreeItem, CommandTreeItem, TaskTreeItem } from "./treeItems";

/**
 * TreeDataProvider for the Shulker Panel sidebar view.
 * Each enabled feature contributes at most one root category.
 */
export class ShulkerTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private rootItems: vscode.TreeItem[] = [];

  constructor(
    private readonly features: Feature[],
    private readonly ctx: FeatureContext,
  ) {}

  /**
   * Rebuilds the tree from the current project info and scanned tasks.
   */
  refresh(): void {
    const project = this.ctx.project();
    this.rootItems = this.features
      .filter((feature) => isFeatureEnabled(feature, project))
      .map((feature) => feature.category?.(this.ctx))
      .filter((item): item is CategoryTreeItem => item !== undefined);
    this._onDidChangeTreeData.fire(undefined);
  }

  // --- TreeDataProvider implementation ---

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    if (!element) {
      return this.rootItems;
    }
    if (element instanceof CategoryTreeItem) {
      return element.children;
    }
    return [];
  }

  getParent(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> {
    return findParent(this.rootItems, element);
  }
}

function findParent(items: vscode.TreeItem[], element: vscode.TreeItem): vscode.TreeItem | null {
  for (const item of items) {
    if (!(item instanceof CategoryTreeItem)) continue;
    if (item.children.includes(element)) return item;
    const nested = findParent(item.children, element);
    if (nested) return nested;
  }
  return null;
}

/**
 * Registers the commands bound to generic tree items.
 */
export function registerPanelCommands(ctx: FeatureContext): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand("shulkerPanel.runCommand", (item: CommandTreeItem) => {
      if (item?.action) {
        runAction(item.action, ctx.terminal);
      }
    }),
    vscode.commands.registerCommand("shulkerPanel.copyCommand", (item: TaskTreeItem | CommandTreeItem) => {
      const commandLine = item instanceof TaskTreeItem || item instanceof CommandTreeItem ? item.commandLine : "";
      if (commandLine) {
        vscode.env.clipboard.writeText(commandLine);
        vscode.window.showInformationMessage(localize("Copied: {0}", commandLine));
      }
    }),
  ];
}
