import * as vscode from "vscode";

/**
 * Represents the detected project type.
 */
export type ProjectType = "RP" | "MP" | "unknown";

/**
 * Information about a detected ShulkerRDK project.
 */
export interface ProjectInfo {
  /** Whether this is a valid ShulkerRDK project */
  isValid: boolean;
  /** Project type: RP (Resource Pack), MP (Modpack), or unknown */
  type: ProjectType;
  /** Project name from proj.json, or undefined */
  name?: string;
  /** Project version from proj.json, or undefined */
  version?: string;
  /** Resource root path from proj.json */
  rootPath?: string;
  /** Output path from proj.json */
  outPath?: string;
  /** Absolute path to the srdk binary */
  srdkPath: string;
  /** Absolute path to the shulker/ directory */
  shulkerDir?: string;
  /** Absolute path to the tasks directory */
  tasksDir?: string;
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
}

/**
 * Detects whether the current workspace is a ShulkerRDK project
 * and extracts project metadata.
 */
export class ProjectDetector {
  private projectInfo: ProjectInfo | null = null;

  /**
   * Detects the ShulkerRDK project in the current workspace.
   */
  async detect(): Promise<ProjectInfo> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this.projectInfo = this.emptyInfo();
      return this.projectInfo;
    }

    const rootUri = workspaceFolder.uri;
    const shulkerDir = vscode.Uri.joinPath(rootUri, "shulker");
    const tasksDir = vscode.Uri.joinPath(shulkerDir, "tasks");
    const projJsonPath = vscode.Uri.joinPath(shulkerDir, "proj.json");
    const mrpackTemplatePath = vscode.Uri.joinPath(shulkerDir, "mrpack.template.json");

    // Check core ShulkerRDK structures
    const shulkerExists = await this.pathExists(shulkerDir);
    const tasksExist = await this.pathExists(tasksDir);

    if (!shulkerExists) {
      this.projectInfo = { ...this.emptyInfo(), shulkerDir: shulkerDir.fsPath };
      return this.projectInfo;
    }

    // Determine OS-appropriate srdk binary
    const os = process.platform;
    const binaryName = os === "win32" ? "srdk.exe" : "srdk";
    const srdkUri = vscode.Uri.joinPath(rootUri, binaryName);
    const srdkExists = await this.pathExists(srdkUri);

    // Read proj.json
    let projData: ProjJson | null = null;
    if (await this.pathExists(projJsonPath)) {
      try {
        const content = await vscode.workspace.fs.readFile(projJsonPath);
        projData = JSON.parse(Buffer.from(content).toString("utf-8")) as ProjJson;
      } catch {
        // proj.json exists but is unreadable
      }
    }

    // Detect project type
    const isMP = await this.pathExists(mrpackTemplatePath);
    const type: ProjectType = isMP ? "MP" : projData ? "RP" : "unknown";

    this.projectInfo = {
      isValid: srdkExists && tasksExist,
      type,
      name: projData?.ProjectName,
      version: projData?.Version,
      rootPath: projData?.RootPath,
      outPath: projData?.OutPath,
      srdkPath: srdkUri.fsPath,
      shulkerDir: shulkerDir.fsPath,
      tasksDir: tasksDir.fsPath,
    };

    return this.projectInfo;
  }

  /**
   * Returns the last detected project info, or detects if not yet done.
   */
  getInfo(): ProjectInfo | null {
    return this.projectInfo;
  }

  /**
   * Returns true if a valid project was detected.
   */
  isValid(): boolean {
    return this.projectInfo?.isValid ?? false;
  }

  /**
   * Returns whether the project is a Modpack (MP).
   */
  isMP(): boolean {
    return this.projectInfo?.type === "MP";
  }

  private async pathExists(uri: vscode.Uri): Promise<boolean> {
    try {
      await vscode.workspace.fs.stat(uri);
      return true;
    } catch {
      return false;
    }
  }

  private emptyInfo(): ProjectInfo {
    return {
      isValid: false,
      type: "unknown",
      srdkPath: "",
    };
  }
}
