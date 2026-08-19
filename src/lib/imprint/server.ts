import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { aiAvailable, askGrokJson, editImage, generateImage } from "@/lib/imagine/xai";
import {
  buildCombinePrompt,
  buildMasterPrompt,
  buildSeedPrompt,
  buildUpscalePrompt,
} from "./engine";
import { isKind } from "./kinds";
import { promptById, promptsForKind, seedPromptsForKind } from "./prompts";
import type {
  Aspect,
  CollectionDetail,
  CollectionRow,
  CombineRow,
  FrameRow,
  Kind,
  RelatedIdea,
  Resolution,
} from "./types";

type CollectionDb = {
  id: string;
  user_id: string;
  kind: string;
  name: string;
  bible: string;
  created_at: string;
  updated_at: string;
};

type FrameDb = {
  id: string;
  collection_id: string;
  user_id: string;
  role: string;
  prompt_id: string | null;
  prompt_label: string;
  prompt_text: string;
  master_prompt: string;
  image_data: string;
  aspect: string;
  resolution: string;
  created_at: string;
};

function mapCollection(
  row: CollectionDb,
  extras: { frameCount: number; seedCount: number; coverData: string | null },
): CollectionRow {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind as Kind,
    name: row.name,
    bible: row.bible,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    frameCount: extras.frameCount,
    seedCount: extras.seedCount,
    coverData: extras.coverData,
  };
}

function mapFrame(row: FrameDb): FrameRow {
  return {
    id: row.id,
    collectionId: row.collection_id,
    userId: row.user_id,
    role: row.role as FrameRow["role"],
    promptId: row.prompt_id,
    promptLabel: row.prompt_label,
    promptText: row.prompt_text,
    masterPrompt: row.master_prompt,
    imageData: row.image_data,
    aspect: row.aspect as Aspect,
    resolution: row.resolution as Resolution,
    createdAt: String(row.created_at),
  };
}

function refsFrom(frames: FrameRow[], limit = 3): string[] {
  const seeds = frames.filter((f) => f.role === "seed");
  const rest = frames.filter((f) => f.role !== "seed");
  return [...seeds, ...rest].slice(0, limit).map((f) => f.imageData);
}

export const getAiStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => ({ available: aiAvailable() }));

export const listCollections = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CollectionRow[]> => {
    const sql = await getSql();
    const rows = await sql<CollectionDb>`
      select id, user_id, kind, name, bible, created_at, updated_at
      from collections
      where user_id = ${context.userId}
      order by updated_at desc
    `;
    const result: CollectionRow[] = [];
    for (const row of rows) {
      const counts = await sql<{ frames: number; seeds: number }>`
        select
          count(*)::int as frames,
          count(*) filter (where role = 'seed')::int as seeds
        from frames
        where collection_id = ${row.id} and user_id = ${context.userId}
      `;
      const cover = await sql<{ image_data: string }>`
        select image_data from frames
        where collection_id = ${row.id} and user_id = ${context.userId}
        order by case when role = 'seed' then 0 else 1 end, created_at asc
        limit 1
      `;
      result.push(
        mapCollection(row, {
          frameCount: counts[0]?.frames ?? 0,
          seedCount: counts[0]?.seeds ?? 0,
          coverData: cover[0]?.image_data ?? null,
        }),
      );
    }
    return result;
  });

