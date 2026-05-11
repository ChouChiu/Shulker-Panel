import * as vscode from "vscode";

/**
 * Represents a detected task from the shulker/tasks/ directory.
 */
export interface TaskInfo {
  /** Task name (filename without .lvt extension) */
  name: string;
  /** Absolute path to the .lvt file */
  filePath: string;
  /** First non-comment line content as task description */
  description: string;
  /** Number of lines in the file */
  lineCount: number;
  /** Whether this is a configuration file (e.g., settings.lvt) */
  isConfig: boolean;
}

/**
 * Scans the shulker/tasks/ directory for .lvt task files
 * and watches for changes.
 */
export class TaskDetector {
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onDidChange.event;

  private watcher: vscode.FileSystemWatcher | null = null;
  private tasks: TaskInfo[] = [];

  // Names of .lvt files that are configuration, not executable tasks
  private static readonly CONFIG_TASKS = new Set(["settings"]);

  /**
   * Scans shulker/tasks/ for .lvt files and parses task metadata.
   */
  async scan(tasksDir: string): Promise<TaskInfo[]> {
    const dirUri = vscode.Uri.file(tasksDir);

    try {
      const entries = await vscode.workspace.fs.readDirectory(dirUri);
      const lvtFiles = entries.filter(([name, type]) => type === vscode.FileType.File && name.endsWith(".lvt"));

      const tasks: TaskInfo[] = [];

      for (const [fileName] of lvtFiles) {
        const filePath = vscode.Uri.joinPath(dirUri, fileName).fsPath;
        const taskName = fileName.replace(/\.lvt$/, "");
        const isConfig = TaskDetector.CONFIG_TASKS.has(taskName);

        let description = "";
        let lineCount = 0;

        try {
          const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
          const text = Buffer.from(content).toString("utf-8");
          const lines = text.split(/\r?\n/);
          lineCount = lines.length;

          // Find the first non-comment, non-empty line as description
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length === 0) continue;
            if (trimmed.startsWith("#")) continue;
            description = trimmed;
            break;
          }
        } catch {
          // File might be unreadable — skip description
        }

        tasks.push({
          name: taskName,
          filePath,
          description,
          lineCount,
          isConfig,
        });
      }

      // Sort: config files last, then alphabetical
      tasks.sort((a, b) => {
        if (a.isConfig !== b.isConfig) {
          return a.isConfig ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });

      this.tasks = tasks;
      return tasks;
    } catch {
      this.tasks = [];
      return [];
    }
  }

  /**
   * Starts watching the tasks directory for changes.
   */
  watch(tasksDir: string): void {
    this.disposeWatcher();

    const pattern = new vscode.RelativePattern(vscode.Uri.file(tasksDir), "*.lvt");

    this.watcher = vscode.workspace.createFileSystemWatcher(pattern);

    // Debounce to avoid rapid refreshes
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedRefresh = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        this._onDidChange.fire();
      }, 300);
    };

    this.watcher.onDidCreate(() => debouncedRefresh());
    this.watcher.onDidDelete(() => debouncedRefresh());
    this.watcher.onDidChange(() => debouncedRefresh());
  }

  /**
   * Returns the last scanned tasks.
   */
  getTasks(): TaskInfo[] {
    return this.tasks;
  }

  /**
   * Disposes of the file watcher.
   */
  dispose(): void {
    this.disposeWatcher();
    this._onDidChange.dispose();
  }

  private disposeWatcher(): void {
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = null;
    }
  }
}
