import * as vscode from "vscode";

/**
 * Watches the shulker/ files that affect the panel and fires a debounced change event:
 * proj.json, tasks/*.lvt, mrpack templates and installed extensions.
 */
export class ProjectWatcher implements vscode.Disposable {
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onDidChange.event;

  private watchers: vscode.FileSystemWatcher[] = [];
  private watchedDir: string | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Starts watching the given shulker/ directory. Calling it again with the same directory is a no-op.
   */
  watch(shulkerDir: string): void {
    if (this.watchedDir === shulkerDir) return;
    this.stop();
    this.watchedDir = shulkerDir;

    const base = vscode.Uri.file(shulkerDir);
    for (const glob of ["proj.json", "tasks/*.lvt", "mrpack*.template.json", "local/extensions/*", "extensions/*"]) {
      const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(base, glob));
      watcher.onDidCreate(() => this.fire());
      watcher.onDidDelete(() => this.fire());
      watcher.onDidChange(() => this.fire());
      this.watchers.push(watcher);
    }
  }

  /**
   * Stops watching.
   */
  stop(): void {
    for (const watcher of this.watchers) {
      watcher.dispose();
    }
    this.watchers = [];
    this.watchedDir = null;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  dispose(): void {
    this.stop();
    this._onDidChange.dispose();
  }

  // Debounce to avoid rapid refreshes
  private fire(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this._onDidChange.fire();
    }, 300);
  }
}
