import type { Feature } from "../core/feature";
import { asepriteFeature } from "./aseprite";
import { envFeature } from "./env";
import { extensionsFeature } from "./extensions";
import { magickFeature } from "./magick";
import { modrinthFeature } from "./modrinth";
import { netfileFeature } from "./netfile";
import { prismarineFeature } from "./prismarine";
import { projectFeature } from "./project";
import { tasksFeature } from "./tasks";
import { versionFeature } from "./version";

/**
 * Panel features in display order.
 */
export const features: Feature[] = [
  tasksFeature,
  projectFeature,
  versionFeature,
  envFeature,
  netfileFeature,
  modrinthFeature,
  prismarineFeature,
  asepriteFeature,
  magickFeature,
  extensionsFeature,
];
