import * as vscode from "vscode";
import { getSrdkPathOverride } from "../config";

/**
 * Launcher candidates in the workspace root, in priority order.
 *
 * ShulkerRDK B0.20 ships bootstrap scripts (`srdk` on Unix, `srdk.bat` / `srdk.ps1` on Windows)
 * that download the real binary into `shulker/local/bin/`. Older projects keep `srdk.exe` in the root.
 */
const CANDIDATES: Record<"win32" | "unix", string[]> = {
  win32: ["srdk.bat", "srdk.exe"],
  unix: ["srdk"],
};

function candidates(): string[] {
  return process.platform === "win32" ? CANDIDATES.win32 : CANDIDATES.unix;
}

/**
 * Turns a bare launcher name into a path relative to the terminal cwd (`./srdk` or `.\srdk.bat`).
 * Paths that already contain a separator are returned unchanged.
 */
export function platformAwarePath(p: string): string {
  if (p.includes("/") || p.includes("\\")) {
    return p;
  }
  return process.platform === "win32" ? `.\\${p}` : `./${p}`;
}

/**
 * Resolves the command prefix used to invoke srdk.
 * The configured `shulkerPanel.srdkPath` wins; otherwise the first launcher found in the root is used.
 * Falls back to the platform default without checking that it exists.
 */
export async function resolveLauncher(root: vscode.Uri | undefined): Promise<string> {
  const override = getSrdkPathOverride();
  if (override) {
    return platformAwarePath(override);
  }

  const names = candidates();
  if (root) {
    for (const name of names) {
      try {
        await vscode.workspace.fs.stat(vscode.Uri.joinPath(root, name));
        return platformAwarePath(name);
      } catch {
        // Try the next candidate
      }
    }
  }
  return platformAwarePath(names[0]);
}
