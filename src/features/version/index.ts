import { defineActionFeature } from "../../core/feature";
import { localize } from "../../core/localize";

/**
 * `verm` — project version management.
 */
export const versionFeature = defineActionFeature({
  id: "version",
  label: () => localize("Version"),
  icon: "versions",
  actions: () => [
    { label: localize("Show Version"), icon: "eye", args: ["verm", "show"], commandId: "shulkerPanel.vermShow" },
    { label: localize("Major +1"), icon: "arrow-up", args: ["verm", "smajor"], commandId: "shulkerPanel.vermSmajor" },
    { label: localize("Minor +1"), icon: "arrow-up", args: ["verm", "sminor"], commandId: "shulkerPanel.vermSminor" },
    { label: localize("Patch +1"), icon: "arrow-up", args: ["verm", "sfix"], commandId: "shulkerPanel.vermSfix" },
    {
      label: localize("Set Version"),
      icon: "edit",
      args: ["verm", "set"],
      inputs: [{ prompt: localize("Enter version number"), placeholder: "1.0.0" }],
      commandId: "shulkerPanel.vermSet",
    },
  ],
});
