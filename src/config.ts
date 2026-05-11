import * as vscode from "vscode";

/**
 * Extension configuration keys.
 */
const CONFIG_SECTION = "shulkerPanel";
const CONFIG_SRDK_PATH = "srdkPath";
const CONFIG_AUTO_REFRESH = "autoRefresh";
const CONFIG_SHOW_WARNING = "showNonProjectWarning";

/**
 * Reads a configuration value from the shulkerPanel section.
 */
function get<T>(key: string, defaultValue?: T): T | undefined {
  return vscode.workspace.getConfiguration(CONFIG_SECTION).get<T>(key) ?? defaultValue;
}

/**
 * Returns the srdk executable path.
 * Uses the user-configured path if set, otherwise auto-detects from the workspace root.
 */
export function getSrdkPath(): string {
  const configured = get<string>(CONFIG_SRDK_PATH);
  if (configured && configured.trim().length > 0) {
    return configured.trim();
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return "";
  }

  const os = process.platform;
  const binaryName = os === "win32" ? "srdk.exe" : "srdk";
  return vscode.Uri.joinPath(workspaceFolder.uri, binaryName).fsPath;
}

/**
 * Returns whether auto-refresh of the task panel is enabled.
 */
export function getAutoRefresh(): boolean {
  return get<boolean>(CONFIG_AUTO_REFRESH, true) ?? true;
}

/**
 * Returns whether to show a warning when no ShulkerRDK project is detected.
 */
export function getShowWarning(): boolean {
  return get<boolean>(CONFIG_SHOW_WARNING, true) ?? true;
}
