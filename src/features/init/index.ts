import * as vscode from "vscode";
import type { Feature, FeatureContext } from "../../core/feature";
import { localize } from "../../core/localize";
import {
  EXT_ASEPRITE,
  EXT_FFMPEG,
  EXT_MAGICK,
  EXT_MODRINTH,
  EXT_PRISMARINE,
  EXT_RRT,
} from "../../core/project/projectDetector";
import { scaffoldProject } from "./scaffold";

interface ExtensionPick extends vscode.QuickPickItem {
  asm: string;
}

/**
 * Initializes a ShulkerRDK project in the workspace root (launchers, proj.json, sample task).
 */
export const initFeature: Feature = {
  id: "init",
  register: (ctx) => [vscode.commands.registerCommand("shulkerPanel.initProject", () => initProject(ctx))],
};

async function initProject(ctx: FeatureContext): Promise<void> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    vscode.window.showWarningMessage(localize("Open a folder before initializing a ShulkerRDK project"));
    return;
  }
  if (ctx.project().isValid) {
    vscode.window.showWarningMessage(localize("This workspace is already a ShulkerRDK project"));
    return;
  }

  const projectName = await vscode.window.showInputBox({
    prompt: localize("Enter new project name"),
    value: folder.name,
    ignoreFocusOut: true,
    validateInput: (value) => (value.trim().length === 0 ? localize("Project name cannot be empty") : undefined),
  });
  if (projectName === undefined) return;

  const rootPath = await vscode.window.showInputBox({
    prompt: localize("Enter new resource root path"),
    value: "./src/",
    ignoreFocusOut: true,
  });
  if (rootPath === undefined) return;

  const picks = await vscode.window.showQuickPick(extensionPicks(), {
    placeHolder: localize("Select ShulkerRDK extensions (optional)"),
    canPickMany: true,
    ignoreFocusOut: true,
  });
  if (picks === undefined) return;

  try {
    const result = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: localize("Initializing ShulkerRDK project...") },
      () =>
        scaffoldProject({
          root: folder.uri,
          projectName: projectName.trim(),
          rootPath: rootPath.trim() || "./src/",
          extensions: picks.map((pick) => pick.asm),
        }),
    );

    if (result.keptLaunchers.length > 0) {
      vscode.window.showInformationMessage(localize("Kept existing launchers: {0}", result.keptLaunchers.join(", ")));
    }
    await ctx.refresh();
    // First run downloads the srdk binary and declared extensions, then prints the project info
    ctx.terminal.exec(["proj", "i"]);
  } catch (error) {
    vscode.window.showErrorMessage(
      localize("Failed to initialize ShulkerRDK project: {0}", error instanceof Error ? error.message : String(error)),
    );
  }
}

function extensionPicks(): ExtensionPick[] {
  return [
    {
      asm: EXT_MODRINTH,
      label: "ModrinthPSK",
      description: "mrp",
      detail: localize("Modrinth hosted files and .mrpack export"),
    },
    { asm: EXT_PRISMARINE, label: "Prismarine", description: "pfm", detail: localize("Prismarine file management") },
    { asm: EXT_ASEPRITE, label: "Aseprite", description: "ase", detail: localize("Convert .aseprite files to PNG") },
    {
      asm: EXT_MAGICK,
      label: "ResourceMagick",
      description: "png2psd / psdcvt / pbrex",
      detail: localize("PNG / PSD conversion and PBR extraction"),
    },
    {
      asm: EXT_RRT,
      label: "ShulkerRRT",
      description: "rrt / pw",
      detail: localize("Live reload with the ShulkerRRT mod"),
    },
    { asm: EXT_FFMPEG, label: "FFmpeg", description: "a2ogg", detail: localize("Convert audio to OGG") },
  ];
}
