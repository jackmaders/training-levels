import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { CurriculumStepProvenance } from "../curriculum-step-provenance";

describe("curriculum step provenance", () => {
  it("renders nothing when step provenance is unfinished", () => {
    expect.assertions(1);

    // Act
    const { container } = render(
      <CurriculumStepProvenance
        summary={{ hasHistoricalCompletion: false, provenance: "unfinished" }}
      />,
    );

    // Assert
    expect(container.textContent).toBe("");
  });

  it("renders Passed Cold Test badge for test_passed provenance", () => {
    expect.assertions(1);

    // Act
    render(
      <CurriculumStepProvenance
        summary={{ hasHistoricalCompletion: true, provenance: "test_passed" }}
      />,
    );

    // Assert
    expect(screen.getByText("Passed Cold Test")).toBeDefined();
  });

  it("renders Previously recorded badge for previously_recorded provenance", () => {
    expect.assertions(1);

    // Act
    render(
      <CurriculumStepProvenance
        summary={{ hasHistoricalCompletion: true, provenance: "previously_recorded" }}
      />,
    );

    // Assert
    expect(screen.getByText("Previously recorded")).toBeDefined();
  });

  it("renders Needs Practice badge with and without historical completion note", () => {
    expect.assertions(4);

    // Act without historical completion
    const { rerender } = render(
      <CurriculumStepProvenance
        summary={{ hasHistoricalCompletion: false, provenance: "needs_practice" }}
      />,
    );

    // Assert without historical completion
    expect(screen.getByText("Needs Practice")).toBeDefined();
    expect(screen.queryByText("Previously recorded; latest retest needs practice")).toBeNull();

    // Act with historical completion
    rerender(
      <CurriculumStepProvenance
        summary={{ hasHistoricalCompletion: true, provenance: "needs_practice" }}
      />,
    );

    // Assert with historical completion
    expect(screen.getByText("Needs Practice")).toBeDefined();
    expect(screen.getByText("Previously recorded; latest retest needs practice")).toBeDefined();
  });
});
