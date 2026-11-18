import { act, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { createDeferred } from "@test/vitest/helpers/deferred";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import type { SaveComeafterInput } from "../../api/generalization-schema";
import { CurriculumComeafterTracker } from "../curriculum-comeafter-tracker";

const UPDATED_AT = new Date("2026-04-01T12:00:00.000Z");

describe("curriculum comeafter tracker", () => {
  it("renders default controls and non-gating explanation when no record exists", () => {
    expect.assertions(4);

    // Arrange & Act
    renderWithProviders(
      <CurriculumComeafterTracker
        record={null}
        stepId="level-1/zen:step-1"
        onSave={vi.fn<(input: SaveComeafterInput) => Promise<unknown>>()}
      />,
    );

    // Assert
    const statusSelect = screen.getByLabelText("Comeafter status");
    expect(statusSelect).toBe(screen.getByDisplayValue("Not started"));
    expect(screen.getByLabelText<HTMLInputElement>("Generalization note (optional)").value).toBe(
      "",
    );
    expect(
      screen.getByText(
        "Comeafters track real-life generalization and do not gate Level advancement.",
      ),
    ).toBeDefined();
    expect(screen.queryByText(/Saved status:/u)).toBeNull();
  });

  it("renders existing saved status and note when record is provided", () => {
    expect.assertions(3);

    // Arrange & Act
    renderWithProviders(
      <CurriculumComeafterTracker
        record={{
          note: "Tried in living room",
          status: "practicing",
          stepId: "level-1/zen:step-1",
          updatedAt: UPDATED_AT,
        }}
        stepId="level-1/zen:step-1"
        onSave={vi.fn<(input: SaveComeafterInput) => Promise<unknown>>()}
      />,
    );

    // Assert
    expect(screen.getByLabelText("Comeafter status")).toBe(screen.getByDisplayValue("Practicing"));
    expect(screen.getByLabelText<HTMLInputElement>("Generalization note (optional)").value).toBe(
      "Tried in living room",
    );
    expect(screen.getByText("Saved status: Practicing")).toBeDefined();
  });

  it("submits trimmed note and status, shows pending state, and displays saved feedback", async () => {
    expect.hasAssertions();

    // Arrange
    const deferred = createDeferred<unknown>();
    const onSave = vi
      .fn<(input: SaveComeafterInput) => Promise<unknown>>()
      .mockReturnValueOnce(deferred.promise);
    const { user } = renderWithProviders(
      <CurriculumComeafterTracker record={null} stepId="level-1/zen:step-2" onSave={onSave} />,
    );

    // Act
    await user.selectOptions(screen.getByLabelText("Comeafter status"), "completed");
    await user.type(
      screen.getByLabelText("Generalization note (optional)"),
      "  Calm near front door  ",
    );
    await user.click(screen.getByRole("button", { name: "Save Comeafter" }));

    // Assert pending
    expect(screen.getByRole("button", { name: "Saving..." }).hasAttribute("disabled")).toBe(true);
    expect(onSave).toHaveBeenCalledWith({
      note: "Calm near front door",
      status: "completed",
      stepId: "level-1/zen:step-2",
    });

    // Act settle
    await act(async () => {
      deferred.resolve({});
      await deferred.promise;
    });

    // Assert saved
    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toBe("Comeafter saved.");
    });
    expect(screen.getByRole("button", { name: "Save Comeafter" })).toBeDefined();
  });

  it("renders error alert for Error and non-Error rejections and clears on edit", async () => {
    expect.hasAssertions();

    // Arrange
    const onSave = vi
      .fn<(input: SaveComeafterInput) => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("Database unavailable"))
      .mockRejectedValueOnce("unexpected");
    const { user } = renderWithProviders(
      <CurriculumComeafterTracker record={null} stepId="level-1/zen:step-1" onSave={onSave} />,
    );

    // Act first failure (Error)
    await user.click(screen.getByRole("button", { name: "Save Comeafter" }));
    const firstAlert = await screen.findByRole("alert");
    expect(within(firstAlert).getByText("Database unavailable")).toBeDefined();

    // Act edit clears error
    await user.selectOptions(screen.getByLabelText("Comeafter status"), "practicing");
    expect(screen.queryByRole("alert")).toBeNull();

    // Act second failure (non-Error)
    await user.click(screen.getByRole("button", { name: "Save Comeafter" }));
    const secondAlert = await screen.findByRole("alert");
    expect(within(secondAlert).getByText("Could not save comeafter.")).toBeDefined();
  });

  it("ignores unrecognized status values on change", async () => {
    expect.assertions(1);

    // Arrange
    const { user } = renderWithProviders(
      <CurriculumComeafterTracker
        record={null}
        stepId="level-1/zen:step-1"
        onSave={vi.fn<(input: SaveComeafterInput) => Promise<unknown>>()}
      />,
    );
    const statusSelect = screen.getByLabelText("Comeafter status");
    statusSelect.insertAdjacentHTML("beforeend", '<option value="unexpected">Unexpected</option>');

    // Act
    await user.selectOptions(statusSelect, "unexpected");

    // Assert
    expect(statusSelect).toBe(screen.getByDisplayValue("Not started"));
  });
});
