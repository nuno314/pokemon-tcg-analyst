const MASCOTS = [
  {
    name: "Victini",
    id: 494,
    className: "poke-float poke-float-a left-[2%] top-[12%] w-16 sm:w-20",
  },
  {
    name: "Clefairy",
    id: 35,
    className: "poke-float poke-float-b right-[3%] top-[18%] w-14 sm:w-[4.5rem]",
  },
  {
    name: "Ditto",
    id: 132,
    className: "poke-float poke-float-c left-[4%] bottom-[10%] w-14 sm:w-16",
  },
  {
    name: "Celebi",
    id: 251,
    className: "poke-float poke-float-d right-[2%] bottom-[14%] w-16 sm:w-[4.75rem]",
  },
] as const;

export function FloatingMascots() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {MASCOTS.map((m) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={m.id}
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${m.id}.png`}
          alt=""
          width={96}
          height={96}
          className={m.className}
          loading="eager"
          decoding="async"
        />
      ))}
    </div>
  );
}

export const HOME_MASCOTS = [
  { name: "Victini", id: 494, tip: "warm spark" },
  { name: "Clefairy", id: 35, tip: "moon blush" },
  { name: "Ditto", id: 132, tip: "soft blob" },
  { name: "Celebi", id: 251, tip: "time leaf" },
] as const;
