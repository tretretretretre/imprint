import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { FrameRow } from "@/lib/imprint/types";

export function PlateLightbox({
  frame,
  busy,
  onClose,
  onCanon,
  onUpscale,
  onRemove,
}: {
  frame: FrameRow;
  busy: boolean;
  onClose: () => void;
  onCanon?: () => void;
  onUpscale: () => void;
  onRemove: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full max-w-3xl overflow-auto rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={frame.imageData}
          alt={frame.promptLabel}
          className="plate max-h-[70dvh] w-full rounded-xl object-contain"
        />
        <div className="flex flex-wrap items-end justify-between gap-3 px-2 py-3">
          <div className="min-w-0">
            <p className="font-display text-xl tracking-tight">{frame.promptLabel}</p>
            <p className="text-xs text-subtle">{frame.promptText}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onCanon ? (
              <Button size="sm" variant="outline" onClick={onCanon}>
                Make canon
              </Button>
            ) : null}
            <Button size="sm" variant="outline" disabled={busy} onClick={onUpscale}>
              Upscale 2K
            </Button>
            <Button size="sm" variant="ghost" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
