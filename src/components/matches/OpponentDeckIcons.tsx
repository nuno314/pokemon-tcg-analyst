import { pokemonSpriteUrl } from "@/lib/pokemon/sprites";

export function OpponentDeckIcons({
  iconIds,
  size = 40,
}: {
  iconIds: number[];
  size?: number;
}) {
  const ids = iconIds.slice(0, 2);

  if (ids.length === 0) {
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--line)] bg-[var(--wash)] text-[10px] font-semibold uppercase text-[var(--muted)]"
        style={{ width: size, height: size }}
        aria-hidden
      >
        ?
      </div>
    );
  }

  const width = ids.length > 1 ? Math.round(size + size * 0.32) : size;

  return (
    <div
      className="flex shrink-0 items-center justify-start"
      style={{ width, height: size, minWidth: width }}
    >
      {ids.map((id, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${id}-${i}`}
          src={pokemonSpriteUrl(id)}
          alt=""
          width={size}
          height={size}
          className="rounded-full border-2 border-[var(--surface)] bg-[var(--wash)] object-cover object-top shadow-sm"
          style={{
            width: size,
            height: size,
            marginLeft: i > 0 ? Math.round(-size * 0.32) : 0,
            position: "relative",
            zIndex: ids.length - i,
          }}
          loading="lazy"
          decoding="async"
        />
      ))}
    </div>
  );
}
