"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "@/components/LocaleProvider";
import { FriendActions } from "@/components/friends/FriendActions";
import type { UserWithRelation } from "@/lib/friends";

export function FriendSearch() {
  const dict = useTranslations();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserWithRelation[]>([]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) {
      setUsers([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(term)}`);
      const data = (await res.json()) as { users?: UserWithRelation[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? dict.common.error);
      setUsers(data.users ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ui-card space-y-4 p-5">
      <form onSubmit={onSearch} className="space-y-2">
        <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="friend-search">
          {dict.friends.searchLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="friend-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dict.friends.searchPlaceholder}
            className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
          <button type="submit" disabled={loading} className="ui-btn-primary px-4 py-2 text-sm disabled:opacity-50">
            {loading ? dict.friends.searching : dict.friends.search}
          </button>
        </div>
      </form>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {searched && users.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{dict.friends.noResults}</p>
      ) : null}
      {users.length > 0 ? (
        <ul className="space-y-2">
          {users.map((u) => (
            <li
              key={u.userId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--wash)] px-3 py-2"
            >
              <Link href={`/users/${u.userId}`} className="min-w-0 hover:underline">
                <p className="font-semibold text-[var(--ink)]">{u.ptcglName}</p>
                <p className="truncate text-sm text-[var(--muted)]">{u.displayName}</p>
              </Link>
              <FriendActions
                userId={u.userId}
                friendshipId={u.friendshipId}
                relation={u.relation}
                onSuccess={() => {
                  void fetch(`/api/users/search?q=${encodeURIComponent(q.trim())}`)
                    .then((res) => res.json())
                    .then((data: { users?: UserWithRelation[] }) => {
                      if (data.users) setUsers(data.users);
                    });
                }}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
