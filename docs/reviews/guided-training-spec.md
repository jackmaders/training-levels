## Problem Statement

The app currently lets handlers read the curriculum and check off Steps, but leaves them to decide what to train, prepare the exercise, interpret progression guidance, and remember what happened previously. A handler needs a clear Start Training action that recommends useful work for their Dog and guides it with little phone interaction while handling treats, a clicker, and the Dog.

The curriculum also contains cross-Behavior foundations that are difficult to understand through linear reading alone. Handlers need to see how earlier learning supports a desired Behavior without losing the default goal of completing a whole Level.

## Solution

Provide guided Training focused on one Behavior at a time, with two clearly distinguished modes: Practice develops the Behavior; Test verifies the full Step criterion without warming up that Behavior first. Do not call the activity a session or workout.

Start Training recommends a suitable pending Test or an eligible Practice in the current Level, explains why, and opens brief Prep. Handlers can choose another Behavior, including a later-Level Behavior, after seeing unmet Comebefores. Their normal recommendations continue to focus on completing the current Level.

Provide four views: Prep, In progress, Explanation, and FAQ. Record attempts using large Success and Not yet buttons, allow Undo and optional totals entry, and save recorded work immediately. Practice follows source-backed, Behavior/Step-specific progression rules rather than a universal percentage-based algorithm or separate build-up and consistency phases.

Show dependencies as a graph with Levels arranged as vertical columns, Behavior boxes in each column, and arrows for documented foundations. Selecting a Behavior reveals its prerequisite chain and progress. Include a mobile presentation and an equivalent dependency list.

## User Stories

