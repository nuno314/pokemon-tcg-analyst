import { pokemonSpriteUrl } from "@/lib/pokemon/sprites";

export function OpponentDeckIcons({
  iconIds,
  size = 40,
}: {
  iconIds: number[];
  size?: number;
}) {
  if (iconIds.length === 0) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--line)] bg-[var(--wash)] text-[10px] font-semibold uppercase text-[var(--muted)]"
        style={{ width: size, height: size }}
        aria-hidden
      >
        ?
      </div>
    );
  }

  const overlap = iconIds.length > 1;

  return (
    <div className={`relative shrink-0 ${overlap ? "w-[52px]" : ""}`} style={overlap ? undefined : { width: size }}>
      {iconIds.slice(0, 2).map((id, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={id}
          src={pokemonSpriteUrl(id)}
          alt=""
          width={size}
          height={size}
          className="rounded-full border-2 border-[var(--surface)] bg-[var(--wash)] object-cover object-top shadow-sm"
          style={{
            width: size,
            height: size,
            position: overlap ? "absolute" : "relative",
            left: overlap ? i * (size * 0.45) : 0,
            top: 0,
            zIndex: iconIds.length - i,
          }}
          loading="lazy"
          decoding="async"
        />
      ))}
    </div>
  );
}
