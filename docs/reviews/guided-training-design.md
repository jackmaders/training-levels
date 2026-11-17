# Guided Training design

Status: agreed design decisions consolidated for final review. Exact curriculum
rules still need authoring; this is not authorization to implement the UI.

## Purpose and language

Make Start Training recommend a clear next action for a Dog. Each Training
focuses on one Behavior and a specific goal; variety comes across successive
Training activities rather than a compulsory circuit. Use Training, Practice,
and Test in the UI; avoid calling the activity a session.

Practice develops the Behavior. Test follows the source's Try It Cold
instructions without warm-up of that Behavior. Finishing Practice does not
complete a Step. Keep Practice history separate from Step completion.

## Practice progression

Use one Practice flow, without separate build-up and consistency phases.
Progression follows the particular Behavior and Step: numeric ladders,
approximations, repeated successes, fading assistance, and changed conditions.
Do not classify entire Behaviors solely as continuous or discrete: Retrieve,
for example, develops mouth contact, duration, and movement in different Steps.

Maintain starting targets, restart rules, increments, repetition requirements,
and success criteria as curriculum data with Step-specific overrides. Rules can
use different increments at different ranges and previous achievement when
appropriate. Some ladders start at one; long-duration targets need deliberate
rules that remain practical in short Practice. Exact values are not settled.
Distinguish source instructions from app defaults. Do not impose a universal
50% restart or mandatory 80% success gate. Retain 80% as optional guidance.

Automate explicit source rules; where understanding or readiness requires
handler judgment, make that judgment observable and explicit.

Where the source lacks an explicit readiness rule, show the full criterion and
recent results and ask the handler to choose Keep practicing or Recommend a
Test next time.

Record attempts with large, stable Success and Not yet buttons, visible counts,
Undo, and Finish practice. Provide optional totals entry. Log after marking and
rewarding the Dog; use quiet visual feedback. Swipes are optional future
shortcuts. Ending early is normal. Suggest easier targets when the Dog struggles.

Duration targets have an optional timer. Elapsed time never automatically
records success; the handler confirms the outcome. Each Step suggests a short
Practice limit using repetitions or elapsed time as appropriate, then offers
Continue or Finish at a pause. Finish remains available throughout.

Save every recorded attempt immediately. Leaving midway preserves progress;
returning shows previous results and an appropriate restart target.

## Guided views

Provide four views:

- Prep: brief setup, equipment, current target, and observable success criteria.
- In progress: current target, Success / Not yet, optional timer, counts, Undo,
  and Finish.
- Explanation: full teaching method, rationale, examples, and progression.
- FAQ: generic training questions and Behavior-specific questions.

Start Training opens Prep, which leads directly to Practice or Test. Explanation
and FAQ are optional reading; returning preserves the selected activity. Both
remain accessible during Training. Opening reading pauses a running timer;
an interrupted timed attempt must restart rather than count as a continuous
hold. Previously recorded attempts remain saved.

Initial FAQ answers come from existing curriculum questions and troubleshooting
sections with source references. Separate generic and Behavior-specific answers.
Additional answers require review as authored curriculum content.

## Tests and recommendations

Recommend a Test at a later suitable opportunity when Practice indicates
readiness for the full Step criterion. Prefer a suitable pending Test before
Practice, without warming up that Behavior first. Normally recommend Tests on a
later day, with an override when the handler confirms the Behavior has not just
been practiced. This is a product default rather than a source-defined exact
cooldown. An unsuccessful Test returns the recommendation to Practice and
remains in history.

For a previously passed Step, preserve the historical pass after a later
unsuccessful Test and mark it Needs practice. Recommend a refresher and show the
concern on the graph without automatically removing downstream achievements.

A passed Test completes the Step. Track Comeafters separately as recommended
generalization Practice. Completing all Behavior Steps unlocks the next Level;
Homework remains a visible reflection prompt with a saved written response,
without gating progression.

Preserve existing checked Steps as previously recorded completions. Do not
invent historical Practice attempts or Test outcomes for them.

Default recommendations focus on completing the current Level, rotating among
eligible Behaviors using curriculum order and Comebefores. Unmet Comebefores
exclude a Behavior from automatic recommendations but do not prevent manual
override. Show the unmet foundations before an override.

A later-Level manual choice is temporary; normal recommendations continue to
focus on finishing the current Level afterward. Before starting, explain
equipment and conditions and offer Choose something else. A goal setting that
changes from progress through Levels to aim for a particular Behavior is a
later requirement.

## Dependency graph

Show Levels as vertical columns, with a box for each Behavior at that Level.
Arrows represent documented Comebefores, including cross-Behavior foundations;
do not manufacture dependencies between every adjacent Level. Preserve source
granularity: use a particular Step when specified, otherwise the Behavior or
Level named by the source.

Selecting a box highlights its prerequisite chain, completion state, and
recommended next options. Allow exploration of the whole curriculum. This
explains how to build toward a Behavior without changing the current goal.

On phones, Level columns scroll horizontally with readable boxes; selected
Behavior details open separately. Provide a list alternative with the same
dependencies.

## Source anchors

- [Ordering and practical exceptions](../training/markdown/00-theory/06-the-organization-of-training.md)
- [Short practice, sets, ladders, and 80% guidance](../training/markdown/00-theory/07-the-thinking-of-training.md)
- [Cold testing and useful records](../training/markdown/00-theory/09-after-you-train.md)
- [Alternating Behaviors](../training/markdown/level-2/crate.md)
- [Behavior-specific ladder and reset rules](../training/markdown/level-2/zen.md)
- [Observable understanding and repeated successes](../training/markdown/level-2/lazy-leash.md)
- [Different progression patterns within Retrieve](../training/markdown/level-3/retrieve.md)

## First-release scope and remaining authoring

Include guided Practice and Test, recommendations, history, the dependency
graph, and the four guided views. Custom Behavior goals and swipe controls are
deferred.

Before implementation, author and review the actual Comebefore graph and
Behavior/Step progression data: starting targets, restart targets, increments,
repetitions, success criteria, and readiness rules. Preserve source references
and distinguish app defaults where the text leaves judgment open. The design
does not supply universal numeric values for these rules.
