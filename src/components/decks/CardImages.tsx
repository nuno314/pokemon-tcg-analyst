"use client";

import { useState } from "react";
import { limitlessCardImageUrl } from "@/lib/pokemon/card-images";

export function TcgCardImage({
  name,
  setCode,
  collectorNumber,
  width = 120,
  className = "",
  size = "full",
}: {
  name: string;
  setCode: string;
  collectorNumber: string;
  width?: number;
  className?: string;
  size?: "full" | "thumb";
}) {
  const [failed, setFailed] = useState(false);
  const src = limitlessCardImageUrl(setCode, collectorNumber, size);
  const height = Math.round(width * (825 / 600));

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border border-[var(--line)] bg-[var(--wash)] px-1 text-center text-[10px] text-[var(--muted)] ${className}`}
        style={{ width, height }}
        title={name}
      >
        {setCode} {collectorNumber}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={width}
      height={height}
      className={`rounded-md object-contain shadow-sm ${className}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function DeckCardRow({
  qty,
  name,
  setCode,
  collectorNumber,
}: {
  qty: number;
  name: string;
  setCode: string;
  collectorNumber: string;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-[var(--wash)]">
      <TcgCardImage
        name={name}
        setCode={setCode}
        collectorNumber={collectorNumber}
        width={44}
        size="thumb"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--ink)]">
          <span className="tabular-nums text-[var(--accent)]">{qty}×</span> {name}
        </p>
        <p className="text-xs text-[var(--muted)]">
          {setCode} {collectorNumber}
        </p>
      </div>
    </li>
  );
}

export function DeckCardGallery({
  title,
  cards,
}: {
  title: string;
  cards: { id?: string; qty: number; name: string; setCode: string; collectorNumber: string }[];
}) {
  if (cards.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl text-[var(--ink)]">{title}</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {cards.map((c) => (
          <article
            key={c.id ?? `${c.setCode}-${c.collectorNumber}-${c.name}`}
            className="ui-card relative flex flex-col items-center p-2"
          >
            <span className="absolute right-2 top-2 z-10 rounded-md bg-[var(--accent)] px-1.5 py-0.5 text-xs font-bold text-white">
              ×{c.qty}
            </span>
            <TcgCardImage
              name={c.name}
              setCode={c.setCode}
              collectorNumber={c.collectorNumber}
              width={140}
              size="full"
            />
            <p className="mt-2 line-clamp-2 text-center text-xs font-medium text-[var(--ink)]">
              {c.name}
            </p>
            <p className="text-[10px] text-[var(--muted)]">
              {c.setCode} {c.collectorNumber}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
