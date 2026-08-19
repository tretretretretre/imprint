import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { KIND_META } from "@/lib/imprint/kinds";
import {
  combineCollections,
  getAiStatus,
  listCollections,
  listCombines,
} from "@/lib/imprint/server";
import type { CollectionRow, CombineRow } from "@/lib/imprint/types";
import { cn } from "@/lib/utils";

type Search = { with?: string };

export const Route = createFileRoute("/combine")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    with: typeof search.with === "string" ? search.with : undefined,
  }),
  component: CombinePage,
});

function CombinePage() {
  const { user, isPending } = useCurrentUserState();
  const search = Route.useSearch();
  const [rows, setRows] = useState<CollectionRow[] | null>(null);
  const [jobs, setJobs] = useState<CombineRow[]>([]);
  const [picked, setPicked] = useState<string[]>(search.with ? [search.with] : []);
  const [scene, setScene] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiOn, setAiOn] = useState(true);

  useEffect(() => {
    if (!user) return;
    void listCollections()
      .then(setRows)
      .catch(() => setRows([]));
    void listCombines()
      .then(setJobs)
      .catch(() => setJobs([]));
    void getAiStatus()
      .then((s) => setAiOn(s.available))
      .catch(() => setAiOn(false));
  }, [user]);

  if (isPending || rows === null) {
    return (
      <AppShell>
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-6 h-64" />
      </AppShell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  function toggle(id: string) {
    setPicked((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 3) return cur;
      return [...cur, id];
    });
  }

  async function run() {
    setBusy(true);
    try {
      const job = await combineCollections({
        data: { collectionIds: picked, scene: scene.trim() },
      });
      setJobs((cur) => [job, ...cur]);
      toast.success("Combined plate ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Combine failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <p className="text-xs uppercase tracking-[0.18em] text-subtle">Combine</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">Put locks in one frame</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Pick two or three canons — a person and a room, a person and a car — then describe
        the still. Each identity stays itself.
      </p>

      {rows.length < 2 ? (
        <p className="mt-10 text-sm text-muted">
          You need at least two locks with plates.{" "}
          <Link to="/studio/new" className="text-fg underline">
            Start another lock
          </Link>
          .
        </p>
      ) : (
        <>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => {
              const on = picked.includes(row.id);
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => toggle(row.id)}
                    className={cn(
                      "w-full overflow-hidden rounded-xl bg-surface p-2 text-left shadow-[var(--shadow-border)]",
                      on && "shadow-[var(--shadow-border-hover)]",
                    )}
                  >
                    <div className="aspect-4/3 overflow-hidden rounded-lg bg-elevated">
                      {row.coverData ? (
                        <img
                          src={row.coverData}
                          alt=""
                          className="plate h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-2 px-1 py-2">
                      <span className="truncate font-display text-lg tracking-tight">
                        {row.name}
                      </span>
                      <Badge>{KIND_META[row.kind].label}</Badge>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 max-w-xl space-y-3">
            <Textarea
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              placeholder="Sarah in the green wagon at blue hour, parked outside her room’s brick face."
            />
            <Button
              disabled={picked.length < 2 || !scene.trim() || busy || !aiOn}
              onClick={() => void run()}
            >
              {busy ? "Composing…" : "Compose"}
            </Button>
          </div>
        </>
      )}

      {jobs.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">Combined plates</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <li key={job.id} className="overflow-hidden rounded-xl bg-surface p-2">
                <img
                  src={job.imageData}
                  alt={job.title}
                  className="plate aspect-3/2 w-full rounded-lg object-cover"
                />
                <p className="px-1 pt-3 font-display text-lg tracking-tight">{job.title}</p>
                <p className="px-1 pb-2 text-xs text-subtle">{job.promptText}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AppShell>
  );
}
