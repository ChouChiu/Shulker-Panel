import { defineActionFeature } from "../../core/feature";
import { localize } from "../../core/localize";

/**
 * `env` — persisted project environment variables.
 */
export const envFeature = defineActionFeature({
  id: "env",
  label: () => localize("Env"),
  icon: "server-environment",
  actions: () => [
    { label: localize("List Vars"), icon: "list-unordered", args: ["env", "list"], commandId: "shulkerPanel.envList" },
    {
      label: localize("Get Var"),
      icon: "search",
      args: ["env", "get"],
      inputs: [{ prompt: localize("Enter env variable name"), placeholder: "project.name" }],
      commandId: "shulkerPanel.envGet",
    },
    {
      label: localize("Set Var"),
      icon: "edit",
      args: ["env", "set"],
      inputs: [
        { prompt: localize("Enter env variable name"), placeholder: "my.var" },
        { prompt: localize("Enter env variable value"), placeholder: "value" },
      ],
      commandId: "shulkerPanel.envSet",
    },
    {
      label: localize("Remove Var"),
      icon: "trash",
      args: ["env", "remove"],
      inputs: [{ prompt: localize("Enter env variable to remove"), placeholder: "my.var" }],
      commandId: "shulkerPanel.envRemove",
    },
  ],
});
