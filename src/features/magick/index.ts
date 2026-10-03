import { defineActionFeature } from "../../core/feature";
import { localize } from "../../core/localize";
import { EXT_MAGICK } from "../../core/project/projectDetector";

/**
 * `png2psd` — ResourceMagick image conversion.
 */
export const magickFeature = defineActionFeature({
  id: "magick",
  requires: EXT_MAGICK,
  label: () => localize("ResourceMagick"),
  icon: "paintcan",
  actions: () => [
    {
      label: localize("Convert to PSD (png2psd)"),
      icon: "file-media",
      args: ["png2psd"],
      inputs: [
        { prompt: localize("Enter PNG file or directory"), placeholder: "src/textures" },
        { prompt: localize("Enter output directory"), optional: true },
      ],
    },
  ],
});
