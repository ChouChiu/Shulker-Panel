import type * as vscode from "vscode";
import type { TaskInfo } from "../features/tasks/taskScanner";
import { CategoryTreeItem, CommandTreeItem } from "../panel/treeItems";
import type { ProjectInfo } from "./project/projectDetector";
import type { SrdkAction } from "./srdk/action";
import type { TerminalManager } from "./srdk/terminalManager";

/**
 * Shared services handed to every feature.
 */
export interface FeatureContext {
  terminal: TerminalManager;
  /** Last detected project info */
  project(): ProjectInfo;
  /** Last scanned tasks */
  tasks(): TaskInfo[];
  /** Re-detects the project and rebuilds the panel */
  refresh(): Promise<void>;
}

/**
 * A self-contained slice of the panel: its tree category, srdk actions and extra commands.
 */
export interface Feature {
  id: string;
  /** Assembly name of the ShulkerRDK extension this feature needs, e.g. ShulkerRDK.Modrinth */
  requires?: string;
  /** Root tree category, or undefined to hide it */
  category?(ctx: FeatureContext): CategoryTreeItem | undefined;
  /** Actions shown in Quick Run; actions with a commandId are registered as commands */
  actions?(ctx: FeatureContext): SrdkAction[];
  /** Extra command registrations */
  register?(ctx: FeatureContext): vscode.Disposable[];
}

/**
 * Returns whether a feature applies to the detected project.
 */
export function isFeatureEnabled(feature: Feature, project: ProjectInfo): boolean {
  return project.isValid && (!feature.requires || project.extensions.has(feature.requires));
}

/**
 * Defines a feature whose tree category is a flat list of srdk actions.
 */
export function defineActionFeature(options: {
  id: string;
  requires?: string;
  label: () => string;
  icon: string;
  actions: () => SrdkAction[];
}): Feature {
  return {
    id: options.id,
    requires: options.requires,
    actions: () => options.actions(),
    category: () =>
      new CategoryTreeItem(
        options.label(),
        options.icon,
        options.actions().map((action) => new CommandTreeItem(action)),
      ),
  };
}
