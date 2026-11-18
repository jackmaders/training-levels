import type { BehaviorStep, ContentBlock } from "@/shared/curriculum-data";
import { CollapsibleContent } from "@/shared/ui/shadcn/collapsible";

import type { SaveComeafterInput } from "../api/generalization-schema";
import type { ComeafterRecordState } from "../api/generalization-service";
import { CurriculumComeafterTracker } from "./curriculum-comeafter-tracker";
import { CurriculumContentBlocks } from "./curriculum-content-blocks";

interface StepCardBodyProps {
  comeafterRecord: ComeafterRecordState | null;
  onSaveComeafter: (input: SaveComeafterInput) => Promise<unknown>;
  step: BehaviorStep;
}

function StepCardBody({ comeafterRecord, onSaveComeafter, step }: StepCardBodyProps) {
  const { comeafters, instructions, tryItCold } = step;

  return (
    <CollapsibleContent className="space-y-4 border-t bg-muted/40 p-4">
      <CurriculumContentBlocks blocks={instructions} />
      {tryItCold !== null && tryItCold.length > 0 ? (
        <CurriculumContentBlocks blocks={tryItCold} />
      ) : null}
      {comeafters !== null && comeafters.length > 0 ? (
        <StepComeafters
          blocks={comeafters}
          comeafterRecord={comeafterRecord}
          stepId={step.stepId}
          onSave={onSaveComeafter}
        />
      ) : null}
    </CollapsibleContent>
  );
}

function StepComeafters({
  blocks,
  comeafterRecord,
  onSave,
  stepId,
}: {
  blocks: readonly ContentBlock[];
  comeafterRecord: ComeafterRecordState | null;
  onSave: (input: SaveComeafterInput) => Promise<unknown>;
  stepId: string;
}) {
  return (
    <div className="space-y-3 border-t border-border/60 pt-3">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Comeafters
      </p>
      <CurriculumContentBlocks blocks={blocks} />
      <CurriculumComeafterTracker record={comeafterRecord} stepId={stepId} onSave={onSave} />
    </div>
  );
}

export { StepCardBody };
