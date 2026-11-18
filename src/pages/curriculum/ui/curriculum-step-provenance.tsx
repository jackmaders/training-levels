import { Badge } from "@/shared/ui/shadcn/badge";

import type { StepProvenanceSummary } from "../model/step-provenance";

interface CurriculumStepProvenanceProps {
  summary: StepProvenanceSummary;
}

function CurriculumStepProvenance({ summary }: CurriculumStepProvenanceProps) {
  if (summary.provenance === "unfinished") {
    return null;
  }

  if (summary.provenance === "test_passed") {
    return <Badge variant="default">Passed Cold Test</Badge>;
  }

  if (summary.provenance === "previously_recorded") {
    return <Badge variant="secondary">Previously recorded</Badge>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Badge variant="destructive">Needs Practice</Badge>
      {summary.hasHistoricalCompletion ? (
        <span className="text-xs text-muted-foreground">
          Previously recorded; latest retest needs practice
        </span>
      ) : null}
    </span>
  );
}

export { CurriculumStepProvenance };
