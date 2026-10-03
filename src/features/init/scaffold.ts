import { promises as fs } from "node:fs";
import * as vscode from "vscode";
import { extensionIdentifier, parseReleaseSource } from "../../core/project/extensionSource";
import { renderReadme } from "./readme";

/**
 * Upstream launcher scripts. The `main` branch carries the release pin that new projects should use;
 * release tags may still point at an older binary.
 */
const SCRIPTS_BASE = "https://raw.githubusercontent.com/LiPolymer/ShulkerRDK/main/scripts/";
const LAUNCHERS = ["srdk", "srdk.bat", "srdk.ps1"];

/**
 * Lines that keep downloaded binaries, extensions, caches and build output out of git.
 */
const GITIGNORE_LINES = ["/shulker/local/", "/build/"];

const SAMPLE_BUILD_TASK = [
  "# Copy the resource root into the cache, zip it into the output directory, then clean up",
  "makeCopy",
  "makePkg",
  "makeCleanup",
  "",
].join("\n");

export interface ScaffoldOptions {
  root: vscode.Uri;
  projectName: string;
  rootPath: string;
  /** Extension assembly names, e.g. ShulkerRDK.Modrinth */
  extensions: string[];
  /** Language of the generated README */
  readmeLang: "zh" | "en";
}

export interface ScaffoldResult {
  /** Release pin read from the launcher, e.g. gl:LiPolymer/ShulkerRDK@B0.20 */
  releaseSource: string;
  /** Existing files that were kept instead of overwritten */
  kept: string[];
}

/**
 * Downloads the launcher scripts and writes a minimal ShulkerRDK B0.20 project into `root`.
 */
export async function scaffoldProject(options: ScaffoldOptions): Promise<ScaffoldResult> {
  const { root } = options;

  const scripts = await Promise.all(LAUNCHERS.map(async (name) => [name, await download(name)] as const));
  const releaseSource = parseReleaseSource(new TextDecoder().decode(scripts[0][1]));
  if (!releaseSource) {
    throw new Error("RELEASE_SOURCE_ID not found in srdk launcher");
  }

  const kept: string[] = [];
  for (const [name, content] of scripts) {
    const uri = vscode.Uri.joinPath(root, name);
    if (await exists(uri)) {
      kept.push(name);
      continue;
    }
    await vscode.workspace.fs.writeFile(uri, content);
  }
  await makeExecutable(vscode.Uri.joinPath(root, "srdk"));

  const shulkerDir = vscode.Uri.joinPath(root, "shulker");
  const writeNew = async (relative: string, value: unknown) => {
    const uri = vscode.Uri.joinPath(shulkerDir, relative);
    if (await exists(uri)) {
      kept.push(`shulker/${relative}`);
    } else {
      await writeJson(uri, value);
    }
  };
  await writeNew("proj.json", {
    ProjectName: options.projectName,
    Version: "0.0.0",
    RootPath: options.rootPath,
    OutPath: "./build/",
    DefaultEnvVars: {},
    Extensions: options.extensions.map((asm) => extensionIdentifier(releaseSource, asm)),
  });
  // Local settings skip SRDK's interactive color test; the VS Code terminal renders ANSI colors
  await writeNew("local/shulker.json", { TerminalMode: "modern" });

  const buildTask = vscode.Uri.joinPath(shulkerDir, "tasks", "build.lvt");
  if (!(await exists(buildTask))) {
    await vscode.workspace.fs.writeFile(buildTask, new TextEncoder().encode(SAMPLE_BUILD_TASK));
  }

  const readme = vscode.Uri.joinPath(root, "README.md");
  if (await exists(readme)) {
    kept.push("README.md");
  } else {
    const content = renderReadme({
      projectName: options.projectName,
      rootPath: options.rootPath,
      extensions: options.extensions,
      releaseSource,
      lang: options.readmeLang,
    });
    await vscode.workspace.fs.writeFile(readme, new TextEncoder().encode(content));
  }

  await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(root, options.rootPath));
  await appendGitignore(vscode.Uri.joinPath(root, ".gitignore"));

  return { releaseSource, kept };
}

async function download(name: string): Promise<Uint8Array> {
  const response = await fetch(SCRIPTS_BASE + name, { headers: { "User-Agent": "ShulkerPanel" } });
  if (!response.ok) {
    throw new Error(`${name}: HTTP ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function appendGitignore(uri: vscode.Uri): Promise<void> {
  let current = "";
  try {
    current = new TextDecoder().decode(await vscode.workspace.fs.readFile(uri));
  } catch {
    // No .gitignore yet
  }
  const present = new Set(current.split(/\r?\n/).map((line) => line.trim()));
  const missing = GITIGNORE_LINES.filter((line) => !present.has(line));
  if (missing.length === 0) return;

  const separator = current.length === 0 || current.endsWith("\n") ? "" : "\n";
  await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(`${current}${separator}${missing.join("\n")}\n`));
}

async function writeJson(uri: vscode.Uri, value: unknown): Promise<void> {
  await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`));
}

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

/**
 * Marks the Unix launcher executable. Only possible for local files; remote workspaces need `chmod +x ./srdk`.
 */
async function makeExecutable(uri: vscode.Uri): Promise<void> {
  if (uri.scheme !== "file" || process.platform === "win32") return;
  try {
    await fs.chmod(uri.fsPath, 0o755);
  } catch {
    // Leave it to the user
  }
}
