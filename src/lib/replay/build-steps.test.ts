import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildReplaySteps } from "./build-steps";

const dir = dirname(fileURLToPath(import.meta.url));
const sampleLog = readFileSync(
  join(dir, "../parser/fixtures/sample-battle-short.txt"),
  "utf8",
);

describe("buildReplaySteps", () => {
  it("flattens setup and turn events in order", () => {
    const steps = buildReplaySteps(sampleLog);
    expect(steps.length).toBeGreaterThan(5);
    expect(steps.some((s) => s.phase === "setup")).toBe(true);
    expect(steps.some((s) => s.phase === "turn" && s.turnNumber === 1)).toBe(true);
    expect(steps.some((s) => s.type === "attack")).toBe(true);
  });
});
