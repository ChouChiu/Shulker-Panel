import * as vscode from "vscode";
import { localize } from "../localize";
import { formatCommand, type TerminalManager } from "./terminalManager";

/**
 * A positional parameter collected through an input box before running an action.
 */
export interface InputSpec {
  prompt: string;
  placeholder?: string;
  /** Optional parameters may be left empty; an empty value stops collecting later parameters */
  optional?: boolean;
}

/**
 * A declarative srdk command: `srdk c <args...> <inputs...>`.
 */
export interface SrdkAction {
  /** Localized label */
  label: string;
  /** Codicon id */
  icon: string;
  /** Fixed arguments after `srdk c`, e.g. ["mrp", "u"] */
  args: string[];
  inputs?: InputSpec[];
  /** Command id contributed in package.json, if the action is exposed in the command palette */
  commandId?: string;
}

/**
 * Returns the display form of an action, e.g. `srdk c mrp u`.
 */
export function actionCommandLine(action: SrdkAction): string {
  return formatCommand(action.args);
}

/**
 * Prompts for the action's parameters and runs it in the ShulkerRDK terminal.
 * Cancelling or leaving a required parameter empty aborts the action.
 */
export async function runAction(action: SrdkAction, terminal: TerminalManager): Promise<void> {
  const values: string[] = [];

  for (const input of action.inputs ?? []) {
    const value = await vscode.window.showInputBox({
      prompt: input.optional ? localize("{0} (optional, leave empty to skip)", input.prompt) : input.prompt,
      placeHolder: input.placeholder,
      ignoreFocusOut: true,
    });

    if (value === undefined) {
      return; // User cancelled
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      if (input.optional) break;
      return;
    }
    values.push(trimmed);
  }

  terminal.exec([...action.args, ...values]);
}
