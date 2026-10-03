import { describe, expect, test } from "vitest";

import { uniformBySymptom } from "./armMetrics.ts";

describe("detection weighted uniformly by symptom", () => {
  test("is the mean of the per-symptom rates, not the item rate", () => {
    // NAME: 3 of 4 detected; ROLE: 0 of 1. Item rate 3/5 = 0.6; uniform (0.75 + 0) / 2 = 0.375.
    const rows = [
      { symptom: "NAME_NOT_CONVEYED", cluster: "p1", value: 1 as const },
      { symptom: "NAME_NOT_CONVEYED", cluster: "p2", value: 1 as const },
      { symptom: "NAME_NOT_CONVEYED", cluster: "p3", value: 1 as const },
      { symptom: "NAME_NOT_CONVEYED", cluster: "p4", value: 0 as const },
      { symptom: "ROLE_NOT_CONVEYED", cluster: "p5", value: 0 as const },
    ];
    const u = uniformBySymptom(rows, 500, 3);
    expect(u.point).toBeCloseTo(0.375, 10);
    expect(u.perSymptom).toEqual({ NAME_NOT_CONVEYED: { k: 3, n: 4 }, ROLE_NOT_CONVEYED: { k: 0, n: 1 } });
    expect(u.lower).toBeLessThanOrEqual(u.point);
    expect(u.upper).toBeGreaterThanOrEqual(u.point);
    expect(uniformBySymptom(rows, 500, 3)).toEqual(u);
  });

  test("no rows give NaN", () => {
    expect(Number.isNaN(uniformBySymptom([], 10, 1).point)).toBe(true);
  });
});
