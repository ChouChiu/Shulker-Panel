import { defineActionFeature } from "../../core/feature";
import { localize } from "../../core/localize";

/**
 * `proj` — project name, resource root and output directory.
 */
export const projectFeature = defineActionFeature({
  id: "project",
  label: () => localize("Project"),
  icon: "project",
  actions: () => [
    { label: localize("Project Info"), icon: "info", args: ["proj", "i"], commandId: "shulkerPanel.projInfo" },
    {
      label: localize("Change Project Name"),
      icon: "edit",
      args: ["proj", "chname"],
      inputs: [{ prompt: localize("Enter new project name"), placeholder: "My Project" }],
      commandId: "shulkerPanel.projChname",
    },
    {
      label: localize("Change Resource Root"),
      icon: "folder-opened",
      args: ["proj", "chroot"],
      inputs: [{ prompt: localize("Enter new resource root path"), placeholder: "./src/" }],
      commandId: "shulkerPanel.projChroot",
    },
    {
      label: localize("Change Output Dir"),
      icon: "folder",
      args: ["proj", "chout"],
      inputs: [{ prompt: localize("Enter new output directory path"), placeholder: "./build/" }],
      commandId: "shulkerPanel.projChout",
    },
  ],
});
