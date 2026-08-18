import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { FriendActions } from "@/components/friends/FriendActions";
import { FriendSearch } from "@/components/friends/FriendSearch";
import { listFriends, listPendingIncoming, listPendingOutgoing } from "@/lib/db/queries";
import { getServerDictionary } from "@/lib/i18n/server";
import { requireProfile } from "@/lib/session";

export default async function FriendsPage() {
  const { session, profile } = await requireProfile();
  const dict = await getServerDictionary();
  const userId = session.user.id;
  const [friends, incoming, outgoing] = await Promise.all([
    listFriends(userId),
    listPendingIncoming(userId),
    listPendingOutgoing(userId),
  ]);

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <h1 className="font-display text-3xl text-[var(--ink)]">{dict.friends.title}</h1>
        <FriendSearch />

        <section className="space-y-3">
          <h2 className="font-display text-xl text-[var(--ink)]">{dict.friends.incoming}</h2>
          {incoming.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{dict.friends.emptyIncoming}</p>
          ) : (
            <ul className="space-y-2">
              {incoming.map((u) => (
                <li
                  key={u.userId}
                  className="ui-card flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <Link href={`/users/${u.userId}`} className="min-w-0 hover:underline">
                    <p className="font-semibold text-[var(--ink)]">{u.ptcglName}</p>
                    <p className="truncate text-sm text-[var(--muted)]">{u.displayName}</p>
                  </Link>
                  <FriendActions
                    userId={u.userId}
                    friendshipId={u.friendshipId}
                    relation={u.relation}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-[var(--ink)]">{dict.friends.outgoing}</h2>
          {outgoing.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{dict.friends.emptyOutgoing}</p>
          ) : (
            <ul className="space-y-2">
              {outgoing.map((u) => (
                <li
                  key={u.userId}
                  className="ui-card flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <Link href={`/users/${u.userId}`} className="min-w-0 hover:underline">
                    <p className="font-semibold text-[var(--ink)]">{u.ptcglName}</p>
                    <p className="truncate text-sm text-[var(--muted)]">{u.displayName}</p>
                  </Link>
                  <FriendActions
                    userId={u.userId}
                    friendshipId={u.friendshipId}
                    relation={u.relation}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-[var(--ink)]">{dict.friends.listTitle}</h2>
          {friends.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
              {dict.friends.empty}
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {friends.map((u) => (
                <li key={u.userId}>
                  <div className="ui-card flex items-center justify-between gap-3 p-4">
                    <Link href={`/users/${u.userId}`} className="min-w-0 hover:underline">
                      <p className="font-semibold text-[var(--ink)]">{u.ptcglName}</p>
                      <p className="truncate text-sm text-[var(--muted)]">{u.displayName}</p>
                    </Link>
                    <FriendActions
                      userId={u.userId}
                      friendshipId={u.friendshipId}
                      relation={u.relation}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
