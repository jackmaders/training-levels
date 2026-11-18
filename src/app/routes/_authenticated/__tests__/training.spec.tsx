import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as TrainingRoute } from "@/app/routes/_authenticated/training";
import { getRouteOption } from "@test/vitest/helpers/route";

const { mockNavigate, mockSearch } = vi.hoisted(() => ({
  mockNavigate: vi.fn<() => Promise<void>>(),
  mockSearch: vi.fn<() => { stepId?: string; target?: string }>(() => ({
    stepId: "level-1/zen:step-1",
    target: "3 seconds",
  })),
}));

vi.mock(import("@/pages/curriculum"), async (importOriginal) => ({
  ...(await importOriginal()),
  CurriculumTrainingPage: ({
    onSelectionChange,
    selectedStepId,
    selectedTarget,
  }: {
    onSelectionChange: (stepId: string, target?: string) => void;
    selectedStepId?: string;
    selectedTarget?: string;
  }) => (
    <button
      data-step={selectedStepId}
      data-target={selectedTarget}
      type="button"
      onClick={() => {
        onSelectionChange("level-1/zen:step-2", "5 seconds");
      }}
    >
      Trigger
    </button>
  ),
}));

type ValidateSearchFn = (search: Record<string, unknown>) => {
  stepId: string | undefined;
  target: string | undefined;
};

describe("training route", () => {
  it("validates search params", () => {
    expect.assertions(2);

    const validateSearch = getRouteOption(TrainingRoute, "validateSearch") as ValidateSearchFn;

    expect(validateSearch({ stepId: "level-1/zen:step-1", target: "3 seconds" })).toStrictEqual({
      stepId: "level-1/zen:step-1",
      target: "3 seconds",
    });
    expect(validateSearch({ stepId: 123, target: null })).toStrictEqual({
      stepId: undefined,
      target: undefined,
    });
  });

  it("renders CurriculumTrainingPage and navigates on selection change", () => {
    expect.assertions(1);

    vi.spyOn(TrainingRoute, "useSearch").mockImplementation(mockSearch);
    vi.spyOn(TrainingRoute, "useNavigate").mockReturnValue(mockNavigate);

    const Component = getRouteOption(TrainingRoute, "component") as ComponentType;
    render(<Component />);

    screen.getByRole("button", { name: "Trigger" }).click();

    expect(mockNavigate).toHaveBeenCalledWith({
      replace: true,
      search: { stepId: "level-1/zen:step-2", target: "5 seconds" },
    });
  });
});
