import { defineActionFeature } from "../../core/feature";
import { localize } from "../../core/localize";

/**
 * `ext` and `help` — loaded extensions and available commands.
 */
export const extensionsFeature = defineActionFeature({
  id: "extensions",
  label: () => localize("Extensions"),
  icon: "extensions",
  actions: () => [
    { label: localize("List Extensions"), icon: "list-unordered", args: ["ext", "list"] },
    {
      label: localize("Lookup Extension"),
      icon: "search",
      args: ["ext", "lookup"],
      inputs: [{ prompt: localize("Enter extension ID"), placeholder: "shulker.core" }],
    },
    { label: localize("List Commands (help c)"), icon: "question", args: ["help", "c"] },
  ],
});
