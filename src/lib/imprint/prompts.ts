import { KIND_META } from "./kinds";
import type { Kind, PromptDef } from "./types";

const ALL: Kind[] = [
  "character",
  "location",
  "object",
  "outfit",
  "companion",
];
const BEING: Kind[] = ["character", "companion"];
const WORN: Kind[] = ["character", "companion", "outfit"];
const PLACE: Kind[] = ["location"];
const THING: Kind[] = ["object"];
const LOOK: Kind[] = ["style"];

function p(
  partial: Omit<PromptDef, "kinds"> & { kinds?: Kind[] },
): PromptDef {
  return { kinds: ALL, ...partial };
}

export const PROMPT_LIBRARY: PromptDef[] = [
  // ── Seeds (priority 0) ──────────────────────────────────────────
  p({
    id: "seed-front",
    kinds: BEING,
    category: "seed",
    label: "Front portrait lock",
    summary: "Eye-level, facing camera. The identity plate.",
    variation:
      "Front-facing portrait, eye-level, subject looking just off the lens. Head and shoulders. This is the identity lock plate.",
    aspect: "2:3",
    priority: 0,
  }),
  p({
    id: "seed-45-right",
    kinds: BEING,
    category: "seed",
    label: "45° to the right",
    summary: "Same person, camera orbits 45° right.",
    variation:
      "Keep the exact same person. Orbit the camera about 45 degrees to the subject's right. Three-quarter portrait, same height, same lens character.",
    aspect: "2:3",
    priority: 0,
  }),
  p({
    id: "seed-45-left",
    kinds: BEING,
    category: "seed",
    label: "45° to the left",
    summary: "Same person, camera orbits 45° left.",
    variation:
      "Keep the exact same person. Orbit the camera about 45 degrees to the subject's left. Three-quarter portrait, same height, same lens character.",
    aspect: "2:3",
    priority: 0,
  }),
  p({
    id: "seed-place-front",
    kinds: PLACE,
    category: "seed",
    label: "Doorway establishing",
    summary: "The room as you first enter it.",
    variation:
      "Establishing view from the doorway, standing height, showing the full layout. Same furniture, same decor, same materials.",
    aspect: "3:2",
    priority: 0,
  }),
  p({
    id: "seed-place-45",
    kinds: PLACE,
    category: "seed",
    label: "Left corner",
    summary: "Same room from the left 45° corner.",
    variation:
      "Same room from the left 45-degree corner. Reveal the adjacent wall and how the furniture sits in space. Do not rearrange anything.",
    aspect: "3:2",
    priority: 0,
  }),
  p({
    id: "seed-place-opposite",
    kinds: PLACE,
    category: "seed",
    label: "Opposite corner",
    summary: "The far corner, looking back.",
    variation:
      "Same room from the opposite corner, looking back toward the entry. Every object remains in its locked place.",
    aspect: "3:2",
    priority: 0,
  }),
  p({
    id: "seed-object-front",
    kinds: THING,
    category: "seed",
    label: "Front hero",
    summary: "Straight-on product hero.",
    variation:
      "Front hero view, slightly below eye-line, the object filling the frame with honest material detail.",
    aspect: "3:2",
    priority: 0,
  }),
  p({
    id: "seed-object-34",
    kinds: THING,
    category: "seed",
    label: "Three-quarter",
    summary: "Classic 3/4 orbit.",
    variation:
      "Orbit about 45 degrees for a three-quarter view. Same object, same paint, same wear, same markings.",
    aspect: "3:2",
    priority: 0,
  }),
  p({
    id: "seed-object-side",
    kinds: THING,
    category: "seed",
    label: "Pure side",
    summary: "True profile of the object.",
    variation:
      "True side profile, camera square to the long axis. Same silhouette, same proportions.",
    aspect: "3:2",
    priority: 0,
  }),
  p({
    id: "seed-outfit-front",
    kinds: ["outfit"],
    category: "seed",
    label: "Front on figure",
    summary: "The garment worn, facing camera.",
    variation:
      "Front view of the exact outfit worn on a neutral standing figure. Full garment visible, natural hang and gravity.",
    aspect: "2:3",
    priority: 0,
  }),
  p({
    id: "seed-outfit-45",
    kinds: ["outfit"],
    category: "seed",
    label: "Three-quarter worn",
    summary: "Same outfit, 45° orbit.",
    variation:
      "Same exact outfit on the same figure, camera 45 degrees to the right. Show how the cloth wraps the body.",
    aspect: "2:3",
    priority: 0,
  }),
  p({
    id: "seed-outfit-back",
    kinds: ["outfit"],
    category: "seed",
    label: "Back view",
    summary: "The reverse of the garment.",
    variation:
      "Back view of the exact same outfit. Preserve every seam, closure, and fabric behavior.",
    aspect: "2:3",
    priority: 0,
  }),
  p({
    id: "seed-style-figure",
    kinds: LOOK,
    category: "seed",
    label: "Figure in this style",
    summary: "How this language draws a person.",
    variation:
      "A single figure rendered in this exact art style. Keep the locked medium, palette, proportion logic, edge, and mark. Not a photograph unless the style itself is photographic. The person is a motif — the style is the subject.",
    aspect: "2:3",
    priority: 0,
  }),
  p({
    id: "seed-style-world",
    kinds: LOOK,
    category: "seed",
    label: "Place in this style",
    summary: "How this language builds space.",
    variation:
      "An interior or landscape in this exact art style. Space, atmosphere, and architecture as this language constructs them — same medium and palette, a different motif.",
    aspect: "3:2",
    priority: 0,
  }),
  p({
    id: "seed-style-matter",
    kinds: LOOK,
    category: "seed",
    label: "Still life in this style",
    summary: "How this language treats volume and surface.",
    variation:
      "A still life of ordinary objects in this exact art style. Volume, edge, and surface as this language sees them. Prove the grammar without inventing a new aesthetic.",
    aspect: "1:1",
    priority: 0,
  }),

  // ── Angles ──────────────────────────────────────────────────────
  p({
    id: "angle-profile-right",
    kinds: BEING,
    category: "angle",
    label: "Profile, right",
    summary: "True side of the face.",
    variation:
      "True right profile. Camera square to the face. Keep the exact nose, lips, jaw, and ear.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "angle-profile-left",
    kinds: BEING,
    category: "angle",
    label: "Profile, left",
    summary: "True left side.",
    variation:
      "True left profile. Camera square to the face. Keep the exact nose, lips, jaw, and ear.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "angle-over-shoulder",
    kinds: BEING,
    category: "angle",
    label: "Over the shoulder",
    summary: "Three-quarter back, looking away.",
    variation:
      "Three-quarter back view over the shoulder. The subject looks away from us. Same hair length and fall.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "angle-low",
    kinds: ALL,
    category: "angle",
    label: "From below",
    summary: "Low camera, slight hero tilt.",
    variation:
      "Camera from below, a modest hero angle around 20–30 degrees up. Do not caricature. Same subject, same identity.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "angle-high",
    kinds: ALL,
    category: "angle",
    label: "From above",
    summary: "High camera looking down.",
    variation:
      "Camera from above, looking down about 25–35 degrees. Keep proportions honest. Same subject.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "angle-close-face",
    kinds: BEING,
    category: "angle",
    label: "Close face",
    summary: "Tight portrait, pores and eyes.",
    variation:
      "Very tight close-up of the face. Eyes razor-sharp. Skin texture fully visible. Same person.",
    aspect: "3:4",
    priority: 1,
  }),
  p({
    id: "angle-eyes",
    kinds: BEING,
    category: "angle",
    label: "Eyes only",
    summary: "Extreme close-up of the eyes.",
    variation:
      "Extreme close-up of both eyes and the bridge of the nose. Exact iris color, catchlights, lashes, and surrounding skin.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "angle-full-body",
    kinds: WORN,
    category: "angle",
    label: "Full body standing",
    summary: "Head to toe, standing.",
    variation:
      "Full-body standing plate, head to toe in frame, natural weight on one leg. Same identity, same proportions.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "angle-mid",
    kinds: WORN,
    category: "angle",
    label: "Waist-up",
    summary: "Mid-shot, conversational.",
    variation:
      "Waist-up mid-shot, conversational distance, slight 20 degree turn. Same person, same clothes unless the lock is an outfit.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "angle-window-in",
    kinds: PLACE,
    category: "angle",
    label: "From the window",
    summary: "Looking into the room from outside the glass.",
    variation:
      "Looking into the same room from just outside the window. Same furniture layout seen through glass and daylight.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "angle-ceiling",
    kinds: PLACE,
    category: "angle",
    label: "High corner",
    summary: "Near-ceiling view of the whole room.",
    variation:
      "High corner, almost ceiling height, showing how the whole room sits together. Nothing rearranged.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "angle-floor",
    kinds: PLACE,
    category: "angle",
    label: "At the floor",
    summary: "Low, along the boards.",
    variation:
      "Camera almost at the floor, looking along the boards toward the furniture. Same materials, same wear.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "angle-rear",
    kinds: THING,
    category: "angle",
    label: "Rear view",
    summary: "Straight on from behind.",
    variation:
      "True rear view of the same object. Same paint, same hardware, same scars.",
    aspect: "3:2",
    priority: 1,
  }),
  p({
    id: "angle-rear-34",
    kinds: THING,
    category: "angle",
    label: "Rear three-quarter",
    summary: "Leaving shot.",
    variation:
      "Rear three-quarter view, as if the object is leaving. Same identity.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "angle-detail-mark",
    kinds: THING,
    category: "angle",
    label: "Marking close-up",
    summary: "Badge, type, or signature scar.",
    variation:
      "Close-up of the most distinctive marking, badge, type treatment, or scar. Exact lettering and wear.",
    aspect: "1:1",
    priority: 1,
  }),

  // ── Expressions (beings) ────────────────────────────────────────
  p({
    id: "expr-neutral",
    kinds: BEING,
    category: "expression",
    label: "Neutral rest",
    summary: "Face at rest, no performance.",
    variation:
      "Neutral resting face, mouth closed, eyes soft. No performance. Same bone structure.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "expr-soft-smile",
    kinds: BEING,
    category: "expression",
    label: "Soft smile",
    summary: "A small, real smile.",
    variation:
      "A small real smile that reaches the eyes. Teeth only if it is natural for this face. Same person.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "expr-laugh",
    kinds: BEING,
    category: "expression",
    label: "Laughing",
    summary: "A genuine laugh, mid-breath.",
    variation:
      "Genuine mid-laugh, eyes creased, a breath in the chest. Keep the exact face — do not beautify.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "expr-serious",
    kinds: BEING,
    category: "expression",
    label: "Serious",
    summary: "Quiet, focused.",
    variation:
      "Serious, focused expression. Brow slightly set. Same eyes, same mouth shape at rest.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "expr-thought",
    kinds: BEING,
    category: "expression",
    label: "Contemplative",
    summary: "Looking slightly down and away.",
    variation:
      "Contemplative, gaze slightly down and away from the camera. Quiet interior life. Same face.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "expr-surprise",
    kinds: BEING,
    category: "expression",
    label: "Surprised",
    summary: "A small, human surprise.",
    variation:
      "A small human surprise — lifted brows, parted lips — not a cartoon. Same face.",
    aspect: "2:3",
    priority: 3,
  }),
  p({
    id: "expr-determined",
    kinds: BEING,
    category: "expression",
    label: "Determined",
    summary: "Set jaw, clear eyes.",
    variation:
      "Determined: set jaw, clear forward eyes, no snarl. Same person, same age.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "expr-speaking",
    kinds: BEING,
    category: "expression",
    label: "Mid-sentence",
    summary: "Caught talking.",
    variation:
      "Caught mid-sentence, mouth naturally open on a vowel. Same teeth, same lips, same face.",
    aspect: "2:3",
    priority: 3,
  }),

  // ── Lighting ────────────────────────────────────────────────────
  p({
    id: "light-window",
    kinds: ALL,
    category: "lighting",
    label: "North window",
    summary: "Soft daylight from one window.",
    variation:
      "Soft north-window daylight from camera left. Gentle falloff. No extra sources. Same subject.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "light-golden",
    kinds: ALL,
    category: "lighting",
    label: "Golden hour",
    summary: "Low warm sun, long shadows.",
    variation:
      "Golden hour, low warm sun raking across the subject, long soft shadows. Same identity.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "light-overcast",
    kinds: ALL,
    category: "lighting",
    label: "Overcast",
    summary: "Open shade, even and honest.",
    variation:
      "Overcast open-shade light, even and honest, almost no hard shadow. Same subject.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "light-blue",
    kinds: ALL,
    category: "lighting",
    label: "Blue hour",
    summary: "After sunset, cool air.",
    variation:
      "Blue hour, just after sunset, cool ambient air with a single warm practical if the scene has one. Same subject.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "light-sss",
    kinds: BEING,
    category: "lighting",
    label: "Lamp + window",
    summary: "The living-skin lighting recipe.",
    variation:
      "Soft warm practical lamp mixed with diffused window light, chosen so light travels through ears, nose, and fingertips. Ultra-soft shadow edges. Same person.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "light-rim",
    kinds: ALL,
    category: "lighting",
    label: "Rim night",
    summary: "Dark field, thin rim.",
    variation:
      "Night interior, dark field, a thin rim of light tracing the edge of the subject. Same identity, readable, not silhouetted into a new shape.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "light-studio",
    kinds: ALL,
    category: "lighting",
    label: "Studio key",
    summary: "Clean key and fill.",
    variation:
      "Quiet studio key and fill, large source, photographic not glossy. Same subject, no beauty dish plastic.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "light-noon",
    kinds: ALL,
    category: "lighting",
    label: "Hard noon",
    summary: "Direct sun, honest contrast.",
    variation:
      "Hard noon sun, honest contrast, small speculars on real materials. Same subject, no HDR glow.",
    aspect: "2:3",
    priority: 3,
  }),
  p({
    id: "light-neon",
    kinds: ALL,
    category: "lighting",
    label: "Street night",
    summary: "Practical street color, not cyber.",
    variation:
      "Night street with real sodium and shop-window color. No neon cyber palette. Same subject.",
    aspect: "2:3",
    priority: 3,
  }),
  p({
    id: "light-moon",
    kinds: ALL,
    category: "lighting",
    label: "Moonlight",
    summary: "Cool, dim, still photographic.",
    variation:
      "Moonlight, cool and dim but still a photograph — visible texture, no blue plastic cast. Same subject.",
    aspect: "2:3",
    priority: 3,
  }),

  // ── Poses ───────────────────────────────────────────────────────
  p({
    id: "pose-weight-hip",
    kinds: WORN,
    category: "pose",
    label: "Weight on one hip",
    summary: "Natural contrapposto.",
    variation:
      "Standing with weight on one hip, a natural contrapposto. Hands relaxed. Same body.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "pose-pockets",
    kinds: WORN,
    category: "pose",
    label: "Hands in pockets",
    summary: "Easy, unposed.",
    variation:
      "Hands in pockets or hooked in a waistband, easy and unposed. Same person, same clothes.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "pose-look-back",
    kinds: WORN,
    category: "pose",
    label: "Looking back",
    summary: "Caught turning.",
    variation:
      "Walking away and looking back over the shoulder, mid-turn. Same face, same hair motion.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "pose-lean",
    kinds: WORN,
    category: "pose",
    label: "Leaning",
    summary: "Against a wall or door.",
    variation:
      "Leaning one shoulder into a wall or doorframe. Natural compression in the cloth. Same person.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "pose-sit",
    kinds: WORN,
    category: "pose",
    label: "Seated",
    summary: "On steps or a chair.",
    variation:
      "Seated on steps or a simple chair, elbows on knees or one arm draped. Honest drape. Same person.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "pose-walk",
    kinds: WORN,
    category: "pose",
    label: "Walking toward",
    summary: "A still from a walk.",
    variation:
      "A still from walking toward the camera, one foot in the air. Natural motion in cloth and hair. Same person.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "pose-hands",
    kinds: BEING,
    category: "pose",
    label: "Looking at hands",
    summary: "Attention down.",
    variation:
      "Looking down at their own hands, quiet. Face still fully recognizable. Same person.",
    aspect: "2:3",
    priority: 3,
  }),

  // ── Detail / coverage ───────────────────────────────────────────
  p({
    id: "detail-hands",
    kinds: BEING,
    category: "detail",
    label: "Hands",
    summary: "Honest hands, no extra fingers.",
    variation:
      "A plate of the subject's real hands, resting. Exact skin, nails, and proportion. No extra fingers, no gloss.",
    aspect: "1:1",
    priority: 2,
  }),
  p({
    id: "detail-hair",
    kinds: BEING,
    category: "detail",
    label: "Hair close-up",
    summary: "Root to tip, flyaways.",
    variation:
      "Close-up of the hair: roots, part, individual strands and flyaways. Exact color and texture. No helmet hair.",
    aspect: "1:1",
    priority: 2,
  }),
  p({
    id: "detail-fabric",
    kinds: ["outfit", "character", "companion"],
    category: "detail",
    label: "Fabric weave",
    summary: "Cloth under real light.",
    variation:
      "Macro of the fabric weave and a natural crease. Authentic thread, pilling, and light in the cloth. No plastic shine.",
    aspect: "1:1",
    priority: 1,
  }),
  p({
    id: "detail-furniture",
    kinds: PLACE,
    category: "detail",
    label: "Furniture study",
    summary: "One locked piece, close.",
    variation:
      "A close study of the most distinctive piece of furniture. Same wood, fabric, wear, and hardware.",
    aspect: "4:3",
    priority: 1,
  }),
  p({
    id: "detail-material",
    kinds: PLACE,
    category: "detail",
    label: "Wall and floor",
    summary: "The room's skin.",
    variation:
      "Detail of the wall meeting the floor — the room's skin. Dust, scuffs, and true material.",
    aspect: "1:1",
    priority: 2,
  }),
  p({
    id: "detail-interior",
    kinds: THING,
    category: "detail",
    label: "Interior / inside",
    summary: "If it has an inside, show it.",
    variation:
      "The interior or inside of the same object if it has one (cabin, lining, mechanism). Same materials. If it has no interior, a truthful detail of its construction instead.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "detail-hardware",
    kinds: ["outfit", "object"],
    category: "detail",
    label: "Hardware",
    summary: "Buttons, zip, badge, chrome.",
    variation:
      "Close-up of hardware: buttons, zipper, badge, chrome, stitching. Exact design, exact wear.",
    aspect: "1:1",
    priority: 2,
  }),
  p({
    id: "cover-night-same",
    kinds: PLACE,
    category: "time",
    label: "Same angle, night",
    summary: "The locked view after dark.",
    variation:
      "The same establishing angle after dark, lit by the room's own practicals. Furniture does not move.",
    aspect: "3:2",
    priority: 1,
  }),
  p({
    id: "cover-morning",
    kinds: PLACE,
    category: "time",
    label: "First light",
    summary: "Early sun in the same room.",
    variation:
      "First morning light in the same room. Long pale rectangles on the same floor. Nothing rearranged.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "cover-lived",
    kinds: PLACE,
    category: "coverage",
    label: "Lived-in",
    summary: "A book, a cup, a jacket.",
    variation:
      "The same room slightly lived-in: a book, a cup, a jacket on the chair. Do not add new furniture.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "cover-empty",
    kinds: PLACE,
    category: "coverage",
    label: "Emptied still",
    summary: "No people, no clutter add.",
    variation:
      "The same room quiet and empty of people, no extra clutter invented. A still of the locked set.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "cover-rain",
    kinds: THING,
    category: "coverage",
    label: "Wet",
    summary: "Rain on the same object.",
    variation:
      "The same object in light rain, honest water beading on real materials. Same paint and form.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "cover-studio-obj",
    kinds: THING,
    category: "coverage",
    label: "Seamless studio",
    summary: "Object on a quiet sweep.",
    variation:
      "The same object on a quiet seamless sweep, museum product light. Identity unchanged.",
    aspect: "1:1",
    priority: 2,
  }),
  p({
    id: "cover-hanger",
    kinds: ["outfit"],
    category: "coverage",
    label: "On a hanger",
    summary: "The garment off the body.",
    variation:
      "The exact outfit on a simple hanger against a quiet wall. Gravity and cloth physics only.",
    aspect: "2:3",
    priority: 1,
  }),
  p({
    id: "cover-mannequin",
    kinds: ["outfit"],
    category: "coverage",
    label: "On a form",
    summary: "Dress form, no face.",
    variation:
      "The exact outfit on a linen dress form, no face, no fashion illustration. Same cut and cloth.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "cover-wind",
    kinds: ["outfit", "character", "companion"],
    category: "coverage",
    label: "In wind",
    summary: "Cloth and hair moving.",
    variation:
      "A light wind moving cloth and hair. Physics only — do not redesign the garment or the person.",
    aspect: "2:3",
    priority: 2,
  }),
  p({
    id: "style-mark-study",
    kinds: LOOK,
    category: "detail",
    label: "Mark study",
    summary: "Close on the stroke, grain, or line.",
    variation:
      "A tight study of the mark-making itself — brush, ink, grain, pixel, or line — filling the frame. Same medium. No new technique.",
    aspect: "1:1",
    priority: 1,
  }),
  p({
    id: "style-palette",
    kinds: LOOK,
    category: "detail",
    label: "Palette lock",
    summary: "Color world, nothing else changing.",
    variation:
      "A simple motif used only to lock the palette: the exact hues, mixing, and contrast curve of this style. Do not add colors the references do not have.",
    aspect: "1:1",
    priority: 1,
  }),
  p({
    id: "style-landscape",
    kinds: LOOK,
    category: "coverage",
    label: "Landscape",
    summary: "Open country in this language.",
    variation:
      "A landscape in this exact art style. Sky, ground, and distance as this language constructs them.",
    aspect: "3:2",
    priority: 1,
  }),
  p({
    id: "style-interior",
    kinds: LOOK,
    category: "coverage",
    label: "Interior",
    summary: "A room as this style builds it.",
    variation:
      "A quiet interior in this exact art style. Furniture and light only as this language would draw them.",
    aspect: "3:2",
    priority: 1,
  }),
  p({
    id: "style-architecture",
    kinds: LOOK,
    category: "coverage",
    label: "Facade",
    summary: "A building in this language.",
    variation:
      "A building or facade in this exact art style. Structure and ornament as this language sees them — same medium, same palette.",
    aspect: "3:2",
    priority: 1,
  }),
  p({
    id: "style-street",
    kinds: LOOK,
    category: "coverage",
    label: "Street",
    summary: "A public way, empty or sparse.",
    variation:
      "A street or public way in this exact art style. Sparse figures at most. Same grammar.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "style-crowd",
    kinds: LOOK,
    category: "coverage",
    label: "Figures",
    summary: "People as this style draws people.",
    variation:
      "Two or three figures in this exact art style, drawn the way this language draws bodies — not a new aesthetic, not photoreal portraits.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "style-hands",
    kinds: LOOK,
    category: "detail",
    label: "Hands",
    summary: "Hands as this language draws them.",
    variation:
      "A close study of hands in this exact art style. Proportion and mark of the style, not anatomical photography.",
    aspect: "1:1",
    priority: 2,
  }),
  p({
    id: "style-cloth",
    kinds: LOOK,
    category: "detail",
    label: "Cloth",
    summary: "Drape as this style sees it.",
    variation:
      "Cloth and drape in this exact art style. Folds as this language draws them, not fabric photography.",
    aspect: "3:4",
    priority: 2,
  }),
  p({
    id: "style-dawn",
    kinds: LOOK,
    category: "time",
    label: "Dawn",
    summary: "Morning as this style paints morning.",
    variation:
      "Dawn or early morning in this exact art style. Only the hour changes — medium, palette logic, and mark stay locked.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "style-dusk",
    kinds: LOOK,
    category: "time",
    label: "Dusk",
    summary: "Evening as this style paints evening.",
    variation:
      "Dusk in this exact art style. Keep the grammar; only the hour changes.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "style-night",
    kinds: LOOK,
    category: "time",
    label: "Night",
    summary: "Dark as this language draws dark.",
    variation:
      "Night in this exact art style. Darkness, lamps, and sky as this language would make them — not a photographic night recipe.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "style-weather",
    kinds: LOOK,
    category: "coverage",
    label: "Weather",
    summary: "Rain or haze in this language.",
    variation:
      "Weather — rain, haze, or wind — in this exact art style. Atmosphere as this language draws it.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "style-sky",
    kinds: LOOK,
    category: "coverage",
    label: "Sky",
    summary: "Sky and weather mass.",
    variation:
      "A sky study in this exact art style. Cloud, color, and empty space as this language treats them.",
    aspect: "3:2",
    priority: 3,
  }),
  p({
    id: "style-table",
    kinds: LOOK,
    category: "coverage",
    label: "Table by a window",
    summary: "Quiet domestic motif.",
    variation:
      "A table by a window in this exact art style. Domestic quiet. Same medium and palette.",
    aspect: "3:2",
    priority: 3,
  }),
  p({
    id: "style-high-key",
    kinds: LOOK,
    category: "lighting",
    label: "High key",
    summary: "The light end of this palette.",
    variation:
      "A high-key plate in this exact art style — the light end of its own contrast curve, not a photography lighting setup.",
    aspect: "3:2",
    priority: 2,
  }),
  p({
    id: "style-low-key",
    kinds: LOOK,
    category: "lighting",
    label: "Low key",
    summary: "The dark end of this palette.",
    variation:
      "A low-key plate in this exact art style — the dark end of its own contrast curve. Same marks, same hues.",
    aspect: "3:2",
    priority: 2,
  }),
];