1. As a handler, I want Start Training to recommend a useful next activity, so that I can begin without planning the curriculum myself.
2. As a handler, I want a short reason for the recommendation, so that I understand why it is appropriate for my Dog.
3. As a handler, I want each Training activity to focus on one Behavior, so that I can concentrate on one learning goal.
4. As a handler, I want recommendations to rotate among eligible Behaviors in my current Level, so that I build a broad foundation while finishing that Level.
5. As a handler, I want Practice and Test identified before starting, so that I know whether to teach and support success or check learning without warm-up.
6. As a handler, I want brief Prep with equipment, setup, and success criteria, so that I am ready before asking my Dog to work.
7. As a handler, I want Choose something else before starting, so that unsuitable equipment, conditions, or helper availability do not stop me training.
8. As a handler, I want a full Explanation available from Prep, so that I can understand the teaching method and rationale when needed.
9. As a handler, I want general and Behavior-specific FAQ answers, so that I can resolve common problems without searching the whole curriculum.
10. As a handler, I want optional reading to preserve my selected activity, so that I can return to Prep without starting over.
11. As a handler, I want a simple In progress view with the current target, so that I can keep my attention on my Dog.
12. As a handler, I want large, clearly labeled Success and Not yet buttons, so that I can record attempts with minimal effort.
13. As a handler, I want visible counts and Undo, so that I can see what I recorded and correct accidental input.
14. As a handler, I want to enter totals instead of logging every attempt, so that I can record work when repetitions are fast or my hands are full.
15. As a handler, I want recording feedback to be quiet, so that the phone does not become an unintended reward marker.
16. As a handler, I want an optional timer for duration targets, so that I can track time without counting mentally.
17. As a handler, I want to confirm success myself after a timer ends, so that elapsed time is not mistaken for correct behavior.
18. As a handler, I want Explanation and FAQ available during Practice, so that I can look up help when I get stuck.
19. As a handler, I want interrupted timed attempts restarted, so that reading help does not incorrectly count as a continuous hold.
20. As a handler, I want manageable targets adapted to the particular Step, so that I can teach duration, distance, approximations, or changed conditions appropriately.
21. As a handler, I want the next suggested target to reflect the Step's repetition and progression rules, so that a single success does not always increase difficulty.
22. As a handler, I want easier suggestions when my Dog struggles, so that I can explain the task again rather than repeat failure.
23. As a handler, I want previous achievements visible alongside an appropriate restart target, so that I can rebuild without blindly repeating a previous maximum.
24. As a handler, I want explicit readiness guidance where the source requires judgment, so that I understand what to observe before asking for more.
25. As a handler, I want short practice limits and Continue or Finish choices, so that breaks and stopping early feel normal.
26. As a handler, I want every recorded attempt saved immediately, so that leaving midway does not lose my work.
27. As a handler, I want to return to previous results and a suitable restart target, so that interrupted Training remains useful.
28. As a handler, I want Test recommended once the full criterion is ready, so that practice can lead to a meaningful check of retention.
29. As a handler, I want a later-day Test recommendation with a clear cold-test explanation, so that I avoid testing immediately after teaching the same Behavior.
30. As a handler, I want to override the default timing when I can confirm the Behavior has not just been practiced, so that timing guidance remains practical.
31. As a handler, I want an unsuccessful Test to recommend more Practice, so that its result tells me how to help my Dog next.
32. As a handler, I want a passed Test to complete the Step, so that progress represents meeting the actual criterion rather than finishing Practice.
33. As a handler, I want historical passes preserved if a later Test is unsuccessful, so that my Dog's achievements are not erased.
34. As a handler, I want shaky completed Steps marked Needs practice, so that I can refresh foundations without automatically losing downstream achievements.
35. As a handler, I want a history of Practice targets and Test results, so that recommendations and changes are understandable.
36. As an existing user, I want my checked Steps retained as previously recorded completions, so that the new flow preserves progress without fabricating past attempts or Tests.
37. As a handler, I want Comeafters tracked separately as generalization Practice, so that passing a Step does not hide useful real-world work.
38. As a handler, I want Level progression based on completing its Behavior Steps, so that my normal path stays focused on finishing each Level.
39. As a handler, I want Homework reflections saved without blocking progression, so that I can revisit my answers while continuing training.
40. As a handler, I want to see unmet Comebefores before choosing a Behavior manually, so that I understand which foundations I am bypassing.
41. As a handler, I want a temporary later-Level override, so that an immediate need does not permanently change my Level progression goal.
42. As a handler, I want Levels shown as columns with Behavior boxes and dependency arrows, so that I can understand the curriculum visually.
43. As a handler, I want selecting a Behavior to highlight its prerequisite chain and recommended next options, so that I can see how to build toward it.
44. As a handler, I want the graph to show completed, unfinished, and Needs practice states, so that I can assess my Dog's foundations.
45. As a mobile handler, I want readable boxes, horizontal Level scrolling, and separate Behavior details, so that the graph remains usable on a phone.
46. As a handler using keyboard or assistive technology, I want a dependency list with equivalent information, so that understanding prerequisites does not depend on reading arrows.
47. As a curriculum maintainer, I want progression rules and dependencies maintained as source-backed data, so that we can improve recommendations without rewriting the guided UI.
48. As a curriculum maintainer, I want app defaults distinguishable from explicit curriculum instructions, so that product choices are not misrepresented as source requirements.

## Implementation Decisions

