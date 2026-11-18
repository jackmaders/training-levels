import type { SyllabusSection } from "@/shared/curriculum-data";
import { Badge } from "@/shared/ui/shadcn/badge";

import { getLevelAdvancementReadiness } from "../model/step-provenance";

interface CurriculumLevelReadinessProps {
  completedStepIds: ReadonlySet<string>;
  section: SyllabusSection | undefined;
}

function CurriculumLevelReadiness({ completedStepIds, section }: CurriculumLevelReadinessProps) {
  if (section === undefined) {
    return null;
  }

  const readiness = getLevelAdvancementReadiness(section, completedStepIds);
  if (readiness.totalStepCount === 0) {
    return null;
  }

  return (
    <section
      aria-label="Level advancement readiness"
      className="space-y-1 rounded-lg border bg-card px-4 py-3 text-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        {readiness.isReadyToAdvance ? (
          <>
            <Badge variant="default">Ready to advance</Badge>
            <span>
              {`All ${String(readiness.totalStepCount)} Main Quest Behavior steps completed.`}
            </span>
          </>
        ) : (
          <p>
            <strong>Level advancement readiness:</strong>{" "}
            {`${String(readiness.completedStepCount)} of ${String(readiness.totalStepCount)} Behavior steps completed (${String(readiness.remainingStepCount)} remaining).`}
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Only Main Quest Behavior steps gate Level advancement; Comeafters and Homework do not.
      </p>
    </section>
  );
}

export { CurriculumLevelReadiness };
