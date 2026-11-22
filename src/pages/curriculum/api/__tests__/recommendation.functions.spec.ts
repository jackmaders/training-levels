import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { hasPermission } from "@/shared/auth/permissions";
import { ensureSession } from "@/shared/auth/session.server";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

import { getTrainingOverview } from "../recommendation-service";
import { getTrainingOverviewFn } from "../recommendation.functions";

vi.mock(import("@tanstack/react-start"));
vi.mock(import("@/shared/auth/session.server"));
vi.mock(import("@/shared/auth/permissions"), { spy: true });
vi.mock(import("../recommendation-service"));

beforeEach(() => {
  vi.mocked(ensureSession).mockResolvedValue(TEST_SESSION);
});

describe("recommendation functions", () => {
  it("delegates getTrainingOverviewFn with curriculum:read permission", async () => {
    expect.assertions(3);

    const overview = {
      activeDog: null,
      curriculumProgress: [],
      practiceAttempts: [],
      practiceTotals: [],
      stepDecisions: [],
      stepTests: [],
    };
    vi.mocked(getTrainingOverview).mockResolvedValueOnce(overview);

    const result = await getTrainingOverviewFn();

    expect(hasPermission).toHaveBeenCalledWith(TEST_SESSION.user.role, "curriculum:read");
    expect(getTrainingOverview).toHaveBeenCalledWith({ userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual(overview);
  });

  it("rejects forbidden requests without calling getTrainingOverview", async () => {
    expect.assertions(2);

    vi.mocked(hasPermission).mockReturnValueOnce(false);

    await expect(getTrainingOverviewFn()).rejects.toThrow("Permission denied.");
    expect(getTrainingOverview).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated requests without calling getTrainingOverview", async () => {
    expect.assertions(2);

    vi.mocked(ensureSession).mockRejectedValueOnce(new Error("Unauthorized"));

    await expect(getTrainingOverviewFn()).rejects.toThrow("Unauthorized");
    expect(getTrainingOverview).not.toHaveBeenCalled();
  });
});