- Extend the existing authenticated curriculum experience and stable Behavior/Step identifiers. The current app already provides structured instructions, equipment, Comebefores, Try It Cold, Comeafters, and Dog-owned Step completions; reuse these concepts and the existing curriculum rendering infrastructure.
- Follow existing route/page, server-function, query/mutation, database ownership, and UI component conventions. Keep page-specific orchestration local; extract reusable modules only where justified by actual consumers.
- Training is an umbrella for Practice and Test; Session remains an authentication term. Keep source wording such as Try It Cold in full reading where appropriate, while labeling the guided verification mode Test.
- Each activity works on one Behavior with a specific current criterion. A Step may require many Practices. Finishing Practice does not mark it complete.
- Maintain Behavior rules with Step-specific overrides for starting and restart targets, increments, repetitions or repeated-success requirements, observable success criteria, readiness, and suggested practice limits. Permit different increment sizes at different ranges and restart rules informed by previous achievement where appropriate. Do not assume one-second increments remain practical for every long-duration target.
- Author this data against the Main Quest curriculum as part of delivery. Preserve source references and explicitly identify app defaults where the source leaves judgment open. Do not invent exact rules and present them as quotations from the curriculum.
- Do not classify every Behavior as exclusively continuous or discrete. A Behavior may progress through shaping, duration, distance, reduced assistance, and changed conditions at different Steps. Use its actual instructions.
- Follow explicit per-attempt ladder or repetition instructions. Sets, where used, support breaks and reflection; they are not a universal boundary for increasing difficulty.
- Do not implement a universal 80% gate, fixed ten-attempt confirmation phase, percentage increment, or 50% restart. The 80% guidance may be explanatory material. Do not add separate build-up and consistency modes.
- Where the source requires judgment, show an observable readiness prompt. At the full criterion, show recent results and offer Keep practicing or Recommend a Test next time rather than silently inventing a numeric gate.
- Start Training opens Prep. Prep contains concise setup and success criteria; In progress contains the target and essential recording controls; Explanation contains the full method and rationale; FAQ separates general and Behavior-specific content. Explanation and FAQ are reachable before and during Training and preserve the chosen activity and recorded attempts on return.
- Opening reading pauses a running timer and invalidates that interrupted timed attempt as a continuous hold; require a fresh attempt. A timer reaching zero never records success automatically.
- Record attempts with fixed-position Success and Not yet buttons, counts, Undo, Finish, and optional totals entry. Support accessible labels, keyboard access, large separated targets, and quiet visual feedback. Logging happens after the handler marks and rewards the Dog. Unrecorded or interrupted attempts are not inferred failures.
- Save each recorded attempt immediately and persist corrections, targets, relevant conditions, results, and the information needed for meaningful history and recommendations. Keep Practice evidence, Test outcomes, historical completion, and current Needs practice state distinguishable. Associate all user-owned records with the correct Dog and authenticated owner.
- New persistence is required for attempts, Test history, readiness, corrections, Comeafter tracking, and Homework responses; existing completion records alone are insufficient. Exact table and operation shapes remain implementation choices. Preserve existing primary-Dog behavior; do not add multi-Dog management in this issue.
- Expose application-owned operations for getting a recommendation, beginning/resuming work, recording/correcting results, and reading history. Use validated authenticated boundaries and existing ownership conventions. Handle write failures visibly; do not claim unsaved work is persisted or duplicate outcomes on retry.
- Completing a new Step requires a successful Test against the full source criterion, including conditions, not merely a timer duration. Recommend eligible Tests before Practice; default to a later day and allow a handler-confirmed coldness override. Keep warm-up eligibility distinct from timer elapsed time.
- After an unsuccessful Test, recommend Practice. For a previously passed Step, retain the historical pass, mark Needs practice, and surface that state in history and the graph without cascading deletion of downstream achievements.
- Preserve existing checked Steps as previously recorded completions; do not backfill fictional Practice or Test results. Reconcile existing checkbox interactions so they do not masquerade as successful Tests or bypass the new guided completion semantics.
- Comeafters remain separately tracked recommended generalization work. Completing all Behavior Steps unlocks the next Level in normal progression; saved Homework reflections are encouraged but do not gate it. Manual later-Level overrides remain available.
- Default recommendations focus on completing the current Level, use curriculum order and rotation across eligible Behaviors, and explain their choice. Unmet prerequisite Comebefores exclude a Behavior from automatic recommendations, while a manual selection displays them and permits an override. Overrides do not permanently change the current Level goal. Offer another recommendation when setup is unsuitable.
- Structure the graph as vertical Level columns containing Behavior boxes, with arrows for documented prerequisite relationships. Preserve source granularity for Behavior, Level, or explicitly named Step requirements; expose Step details without requiring every Step to become a box.
- Interpret source relationships carefully: some Comebefore sections describe prior foundations; others recommend working Behaviors together, mention helpful background, or require reading another section. Preserve these distinctions rather than turning every mention into a completion gate. In particular, mutual support between Go To Mat and Relax must not become a prerequisite deadlock. Make these distinctions visible in details or edge treatment while keeping true prerequisites actionable.
- Highlight a selected Behavior's prerequisite chain, completion/Needs practice state, and next eligible options. Provide whole-curriculum exploration. On mobile, scroll columns horizontally and open selected details separately; provide an equivalent accessible dependency list.
- Initial FAQs are authored from source questions and troubleshooting, with source references. Additional answers require curriculum review. No generated-answer service is part of this feature.
- No dependency, project configuration, CI, or deployment changes are pre-approved by this issue; follow the repository's configuration approval gate if implementation needs them.

