import * as vscode from "vscode";

/**
 * Localization helper wrapping the VS Code l10n API.
 *
 * Usage:
 *   localize("Hello {0}", name)   → looks up "Hello {0}" in bundle.l10n.{lang}.json
 *
 * Keys are the English source strings; translations are resolved
 * from l10n/bundle.l10n.json (default) and l10n/bundle.l10n.{language}.json.
 */
export function localize(message: string, ...args: Array<string | number | boolean>): string {
    return vscode.l10n.t(message, ...args);
}

/**
 * Short alias for localize.
 */
export const l = localize;
