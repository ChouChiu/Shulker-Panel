import * as vscode from "vscode";
import type { ProjectInfo } from "../detector/projectDetector";
import type { TaskDetector, TaskInfo } from "../detector/taskDetector";
import { localize } from "../localize";
import { CategoryTreeItem, CommandTreeItem, TaskTreeItem } from "./treeItem";

/**
 * TreeDataProvider for the Shulker Panel sidebar view.
 *
 * Tree structure:
 *   📁 任务 (Tasks)        — scanned .lvt files
 *   📁 构建 (Build)         — srdk build/dev/publish/run
 *   📁 项目 (Project)       — proj info/chname/chroot/chout
 *   📁 版本 (Version)       — verm show/smajor/sminor/sfix/set
 *   📁 环境 (Env)           — env list/get/set/remove
 *   📁 Modrinth (MRP)       — mrp commands (MP projects only)
 */
export class TaskTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private taskDetector: TaskDetector;
  private rootItems: vscode.TreeItem[] = [];

  constructor(taskDetector: TaskDetector) {
    this.taskDetector = taskDetector;
  }

  /**
   * Refreshes the entire tree. Called when tasks change or project info updates.
   */
  async refresh(projectInfo: ProjectInfo): Promise<void> {
    // Re-scan tasks
    let taskInfos: TaskInfo[] = [];
    if (projectInfo.tasksDir) {
      taskInfos = await this.taskDetector.scan(projectInfo.tasksDir);
    }

    this.rootItems = this.buildTree(taskInfos, projectInfo);
    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * Builds the complete tree structure.
   */
  private buildTree(taskInfos: TaskInfo[], projectInfo: ProjectInfo): vscode.TreeItem[] {
    const items: vscode.TreeItem[] = [];

    // --- Tasks category ---
    if (taskInfos.length > 0) {
      const taskItems: vscode.TreeItem[] = taskInfos.map(
        (t) => new TaskTreeItem(t.name, t.filePath, t.description, t.lineCount, t.isConfig),
      );
      items.push(new CategoryTreeItem(`${localize("Tasks")} (Tasks)`, "list-tree", taskItems));
    }

    // --- Build category ---
    const buildCommands: vscode.TreeItem[] = [
      new CommandTreeItem(localize("Build"), "srdk build", "tools", false),
      new CommandTreeItem(localize("Dev"), "srdk dev", "zap", false),
      new CommandTreeItem(localize("Publish"), "srdk publish", "package", false),
      new CommandTreeItem(localize("Run"), "srdk run", "run-all", false),
    ];
    items.push(new CategoryTreeItem(`${localize("Build")} (Build)`, "rocket", buildCommands));

    // --- Project category ---
    const projCommands: vscode.TreeItem[] = [
      new CommandTreeItem(localize("Project Info"), "srdk c proj i", "info", false),
      new CommandTreeItem(localize("Change Project Name"), "srdk c proj chname", "edit", true),
      new CommandTreeItem(localize("Change Resource Root"), "srdk c proj chroot", "folder-opened", true),
      new CommandTreeItem(localize("Change Output Dir"), "srdk c proj chout", "folder", true),
    ];
    items.push(new CategoryTreeItem(`${localize("Project")} (Project)`, "project", projCommands));

    // --- Version category ---
    const vermCommands: vscode.TreeItem[] = [
      new CommandTreeItem(localize("Show Version"), "srdk c verm show", "eye", false),
      new CommandTreeItem(localize("Major +1"), "srdk c verm smajor", "arrow-up", false),
      new CommandTreeItem(localize("Minor +1"), "srdk c verm sminor", "arrow-up", false),
      new CommandTreeItem(localize("Patch +1"), "srdk c verm sfix", "arrow-up", false),
      new CommandTreeItem(localize("Set Version"), "srdk c verm set", "edit", true),
    ];
    items.push(new CategoryTreeItem(`${localize("Version")} (Version)`, "versions", vermCommands));

    // --- Environment category ---
    const envCommands: vscode.TreeItem[] = [
      new CommandTreeItem(localize("List Vars"), "srdk c env list", "list-unordered", false),
      new CommandTreeItem(localize("Get Var"), "srdk c env get", "search", true),
      new CommandTreeItem(localize("Set Var"), "srdk c env set", "edit", true),
      new CommandTreeItem(localize("Remove Var"), "srdk c env remove", "trash", true),
    ];
    items.push(new CategoryTreeItem(`${localize("Env")} (Env)`, "server-environment", envCommands));

    // --- Modrinth category (MP only) ---
    if (projectInfo.type === "MP") {
      const mrpCommands: vscode.TreeItem[] = [
        new CommandTreeItem(localize("Serialize (mrp s)"), "srdk c mrp s", "sync", false),
        new CommandTreeItem(localize("Restore (mrp r)"), "srdk c mrp r", "cloud-download", false),
        new CommandTreeItem(localize("Export (mrp e)"), "srdk c mrp e", "export", false),
        new CommandTreeItem(localize("Add Resource (mrp a)"), "srdk c mrp a", "add", true),
        new CommandTreeItem(localize("Update Resource (mrp u)"), "srdk c mrp u", "sync-ignored", false),
        new CommandTreeItem(localize("Lock (mrp lock)"), "srdk c mrp lock", "lock", true),
        new CommandTreeItem(localize("Unlock (mrp unlock)"), "srdk c mrp unlock", "unlock", true),
        new CommandTreeItem(localize("Clean Cache (mrp clean)"), "srdk c mrp clean", "clear-all", false),
      ];
      items.push(new CategoryTreeItem(localize("Modrinth (MRP)"), "package", mrpCommands));
    }

    return items;
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
    // Simple implementation: find the category that contains this item
    for (const root of this.rootItems) {
      if (root instanceof CategoryTreeItem && root.children.includes(element)) {
        return root;
      }
    }
    return null;
  }
}
