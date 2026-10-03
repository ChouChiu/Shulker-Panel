import * as vscode from "vscode";
import { localize } from "../localize";
import { platformAwarePath } from "./launcher";

/**
 * Characters that stay special inside double quotes in bash, fish, PowerShell or cmd, so they cannot be quoted safely.
 */
const UNQUOTABLE = /["`$%\r\n]/;

/**
 * Characters no supported shell treats specially, passed through unquoted; anything else is double-quoted.
 */
const PLAIN = /^[\p{L}\p{N}_.:/\\-]+$/u;

/**
 * Returns whether an argument can be sent to the terminal shell without being interpreted by it.
 */
export function isSafeArg(arg: string): boolean {
  return !UNQUOTABLE.test(arg);
}

/**
 * Double-quotes an argument unless it only contains plain characters, so shell operators reach srdk as text.
 */
function quoteArg(arg: string): string {
  return PLAIN.test(arg) ? arg : `"${arg}"`;
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
    // Restricted Mode terminals do not run sent text, so ask for trust instead of failing silently
    if (!vscode.workspace.isTrusted) {
      const manage = localize("Manage Workspace Trust");
      vscode.window
        .showWarningMessage(localize("srdk commands only run in a trusted workspace"), manage)
        .then((choice) => {
          if (choice === manage) {
            vscode.commands.executeCommand("workbench.trust.manage");
          }
        });
      return;
    }

    const unsafe = args.find((arg) => !isSafeArg(arg));
    if (unsafe !== undefined) {
      vscode.window.showErrorMessage(
        localize("Argument contains characters that cannot be passed safely: {0}", unsafe),
      );
      return;
    }

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
