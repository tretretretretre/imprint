import { Link } from "@tanstack/react-router";
import { KIND_META } from "@/lib/imprint/kinds";
import { coverageLabel, promptsForKind } from "@/lib/imprint/prompts";
import type { CollectionRow } from "@/lib/imprint/types";

export function LockCard({ row }: { row: CollectionRow }) {
  const total = promptsForKind(row.kind).length;
  return (
    <Link
      to="/studio/$collectionId"
      params={{ collectionId: row.id }}
      className="block overflow-hidden rounded-2xl bg-surface p-2 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
    >
      <div className="aspect-3/4 overflow-hidden rounded-xl bg-elevated">
        {row.coverData ? (
          <img src={row.coverData} alt="" className="plate h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center px-4 text-center text-xs text-subtle">
            No plates yet
          </div>
        )}
      </div>
      <div className="px-2 py-3">
        <p className="font-display text-xl tracking-tight">{row.name}</p>
        <p className="mt-1 text-xs tabular-nums text-subtle">
          {KIND_META[row.kind].label} · {coverageLabel(row.kind, row.frameCount, total)} ·{" "}
          {row.frameCount}/{total}
        </p>
      </div>
    </Link>
  );
}
