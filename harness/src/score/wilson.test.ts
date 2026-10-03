import { describe, expect, test } from "vitest";

import { wilsonInterval, Z_95 } from "./wilson.ts";

describe("wilsonInterval", () => {
  test("uses z = 1.959964 by default", () => {
    expect(Z_95).toBe(1.959964);
  });

  test("49/50", () => {
    const { point, lower, upper } = wilsonInterval(49, 50);
    expect(point).toBe(0.98);
    expect(lower).toBeCloseTo(0.895, 4);
    expect(upper).toBeCloseTo(0.99646, 4);
  });

  test("50/50", () => {
    const { lower, upper } = wilsonInterval(50, 50);
    expect(lower).toBeCloseTo(0.9287, 4);
    expect(upper).toBe(1);
  });

  test("0/50 mirrors 50/50", () => {
    const { lower, upper } = wilsonInterval(0, 50);
    expect(lower).toBe(0);
    expect(upper).toBeCloseTo(0.071348, 5);
  });

  test("245/250 (pooled K1–K5 with five failures)", () => {
    const { lower, upper } = wilsonInterval(245, 250);
    expect(lower).toBeCloseTo(0.954044, 5);
    expect(upper).toBeCloseTo(0.991428, 5);
  });

  test("is symmetric: interval(k, n) mirrors interval(n - k, n)", () => {
    const a = wilsonInterval(7, 20);
    const b = wilsonInterval(13, 20);
    expect(a.lower).toBeCloseTo(1 - b.upper, 12);
    expect(a.upper).toBeCloseTo(1 - b.lower, 12);
  });

  test("rejects invalid input", () => {
    expect(() => wilsonInterval(1, 0)).toThrow(RangeError);
    expect(() => wilsonInterval(-1, 10)).toThrow(RangeError);
    expect(() => wilsonInterval(11, 10)).toThrow(RangeError);
    expect(() => wilsonInterval(1.5, 10)).toThrow(RangeError);
    expect(() => wilsonInterval(1, 10, 0)).toThrow(RangeError);
  });
});
