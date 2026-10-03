import * as vscode from "vscode";

/**
 * Extension configuration keys.
 */
export const CONFIG_SECTION = "shulkerPanel";
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
 * Returns the user-configured srdk path, or undefined when auto-detection should be used.
 */
export function getSrdkPathOverride(): string | undefined {
  const configured = get<string>(CONFIG_SRDK_PATH)?.trim();
  return configured ? configured : undefined;
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
