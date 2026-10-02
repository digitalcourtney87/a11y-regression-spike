/**
 * Wilson score interval for a binomial proportion (HANDOFF §10.3; DR-0021 D12:
 * Wilson intervals are reported throughout Phase 0).
 */

/** Two-sided 95% normal quantile. */
export const Z_95 = 1.959964;

export interface WilsonInterval {
  /** Observed proportion successes / n. */
  point: number;
  lower: number;
  upper: number;
}

/**
 * Wilson score interval for `successes` out of `n` trials. Throws RangeError
 * unless n is a positive integer and successes an integer in [0, n].
 */
export function wilsonInterval(successes: number, n: number, z: number = Z_95): WilsonInterval {
  if (!Number.isSafeInteger(n) || n <= 0) throw new RangeError(`n must be a positive integer, got ${String(n)}`);
  if (!Number.isSafeInteger(successes) || successes < 0 || successes > n) {
    throw new RangeError(`successes must be an integer in [0, ${String(n)}], got ${String(successes)}`);
  }
  if (!Number.isFinite(z) || z <= 0) throw new RangeError(`z must be positive, got ${String(z)}`);

  const p = successes / n;
  const z2 = z * z;
  const denominator = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denominator;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denominator;
  return {
    point: p,
    lower: successes === 0 ? 0 : Math.max(0, centre - margin),
    upper: successes === n ? 1 : Math.min(1, centre + margin),
  };
}