export const getCollection = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }): Promise<CollectionDetail | null> => {
    const sql = await getSql();
    const rows = await sql<CollectionDb>`
      select id, user_id, kind, name, bible, created_at, updated_at
      from collections
      where id = ${id} and user_id = ${context.userId}
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    const frames = await sql<FrameDb>`
      select id, collection_id, user_id, role, prompt_id, prompt_label, prompt_text,
             master_prompt, image_data, aspect, resolution, created_at
      from frames
      where collection_id = ${id} and user_id = ${context.userId}
      order by case when role = 'seed' then 0 else 1 end, created_at asc
    `;
    const mapped = frames.map(mapFrame);
    return {
      ...mapCollection(row, {
        frameCount: mapped.length,
        seedCount: mapped.filter((f) => f.role === "seed").length,
        coverData: mapped[0]?.imageData ?? null,
      }),
      frames: mapped,
    };
  });

export const createCollection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: string; name: string; bible: string }) => input)
  .handler(async ({ context, data }): Promise<CollectionRow> => {
    if (!isKind(data.kind)) throw new Error("Unknown lock type");
    const name = data.name.trim();
    if (!name) throw new Error("Name the lock");
    const id = crypto.randomUUID();
    const sql = await getSql();
    await sql`
      insert into collections (id, user_id, kind, name, bible)
      values (${id}, ${context.userId}, ${data.kind}, ${name}, ${data.bible.trim()})
    `;
    const rows = await sql<CollectionDb>`
      select id, user_id, kind, name, bible, created_at, updated_at
      from collections where id = ${id} and user_id = ${context.userId}
    `;
    return mapCollection(rows[0], { frameCount: 0, seedCount: 0, coverData: null });
  });

export const updateCollection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; name?: string; bible?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<CollectionDb>`
      select id, user_id, kind, name, bible, created_at, updated_at
      from collections where id = ${data.id} and user_id = ${context.userId}
    `;
    if (!existing[0]) throw new Error("Collection not found");
    const name = data.name?.trim() ?? existing[0].name;
    const bible = data.bible !== undefined ? data.bible.trim() : existing[0].bible;
    await sql`
      update collections
      set name = ${name}, bible = ${bible}, updated_at = now()
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const deleteCollection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from collections where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const addUploadedSeeds = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      collectionId: string;
      images: Array<{ dataUrl: string; promptId?: string; label?: string }>;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const cols = await sql<CollectionDb>`
      select id, user_id, kind, name, bible, created_at, updated_at
      from collections where id = ${data.collectionId} and user_id = ${context.userId}
    `;
    if (!cols[0]) throw new Error("Collection not found");
    const kind = cols[0].kind as Kind;
    const seeds = seedPromptsForKind(kind);
    const created: FrameRow[] = [];
    for (const [i, image] of data.images.slice(0, 3).entries()) {
      if (!image.dataUrl.startsWith("data:image/")) continue;
      const seed = seeds[i];
      const id = crypto.randomUUID();
      const promptId = image.promptId ?? seed?.id ?? null;
      const label = image.label ?? seed?.label ?? `Seed ${i + 1}`;
      await sql`
        insert into frames (
          id, collection_id, user_id, role, prompt_id, prompt_label, prompt_text,
          master_prompt, image_data, aspect, resolution
        ) values (
          ${id}, ${data.collectionId}, ${context.userId}, ${"seed"},
          ${promptId}, ${label}, ${"Uploaded reference"}, ${"Uploaded reference"},
          ${image.dataUrl}, ${seed?.aspect ?? "2:3"}, ${"1k"}
        )
      `;
      const rows = await sql<FrameDb>`
        select id, collection_id, user_id, role, prompt_id, prompt_label, prompt_text,
               master_prompt, image_data, aspect, resolution, created_at
        from frames where id = ${id}
      `;
      if (rows[0]) created.push(mapFrame(rows[0]));
    }
    await sql`update collections set updated_at = now() where id = ${data.collectionId} and user_id = ${context.userId}`;
    return created;
  });

async function loadOwned(userId: string, collectionId: string) {
  const sql = await getSql();
  const cols = await sql<CollectionDb>`
    select id, user_id, kind, name, bible, created_at, updated_at
    from collections where id = ${collectionId} and user_id = ${userId}
  `;
  if (!cols[0]) throw new Error("Collection not found");
  const frames = await sql<FrameDb>`
    select id, collection_id, user_id, role, prompt_id, prompt_label, prompt_text,
           master_prompt, image_data, aspect, resolution, created_at
    from frames
    where collection_id = ${collectionId} and user_id = ${userId}
    order by case when role = 'seed' then 0 else 1 end, created_at asc
  `;
  return { col: cols[0], frames: frames.map(mapFrame), sql };
}

async function insertFrame(
  userId: string,
  input: {
    collectionId: string;
    role: FrameRow["role"];
    promptId: string | null;
    promptLabel: string;
    promptText: string;
    masterPrompt: string;
    imageData: string;
    aspect: Aspect;
    resolution: Resolution;
  },
): Promise<FrameRow> {
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql`
    insert into frames (
      id, collection_id, user_id, role, prompt_id, prompt_label, prompt_text,
      master_prompt, image_data, aspect, resolution
    ) values (
      ${id}, ${input.collectionId}, ${userId}, ${input.role},
      ${input.promptId}, ${input.promptLabel}, ${input.promptText},
      ${input.masterPrompt}, ${input.imageData}, ${input.aspect}, ${input.resolution}
    )
  `;
  await sql`update collections set updated_at = now() where id = ${input.collectionId} and user_id = ${userId}`;
  const rows = await sql<FrameDb>`
    select id, collection_id, user_id, role, prompt_id, prompt_label, prompt_text,
           master_prompt, image_data, aspect, resolution, created_at
    from frames where id = ${id}
  `;
  return mapFrame(rows[0]);
}

