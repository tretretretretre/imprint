import type { ReactNode } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function RequireUser({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <AppShell>
        <Skeleton className="h-8 w-44" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Skeleton className="aspect-3/4 rounded-xl" />
          <Skeleton className="aspect-3/4 rounded-xl" />
          <Skeleton className="aspect-3/4 rounded-xl" />
        </div>
      </AppShell>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <>{children}</>;
}
