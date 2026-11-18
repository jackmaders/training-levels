import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";

import { TEST_BEHAVIOR_PAGE, createBehaviorPageFixture } from "@test/vitest/fixtures/curriculum";
import { renderWithProviders } from "@test/vitest/wrappers/testing-wrapper";

import { curriculumPageQueryOptions } from "../../api/curriculum-query-options";
import { GENERAL_FAQ_PAGE_SLUGS } from "../../model/training-faq";
import {
  InterruptedTimerNotice,
  TrainingReadingGate,
  TrainingReadingLinks,
} from "../curriculum-training-reading";

function createReadingQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  for (const slug of GENERAL_FAQ_PAGE_SLUGS) {
    queryClient.setQueryData(curriculumPageQueryOptions(slug).queryKey, null);
  }
  return queryClient;
}

const [FIRST_STEP] = TEST_BEHAVIOR_PAGE.steps;
if (!FIRST_STEP) {
  throw new Error("Missing fixture step");
}

function renderInterruptedNotice(timerInterrupted: boolean) {
  return timerInterrupted ? <InterruptedTimerNotice /> : null;
}

describe("curriculum training reading", () => {
  it("opens explanation, displays progression source, and returns with interrupted timer notice", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const page = createBehaviorPageFixture({
      ...TEST_BEHAVIOR_PAGE,
      aboutTheCues: [],
      introBlocks: [],
      thinkAbout: [],
      steps: [
        {
          ...FIRST_STEP,
          comeafters: [{ type: "paragraph", content: [{ text: "Comeafter note", type: "text" }] }],
          instructions: [
            { type: "paragraph", content: [{ text: "Step instructions", type: "text" }] },
          ],
          tryItCold: [{ type: "paragraph", content: [{ text: "Cold note", type: "text" }] }],
        },
      ],
    });
    renderWithProviders(
      <TrainingReadingGate
        page={page}
        progressionSource="Zen ladder"
        returnLabel="Back to practice"
        stepId={FIRST_STEP.stepId}
      >
        {({ openReading, timerInterrupted }) => (
          <div>
            <TrainingReadingLinks
              onOpen={(kind) => {
                openReading(kind, true);
              }}
            />
            {renderInterruptedNotice(timerInterrupted)}
          </div>
        )}
      </TrainingReadingGate>,
      { queryClient: createReadingQueryClient(), routePaths: ["/"] },
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Explanation" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Explanation" })).toBe(true);
    expect(screen.getByText("Practice ladder: Zen ladder")).toBe(true);
    expect(screen.getByText("Cold note")).toBe(true);
    expect(screen.getByText("Comeafter note")).toBe(true);

    // Act
    await user.click(screen.getByRole("button", { name: "Back to practice" }));

    // Assert
    expect(
      screen.getByText(
        "Timed hold interrupted when you opened reading. It was not recorded; start a fresh timed attempt.",
      ),
    ).toBe(true);
  });

  it("opens faq and handles missing step instructions", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <TrainingReadingGate
        page={TEST_BEHAVIOR_PAGE}
        progressionSource={null}
        returnLabel="Back"
        stepId="missing-step"
      >
        {({ openReading }) => <TrainingReadingLinks onOpen={openReading} />}
      </TrainingReadingGate>,
      { queryClient: createReadingQueryClient(), routePaths: ["/"] },
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Explanation" }));

    // Assert
    expect(screen.getByText("The source instructions for this Step are unavailable.")).toBe(true);

    // Act
    await user.click(screen.getByRole("button", { name: "Back" }));
    await user.click(screen.getByRole("button", { name: "FAQ" }));

    // Assert
    expect(screen.getByRole("heading", { name: "FAQ" })).toBe(true);
  });

  it("opens explanation without progression source and with null step/page optional blocks", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const page = createBehaviorPageFixture({
      ...TEST_BEHAVIOR_PAGE,
      aboutTheCues: null,
      steps: [
        {
          ...FIRST_STEP,
          comeafters: null,
          instructions: [
            { type: "paragraph", content: [{ text: "Step instructions", type: "text" }] },
          ],
          tryItCold: null,
        },
      ],
    });
    renderWithProviders(
      <TrainingReadingGate
        page={page}
        progressionSource={null}
        returnLabel="Back"
        stepId={FIRST_STEP.stepId}
      >
        {({ openReading }) => <TrainingReadingLinks onOpen={openReading} />}
      </TrainingReadingGate>,
      { queryClient: createReadingQueryClient(), routePaths: ["/"] },
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Explanation" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Explanation" })).toBe(true);
    expect(screen.queryByText(/Practice ladder:/u)).toBeNull();
  });
});
