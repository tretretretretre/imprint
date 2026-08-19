import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <nav className="flex min-h-11 items-center gap-6 text-sm">
            <Link to="/" className="font-display text-lg tracking-tight text-fg">
              Imprint
            </Link>
            <Link
              to="/studio"
              className="text-muted transition-colors duration-150 hover:text-fg data-[status=active]:text-fg"
            >
              Studio
            </Link>
          </nav>
          <div className="flex min-h-11 items-center">
            {isPending ? (
              <div className="size-8 animate-pulse rounded-full bg-elevated" />
            ) : user ? (
              <button
                type="button"
                onClick={() => void signOut("/")}
                className="flex min-h-11 items-center gap-2 text-sm text-muted transition-colors duration-150 hover:text-fg"
              >
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt=""
                    className="size-8 rounded-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                  />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-elevated text-xs text-muted">
                    {(user.displayName ?? user.primaryEmail ?? "Y").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden sm:inline">Sign out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-11 items-center rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
    </div>
  );
}
