import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireUser } from "@/components/require-user";
import { AppShell } from "@/components/app-shell";
import { LockCard } from "@/components/lock-card";
import { Button } from "@/components/ui/button";
import { KIND_META } from "@/lib/imprint/kinds";
import { listCollections, suggestRelated } from "@/lib/imprint/server";
import type { CollectionRow, RelatedIdea } from "@/lib/imprint/types";

export const Route = createFileRoute("/studio/")({ component: StudioRoute });

function StudioRoute() {
  return (
    <RequireUser>
      <Studio />
    </RequireUser>
  );
}

function Studio() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<CollectionRow[] | null>(null);
  const [ideas, setIdeas] = useState<RelatedIdea[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listCollections()
      .then((data) => {
        if (alive) setRows(data);
      })
      .catch((e: unknown) => {
        if (alive) setErr(e instanceof Error ? e.message : "Could not load");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">Studio</p>
          <h1 className="mt-1 font-display text-[length:var(--text-title)] tracking-tight">
            Your locks
          </h1>
        </div>
        <Button asChild>
          <Link to="/studio/new">New lock</Link>
        </Button>
      </div>

      {err ? <p className="mt-6 text-sm text-danger">{err}</p> : null}

      {rows === null ? null : rows.length === 0 ? (
        <div className="mt-14 max-w-lg">
          <div className="overflow-hidden rounded-2xl bg-surface p-2">
            <img
              src="/hero-contact.jpg"
              alt=""
              className="plate aspect-video w-full rounded-xl object-cover"
            />
          </div>
          <h2 className="mt-6 font-display text-2xl tracking-tight">Nothing locked yet</h2>
          <p className="mt-2 text-sm text-muted">
            Start with a person, a room, a car. Two or three first plates and the sheet
            will have something to orbit.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <li key={row.id}>
                <LockCard row={row} />
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/combine"
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              Combine locks
            </Link>
            <button
              type="button"
              className="text-sm text-muted transition-colors hover:text-fg"
              onClick={() => {
                void suggestRelated()
                  .then(setIdeas)
                  .catch(() => setIdeas([]));
              }}
            >
              Suggest the next lock
            </button>
          </div>
        </>
      )}

      {ideas.length > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {ideas.map((idea) => (
            <li key={idea.name} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
              <p className="text-xs uppercase tracking-[0.16em] text-subtle">
                {KIND_META[idea.kind].label}
              </p>
              <p className="mt-1 font-display text-xl tracking-tight">{idea.name}</p>
              <p className="mt-2 text-sm text-muted">{idea.reason}</p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() =>
                  void navigate({
                    to: "/studio/new",
                    search: { kind: idea.kind, name: idea.name, bible: idea.bible },
                  })
                }
              >
                Start this lock
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </AppShell>
  );
}
