import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import { CurriculumTrainingReadinessChoice } from "../curriculum-training-readiness-choice";

describe("curriculum training readiness choice", () => {
  it("renders both choices without a saved message when decision is null", () => {
    expect.hasAssertions();

    // Arrange
    const handleSave = vi.fn<(decision: "keep_practicing" | "recommend_test") => void>();

    // Act
    render(<CurriculumTrainingReadinessChoice decision={null} handleSave={handleSave} />);

    // Assert
    expect(
      screen.getByRole("button", { name: "Keep practicing" }).getAttribute("aria-pressed"),
    ).toBe("false");
    expect(
      screen
        .getByRole("button", { name: "Recommend a Test next time" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(screen.queryByText(/Saved:/u)).toBeNull();
  });

  it("calls handleSave with keep_practicing and shows saved output", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const handleSave = vi.fn<(decision: "keep_practicing" | "recommend_test") => void>();
    render(
      <CurriculumTrainingReadinessChoice decision="keep_practicing" handleSave={handleSave} />,
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Keep practicing" }));

    // Assert
    expect(handleSave).toHaveBeenCalledWith("keep_practicing");
    expect(screen.getByText("Saved: Keep practicing.")).toBe(true);
  });

  it("calls handleSave with recommend_test and shows saved output", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const handleSave = vi.fn<(decision: "keep_practicing" | "recommend_test") => void>();
    render(<CurriculumTrainingReadinessChoice decision="recommend_test" handleSave={handleSave} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Recommend a Test next time" }));

    // Assert
    expect(handleSave).toHaveBeenCalledWith("recommend_test");
    expect(screen.getByText("Saved: Recommend a Test next time.")).toBe(true);
  });
});
