"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "@/components/LocaleProvider";
import type { FriendRelation } from "@/lib/friends";

export function FriendActions({
  userId,
  friendshipId,
  relation,
  onSuccess,
}: {
  userId: string;
  friendshipId: string | null;
  relation: FriendRelation;
  onSuccess?: () => void;
}) {
  const dict = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(path: string, method: string, body?: object) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? dict.common.error);
      router.refresh();
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {relation === "none" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => run("/api/friends", "POST", { userId })}
          className="ui-btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {dict.friends.add}
        </button>
      ) : null}
      {relation === "pending_outgoing" ? (
        <>
          <span className="text-sm text-[var(--muted)]">{dict.friends.sent}</span>
          {friendshipId ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => run(`/api/friends/${friendshipId}`, "DELETE")}
              className="ui-btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {dict.friends.decline}
            </button>
          ) : null}
        </>
      ) : null}
      {relation === "pending_incoming" && friendshipId ? (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => run(`/api/friends/${friendshipId}/accept`, "POST")}
            className="ui-btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
          >
            {dict.friends.accept}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => run(`/api/friends/${friendshipId}/decline`, "POST")}
            className="ui-btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
          >
            {dict.friends.decline}
          </button>
        </>
      ) : null}
      {relation === "accepted" && friendshipId ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            if (!confirm(dict.friends.unfriendConfirm)) return;
            void run(`/api/friends/${friendshipId}`, "DELETE");
          }}
          className="ui-btn-danger px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {dict.friends.unfriend}
        </button>
      ) : null}
      {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
    </div>
  );
}
