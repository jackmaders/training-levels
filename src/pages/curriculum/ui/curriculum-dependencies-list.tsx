import type { SyllabusPageEntry } from "@/shared/curriculum-data";

import type { CurriculumBehaviorTrainingState } from "../model/curriculum-training-state";
import { BehaviorCardButton } from "./curriculum-dependencies-shared";

interface CurriculumDependenciesListProps {
  behaviors: readonly SyllabusPageEntry[];
  behaviorsBySlug: ReadonlyMap<string, CurriculumBehaviorTrainingState>;
  chain: ReadonlySet<string>;
  completed: ReadonlySet<string>;
  onSelectBehavior: (pageSlug: string) => void;
  selectedPageSlug: string;
}

function CurriculumDependenciesList({
  behaviors,
  behaviorsBySlug,
  chain,
  completed,
  onSelectBehavior,
  selectedPageSlug,
}: CurriculumDependenciesListProps) {
  return (
    <section aria-label="Dependency list" className="rounded-xl border bg-card p-5">
      <h2 className="text-xl font-semibold">Dependency list</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {behaviors.map((page) => (
          <li key={page.pageSlug}>
            <BehaviorCardButton
              behaviorState={behaviorsBySlug.get(page.pageSlug)}
              behaviors={behaviors}
              chain={chain}
              completed={completed}
              isSelected={selectedPageSlug === page.pageSlug}
              page={page}
              onSelect={onSelectBehavior}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export { CurriculumDependenciesList };
