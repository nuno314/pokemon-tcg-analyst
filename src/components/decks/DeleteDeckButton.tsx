"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteDeckButton({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this deck?")) return;
    setLoading(true);
    const res = await fetch(`/api/decks/${deckId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Delete failed");
      return;
    }
    router.push("/decks");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className="ui-btn-danger px-3 py-2 text-sm disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
