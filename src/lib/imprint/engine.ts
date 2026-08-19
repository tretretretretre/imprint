import { KIND_META } from "./kinds";
import type { Kind, PromptDef } from "./types";

const HUMAN_STACK = `Portrait Engine V4 Flux Klein stack at photographic strength: micro-detail skin, natural visible pores, peach fuzz and vellus hair with catchlights, multi-lobe 3-layer subsurface scattering (epidermis + blood-perfused dermis + subcutaneous fat), wavelength-dependent Rayleigh and Mie scattering, living inner glow in ears, nose, cheeks, lips, collarbones and fingertips. Individual hair strands resolved at 4K, natural flyaways, root-to-tip variation, no helmet hair. Authentic fabric weave and physics, creasing where the body bends, subtle wear, sun-fading, dust. Shot on a Sony A7R V 85mm f/1.4, shallow depth of field, creamy bokeh, razor-sharp eyes. Background: aged surfaces, patina, scuffs, realistic depth.

Second-pass photorealism enhancement restoring high-frequency pore structure, natural oily sheen and living SSS glow.`;

const PLACE_STACK = `Photographic architecture lock: authentic material physics, aged surfaces, patina, dust, scuffs, sun-fading, true light falloff and depth. Shot on a Sony A7R V 24mm or 35mm f/1.8 for rooms, 50mm for details. Mixed natural light unless the variation names another recipe.

Second-pass photorealism enhancement restoring high-frequency material texture, dust, and true surface wear.`;

const OBJECT_STACK = `Product-true photography: exact silhouette, paint, hardware and wear. Real material physics — metal, glass, cloth, rubber — with honest speculars, no CGI cleanliness. Shot on a Sony A7R V 50mm or 85mm, shallow but readable depth.

Second-pass photorealism enhancement restoring micro-scratches, dust in panel gaps, and true surface grain.`;

const OUTFIT_STACK = `Wardrobe lock photography: exact cut, cloth, color and hardware. Natural hang and gravity, weave visible, creasing where the body bends, light regular wear, no plastic shine. Shot on a Sony A7R V 85mm f/1.8.

Second-pass photorealism enhancement restoring thread, pilling, and cloth physics.`;

const STYLE_STACK = `Art-style lock. The style is the subject. Preserve the exact medium, palette, mark-making, contrast curve, edge behavior, proportion logic, and light-as-drawn of the references. Do not drift into generic photorealism, stock illustration, or a neighboring aesthetic unless the locked style itself is photographic. Do not invent a new brush, a new color world, or a new way of drawing light.

Second-pass refinement: tighten the grammar — same marks, same mixing, same edges.`;

const STYLE_NEGATIVE = `Avoid: photorealistic skin and pores unless the style is photographic, CGI cleanliness, generic stock illustration, trendy AI-art defaults, extra mediums, redesigned palette, smooth airbrushed gradients the references do not have, comic-to-real or real-to-comic drift.`;

const NEGATIVE = `Avoid: plastic skin, doll eyes, over-smoothed or waxy surfaces, fake fabric shine, blurry hands, deformed anatomy, cartoonish invention, heavy makeup unless locked, heavy freckle scatter unless locked, AI artifacts, over-sharpening, extra limbs, redesigned identity.`;

function stackFor(kind: Kind): string {
  switch (kind) {
    case "character":
    case "companion":
      return HUMAN_STACK;
    case "location":
      return PLACE_STACK;
    case "object":
      return OBJECT_STACK;
    case "outfit":
      return OUTFIT_STACK;
    case "style":
      return STYLE_STACK;
  }
}

export function buildMasterPrompt(input: {
  kind: Kind;
  name: string;
  bible: string;
  variation: string;
  hasRefs: boolean;
  extra?: string;
}): string {
  const meta = KIND_META[input.kind];
  const lock = input.bible.trim() || `${input.name}, locked ${meta.lockNoun}.`;
  const isStyle = input.kind === "style";
  const open = isStyle
    ? input.hasRefs
      ? `Edit from these exact style references for ${input.name}. Keep this art language with 100% fidelity — ${meta.lockNoun}. The motif may change; the grammar must not. Do not invent a new aesthetic.`
      : `Create an image in the locked art style ${input.name}. The style is the subject. ${lock}`
    : input.hasRefs
      ? `Edit these exact reference images of ${input.name}. Preserve the ${meta.lockNoun} with 100% fidelity. Do not invent a new identity.`
      : `Photorealistic photography of ${input.name}, strongly anchored as a real photograph of one locked subject.`;

  const variationLine = isStyle
    ? `Plate (change the motif or the hour, never the grammar): ${input.variation.trim()}`
    : `Variation only (subtle, 20–68° or a named light/pose — never a redesign): ${input.variation.trim()}`;

  return [
    open,
    isStyle ? `Style lock: ${lock}` : `Identity lock: ${lock}`,
    variationLine,
    input.extra?.trim() ? `Additional direction: ${input.extra.trim()}` : "",
    stackFor(input.kind),
    isStyle ? STYLE_NEGATIVE : NEGATIVE,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildSeedPrompt(input: {
  kind: Kind;
  name: string;
  bible: string;
  seed: PromptDef;
  hasRefs: boolean;
}): string {
  return buildMasterPrompt({
    kind: input.kind,
    name: input.name,
    bible: input.bible,
    variation: input.seed.variation,
    hasRefs: input.hasRefs,
    extra: input.kind === "style"
      ? "This plate is a canon seed. Prioritize the style grammar over a new motif."
      : "This plate is a canon seed. Prioritize identity lock over novelty.",
  });
}

export function buildCombinePrompt(input: {
  names: string[];
  bibles: string[];
  scene: string;
}): string {
  const roster = input.names
    .map((name, i) => `- ${name}: ${input.bibles[i] || "locked from its references"}`)
    .join("\n");
  return `Edit and compose from these exact reference images. Each subject must remain itself — do not blend faces, rooms, or objects into a new design.

Locked roster:
${roster}

Scene: ${input.scene.trim()}

Keep every locked identity. Place them in one coherent photograph. Sony A7R V still, natural mixed light, authentic materials, living skin where people appear, real fabric physics.

${NEGATIVE}`;
}

export function buildUpscalePrompt(kind: Kind, name: string): string {
  if (kind === "style") {
    return `Edit this exact image of ${name}. Do not change the art style, composition, or motif. Refine mark-making, palette fidelity, and edge behavior. Do not convert to photorealism unless the locked style is photographic. ${STYLE_NEGATIVE}`;
  }
  const human =
    kind === "character" || kind === "companion"
      ? "Restore high-frequency pore structure, peach fuzz, flyaways, and living SSS glow. "
      : "";
  return `Edit this exact image of ${name}. Do not change identity, pose, clothes, or composition. Upscale and refine as a second-pass photorealism enhancement. ${human}Restore material grain, honest wear, and optical micro-contrast. Keep the same crop. ${NEGATIVE}`;
}
