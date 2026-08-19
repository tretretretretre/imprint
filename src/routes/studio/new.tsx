import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { compressImage } from "@/lib/imprint/image";
import { isKind, KIND_META, KIND_ORDER } from "@/lib/imprint/kinds";
import { seedPromptsForKind } from "@/lib/imprint/prompts";
import {
  addUploadedSeeds,
  createCollection,
  generateSeedPlate,
} from "@/lib/imprint/server";
import type { Kind } from "@/lib/imprint/types";
import { cn } from "@/lib/utils";

type Search = { kind?: string; name?: string; bible?: string };

export const Route = createFileRoute("/studio/new")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    kind: typeof search.kind === "string" ? search.kind : undefined,
    name: typeof search.name === "string" ? search.name : undefined,
    bible: typeof search.bible === "string" ? search.bible : undefined,
  }),
  component: NewLock,
});

function NewLock() {
  const { user, isPending } = useCurrentUserState();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const initialKind = search.kind && isKind(search.kind) ? search.kind : null;
  const [step, setStep] = useState<1 | 2 | 3>(initialKind ? 2 : 1);
  const [kind, setKind] = useState<Kind | null>(initialKind);
  const [name, setName] = useState(search.name ?? "");
  const [bible, setBible] = useState(search.bible ?? "");
  const [files, setFiles] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const seeds = useMemo(() => (kind ? seedPromptsForKind(kind) : []), [kind]);
  const meta = kind ? KIND_META[kind] : null;

  if (isPending) {
    return (
      <AppShell>
        <div className="h-40 animate-pulse rounded-xl bg-surface" />
      </AppShell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  async function finish(generateMissing: boolean) {
    if (!kind || !name.trim()) return;
    setBusy("Creating the lock…");
    try {
      const col = await createCollection({
        data: { kind, name: name.trim(), bible: bible.trim() },
      });
      if (files.length) {
        setBusy("Saving your plates…");
        await addUploadedSeeds({
          data: {
            collectionId: col.id,
            images: files.map((dataUrl, i) => ({
              dataUrl,
              promptId: seeds[i]?.id,
              label: seeds[i]?.label,
            })),
          },
        });
      }
      if (generateMissing) {
        const already = files.length;
        for (const [i, seed] of seeds.entries()) {
          if (i < already) continue;
          setBusy(`Generating ${seed.label}…`);
          await generateSeedPlate({
            data: { collectionId: col.id, promptId: seed.id },
          });
        }
      }
      toast.success("Lock is open");
      await navigate({ to: "/studio/$collectionId", params: { collectionId: col.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the lock");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell>
      <p className="text-xs uppercase tracking-[0.18em] text-subtle">New lock</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">
        {step === 1 && "What are we locking?"}
        {step === 2 && (meta ? `Name the ${meta.label.toLowerCase()}` : "Name it")}
        {step === 3 && "First plates"}
      </h1>

      {step === 1 ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {KIND_ORDER.map((id) => {
            const k = KIND_META[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => {
                    setKind(id);
                    setStep(2);
                  }}
                  className={cn(
                    "h-full w-full rounded-xl bg-surface p-5 text-left shadow-[var(--shadow-border)]",
                    "transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-subtle">{k.label}</p>
                  <p className="mt-2 font-display text-xl tracking-tight">{k.blurb}</p>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {step === 2 && meta ? (
        <form
          className="mt-8 max-w-lg space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) setStep(3);
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm text-muted">Name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah, Sarah’s room, the green wagon…"
              autoFocus
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-muted">
              {kind === "style" ? "Style lock" : "Identity lock"}
            </span>
            <Textarea
              value={bible}
              onChange={(e) => setBible(e.target.value)}
              placeholder={`What must never change — the ${meta.lockNoun}.`}
            />
          </label>
          <p className="text-sm text-subtle">{meta.seedHint}</p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              First plates
            </Button>
          </div>
        </form>
      ) : null}

      {step === 3 && meta ? (
        <div className="mt-8 max-w-lg space-y-6">
          <p className="text-sm text-muted">
            Drop up to three photographs, or let the studio grow the first plates from
            the lock. Uploads become canon immediately.
          </p>
          <label className="flex h-28 cursor-pointer items-center justify-center rounded-xl bg-surface text-sm text-muted shadow-[var(--shadow-border)]">
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={async (e) => {
                const list = Array.from(e.target.files ?? []).slice(0, 3);
                const next: string[] = [];
                for (const file of list) {
                  next.push(await compressImage(file));
                }
                setFiles(next);
              }}
            />
            {files.length ? `${files.length} plate${files.length === 1 ? "" : "s"} ready` : "Choose photographs"}
          </label>
          {files.length ? (
            <div className="grid grid-cols-3 gap-2">
              {files.map((src) => (
                <img key={src.slice(0, 40)} src={src} alt="" className="plate aspect-3/4 rounded-lg object-cover" />
              ))}
            </div>
          ) : null}
          {busy ? <p className="text-sm text-muted">{busy}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(2)} disabled={Boolean(busy)}>
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(busy)}
              onClick={() => void finish(false)}
            >
              Save without generating
            </Button>
            <Button type="button" disabled={Boolean(busy)} onClick={() => void finish(true)}>
              {files.length ? "Fill the missing plates" : "Generate the first three"}
            </Button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
