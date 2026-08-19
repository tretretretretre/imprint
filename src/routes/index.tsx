import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { KIND_META, KIND_ORDER } from "@/lib/imprint/kinds";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  const cta = !isPending && user ? "/studio" : "/login";

  return (
    <AppShell>
      <section className="reveal grid items-end gap-10 pb-16 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.2em] text-subtle">Consistency studio</p>
          <h1 className="font-display text-[length:var(--text-display)] tracking-tight">
            Lock a look.
            <br />
            Grow a world.
          </h1>
          <p className="max-w-md text-base text-muted">
            Two or three plates of the same person, room, or thing. Then orbit — never
            invent a new one.
          </p>
          <Link
            to={cta}
            className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Enter the studio
          </Link>
        </div>
        <figure>
          <div className="overflow-hidden rounded-2xl bg-surface p-2">
            <img
              src="/hero-contact.jpg"
              alt="The same bedroom from three beginning angles"
              className="plate aspect-video w-full rounded-xl object-cover"
            />
          </div>
          <figcaption className="px-1 pt-3 text-xs text-subtle">
            One room. Three first plates.
          </figcaption>
        </figure>
      </section>

      <section className="grid gap-6 border-t border-line py-14 sm:grid-cols-3">
        <Strip src="/strip-character.jpg" kicker="Character" title="Same face, every turn" />
        <Strip src="/strip-place.jpg" kicker="Place" title="Furniture that never moves" />
        <Strip src="/strip-object.jpg" kicker="Object" title="The car that stays the car" />
      </section>

      <section className="grid gap-10 border-t border-line py-14 lg:grid-cols-2">
        <div className="max-w-md space-y-3">
          <h2 className="font-display text-[length:var(--text-title)] tracking-tight">
            Six kinds of lock
          </h2>
          <p className="text-sm text-muted">
            Built for living skin — pores, flyaways, light through the ear — then opened
            to rooms, objects, outfits, companions, and style. Always edit the canon.
          </p>
        </div>
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {KIND_ORDER.map((id) => {
            const k = KIND_META[id];
            return (
              <div key={id}>
                <dt className="text-xs uppercase tracking-[0.16em] text-subtle">{k.label}</dt>
                <dd className="mt-1 text-sm text-muted">{k.blurb}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <ol className="grid gap-8 border-t border-line py-14 sm:grid-cols-3">
        <Step n="01" title="First plates">
          Upload, or generate front, 45° left, 45° right. Those become canon.
        </Step>
        <Step n="02" title="Orbit">
          Angle, light, weather. Each plate edits the existing ones.
        </Step>
        <Step n="03" title="Combine">
          When two locks hold, put the person in the room — or beside the car.
        </Step>
      </ol>
    </AppShell>
  );
}

function Strip({
  src,
  kicker,
  title,
}: {
  src: string;
  kicker: string;
  title: string;
}) {
  return (
    <figure>
      <div className="overflow-hidden rounded-xl bg-surface p-2">
        <img src={src} alt="" className="plate aspect-4/3 w-full rounded-lg object-cover" />
      </div>
      <figcaption className="px-1 pt-3">
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">{kicker}</p>
        <p className="mt-1 font-display text-lg tracking-tight">{title}</p>
      </figcaption>
    </figure>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <p className="text-xs tabular-nums text-subtle">{n}</p>
      <h3 className="mt-2 font-display text-xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted">{children}</p>
    </li>
  );
}
