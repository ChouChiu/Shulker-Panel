import * as vscode from "vscode";
import { localize } from "../localize";
import { EXT_ASEPRITE, EXT_FFMPEG, EXT_MAGICK, EXT_MODRINTH, EXT_PRISMARINE, EXT_RRT } from "./projectDetector";

/**
 * A first-party ShulkerRDK extension offered by init and Add Extension.
 */
export interface KnownExtension {
  /** Assembly name, e.g. ShulkerRDK.Modrinth */
  asm: string;
  label: string;
  /** Commands the extension adds */
  commands: string;
  detail: () => string;
}

export const KNOWN_EXTENSIONS: KnownExtension[] = [
  {
    asm: EXT_MODRINTH,
    label: "ModrinthPSK",
    commands: "mrp",
    detail: () => localize("Modrinth hosted files and .mrpack export"),
  },
  { asm: EXT_PRISMARINE, label: "Prismarine", commands: "pfm", detail: () => localize("Prismarine file management") },
  { asm: EXT_ASEPRITE, label: "Aseprite", commands: "ase", detail: () => localize("Convert .aseprite files to PNG") },
  {
    asm: EXT_MAGICK,
    label: "ResourceMagick",
    commands: "png2psd / psdcvt / pbrex",
    detail: () => localize("PNG / PSD conversion and PBR extraction"),
  },
  {
    asm: EXT_RRT,
    label: "ShulkerRRT",
    commands: "rrt / pw",
    detail: () => localize("Live reload with the ShulkerRRT mod"),
  },
  { asm: EXT_FFMPEG, label: "FFmpeg", commands: "a2ogg", detail: () => localize("Convert audio to OGG") },
];

/**
 * `RELEASE_SOURCE_ID='gl:LiPolymer/ShulkerRDK@B0.20'` in `srdk`, `$ReleaseSourceId = '...'` in `srdk.ps1`.
 */
const RELEASE_SOURCE = /(?:RELEASE_SOURCE_ID|\$ReleaseSourceId)\s*=\s*'([^:'\s]+:[^@'\s]+@[^'\s]+)'/;

/**
 * Same shape ShulkerRDK's `ExtensionSource.Parse` accepts: `gh|gl:<repo>#<Asm>@<tag>`.
 */
const IDENTIFIER = /^(gh|gl):([^#\s]+)#([^@\s]+)@(\S+)$/i;

/**
 * Reads the release pin from launcher script content, or undefined when it has none.
 */
export function parseReleaseSource(script: string): string | undefined {
  return RELEASE_SOURCE.exec(script)?.[1];
}

/**
 * Reads the release pin from the launchers in the workspace root, trying `srdk` then `srdk.ps1`.
 */
export async function readReleaseSource(root: vscode.Uri): Promise<string | undefined> {
  for (const name of ["srdk", "srdk.ps1"]) {
    try {
      const content = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(root, name));
      const source = parseReleaseSource(new TextDecoder().decode(content));
      if (source) return source;
    } catch {
      // Try the next launcher
    }
  }
  return undefined;
}

/**
 * Builds `platform:repo#Asm@tag` from a `platform:repo@tag` release pin.
 */
export function extensionIdentifier(releaseSource: string, asm: string): string {
  const at = releaseSource.lastIndexOf("@");
  return `${releaseSource.slice(0, at)}#${asm}${releaseSource.slice(at)}`;
}

/**
 * Returns the assembly name of a valid extension identifier, or undefined.
 */
export function identifierAssembly(identifier: string): string | undefined {
  return IDENTIFIER.exec(identifier.trim())?.[3];
}

/**
 * Turns `platform:repo#Asm@tag` back into the `platform:repo@tag` release pin.
 */
export function identifierReleaseSource(identifier: string): string | undefined {
  const match = IDENTIFIER.exec(identifier.trim());
  return match ? `${match[1]}:${match[2]}@${match[4]}` : undefined;
}
