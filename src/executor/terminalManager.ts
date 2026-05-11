import * as vscode from "vscode";

/**
 * Manages a persistent "ShulkerRDK" terminal for executing srdk commands.
 */
export class TerminalManager {
  private terminal: vscode.Terminal | null = null;
  private srdkPath: string;

  private static readonly TERMINAL_NAME = "ShulkerRDK";

  constructor(srdkPath: string) {
    this.srdkPath = srdkPath;
  }

  /**
   * Updates the srdk path (e.g., when configuration changes).
   */
  setSrdkPath(srdkPath: string): void {
    this.srdkPath = srdkPath;
  }

  /**
   * Executes a srdk command in the terminal.
   * @param args - Command arguments (e.g., ["task", "build"])
   * @param cwd - Working directory (defaults to workspace root)
   */
  executeCommand(args: string[], cwd?: string): void {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const workingDir = cwd ?? workspaceFolder?.uri.fsPath;

    // Build the full command: <srdkPath> c <args...>
    const srdkExec = this.platformAwarePath(this.srdkPath);
    const quotedArgs = args.map((a) => (a.includes(" ") ? `"${a}"` : a));
    const fullCommand = [srdkExec, "c", ...quotedArgs].join(" ");

    // Create or reuse terminal
    if (!this.terminal || this.terminal.exitStatus !== undefined) {
      this.terminal = vscode.window.createTerminal({
        name: TerminalManager.TERMINAL_NAME,
        cwd: workingDir,
      });
    }

    this.terminal.show(true);
    this.terminal.sendText(fullCommand);
  }

  /**
   * Executes a Levitate task by task name.
   * Equivalent to: srdk c task <taskName>
   */
  runTask(taskName: string): void {
    this.executeCommand(["task", taskName]);
  }

  /**
   * Executes a command that requires user input for one parameter.
   * @param command - The command to run (e.g., "proj chname")
   * @param commandArgs - Fixed arguments before the user input
   * @param prompt - The input box prompt text
   * @param placeholder - The input box placeholder
   */
  async runWithInput(command: string, commandArgs: string[], prompt: string, placeholder?: string): Promise<void> {
    const input = await vscode.window.showInputBox({
      prompt,
      placeHolder: placeholder,
      ignoreFocusOut: true,
    });

    if (input === undefined) {
      return; // User cancelled
    }

    // Split command into args and append user input
    const args = [...command.split(/\s+/), ...commandArgs];
    if (input.trim().length > 0) {
      args.push(input.trim());
    }

    this.executeCommand(args);
  }

  /**
   * Executes a command that requires two user inputs (e.g., env set key value).
   */
  async runWithTwoInputs(
    command: string,
    prompt1: string,
    placeholder1: string,
    prompt2: string,
    placeholder2: string,
  ): Promise<void> {
    const input1 = await vscode.window.showInputBox({
      prompt: prompt1,
      placeHolder: placeholder1,
      ignoreFocusOut: true,
    });

    if (input1 === undefined) {
      return; // User cancelled
    }

    const input2 = await vscode.window.showInputBox({
      prompt: prompt2,
      placeHolder: placeholder2,
      ignoreFocusOut: true,
    });

    if (input2 === undefined) {
      return; // User cancelled
    }

    const args = [...command.split(/\s+/)];
    if (input1.trim().length > 0) {
      args.push(input1.trim());
    }
    if (input2.trim().length > 0) {
      args.push(input2.trim());
    }

    this.executeCommand(args);
  }

  /**
   * Disposes the terminal.
   */
  dispose(): void {
    if (this.terminal) {
      this.terminal.dispose();
      this.terminal = null;
    }
  }

  /**
   * Returns a platform-appropriate path for the srdk binary.
   * On Windows, ensures we use the executable path correctly.
   */
  private platformAwarePath(p: string): string {
    if (process.platform === "win32") {
      // Use .\srdk.exe or full path
      if (p === "srdk" || p === "srdk.exe") {
        return ".\\srdk.exe";
      }
      return p;
    }
    // Unix: use ./srdk
    if (p === "srdk" || p === "srdk.exe") {
      return "./srdk";
    }
    return p;
  }
}
