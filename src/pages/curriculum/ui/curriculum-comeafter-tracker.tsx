import { AlertCircle } from "lucide-react";
import { type SubmitEvent, useId, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/shadcn/alert";
import { Button } from "@/shared/ui/shadcn/button";
import { Input } from "@/shared/ui/shadcn/input";
import { Label } from "@/shared/ui/shadcn/label";

import {
  COMEAFTER_STATUSES,
  MAX_COMEAFTER_NOTE_LENGTH,
  type ComeafterStatus,
  type SaveComeafterInput,
} from "../api/generalization-schema";
import type { ComeafterRecordState } from "../api/generalization-service";

interface CurriculumComeafterTrackerProps {
  onSave: (input: SaveComeafterInput) => Promise<unknown>;
  record: ComeafterRecordState | null;
  stepId: string;
}

const COMEAFTER_STATUS_LABELS: Record<ComeafterStatus, string> = {
  completed: "Completed",
  not_started: "Not started",
  practicing: "Practicing",
};

const SELECT_CLASS_NAME =
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

interface DraftFields {
  note: string | null;
  status: ComeafterStatus | null;
}

interface SaveState {
  errorMessage: string | null;
  isSaving: boolean;
  savedNotice: boolean;
}

const INITIAL_DRAFT_FIELDS: DraftFields = { note: null, status: null };
const INITIAL_SAVE_STATE: SaveState = {
  errorMessage: null,
  isSaving: false,
  savedNotice: false,
};

function isComeafterStatus(value: string): value is ComeafterStatus {
  return COMEAFTER_STATUSES.some((status) => status === value);
}

function useComeafterDraft({ onSave, record, stepId }: CurriculumComeafterTrackerProps) {
  const [draft, setDraft] = useState<DraftFields>(INITIAL_DRAFT_FIELDS);
  const [saveState, setSaveState] = useState<SaveState>(INITIAL_SAVE_STATE);

  const status = draft.status ?? record?.status ?? "not_started";
  const note = draft.note ?? record?.note ?? "";

  async function submit() {
    setSaveState({ errorMessage: null, isSaving: true, savedNotice: false });
    try {
      await onSave({ note: note.trim(), status, stepId });
      setDraft(INITIAL_DRAFT_FIELDS);
      setSaveState({ errorMessage: null, isSaving: false, savedNotice: true });
    } catch (error) {
      setSaveState({
        errorMessage: error instanceof Error ? error.message : "Could not save comeafter.",
        isSaving: false,
        savedNotice: false,
      });
    }
  }

  return {
    errorMessage: saveState.errorMessage,
    handleNoteChange: (nextNote: string) => {
      setDraft((prev) => ({ ...prev, note: nextNote }));
      setSaveState(INITIAL_SAVE_STATE);
    },
    handleStatusChange: (nextStatus: ComeafterStatus) => {
      setDraft((prev) => ({ ...prev, status: nextStatus }));
      setSaveState(INITIAL_SAVE_STATE);
    },
    isSaving: saveState.isSaving,
    note,
    savedNotice: saveState.savedNotice,
    status,
    submit,
  };
}

function CurriculumComeafterTracker({ onSave, record, stepId }: CurriculumComeafterTrackerProps) {
  const draft = useComeafterDraft({ onSave, record, stepId });

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void draft.submit();
  }

  return (
    <form className="space-y-3 rounded-lg border bg-background p-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <ComeafterStatusField
          disabled={draft.isSaving}
          value={draft.status}
          onChange={draft.handleStatusChange}
        />
        <ComeafterNoteField
          disabled={draft.isSaving}
          value={draft.note}
          onChange={draft.handleNoteChange}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Comeafters track real-life generalization and do not gate Level advancement.
      </p>
      <ComeafterErrorAlert message={draft.errorMessage} />
      <ComeafterActions isSaving={draft.isSaving} record={record} savedNotice={draft.savedNotice} />
    </form>
  );
}

function ComeafterActions({
  isSaving,
  record,
  savedNotice,
}: {
  isSaving: boolean;
  record: ComeafterRecordState | null;
  savedNotice: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled={isSaving} size="sm" type="submit">
        {isSaving ? "Saving..." : "Save Comeafter"}
      </Button>
      <ComeafterSaveStatus record={record} savedNotice={savedNotice} />
    </div>
  );
}

function ComeafterStatusField({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean;
  onChange: (status: ComeafterStatus) => void;
  value: ComeafterStatus;
}) {
  const statusId = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={statusId}>Comeafter status</Label>
      <select
        className={SELECT_CLASS_NAME}
        disabled={disabled}
        id={statusId}
        value={value}
        onChange={(event) => {
          const { value: nextValue } = event.currentTarget;
          if (isComeafterStatus(nextValue)) {
            onChange(nextValue);
          }
        }}
      >
        {COMEAFTER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {COMEAFTER_STATUS_LABELS[option]}
          </option>
        ))}
      </select>
    </div>
  );
}

function ComeafterNoteField({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean;
  onChange: (note: string) => void;
  value: string;
}) {
  const noteId = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={noteId}>Generalization note (optional)</Label>
      <Input
        disabled={disabled}
        id={noteId}
        maxLength={MAX_COMEAFTER_NOTE_LENGTH}
        placeholder="Where and how you practiced..."
        value={value}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
      />
    </div>
  );
}

function ComeafterSaveStatus({
  record,
  savedNotice,
}: {
  record: ComeafterRecordState | null;
  savedNotice: boolean;
}) {
  if (savedNotice) {
    return <output className="text-xs font-medium text-foreground">Comeafter saved.</output>;
  }

  if (record === null) {
    return null;
  }

  return (
    <span className="text-xs text-muted-foreground">
      {`Saved status: ${COMEAFTER_STATUS_LABELS[record.status]}`}
    </span>
  );
}

function ComeafterErrorAlert({ message }: { message: string | null }) {
  if (message === null) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" className="size-4" />
      <AlertTitle>Could not save comeafter</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export { CurriculumComeafterTracker };
