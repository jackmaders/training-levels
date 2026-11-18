type PracticeDecision = "keep_practicing" | "recommend_test";

function CurriculumTrainingReadinessChoice({
  decision,
  handleSave,
}: {
  decision: PracticeDecision | null;
  handleSave: (decision: PracticeDecision) => void;
}) {
  return (
    <section aria-labelledby="readiness-heading" className="space-y-3 rounded-md border p-4">
      <h3 className="font-medium" id="readiness-heading">
        The full Step criterion is in reach.
      </h3>
      <p className="text-sm text-muted-foreground">
        Check your Dog&apos;s response against the source criterion before choosing what happens
        next.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          aria-pressed={decision === "keep_practicing"}
          className="min-h-11 rounded-md border px-3"
          type="button"
          onClick={() => {
            handleSave("keep_practicing");
          }}
        >
          Keep practicing
        </button>
        <button
          aria-pressed={decision === "recommend_test"}
          className="min-h-11 rounded-md border px-3"
          type="button"
          onClick={() => {
            handleSave("recommend_test");
          }}
        >
          Recommend a Test next time
        </button>
      </div>
      {decision === null ? null : (
        <output className="text-sm">
          Saved: {decision === "keep_practicing" ? "Keep practicing" : "Recommend a Test next time"}
          .
        </output>
      )}
    </section>
  );
}

export { CurriculumTrainingReadinessChoice };
