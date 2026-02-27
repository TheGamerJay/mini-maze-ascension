// Minimal validation so people can’t just post Level 99999.
export function validateEvent({ prevLevel, nextLevel, runStartedAtMs, nowMs }) {
  if (typeof nextLevel !== "number" || nextLevel < 1) return "bad_level";
  if (nextLevel !== prevLevel + 1 && nextLevel !== prevLevel) return "level_jump";

  // prevent impossible speedruns: require at least 6s per level (tune later)
  const elapsedSec = (nowMs - runStartedAtMs) / 1000;
  const minSec = Math.max(6 * (nextLevel - 1), 0);
  if (elapsedSec + 1 < minSec) return "too_fast";

  return null;
}

export function validateFinish({ level, runStartedAtMs, nowMs }) {
  if (typeof level !== "number" || level < 1) return "bad_level";
  const elapsedSec = (nowMs - runStartedAtMs) / 1000;
  if (elapsedSec < 5) return "too_short";
  return null;
}
