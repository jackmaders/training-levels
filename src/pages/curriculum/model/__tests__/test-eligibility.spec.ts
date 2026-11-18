import { describe, expect, it } from "vite-plus/test";

import { canTestToday } from "../test-eligibility";

describe("cold Test eligibility", () => {
  it("recommends a Test after the last activity day", () => {
    expect.assertions(1);
    const eligible = canTestToday(
      [new Date("2026-11-16T23:59:00Z")],
      new Date("2026-11-17T00:01:00Z"),
    );

    expect(eligible).toBe(true);
  });

  it("holds a Test until a later day when Practice happened today", () => {
    expect.assertions(1);
    const eligible = canTestToday(
      [new Date("2026-11-17T09:00:00Z")],
      new Date("2026-11-17T21:00:00Z"),
    );

    expect(eligible).toBe(false);
  });
});
