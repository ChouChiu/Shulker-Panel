import * as vscode from "vscode";
import { platformAwarePath } from "./launcher";

/**
 * Quotes an argument when it contains whitespace, matching how ShulkerRDK splits parameters.
 */
function quoteArg(arg: string): string {
  return /\s/.test(arg) ? `"${arg}"` : arg;
}

/**
 * Builds the display form of a srdk command, e.g. `srdk c task build`.
 */
export function formatCommand(args: string[]): string {
  return ["srdk", "c", ...args.map(quoteArg)].join(" ");
}

/**
 * Manages a persistent "ShulkerRDK" terminal for executing srdk commands.
 */
export class TerminalManager {
  private terminal: vscode.Terminal | null = null;
  private launcher: string;

  private static readonly TERMINAL_NAME = "ShulkerRDK";

  constructor(launcher: string) {
    this.launcher = launcher;
  }

  /**
   * Returns a platform-appropriate path for the srdk launcher.
   */
  static platformAwarePath(p: string): string {
    return platformAwarePath(p);
  }

  /**
   * Updates the launcher (e.g., after re-detection or a configuration change).
   */
  setLauncher(launcher: string): void {
    this.launcher = launcher;
  }

  /**
   * Executes `<launcher> c <args...>` in the ShulkerRDK terminal.
   * @param args - Command arguments (e.g., ["task", "build"])
   */
  exec(args: string[]): void {
    const fullCommand = [this.launcher, "c", ...args.map(quoteArg)].join(" ");

    // Create or reuse terminal; srdk resolves project paths relative to the workspace root
    if (!this.terminal || this.terminal.exitStatus !== undefined) {
      this.terminal = vscode.window.createTerminal({
        name: TerminalManager.TERMINAL_NAME,
        cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
      });
    }

    this.terminal.show(true);
    this.terminal.sendText(fullCommand);
  }

  /**
   * Executes a Levitate task by name. Equivalent to: srdk c task <taskName>
   */
  runTask(taskName: string): void {
    this.exec(["task", taskName]);
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
}
