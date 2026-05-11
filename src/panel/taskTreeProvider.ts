import * as vscode from "vscode";
import type { ProjectInfo } from "../detector/projectDetector";
import type { TaskDetector, TaskInfo } from "../detector/taskDetector";
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
    this.projectInfo = projectInfo;

    // Re-scan tasks
    let taskInfos: TaskInfo[] = [];
    if (projectInfo.tasksDir) {
      taskInfos = await this.taskDetector.scan(projectInfo.tasksDir);
    }

    this.rootItems = this.buildTree(taskInfos, projectInfo);
    this._onDidChangeTreeData.fire();
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
      items.push(new CategoryTreeItem("任务 (Tasks)", "list-tree", taskItems));
    }

    // --- Build category ---
    const buildCommands: vscode.TreeItem[] = [
      new CommandTreeItem("Build", "srdk build", "tools", false),
      new CommandTreeItem("Dev", "srdk dev", "zap", false),
      new CommandTreeItem("Publish", "srdk publish", "package", false),
      new CommandTreeItem("Run", "srdk run", "run-all", false),
    ];
    items.push(new CategoryTreeItem("构建 (Build)", "rocket", buildCommands));

    // --- Project category ---
    const projCommands: vscode.TreeItem[] = [
      new CommandTreeItem("项目信息", "srdk c proj i", "info", false),
      new CommandTreeItem("修改项目名", "srdk c proj chname", "edit", true),
      new CommandTreeItem("修改资源根", "srdk c proj chroot", "folder-opened", true),
      new CommandTreeItem("修改输出目录", "srdk c proj chout", "folder", true),
    ];
    items.push(new CategoryTreeItem("项目 (Project)", "project", projCommands));

    // --- Version category ---
    const vermCommands: vscode.TreeItem[] = [
      new CommandTreeItem("查看版本", "srdk c verm show", "eye", false),
      new CommandTreeItem("主版本 +1", "srdk c verm smajor", "arrow-up", false),
      new CommandTreeItem("次版本 +1", "srdk c verm sminor", "arrow-up", false),
      new CommandTreeItem("修订号 +1", "srdk c verm sfix", "arrow-up", false),
      new CommandTreeItem("设置版本", "srdk c verm set", "edit", true),
    ];
    items.push(new CategoryTreeItem("版本 (Version)", "versions", vermCommands));

    // --- Environment category ---
    const envCommands: vscode.TreeItem[] = [
      new CommandTreeItem("列出变量", "srdk c env list", "list-unordered", false),
      new CommandTreeItem("获取变量", "srdk c env get", "search", true),
      new CommandTreeItem("设置变量", "srdk c env set", "edit", true),
      new CommandTreeItem("删除变量", "srdk c env remove", "trash", true),
    ];
    items.push(new CategoryTreeItem("环境 (Env)", "server-environment", envCommands));

    // --- Modrinth category (MP only) ---
    if (projectInfo.type === "MP") {
      const mrpCommands: vscode.TreeItem[] = [
        new CommandTreeItem("序列化 (mrp s)", "srdk c mrp s", "sync", false),
        new CommandTreeItem("还原 (mrp r)", "srdk c mrp r", "cloud-download", false),
        new CommandTreeItem("导出 (mrp e)", "srdk c mrp e", "export", false),
        new CommandTreeItem("添加资源 (mrp a)", "srdk c mrp a", "add", true),
        new CommandTreeItem("更新资源 (mrp u)", "srdk c mrp u", "sync-ignored", false),
        new CommandTreeItem("锁定 (mrp lock)", "srdk c mrp lock", "lock", true),
        new CommandTreeItem("解锁 (mrp unlock)", "srdk c mrp unlock", "unlock", true),
        new CommandTreeItem("清理缓存 (mrp clean)", "srdk c mrp clean", "clear-all", false),
      ];
      items.push(new CategoryTreeItem("Modrinth (MRP)", "package", mrpCommands));
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
