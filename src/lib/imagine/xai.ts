import type { Aspect, Resolution } from "@/lib/imprint/types";

const GEN_URL = "https://api.x.ai/v1/images/generations";
const EDIT_URL = "https://api.x.ai/v1/images/edits";
const MODEL = "grok-imagine-image-2.0";

export function aiAvailable(): boolean {
  return Boolean(process.env.XAI_API_KEY);
}

type ImageInput = { url: string; type: "image_url" };

type ImagineResult =
  | { ok: true; dataUrl: string }
  | { ok: false; error: string };

function authHeaders(): HeadersInit | null {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

function asImageInput(src: string): ImageInput {
  return { url: src, type: "image_url" };
}

type ApiBody = {
  data?: Array<{ url?: string; b64_json?: string }>;
  url?: string;
  b64_json?: string;
  error?: { message?: string } | string;
};

async function toDataUrl(raw: ApiBody): Promise<string> {
  const first = raw.data?.[0];
  const b64 = first?.b64_json ?? raw.b64_json;
  if (b64) {
    const clean = b64.replace(/^data:image\/\w+;base64,/, "");
    return `data:image/jpeg;base64,${clean}`;
  }
  const url = first?.url ?? raw.url;
  if (!url) throw new Error("Imagine returned no image");
  if (url.startsWith("data:")) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch generated image (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function postImagine(
  url: string,
  body: Record<string, unknown>,
): Promise<ImagineResult> {
  const headers = authHeaders();
  if (!headers) return { ok: false, error: "AI is not available in this environment" };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: ApiBody = {};
  try {
    parsed = JSON.parse(text) as ApiBody;
  } catch {
    return { ok: false, error: `Imagine returned unreadable output (${res.status})` };
  }
  if (!res.ok) {
    const msg =
      typeof parsed.error === "string"
        ? parsed.error
        : parsed.error?.message || `Imagine error ${res.status}`;
    return { ok: false, error: msg };
  }
  try {
    return { ok: true, dataUrl: await toDataUrl(parsed) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not read the image",
    };
  }
}

export async function generateImage(input: {
  prompt: string;
  aspect: Aspect;
  resolution?: Resolution;
}): Promise<ImagineResult> {
  return postImagine(GEN_URL, {
    model: MODEL,
    prompt: input.prompt,
    n: 1,
    aspect_ratio: input.aspect,
    resolution: input.resolution ?? "1k",
    response_format: "b64_json",
  });
}

export async function editImage(input: {
  prompt: string;
  references: string[];
  aspect?: Aspect;
  resolution?: Resolution;
}): Promise<ImagineResult> {
  const refs = input.references.filter(Boolean).slice(0, 3);
  if (refs.length === 0) {
    return generateImage({
      prompt: input.prompt,
      aspect: input.aspect ?? "2:3",
      resolution: input.resolution,
    });
  }

  const images = refs.map(asImageInput);
  const base: Record<string, unknown> = {
    model: MODEL,
    prompt: input.prompt,
    n: 1,
    resolution: input.resolution ?? "1k",
    response_format: "b64_json",
  };
  if (input.aspect) base.aspect_ratio = input.aspect;

  const multi = await postImagine(EDIT_URL, { ...base, images });
  if (multi.ok) return multi;

  const single = await postImagine(EDIT_URL, {
    ...base,
    image: images[0],
  });
  if (single.ok) return single;
  return multi.ok ? multi : single;
}

export async function askGrokJson<T>(prompt: string): Promise<T | null> {
  const headers = authHeaders();
  if (!headers) return null;
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    const a = text.indexOf("[");
    const b = text.lastIndexOf("]");
    if (a < 0 || b <= a) return null;
    try {
      return JSON.parse(text.slice(a, b + 1)) as T;
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
