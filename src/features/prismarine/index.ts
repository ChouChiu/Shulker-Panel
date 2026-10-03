import { defineActionFeature } from "../../core/feature";
import { localize } from "../../core/localize";
import { EXT_PRISMARINE } from "../../core/project/projectDetector";
import type { InputSpec } from "../../core/srdk/action";

const path = (): InputSpec => ({ prompt: localize("Enter directory"), placeholder: "./src/mods", optional: true });

/**
 * `pfm` — Prismarine file management.
 */
export const prismarineFeature = defineActionFeature({
  id: "prismarine",
  requires: EXT_PRISMARINE,
  label: () => localize("Prismarine (PFM)"),
  icon: "library",
  actions: () => [
    {
      label: localize("Create (pfm create)"),
      icon: "add",
      args: ["pfm", "create"],
      inputs: [
        { prompt: localize("Enter search query"), placeholder: "sodium" },
        { prompt: localize("Enter output directory"), optional: true },
      ],
    },
    {
      label: localize("Search (pfm search)"),
      icon: "search",
      args: ["pfm", "search"],
      inputs: [
        { prompt: localize("Enter search query"), placeholder: "sodium" },
        { prompt: localize("Enter game version"), placeholder: "1.21.1", optional: true },
        { prompt: localize("Enter loader"), placeholder: "fabric", optional: true },
      ],
    },
    { label: localize("Serialize (pfm s)"), icon: "sync", args: ["pfm", "s"], inputs: [path()] },
    {
      label: localize("Restore (pfm r)"),
      icon: "cloud-download",
      args: ["pfm", "r"],
      inputs: [path(), { prompt: localize("Enter output directory"), optional: true }],
    },
    { label: localize("Update (pfm u)"), icon: "sync-ignored", args: ["pfm", "u"], inputs: [path()] },
    {
      label: localize("Lock (pfm l)"),
      icon: "lock",
      args: ["pfm", "l"],
      inputs: [{ prompt: localize("Enter filename to lock (partial match)"), placeholder: "sodium" }],
    },
    {
      label: localize("Unlock (pfm ul)"),
      icon: "unlock",
      args: ["pfm", "ul"],
      inputs: [{ prompt: localize("Enter filename to unlock (partial match)"), placeholder: "sodium" }],
    },
  ],
});
