import { defineActionFeature } from "../../core/feature";
import { localize } from "../../core/localize";
import { EXT_ASEPRITE } from "../../core/project/projectDetector";

/**
 * `ase` — convert .aseprite files to PNG.
 */
export const asepriteFeature = defineActionFeature({
  id: "aseprite",
  requires: EXT_ASEPRITE,
  label: () => localize("Aseprite"),
  icon: "symbol-color",
  actions: () => [
    {
      label: localize("Convert to PNG (ase)"),
      icon: "file-media",
      args: ["ase"],
      inputs: [
        { prompt: localize("Enter .aseprite file or directory"), placeholder: "src/sprites" },
        { prompt: localize("Enter output directory"), optional: true },
      ],
    },
  ],
});
