import { defineActionFeature } from "../../core/feature";
import { localize } from "../../core/localize";

/**
 * `netfile` — link large files by URL and SHA1 instead of committing them.
 */
export const netfileFeature = defineActionFeature({
  id: "netfile",
  label: () => localize("Net Files"),
  icon: "cloud",
  actions: () => [
    {
      label: localize("Create Net File (netfile create)"),
      icon: "add",
      args: ["netfile", "create"],
      inputs: [
        { prompt: localize("Enter file path"), placeholder: "./src/assets/big_texture.png" },
        { prompt: localize("Enter download URL"), placeholder: "https://example.com/big_texture.png" },
      ],
    },
    {
      label: localize("Restore Net Files (netfile restore)"),
      icon: "cloud-download",
      args: ["netfile", "restore"],
      inputs: [
        { prompt: localize("Enter source directory"), placeholder: "./src/", optional: true },
        { prompt: localize("Enter output directory"), optional: true },
      ],
    },
    { label: localize("Clean Cache (netfile clean)"), icon: "clear-all", args: ["netfile", "clean"] },
  ],
});
