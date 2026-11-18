import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import { CurriculumTrainingTotals } from "../curriculum-training-totals";

function getElementAt(elements: HTMLElement[], index: number): HTMLElement {
  const element = elements[index];
  if (!element) {
    throw new Error(`Expected element at index ${index}`);
  }
  return element;
}

describe("curriculum training totals", () => {
  it("submits new grouped totals and ignores zero-total submissions", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const recordTotals = vi.fn<(success: number, notYet: number) => void>();
    const correctTotals = vi.fn<(recordId: string, success: number, notYet: number) => void>();
    render(<CurriculumTrainingTotals actions={{ correctTotals, recordTotals }} totals={[]} />);
    const form = screen.getByRole("form", { name: "Enter practice totals" });

    // Act
    fireEvent.submit(form);
    await user.clear(screen.getByLabelText("Success count"));
    await user.type(screen.getByLabelText("Success count"), "3");
    await user.clear(screen.getByLabelText("Not yet count"));
    await user.type(screen.getByLabelText("Not yet count"), "1");
    await user.click(screen.getByRole("button", { name: "Save totals" }));

    // Assert
    expect(recordTotals).toHaveBeenCalledExactlyOnceWith(3, 1);
  });

  it("displays saved totals and submits corrections", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const recordTotals = vi.fn<(success: number, notYet: number) => void>();
    const correctTotals = vi.fn<(recordId: string, success: number, notYet: number) => void>();
    render(
      <CurriculumTrainingTotals
        actions={{ correctTotals, recordTotals }}
        totals={[{ notYetCount: 2, recordId: "rec-1", successCount: 4 }]}
      />,
    );
    const successInput = getElementAt(screen.getAllByLabelText("Success count"), 1);
    const notYetInput = getElementAt(screen.getAllByLabelText("Not yet count"), 1);

    // Act
    await user.clear(successInput);
    await user.type(successInput, "5");
    await user.clear(notYetInput);
    await user.type(notYetInput, "1");
    await user.click(screen.getByRole("button", { name: "Correct totals" }));

    // Assert
    expect(screen.getByText("Saved groups total: 4 Success · 2 Not yet")).toBe(true);
    expect(correctTotals).toHaveBeenCalledWith("rec-1", 5, 1);
  });
});
