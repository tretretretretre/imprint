import type { Kind } from "./types";

export type KindMeta = {
  id: Kind;
  label: string;
  plural: string;
  blurb: string;
  lockNoun: string;
  seedHint: string;
};

export const KIND_META: Record<Kind, KindMeta> = {
  character: {
    id: "character",
    label: "Character",
    plural: "Characters",
    blurb: "A person locked from face to posture. Portraits, turns, light, and mood.",
    lockNoun: "face, hair, eyes, body, and skin",
    seedHint: "Front portrait, then 45° left and 45° right. Same person, same hair, same bones.",
  },
  location: {
    id: "location",
    label: "Place",
    plural: "Places",
    blurb: "A room or site that never rearranges itself. Corners, weather, time of day.",
    lockNoun: "architecture, furniture, decor, materials, and layout",
    seedHint: "Doorway establishing shot, then two opposite corners of the same space.",
  },
  object: {
    id: "object",
    label: "Object",
    plural: "Objects",
    blurb: "A car, prop, or thing you can orbit forever. Same paint, same scars.",
    lockNoun: "silhouette, materials, markings, and proportions",
    seedHint: "Front hero, three-quarter, and a pure side. Same object, same wear.",
  },
  style: {
    id: "style",
    label: "Style",
    plural: "Styles",
    blurb: "A locked art language — medium, palette, mark, and light — not a person or a room.",
    lockNoun: "medium, palette, mark-making, contrast, and how light is drawn",
    seedHint:
      "Three different subjects, one grammar: a figure, a place, a still life. The style stays; the motif changes.",
  },
  outfit: {
    id: "outfit",
    label: "Outfit",
    plural: "Outfits",
    blurb: "A wardrobe lock. Weave, drape, hardware — worn, hung, and in motion.",
    lockNoun: "cut, fabric, color, hardware, and wear",
    seedHint: "Front on a figure, three-quarter, and the back. Same garment, same cloth.",
  },
  companion: {
    id: "companion",
    label: "Companion",
    plural: "Companions",
    blurb: "A best friend, sibling, or creature that belongs to an existing character.",
    lockNoun: "face, hair, eyes, body, and the relationship to their world",
    seedHint: "Front portrait, 45° turn, and a mid-shot. Same companion every time.",
  },
};

export const KIND_ORDER: Kind[] = [
  "character",
  "location",
  "object",
  "outfit",
  "companion",
  "style",
];

export function isKind(value: string): value is Kind {
  return value in KIND_META;
}
