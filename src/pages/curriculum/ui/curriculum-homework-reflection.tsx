import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { type SubmitEvent, useId, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/shadcn/alert";
import { Button } from "@/shared/ui/shadcn/button";
import { Label } from "@/shared/ui/shadcn/label";

import {
  EMPTY_PAGE_GENERALIZATION,
  pageGeneralizationQueryOptions,
} from "../api/generalization-query-options";
import { MAX_HOMEWORK_REFLECTION_LENGTH } from "../api/generalization-schema";
import { useSaveHomeworkReflectionAction } from "./use-generalization-actions";

interface CurriculumHomeworkReflectionProps {
  pageSlug: string;
}

const TEXTAREA_CLASS_NAME =
  "min-h-28 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80";

function useHomeworkReflectionForm(pageSlug: string) {
  const { data: generalization = EMPTY_PAGE_GENERALIZATION } = useQuery(
    pageGeneralizationQueryOptions(pageSlug),
  );
  const { error, isPending, mutate, reset } = useSaveHomeworkReflectionAction(pageSlug);

  const savedReflection = generalization.homeworkReflection?.reflection ?? "";
  const [draft, setDraft] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const value = draft ?? savedReflection;

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setValidationError("Reflection is required.");
      setSavedNotice(false);
      return;
    }

    setValidationError(null);
    setSavedNotice(false);
    mutate(
      { pageSlug, reflection: trimmed },
      {
        onSuccess: () => {
          setDraft(null);
          setSavedNotice(true);
        },
      },
    );
  }

  return {
    errorMessage: validationError ?? error?.message ?? null,
    handleDraftChange: (nextValue: string) => {
      setDraft(nextValue);
      setValidationError(null);
      setSavedNotice(false);
      reset();
    },
    handleSubmit: submit,
    hasSavedReflection: savedReflection.length > 0,
    isPending,
    savedNotice,
    value,
  };
}

function CurriculumHomeworkReflection({ pageSlug }: CurriculumHomeworkReflectionProps) {
  const headingId = useId();
  const textareaId = useId();
  const form = useHomeworkReflectionForm(pageSlug);

  return (
    <section aria-labelledby={headingId} className="space-y-4 rounded-lg border bg-card p-4">
      <HomeworkReflectionHeader headingId={headingId} />
      <form className="space-y-3" onSubmit={form.handleSubmit}>
        <HomeworkReflectionField
          disabled={form.isPending}
          id={textareaId}
          value={form.value}
          onChange={form.handleDraftChange}
        />
        <HomeworkReflectionError message={form.errorMessage} />
        <HomeworkReflectionActions
          hasSavedReflection={form.hasSavedReflection}
          isPending={form.isPending}
          savedNotice={form.savedNotice}
        />
      </form>
    </section>
  );
}

function HomeworkReflectionHeader({ headingId }: { headingId: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight" id={headingId}>
        Homework Reflection
      </h2>
      <p className="text-sm text-muted-foreground">
        Homework reflections support handler generalization and do not count toward or gate Level
        advancement.
      </p>
    </div>
  );
}

function HomeworkReflectionField({
  disabled,
  id,
  onChange,
  value,
}: {
  disabled: boolean;
  id: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Homework reflection</Label>
      <textarea
        className={TEXTAREA_CLASS_NAME}
        disabled={disabled}
        id={id}
        maxLength={MAX_HOMEWORK_REFLECTION_LENGTH}
        placeholder="Record observations, training priorities, or generalization notes..."
        value={value}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
      />
    </div>
  );
}

function HomeworkReflectionActions({
  hasSavedReflection,
  isPending,
  savedNotice,
}: {
  hasSavedReflection: boolean;
  isPending: boolean;
  savedNotice: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save reflection"}
      </Button>
      <HomeworkReflectionStatus hasSavedReflection={hasSavedReflection} savedNotice={savedNotice} />
    </div>
  );
}

function HomeworkReflectionError({ message }: { message: string | null }) {
  if (message === null) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" className="size-4" />
      <AlertTitle>Could not save reflection</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function HomeworkReflectionStatus({
  hasSavedReflection,
  savedNotice,
}: {
  hasSavedReflection: boolean;
  savedNotice: boolean;
}) {
  if (savedNotice) {
    return <output className="text-sm font-medium text-foreground">Reflection saved.</output>;
  }

  if (hasSavedReflection) {
    return <span className="text-xs text-muted-foreground">Saved reflection loaded.</span>;
  }

  return null;
}

export { CurriculumHomeworkReflection };
