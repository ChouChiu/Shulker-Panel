import * as vscode from "vscode";
import type { Feature, FeatureContext } from "../../core/feature";
import { localize } from "../../core/localize";
import {
  extensionIdentifier,
  identifierAssembly,
  identifierReleaseSource,
  KNOWN_EXTENSIONS,
  readReleaseSource,
} from "../../core/project/extensionSource";
import type { SrdkAction } from "../../core/srdk/action";
import {
  CategoryTreeItem,
  CONTEXT_EXTENSIONS_CATEGORY,
  CommandTreeItem,
  PanelCommandTreeItem,
} from "../../panel/treeItems";

const ADD_EXTENSION_COMMAND = "shulkerPanel.addExtension";

/**
 * Pin of the first-party extensions, used when the launchers carry no RELEASE_SOURCE_ID.
 */
const FIRST_PARTY_REPO = "LiPolymer/ShulkerRDK";

function actions(): SrdkAction[] {
  return [
    { label: localize("List Extensions"), icon: "list-unordered", args: ["ext", "list"] },
    {
      label: localize("Lookup Extension"),
      icon: "search",
      args: ["ext", "lookup"],
      inputs: [{ prompt: localize("Enter extension ID"), placeholder: "shulker.core" }],
    },
    { label: localize("List Commands (help c)"), icon: "question", args: ["help", "c"] },
  ];
}

/**
 * `ext` and `help` — loaded extensions and available commands, plus declaring new extensions in proj.json.
 */
export const extensionsFeature: Feature = {
  id: "extensions",

  category() {
    const category = new CategoryTreeItem(localize("Extensions"), "extensions", [
      new PanelCommandTreeItem(localize("Add Extension"), "add", ADD_EXTENSION_COMMAND),
      ...actions().map((action) => new CommandTreeItem(action)),
    ]);
    category.contextValue = CONTEXT_EXTENSIONS_CATEGORY;
    return category;
  },

  actions,

  register: (ctx) => [vscode.commands.registerCommand(ADD_EXTENSION_COMMAND, () => addExtension(ctx))],
};

interface ExtensionPick extends vscode.QuickPickItem {
  /** Identifier to declare, or undefined for the custom entry */
  identifier?: string;
}

/**
 * Appends extension identifiers to `Extensions` in shulker/proj.json, then runs `proj i` so srdk installs them.
 */
async function addExtension(ctx: FeatureContext): Promise<void> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  const project = ctx.project();
  if (!folder || !project.isValid || !project.shulkerDir) {
    vscode.window.showWarningMessage(localize("Current workspace is not a ShulkerRDK project"));
    return;
  }

  const projUri = vscode.Uri.joinPath(vscode.Uri.file(project.shulkerDir), "proj.json");
  let raw: string;
  let data: Record<string, unknown>;
  try {
    raw = new TextDecoder().decode(await vscode.workspace.fs.readFile(projUri));
    data = JSON.parse(raw);
  } catch (error) {
    vscode.window.showErrorMessage(
      localize("Cannot read shulker/proj.json: {0}", error instanceof Error ? error.message : String(error)),
    );
    return;
  }

  const declared = Array.isArray(data.Extensions)
    ? data.Extensions.filter((item): item is string => typeof item === "string")
    : [];
  const declaredAsms = new Set(declared.map(identifierAssembly).filter((asm) => asm !== undefined));
  const releaseSource = (await readReleaseSource(folder.uri)) ?? fallbackReleaseSource(declared);

  const picks = await vscode.window.showQuickPick(extensionPicks(releaseSource, declaredAsms, project.extensions), {
    placeHolder: releaseSource
      ? localize("Select extensions to add")
      : localize("No release pin found in the launchers; enter an identifier"),
    canPickMany: true,
    ignoreFocusOut: true,
  });
  if (!picks || picks.length === 0) return;

  const identifiers = picks.flatMap((pick) => (pick.identifier ? [pick.identifier] : []));
  if (picks.some((pick) => !pick.identifier)) {
    const taken = new Set([...declaredAsms, ...identifiers.map(identifierAssembly).filter((asm) => asm !== undefined)]);
    const custom = await promptIdentifier(taken, releaseSource);
    if (custom === undefined) return;
    identifiers.push(custom);
  }

  data.Extensions = [...declared, ...identifiers];
  try {
    await vscode.workspace.fs.writeFile(projUri, new TextEncoder().encode(serializeLike(raw, data)));
  } catch (error) {
    vscode.window.showErrorMessage(
      localize("Cannot write shulker/proj.json: {0}", error instanceof Error ? error.message : String(error)),
    );
    return;
  }

  vscode.window.showInformationMessage(
    localize("Added {0}; srdk installs them on its next run", identifiers.map(identifierAssembly).join(", ")),
  );
  await ctx.refresh();
  ctx.terminal.exec(["proj", "i"]);
}

function extensionPicks(
  releaseSource: string | undefined,
  declaredAsms: Set<string>,
  installed: Set<string>,
): ExtensionPick[] {
  const picks: ExtensionPick[] = [];
  if (releaseSource) {
    for (const ext of KNOWN_EXTENSIONS) {
      if (declaredAsms.has(ext.asm)) continue;
      picks.push({
        identifier: extensionIdentifier(releaseSource, ext.asm),
        label: ext.label,
        // srdk skips declarations for manually installed extensions without a lock file
        description: installed.has(ext.asm) ? `${ext.commands} · ${localize("installed manually")}` : ext.commands,
        detail: ext.detail(),
      });
    }
  }
  picks.push({
    label: `$(edit) ${localize("Custom identifier...")}`,
    detail: "gh|gl:<repo>#<Assembly>@<tag>",
  });
  return picks;
}

async function promptIdentifier(taken: Set<string>, releaseSource: string | undefined): Promise<string | undefined> {
  const value = await vscode.window.showInputBox({
    prompt: localize("Enter extension identifier"),
    placeHolder: releaseSource ? extensionIdentifier(releaseSource, "<Assembly>") : "gh:owner/repo#Assembly@v1.0",
    ignoreFocusOut: true,
    validateInput: (text) => {
      const asm = identifierAssembly(text);
      if (!asm) return localize("Expected gh|gl:<repo>#<Assembly>@<tag>");
      if (taken.has(asm)) return localize("{0} is already declared", asm);
      return undefined;
    },
  });
  return value?.trim();
}

/**
 * Reuses the pin of an already declared first-party extension, then any declared extension.
 */
function fallbackReleaseSource(declared: string[]): string | undefined {
  const sources = declared.map(identifierReleaseSource).filter((source) => source !== undefined);
  return sources.find((source) => source.includes(`:${FIRST_PARTY_REPO}@`)) ?? sources[0];
}

/**
 * Serializes proj.json with the original indentation, line endings and trailing newline.
 */
function serializeLike(original: string, value: unknown): string {
  const indent = /^([ \t]+)"/m.exec(original)?.[1] ?? "  ";
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  const body = JSON.stringify(value, null, indent).replace(/\n/g, eol);
  return /\r?\n$/.test(original) || original.length === 0 ? body + eol : body;
}
