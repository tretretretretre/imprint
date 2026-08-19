export const KINDS = [
  "character",
  "location",
  "object",
  "style",
  "outfit",
  "companion",
] as const;

export type Kind = (typeof KINDS)[number];

export type FrameRole = "seed" | "variation" | "combine";
export type Aspect = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "16:9";
export type Resolution = "1k" | "2k";
export type PromptCategory =
  | "seed"
  | "angle"
  | "expression"
  | "lighting"
  | "pose"
  | "detail"
  | "time"
  | "coverage";

export type CollectionRow = {
  id: string;
  userId: string;
  kind: Kind;
  name: string;
  bible: string;
  createdAt: string;
  updatedAt: string;
  frameCount: number;
  seedCount: number;
  coverData: string | null;
};

export type FrameRow = {
  id: string;
  collectionId: string;
  userId: string;
  role: FrameRole;
  promptId: string | null;
  promptLabel: string;
  promptText: string;
  masterPrompt: string;
  imageData: string;
  aspect: Aspect;
  resolution: Resolution;
  createdAt: string;
};

export type CollectionDetail = CollectionRow & {
  frames: FrameRow[];
};

export type CombineRow = {
  id: string;
  userId: string;
  title: string;
  promptText: string;
  collectionIds: string[];
  imageData: string;
  createdAt: string;
};

export type PromptDef = {
  id: string;
  kinds: Kind[];
  category: PromptCategory;
  label: string;
  summary: string;
  variation: string;
  aspect: Aspect;
  priority: 0 | 1 | 2 | 3;
};

export type RelatedIdea = {
  kind: Kind;
  name: string;
  bible: string;
  reason: string;
};
