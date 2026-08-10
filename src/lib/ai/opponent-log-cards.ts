function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isTrainerOrEnergy(name: string) {
  return /energy|boss's orders|iono|professor|ultra ball|nest ball|rare candy|switch|counter|stadium|supporter|tool|rocket's (?!honchkrow|murkrow|mewtwo|wobbuffet|moltres|zapdos|articuno|mew|persian|giovanni|petrel|proton|mamba|transceiver)/i.test(
    name,
  );
}

/** Pokémon đối thủ xuất hiện trong log (chỉ hành động của họ). */
export function extractOpponentCards(rawLog: string, opponentName: string): string[] {
  const log = rawLog.slice(0, 12000);
  const player = opponentName.trim();
  if (!player) return [];

  const names = new Set<string>();
  const p = escapeRegExp(player);

  const patterns = [
    new RegExp(`${p} played ([^.]+?)\\.`, "gi"),
    new RegExp(`${p} evolved .+ to ([^.]+?)\\.`, "gi"),
    new RegExp(`${p}'s (.+?) used `, "gi"),
    new RegExp(`on ${p}'s (.+?) for \\d+ damage`, "gi"),
    new RegExp(`${p}'s (.+?) was Knocked Out`, "gi"),
  ];

  for (const re of patterns) {
    for (const m of log.matchAll(re)) {
      const name = m[1]?.trim();
      if (!name || name.length >= 60 || isTrainerOrEnergy(name)) continue;
      names.add(name);
    }
  }

  return [...names].slice(0, 20);
}

/** Pokémon đối thủ bị K/O cuối cùng trong trận. */
export function extractLastOpponentKoPokemon(rawLog: string, opponentName: string): string | null {
  const player = opponentName.trim();
  if (!player) return null;

  const re = new RegExp(`${escapeRegExp(player)}'s (.+?) was Knocked Out`, "gi");
  let last: string | null = null;
  for (const m of rawLog.matchAll(re)) {
    const name = m[1]?.trim();
    if (name && !isTrainerOrEnergy(name)) last = name;
  }
  return last;
}