const CATEGORY_ORDER: PromptDef["category"][] = [
  "seed",
  "angle",
  "expression",
  "lighting",
  "pose",
  "detail",
  "time",
  "coverage",
];

export const CATEGORY_LABEL: Record<PromptDef["category"], string> = {
  seed: "First plates",
  angle: "Camera",
  expression: "Expression",
  lighting: "Light",
  pose: "Pose",
  detail: "Detail",
  time: "Time of day",
  coverage: "Coverage",
};

export function promptsForKind(kind: Kind): PromptDef[] {
  return PROMPT_LIBRARY.filter((item) => item.kinds.includes(kind)).sort(
    (a, b) =>
      a.priority - b.priority ||
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      a.label.localeCompare(b.label),
  );
}

export function seedPromptsForKind(kind: Kind): PromptDef[] {
  return promptsForKind(kind).filter((item) => item.category === "seed");
}

export function promptById(id: string): PromptDef | undefined {
  return PROMPT_LIBRARY.find((item) => item.id === id);
}

export function coverageLabel(kind: Kind, done: number, total: number): string {
  const noun = kind === "style" ? "style" : KIND_META[kind].plural.toLowerCase();
  if (total === 0) return "No plates yet";
  const ratio = done / total;
  if (done === 0) return `Empty ${noun} lock`;
  if (ratio < 0.15) return "Unstable";
  if (ratio < 0.35) return "Anchored";
  if (ratio < 0.6) return "Locked";
  if (ratio < 0.85) return "Growing";
  return "World-ready";
}
