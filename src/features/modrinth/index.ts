import { defineActionFeature } from "../../core/feature";
import { localize } from "../../core/localize";
import { EXT_MODRINTH } from "../../core/project/projectDetector";
import type { InputSpec } from "../../core/srdk/action";

const sourceDir = (): InputSpec => ({
  prompt: localize("Enter source directory"),
  placeholder: "./src/mods",
  optional: true,
});
const outputDir = (): InputSpec => ({ prompt: localize("Enter output directory"), optional: true });

/**
 * `mrp` — ModrinthPSK (.mrf references, restore, export, add, update, lock).
 */
export const modrinthFeature = defineActionFeature({
  id: "modrinth",
  requires: EXT_MODRINTH,
  label: () => localize("Modrinth (MRP)"),
  icon: "package",
  actions: () => [
    {
      label: localize("Serialize (mrp s)"),
      icon: "sync",
      args: ["mrp", "s"],
      inputs: [sourceDir(), outputDir()],
      commandId: "shulkerPanel.mrpSerialize",
    },
    {
      label: localize("Restore (mrp r)"),
      icon: "cloud-download",
      args: ["mrp", "r"],
      inputs: [sourceDir(), outputDir()],
      commandId: "shulkerPanel.mrpRestore",
    },
    {
      label: localize("Export (mrp e)"),
      icon: "export",
      args: ["mrp", "e"],
      inputs: [sourceDir(), outputDir()],
      commandId: "shulkerPanel.mrpExport",
    },
    {
      label: localize("Add Resource (mrp a)"),
      icon: "add",
      args: ["mrp", "a"],
      inputs: [
        { prompt: localize("Enter Modrinth slug/URL or project ID"), placeholder: "sodium" },
        { prompt: localize("Enter version number"), placeholder: "0.6.13", optional: true },
        { prompt: localize("Enter output directory"), placeholder: "src/mods", optional: true },
      ],
      commandId: "shulkerPanel.mrpAdd",
    },
    {
      label: localize("Update Resource (mrp u)"),
      icon: "sync-ignored",
      args: ["mrp", "u"],
      inputs: [sourceDir()],
      commandId: "shulkerPanel.mrpUpdate",
    },
    {
      label: localize("Lock (mrp lock)"),
      icon: "lock",
      args: ["mrp", "lock"],
      inputs: [{ prompt: localize("Enter filename to lock (partial match)"), placeholder: "sodium" }],
      commandId: "shulkerPanel.mrpLock",
    },
    {
      label: localize("Unlock (mrp unlock)"),
      icon: "unlock",
      args: ["mrp", "unlock"],
      inputs: [{ prompt: localize("Enter filename to unlock (partial match)"), placeholder: "sodium" }],
      commandId: "shulkerPanel.mrpUnlock",
    },
    {
      label: localize("Clean Cache (mrp clean)"),
      icon: "clear-all",
      args: ["mrp", "clean"],
      commandId: "shulkerPanel.mrpClean",
    },
  ],
});
