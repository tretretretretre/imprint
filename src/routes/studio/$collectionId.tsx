import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { KIND_META } from "@/lib/imprint/kinds";
import {
  CATEGORY_LABEL,
  coverageLabel,
  promptsForKind,
} from "@/lib/imprint/prompts";
import {
  deleteCollection,
  deleteFrame,
  generateVariation,
  getAiStatus,
  getCollection,
  promoteFrame,
  upscaleFrame,
} from "@/lib/imprint/server";
import type { CollectionDetail, FrameRow, PromptDef } from "@/lib/imprint/types";

export const Route = createFileRoute("/studio/$collectionId")({
  component: CollectionPage,
});

function CollectionPage() {
  const { collectionId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [col, setCol] = useState<CollectionDetail | null | undefined>(undefined);
  const [tab, setTab] = useState<"library" | "plates">("library");
  const [busy, setBusy] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [open, setOpen] = useState<FrameRow | null>(null);
  const [aiOn, setAiOn] = useState(true);

  const reload = useCallback(async () => {
    const next = await getCollection({ data: collectionId });
    setCol(next);
  }, [collectionId]);

  useEffect(() => {
    if (!user) return;
    void reload().catch(() => setCol(null));
    void getAiStatus()
      .then((s) => setAiOn(s.available))
      .catch(() => setAiOn(false));
  }, [user, reload]);

  const catalog = useMemo(
    () => (col ? promptsForKind(col.kind) : []),
    [col],
  );
  const doneIds = useMemo(
    () => new Set(col?.frames.map((f) => f.promptId).filter(Boolean) as string[]),
    [col],
  );
  const groups = useMemo(() => {
    const map = new Map<PromptDef["category"], PromptDef[]>();
    for (const p of catalog) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return map;
  }, [catalog]);

  if (isPending || col === undefined) {
    return (
      <AppShell>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-80 w-full" />
      </AppShell>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!col) {
    return (
      <AppShell>
        <p className="text-muted">This lock is gone.</p>
        <Link to="/studio" className="mt-4 inline-block text-sm text-fg underline">
          Back to studio
        </Link>
      </AppShell>
    );
  }

  const lock = col;

  async function runPrompt(prompt: PromptDef) {
    setBusy(prompt.id);
    try {
      await generateVariation({
        data: { collectionId: lock.id, promptId: prompt.id },
      });
      await reload();
      toast.success(prompt.label);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(null);
    }
  }

  async function runCustom() {
    if (!custom.trim()) return;
    setBusy("custom");
    try {
      await generateVariation({
        data: {
          collectionId: lock.id,
          customPrompt: custom.trim(),
          customLabel: "Custom plate",
        },
      });
      setCustom("");
      await reload();
      toast.success("Plate added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <Link
            to="/studio"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
          >
            <ArrowLeft className="size-3.5" /> Studio
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-4xl tracking-tight">{col.name}</h1>
            <Badge>{KIND_META[col.kind].label}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">{col.bible || KIND_META[col.kind].seedHint}</p>
          <p className="mt-2 text-xs text-subtle">
            {coverageLabel(col.kind, col.frameCount, catalog.length)} · {col.seedCount} canon
            · {col.frameCount}/{catalog.length} library
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              void navigate({
                to: "/combine",
                search: { with: col.id },
              })
            }
          >
            Combine
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              if (!confirm(`Delete ${col.name}?`)) return;
              await deleteCollection({ data: col.id });
              await navigate({ to: "/studio" });
            }}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      {!aiOn ? (
        <p className="mt-6 text-sm text-muted">
          Image generation is unavailable here. You can still upload plates and browse the
          library.
        </p>
      ) : null}

      {col.frames.filter((f) => f.role === "seed").length > 0 ? (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">Canon plates</p>
          <ul className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {col.frames
              .filter((f) => f.role === "seed")
              .map((f) => (
                <li key={f.id} className="w-28 shrink-0">
                  <button type="button" onClick={() => setOpen(f)} className="block w-full">
                    <img
                      src={f.imageData}
                      alt={f.promptLabel}
                      className="plate aspect-2/3 w-full rounded-lg object-cover"
                    />
                    <p className="mt-1 truncate text-xs text-subtle">{f.promptLabel}</p>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 flex gap-2">
        <Button
          size="sm"
          variant={tab === "library" ? "default" : "ghost"}
          onClick={() => setTab("library")}
        >
          Library
        </Button>
        <Button
          size="sm"
          variant={tab === "plates" ? "default" : "ghost"}
          onClick={() => setTab("plates")}
        >
          All plates
        </Button>
      </div>

      {tab === "library" ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="space-y-8">
            {[...groups.entries()].map(([cat, items]) => (
              <section key={cat}>
                <h2 className="font-display text-2xl tracking-tight">{CATEGORY_LABEL[cat]}</h2>
                <ul className="mt-3 divide-y divide-line">
                  {items.map((p) => {
                    const done = doneIds.has(p.id);
                    const frame = col.frames.find((f) => f.promptId === p.id);
                    return (
                      <li key={p.id} className="flex items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-fg">{p.label}</p>
                          <p className="truncate text-xs text-subtle">{p.summary}</p>
                        </div>
                        {frame ? (
                          <button type="button" onClick={() => setOpen(frame)}>
                            <img
                              src={frame.imageData}
                              alt=""
                              className="plate size-12 rounded-sm object-cover"
                            />
                          </button>
                        ) : null}
                        <Button
                          size="sm"
                          variant={done ? "outline" : "default"}
                          disabled={Boolean(busy) || !aiOn}
                          onClick={() => void runPrompt(p)}
                        >
                          {busy === p.id ? "Working…" : done ? "Again" : "Make"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
          <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
            <p className="text-xs uppercase tracking-[0.16em] text-subtle">Custom plate</p>
            <Textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={
                col.kind === "style"
                  ? "A new motif in this exact style — same medium, same palette."
                  : "A slight variation from the canon — new hour, new turn, same identity."
              }
            />
            <Button
              className="w-full"
              disabled={!custom.trim() || Boolean(busy) || !aiOn}
              onClick={() => void runCustom()}
            >
              {busy === "custom" ? "Working…" : "Make this plate"}
            </Button>
          </aside>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {col.frames.map((f) => (
            <li key={f.id}>
              <button type="button" onClick={() => setOpen(f)} className="block w-full text-left">
                <img
                  src={f.imageData}
                  alt={f.promptLabel}
                  className="plate aspect-3/4 w-full rounded-xl object-cover"
                />
                <p className="mt-2 truncate text-sm">{f.promptLabel}</p>
                <p className="text-xs text-subtle">{f.role === "seed" ? "Canon" : f.resolution}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="max-h-[90dvh] w-full max-w-3xl overflow-auto rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={open.imageData}
              alt={open.promptLabel}
              className="plate max-h-[70dvh] w-full rounded-xl object-contain"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-3">
              <div>
                <p className="font-display text-xl tracking-tight">{open.promptLabel}</p>
                <p className="text-xs text-subtle">{open.promptText}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {open.role !== "seed" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await promoteFrame({
                        data: { collectionId: col.id, frameId: open.id },
                      });
                      await reload();
                      setOpen(null);
                      toast.success("Promoted to canon");
                    }}
                  >
                    <Check />
                    Make canon
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={Boolean(busy) || !aiOn}
                  onClick={async () => {
                    setBusy("upscale");
                    try {
                      const next = await upscaleFrame({
                        data: { collectionId: col.id, frameId: open.id },
                      });
                      await reload();
                      setOpen(next);
                      toast.success("2K plate ready");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Upscale failed");
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  Upscale 2K
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await deleteFrame({
                      data: { collectionId: col.id, frameId: open.id },
                    });
                    await reload();
                    setOpen(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