export const generateSeedPlate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { collectionId: string; promptId: string }) => input)
  .handler(async ({ context, data }): Promise<FrameRow> => {
    const { col, frames } = await loadOwned(context.userId, data.collectionId);
    const seed = promptById(data.promptId);
    if (!seed) throw new Error("Unknown seed plate");
    const kind = col.kind as Kind;
    const existing = frames.find((f) => f.promptId === seed.id);
    if (existing) return existing;
    const refs = refsFrom(frames);
    const master = buildSeedPrompt({
      kind,
      name: col.name,
      bible: col.bible,
      seed,
      hasRefs: refs.length > 0,
    });
    const result =
      refs.length > 0
        ? await editImage({
            prompt: master,
            references: refs,
            aspect: seed.aspect,
            resolution: "1k",
          })
        : await generateImage({
            prompt: master,
            aspect: seed.aspect,
            resolution: "1k",
          });
    if (!result.ok) throw new Error(result.error);
    return insertFrame(context.userId, {
      collectionId: data.collectionId,
      role: "seed",
      promptId: seed.id,
      promptLabel: seed.label,
      promptText: seed.variation,
      masterPrompt: master,
      imageData: result.dataUrl,
      aspect: seed.aspect,
      resolution: "1k",
    });
  });

export const generateVariation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      collectionId: string;
      promptId?: string;
      customPrompt?: string;
      customLabel?: string;
      aspect?: Aspect;
      resolution?: Resolution;
    }) => input,
  )
  .handler(async ({ context, data }): Promise<FrameRow> => {
    const { col, frames } = await loadOwned(context.userId, data.collectionId);
    const kind = col.kind as Kind;
    const catalog = data.promptId ? promptById(data.promptId) : undefined;
    const variation =
      data.customPrompt?.trim() || catalog?.variation || "A subtle new plate of the same locked subject.";
    const label = data.customLabel?.trim() || catalog?.label || "Custom plate";
    const aspect = data.aspect ?? catalog?.aspect ?? "2:3";
    const resolution = data.resolution ?? "1k";
    const refs = refsFrom(frames);
    const master = buildMasterPrompt({
      kind,
      name: col.name,
      bible: col.bible,
      variation,
      hasRefs: refs.length > 0,
    });
    const result = await editImage({
      prompt: master,
      references: refs,
      aspect,
      resolution,
    });
    if (!result.ok) throw new Error(result.error);
    return insertFrame(context.userId, {
      collectionId: data.collectionId,
      role: catalog?.category === "seed" ? "seed" : "variation",
      promptId: catalog?.id ?? null,
      promptLabel: label,
      promptText: variation,
      masterPrompt: master,
      imageData: result.dataUrl,
      aspect,
      resolution,
    });
  });

export const upscaleFrame = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { collectionId: string; frameId: string }) => input)
  .handler(async ({ context, data }): Promise<FrameRow> => {
    const { col, frames } = await loadOwned(context.userId, data.collectionId);
    const frame = frames.find((f) => f.id === data.frameId);
    if (!frame) throw new Error("Plate not found");
    const master = buildUpscalePrompt(col.kind as Kind, col.name);
    const result = await editImage({
      prompt: master,
      references: [frame.imageData],
      aspect: frame.aspect,
      resolution: "2k",
    });
    if (!result.ok) throw new Error(result.error);
    return insertFrame(context.userId, {
      collectionId: data.collectionId,
      role: frame.role,
      promptId: frame.promptId,
      promptLabel: `${frame.promptLabel} · 2K`,
      promptText: frame.promptText,
      masterPrompt: master,
      imageData: result.dataUrl,
      aspect: frame.aspect,
      resolution: "2k",
    });
  });

