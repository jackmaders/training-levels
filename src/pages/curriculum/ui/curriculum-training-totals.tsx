import { useState, type SyntheticEvent } from "react";

interface PracticeTotalRecord {
  notYetCount: number;
  recordId: string;
  successCount: number;
}

interface PracticeTotalActions {
  correctTotals: (recordId: string, successCount: number, notYetCount: number) => void;
  recordTotals: (successCount: number, notYetCount: number) => void;
}

function CurriculumTrainingTotals({
  actions,
  totals,
}: {
  actions: PracticeTotalActions;
  totals: readonly PracticeTotalRecord[];
}) {
  const success = totals.reduce((count, record) => count + record.successCount, 0);
  const notYet = totals.reduce((count, record) => count + record.notYetCount, 0);
  function handleRecordTotals(successCount: number, notYetCount: number) {
    actions.recordTotals(successCount, notYetCount);
  }

  return (
    <section aria-labelledby="totals-heading" className="space-y-3 rounded-md border p-4">
      <h3 className="font-medium" id="totals-heading">
        Enter totals
      </h3>
      <p className="text-sm text-muted-foreground">
        Save grouped results without assigning an order to individual attempts.
      </p>
      <output className="text-sm">
        Saved groups total: {String(success)} Success · {String(notYet)} Not yet
      </output>
      <TotalsForm key={totals.length} handleSave={handleRecordTotals} />
      {totals.map((record) => (
        <TotalRecord actions={actions} key={record.recordId} record={record} />
      ))}
    </section>
  );
}

function TotalsForm({
  handleSave,
}: {
  handleSave: (successCount: number, notYetCount: number) => void;
}) {
  const [successCount, setSuccessCount] = useState("0");
  const [notYetCount, setNotYetCount] = useState("0");
  const total = Number(successCount) + Number(notYetCount);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (total > 0) {
      handleSave(Number(successCount), Number(notYetCount));
    }
  }

  return (
    <form
      aria-label="Enter practice totals"
      className="grid gap-3 sm:grid-cols-3"
      onSubmit={handleSubmit}
    >
      <TotalsCount label="Success count" value={successCount} onChange={setSuccessCount} />
      <TotalsCount label="Not yet count" value={notYetCount} onChange={setNotYetCount} />
      <button
        className="min-h-10 self-end rounded-md border px-3"
        disabled={total <= 0}
        type="submit"
      >
        Save totals
      </button>
    </form>
  );
}

function TotalRecord({
  actions,
  record,
}: {
  actions: PracticeTotalActions;
  record: PracticeTotalRecord;
}) {
  const [successCount, setSuccessCount] = useState(String(record.successCount));
  const [notYetCount, setNotYetCount] = useState(String(record.notYetCount));
  const total = Number(successCount) + Number(notYetCount);

  function handleCorrect(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    actions.correctTotals(record.recordId, Number(successCount), Number(notYetCount));
  }

  return (
    <form
      aria-label="Correct saved totals"
      className="grid gap-3 rounded-md bg-muted/40 p-3 sm:grid-cols-3"
      onSubmit={handleCorrect}
    >
      <TotalsCount label="Success count" value={successCount} onChange={setSuccessCount} />
      <TotalsCount label="Not yet count" value={notYetCount} onChange={setNotYetCount} />
      <button
        className="min-h-10 self-end rounded-md border px-3"
        disabled={total <= 0}
        type="submit"
      >
        Correct totals
      </button>
    </form>
  );
}

function TotalsCount({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <input
        className="min-h-10 rounded-md border px-2"
        min="0"
        type="number"
        value={value}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
      />
    </label>
  );
}

export { CurriculumTrainingTotals };
export type { PracticeTotalRecord };
