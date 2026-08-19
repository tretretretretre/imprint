import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  if (!isPending && user) return <Navigate to="/studio" />;

  return (
    <main className="grid min-h-dvh bg-bg text-fg lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="/strip-character.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-bg/35" />
      </div>
      <div className="grid place-items-center px-6 py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-3">
            <Link to="/" className="font-display text-lg tracking-tight">
              Imprint
            </Link>
            <h1 className="font-display text-4xl tracking-tight">Sign in to your canon</h1>
            <p className="text-sm text-muted">
              Locks live on your profile. Google or X, then start the first plates.
            </p>
          </div>
          {authEnabled ? (
            <div className="space-y-3">
              {GROK_PROVIDERS.map((p) => (
                <button
                  key={p.providerId}
                  type="button"
                  onClick={() => signIn(p.providerId, { callbackURL: "/studio" })}
                  className="flex h-11 w-full items-center justify-center rounded-md bg-accent text-sm font-medium text-accent-fg transition-opacity duration-150 hover:opacity-90"
                >
                  Continue with {p.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
          <Link to="/" className="block text-sm text-muted transition-colors hover:text-fg">
            Back
          </Link>
        </div>
      </div>
    </main>
  );
}