export const promoteFrame = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { collectionId: string; frameId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update frames set role = 'seed'
      where id = ${data.frameId}
        and collection_id = ${data.collectionId}
        and user_id = ${context.userId}
    `;
    await sql`update collections set updated_at = now() where id = ${data.collectionId} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const deleteFrame = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { collectionId: string; frameId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      delete from frames
      where id = ${data.frameId}
        and collection_id = ${data.collectionId}
        and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const suggestRelated = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<RelatedIdea[]> => {
    const sql = await getSql();
    const rows = await sql<{ kind: string; name: string; bible: string }>`
      select kind, name, bible from collections
      where user_id = ${context.userId}
      order by updated_at desc
    `;
    const roster = rows
      .map((c) => `${c.kind}: ${c.name} — ${c.bible || "no bible yet"}`)
      .join("\n");
    const lead = rows[0]?.name;
    const fallback: RelatedIdea[] = lead
      ? [
          {
            kind: "object",
            name: `${lead}'s car`,
            bible: `The everyday car that belongs to ${lead}. Same world, same era, honest wear.`,
            reason: "A locked vehicle lets the character travel without drifting.",
          },
          {
            kind: "location",
            name: `${lead}'s room`,
            bible: `The private room of ${lead}. Furniture and light that never rearrange.`,
            reason: "A repeatable interior is the cheapest consistency win.",
          },
          {
            kind: "companion",
            name: `${lead}'s closest person`,
            bible: `A companion who belongs beside ${lead}. Distinct face, same world.`,
            reason: "A second locked face makes two-shots possible.",
          },
        ]
      : [
          {
            kind: "character",
            name: "A lead you can return to",
            bible: "One adult face, one haircut, one body. Photographed, not illustrated.",
            reason: "Start with a person. Everything else hangs off them.",
          },
        ];
    if (!aiAvailable()) return fallback.slice(0, 3);
    const json = await askGrokJson<{ ideas?: RelatedIdea[] }>(
      `You invent the next locks for a visual-consistency studio. Existing locks:\n${roster || "(none yet)"}\n\nReturn JSON: {"ideas":[{"kind":"character|location|object|style|outfit|companion","name":"...","bible":"one or two sentences locking identity","reason":"why this helps"}]}. Exactly 3 ideas. Prefer objects, places, outfits, companions that belong to existing locks. No sexual content. No minors.`,
    );
    const ideas = json?.ideas?.filter((idea) => isKind(idea.kind) && idea.name) ?? [];
    return ideas.length ? ideas.slice(0, 3) : fallback.slice(0, 3);
  });

export const listCombines = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CombineRow[]> => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      user_id: string;
      title: string;
      prompt_text: string;
      collection_ids: string;
      image_data: string;
      created_at: string;
    }>`
      select id, user_id, title, prompt_text, collection_ids, image_data, created_at
      from combine_jobs
      where user_id = ${context.userId}
      order by created_at desc
    `;
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      promptText: row.prompt_text,
      collectionIds: safeIds(row.collection_ids),
      imageData: row.image_data,
      createdAt: String(row.created_at),
    }));
  });

function safeIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export const combineCollections = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { collectionIds: string[]; scene: string; title?: string }) => input)
  .handler(async ({ context, data }): Promise<CombineRow> => {
    const ids = data.collectionIds.slice(0, 3);
    if (ids.length < 2) throw new Error("Pick at least two locks");
    const scene = data.scene.trim();
    if (!scene) throw new Error("Describe the scene");
    const refs: string[] = [];
    const names: string[] = [];
    const bibles: string[] = [];
    for (const id of ids) {
      const { col, frames } = await loadOwned(context.userId, id);
      names.push(col.name);
      bibles.push(col.bible);
      const seed = frames.find((f) => f.role === "seed") ?? frames[0];
      if (seed) refs.push(seed.imageData);
    }
    if (refs.length === 0) throw new Error("Those locks need at least one plate each");
    const master = buildCombinePrompt({ names, bibles, scene });
    const result = await editImage({
      prompt: master,
      references: refs,
      aspect: "3:2",
      resolution: "1k",
    });
    if (!result.ok) throw new Error(result.error);
    const sql = await getSql();
    const id = crypto.randomUUID();
    const title = data.title?.trim() || names.join(" × ");
    await sql`
      insert into combine_jobs (id, user_id, title, prompt_text, collection_ids, image_data)
      values (${id}, ${context.userId}, ${title}, ${scene}, ${JSON.stringify(ids)}, ${result.dataUrl})
    `;
    return {
      id,
      userId: context.userId,
      title,
      promptText: scene,
      collectionIds: ids,
      imageData: result.dataUrl,
      createdAt: new Date().toISOString(),
    };
  });

export const catalogForKind = createServerFn({ method: "GET" })
  .validator((kind: string) => kind)
  .handler(async ({ data: kind }) => {
    if (!isKind(kind)) return [];
    return promptsForKind(kind);
  });