## Testing Decisions

- The user confirmed browser-level acceptance tests through the existing page-object approach as the primary, highest test seam, supported by focused curriculum-rule and persistence tests only where needed.
- Good tests assert visible behavior and durable outcomes, not component structure, private helpers, exact internal call sequences, or incidental state representation. Prefer existing fixtures and test seams over new wrappers or adapters introduced only for testing.
- Browser coverage should exercise Start Training through Prep, Practice, recorded outcomes, changed targets, finishing, history, later Test, and Step completion. Include manual overrides, pending-Test priority, current-Level focus, unsuitable setup, and preservation of existing completion records.
- Cover reading navigation, timer interruption and restart, no automatic timer success, Undo, totals entry, reload/resume, visible save failure/retry behavior, and no inferred failure for an unrecorded attempt.
- Cover unsuccessful Tests for both uncompleted and previously passed Steps, Needs practice without downstream achievement removal, Comeafter tracking, saved Homework, and Level progression without Homework gating.
- Cover dependency chains, unmet-foundation explanations, nonblocking co-practice relationships, mobile horizontal graph navigation, equivalent list information, keyboard access, and readable recording controls.
- Use focused public rule tests for representative numeric ladders, repeated-success requirements, approximation changes, restart rules, source-unspecified readiness prompts, and prerequisite eligibility. Include mutual-support relationships so recommendation selection cannot deadlock by mistaking them for prerequisites. Use controlled time for later-day Test eligibility rather than wall-clock waits.
- Extend existing Workers database service tests for ownership, durable attempt/correction history, preserved completions, and invalid inputs. Exercise observable persisted results and recovery rather than mocking every database call.
- Prior art includes the existing curriculum Level/completion browser scenarios, navigation and keyboard scenarios, responsive overflow checks, curriculum data validation tests, and Workers-backed curriculum service tests. Reuse their page objects, authenticated setup, provider-backed testing helpers, and deterministic fixtures.
- During implementation, add failing behavior tests first and run focused checks. Before handover, run full repository health and CI parity, complete suite coverage, and browser checks using the existing Vite+ commands: `vpr check:full`, `vpr check:ci`, `vp test --coverage`, and `vpr test:browser`. Report evidence and any blocked checks.

## Out of Scope

- Creating a prototype now; the user explicitly deferred it.
- A persistent Dog goal of aim for a particular Behavior instead of progress through Levels. Viewing a Behavior's prerequisite chain and temporarily choosing it remain in scope.
- Swipe controls; taps are the initial recording interaction.
- Mandatory multi-Behavior workouts, global 80% algorithms, or a separate consistency phase.
- Automatic correctness detection from timers, sensors, audio, or video.
- Multi-Dog management, specialty Side Quests, and an AI-generated FAQ/chat service.
- Deploying the feature, changing production data, or changing project configuration as part of publishing this specification.

## Further Notes

This specification synthesizes the accepted design interview. It is self-contained because the local design notes and glossary updates have not been published as repository commits.

Source evidence reviewed includes The Organization of Training for order and exceptions; The Thinking of Training for short Practice, ten-treat sets, ladders, and general 80% guidance; After You Train for cold Tests and useful records; Level 1 Down for within-Level ordering; Level 2 Zen and Down for varied ladder/reset rules; Level 2 Lazy Leash for observable understanding and repetition patterns; and Level 3 Retrieve for different progression methods within one Behavior.

Authoring the actual dependencies and progression rules is required work, not a completed artifact or a universal algorithm supplied by this spec. Use source-backed instructions and distinguish deliberately chosen defaults. Where the source leaves readiness to the handler, the agreed fallback is an observable prompt rather than another interview or invented precision.

Deliver the guided flow, recommendation/history support, dependency graph/list, and all four views as the initial feature. Break implementation into reviewable changes if needed while keeping this issue as the acceptance contract. No prototype has been created or requested for this issue.
