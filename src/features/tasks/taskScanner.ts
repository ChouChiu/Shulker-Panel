import * as vscode from "vscode";

/**
 * Represents a detected task from the shulker/tasks/ directory.
 */
export interface TaskInfo {
  /** Task name (filename without .lvt extension) */
  name: string;
  /** Absolute path to the .lvt file */
  filePath: string;
  /** Leading `#` comment, after any `import` lines */
  description: string;
  /** Number of lines in the file */
  lineCount: number;
  /** Whether this is a sub-task (`_` prefix) meant to be called with `run` from other tasks */
  isSubTask: boolean;
}

/**
 * Scans the shulker/tasks/ directory for .lvt task files.
 */
export class TaskScanner {
  private tasks: TaskInfo[] = [];

  /**
   * Scans shulker/tasks/ for .lvt files and parses task metadata. The result is cached only through `setTasks`.
   */
  async scan(tasksDir: string | undefined): Promise<TaskInfo[]> {
    if (!tasksDir) {
      return [];
    }

    const dirUri = vscode.Uri.file(tasksDir);
    let entries: [string, vscode.FileType][];
    try {
      entries = await vscode.workspace.fs.readDirectory(dirUri);
    } catch {
      return [];
    }

    const tasks: TaskInfo[] = [];
    for (const [fileName, type] of entries) {
      if (type !== vscode.FileType.File || !fileName.endsWith(".lvt")) continue;

      const fileUri = vscode.Uri.joinPath(dirUri, fileName);
      const name = fileName.replace(/\.lvt$/, "");
      let lines: string[] = [];
      try {
        const content = await vscode.workspace.fs.readFile(fileUri);
        lines = Buffer.from(content).toString("utf-8").split(/\r?\n/);
      } catch {
        // File might be unreadable — skip description
      }

      tasks.push({
        name,
        filePath: fileUri.fsPath,
        description: parseDescription(lines),
        lineCount: lines.length,
        isSubTask: name.startsWith("_"),
      });
    }

    tasks.sort((a, b) => a.name.localeCompare(b.name));
    return tasks;
  }

  /**
   * Caches the tasks returned by the latest completed scan.
   */
  setTasks(tasks: TaskInfo[]): void {
    this.tasks = tasks;
  }

  /**
   * Returns the last scanned tasks.
   */
  getTasks(): TaskInfo[] {
    return this.tasks;
  }
}

/**
 * Uses the first `#` comment as the description, skipping blank and `import` lines before it.
 */
function parseDescription(lines: string[]): string {
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("import ")) continue;
    return trimmed.startsWith("#") ? trimmed.replace(/^#+\s*/, "") : "";
  }
  return "";
}
