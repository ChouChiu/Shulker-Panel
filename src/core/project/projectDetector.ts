import * as vscode from "vscode";
import { resolveLauncher } from "../srdk/launcher";

/**
 * Represents the detected project type.
 * ShulkerRDK itself has no project types; a project is treated as a modpack when it uses Modrinth tooling.
 */
export type ProjectType = "MP" | "generic";

/**
 * Assembly names of first-party ShulkerRDK extensions.
 */
export const EXT_MODRINTH = "ShulkerRDK.Modrinth";
export const EXT_PRISMARINE = "ShulkerRDK.Prismarine";
export const EXT_ASEPRITE = "ShulkerRDK.Aseprite";
export const EXT_MAGICK = "ShulkerRDK.ResourceMagick";
export const EXT_RRT = "ShulkerRDK.RRT";
export const EXT_FFMPEG = "ShulkerRDK.FFmpeg";

/**
 * Information about a detected ShulkerRDK project.
 */
export interface ProjectInfo {
  /** Whether this is a valid ShulkerRDK project (shulker/proj.json exists) */
  isValid: boolean;
  /** MP when Modrinth tooling is present, otherwise generic */
  type: ProjectType;
  /** Project name from proj.json, or undefined */
  name?: string;
  /** Project version from proj.json, or undefined */
  version?: string;
  /** Resource root path from proj.json */
  rootPath?: string;
  /** Output path from proj.json */
  outPath?: string;
  /** Command prefix used to invoke srdk, e.g. ./srdk or .\srdk.bat */
  launcher: string;
  /** Absolute path to the shulker/ directory */
  shulkerDir?: string;
  /** Absolute path to the tasks directory */
  tasksDir?: string;
  /** Assembly names of declared or installed extensions */
  extensions: Set<string>;
}

/**
 * Interface for proj.json structure.
 */
interface ProjJson {
  ProjectName?: string;
  Version?: string;
  RootPath?: string;
  OutPath?: string;
  DefaultEnvVars?: Record<string, string>;
  /** Extension identifiers, e.g. gl:LiPolymer/ShulkerRDK#ShulkerRDK.Modrinth@B0.20 */
  Extensions?: string[];
}

/**
 * Detects whether the current workspace is a ShulkerRDK project
 * and extracts project metadata.
 */
export class ProjectDetector {
  private projectInfo: ProjectInfo | null = null;

  /**
   * Detects the ShulkerRDK project in the current workspace. The result is cached only through `setInfo`.
   */
  async detect(): Promise<ProjectInfo> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const launcher = await resolveLauncher(workspaceFolder?.uri);
    if (!workspaceFolder) {
      return emptyInfo(launcher);
    }

    const shulkerDir = vscode.Uri.joinPath(workspaceFolder.uri, "shulker");
    const tasksDir = vscode.Uri.joinPath(shulkerDir, "tasks");
    const projData = await readProjJson(vscode.Uri.joinPath(shulkerDir, "proj.json"));

    if (!projData) {
      return { ...emptyInfo(launcher), shulkerDir: shulkerDir.fsPath, tasksDir: tasksDir.fsPath };
    }

    const extensions = await detectExtensions(shulkerDir, projData);
    const hasMrpackTemplate = (await listDir(shulkerDir)).some(
      ([name, type]) => type === vscode.FileType.File && /^mrpack.*\.template\.json$/.test(name),
    );

    return {
      isValid: true,
      type: extensions.has(EXT_MODRINTH) || hasMrpackTemplate ? "MP" : "generic",
      name: projData.ProjectName,
      version: projData.Version,
      rootPath: projData.RootPath,
      outPath: projData.OutPath,
      launcher,
      shulkerDir: shulkerDir.fsPath,
      tasksDir: tasksDir.fsPath,
      extensions,
    };
  }

  /**
   * Caches the info returned by the latest completed detection.
   */
  setInfo(info: ProjectInfo): void {
    this.projectInfo = info;
  }

  /**
   * Returns the last detected project info, or null before the first detection.
   */
  getInfo(): ProjectInfo | null {
    return this.projectInfo;
  }
}

function emptyInfo(launcher: string): ProjectInfo {
  return {
    isValid: false,
    type: "generic",
    launcher,
    extensions: new Set(),
  };
}

/**
 * Reads shulker/proj.json. Returns an empty object if it exists but is unreadable, null if missing.
 */
async function readProjJson(uri: vscode.Uri): Promise<ProjJson | null> {
  let content: Uint8Array;
  try {
    content = await vscode.workspace.fs.readFile(uri);
  } catch {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(content).toString("utf-8")) as ProjJson;
  } catch {
    return {};
  }
}

async function listDir(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
  try {
    return await vscode.workspace.fs.readDirectory(uri);
  } catch {
    return [];
  }
}

/**
 * Collects extension assembly names from proj.json `Extensions`,
 * shulker/local/extensions/<Asm>/ and the legacy shulker/extensions/<Asm>.dll layout.
 */
async function detectExtensions(shulkerDir: vscode.Uri, projData: ProjJson): Promise<Set<string>> {
  const extensions = new Set<string>();

  for (const identifier of projData.Extensions ?? []) {
    const match = /#([^@]+)@/.exec(identifier);
    if (match) extensions.add(match[1]);
  }

  for (const dir of [
    vscode.Uri.joinPath(shulkerDir, "local", "extensions"),
    vscode.Uri.joinPath(shulkerDir, "extensions"),
  ]) {
    for (const [name, type] of await listDir(dir)) {
      if (type === vscode.FileType.Directory) {
        extensions.add(name);
      } else if (name.endsWith(".dll")) {
        extensions.add(name.slice(0, -".dll".length));
      }
    }
  }

  return extensions;
}
