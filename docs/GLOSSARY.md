# Training Levels Domain Glossary & Terminology Guide

> **Canonical Domain Reference for Sue Ailsby's *Training Levels: Steps to Success* (Volumes 1 & 2)**  
> *Third Edition — Completely Revised*

---

## Table of Contents

1. [Overview & Purpose](#overview--purpose)
2. [Core Curriculum Structure & Workflow](#core-curriculum-structure--workflow)
3. [Training Concepts & Behavioral Theory](#training-concepts--behavioral-theory)
4. [Acquisition Techniques (Getting Behaviour)](#acquisition-techniques-getting-behaviour)
5. [Cues, Markers & Communication](#cues-markers--communication)
6. [Behavioural Architecture & Chains](#behavioural-architecture--chains)
7. [Problem Solving & Troubleshooting](#problem-solving--troubleshooting)
8. [Curriculum Behaviors & Standard Cues Directory](#curriculum-behaviors--standard-cues-directory)
9. [Codebase & Schema Terminology Mapping](#codebase--schema-terminology-mapping)
10. [Alphabetical Index](#alphabetical-index)

---

## Overview & Purpose

This glossary establishes canonical, standardized definitions for all domain terminology used throughout Sue Ailsby's *Training Levels: Steps to Success* curriculum. It serves as the single source of truth across the markdown documentation, TypeScript schema definitions, AST parsers, and UI components.

---

## Core Curriculum Structure & Workflow

### Level
One of the four main progressive stages composing the curriculum:
- **Level 1 (Foundations & Basics):** Introduces handler and dog communication, clicker mechanics, and basic control behaviors (Zen, Come, Sit, Target, Down).
- **Level 2 (New Behaviours & Control):** Expands vocabulary with loose-leash walking, crate manners, mat stays, distance work, jumping, handling, and initial directional communication.
- **Level 3 (Duration, Distraction & Chains):** Solidifies behaviors under heavy real-world distractions, extends duration, introduces retrieving, and begins stimulus control drills.
- **Level 4 (Fluency, Independence & Advanced Skills):** Refines behaviors to high proofing standards (out-of-sight stays, off-lead reliability, directional modifiers, elimination on cue, complex chains).

*Cross-references:* `LevelData`, `01-level-1/`, `02-level-2/`, `03-level-3/`, `04-level-4/`.

### Behavior (Behaviour)
A distinct exercise track within the curriculum. There are 16 general behaviors across the 4 Levels:
1. **Zen** (Self-Control)
2. **Come** (Recall)
3. **Sit**
4. **Target** (Hand, Foot, Object targeting)
5. **Down**
6. **Focus** (Eye Contact / Attention)
7. **Lazy Leash** (Loose-leash walking)
8. **Go To Mat**
9. **Crate**
10. **Distance** (Working away from the handler / Go Around)
11. **Jump**
12. **Relax** (Settle)
13. **Handling** (Husbandry, Grooming, Vet Care)
14. **Tricks**
15. **Communication** (Personal space, directional modifiers, body language)
16. **Retrieve**

*Cross-references:* `BehaviorData`, `behaviorKey`.

### Step
One of the 5 sequential stages in each Behavior. Each behavior in the Levels is divided into exactly **5 Steps** (numbered 1 through 5), each building upon the previous step to increase difficulty, distance, distraction, or duration.

*Cross-references:* `StepData`, `stepNumber`, `CriteriaTableRow`.

### Split
A subdivision of a step. When a dog struggles with a given step, the trainer splits the criterion into even smaller, achievable increments rather than forcing the larger step all at once.

*Cross-references:* [Splitting](#splitting-vs-lumping), [Chutes and Ladders](#chutes-and-ladders).

### Criteria (Criterion)
The specific, measurable standard or requirement that the dog must meet on any given repetition to earn a click and reward. Clear criteria prevent trainer hesitation and dog confusion.

*Cross-references:* `CriteriaTableRow`, `criterionSummary`, `00-foundations/07-solving-training-problems.md`.

### Comebefores
The prerequisites or foundational behaviors and skills that the dog and handler should master before attempting a new behavior or step.

> *"Most Steps and Behaviours are based on what came before them. I've listed the behaviours I think are vital foundations in sections called COMEBEFORES."* — Sue Ailsby (*00-foundations/08-after-you-train.md*)

*Cross-references:* `BehaviorData.comebefores`.

### Comeafters
Practical, real-world generalization exercises, creative applications, and proofing challenges suggested for practice after the core step criteria have been passed.

*Cross-references:* `StepData.comeafters`.

### Try It Cold
A testing protocol where the handler tests the dog on a specific step criterion without prior warm-up, prompting, or practice in that session. "Cold" testing verifies true long-term retention and generalization versus short-term repetition.

*Cross-references:* `StepData.tryItCold`, `00-foundations/08-after-you-train.md`.

### Homework
The culminating review at the end of each Level. Homework outlines real-life milestones, self-evaluations, and expectations before advancing to the next level.

*Cross-references:* `Homework`, `01-level-1/06-homework.md` through `04-level-4/13-homework.md`.

### In The Game
The essential state of mutual focus, enthusiasm, and cognitive engagement between handler and dog. If either partner is distracted, bored, or frustrated, they are not "In The Game," and criteria must be simplified until engagement returns.

> *"The first, last, and forever, unbreakable rule: YOUR DOG — AND YOU — MUST BE IN THE GAME WHILE YOU'RE TRAINING HER."* — Sue Ailsby (*00-foundations/06-the-thinking-of-training.md*)

### Pre-Brief, Be Brief, Debrief
A 3-stage training session structure attributed to Steve White:
1. **Pre-Brief:** Plan the session, select criteria, assemble treats and equipment, and arrange setting factors.
2. **Be Brief:** Execute a short, focused training session (typically 15 seconds to 5 minutes / 10 to 50 treats).
3. **Debrief:** Stop training, evaluate what went right or wrong, record progress, and adjust the plan.

---

## Training Concepts & Behavioral Theory

### Zen (Self-Control)
The core impulse-control concept in the Levels: **"Leaving what you want is what makes what you want happen."**
Training progresses through progressive Zen challenges:
- **Hand Zen:** Dog leaves food closed in the handler's fist; opening hand marks progress; treat is delivered from the *other* hand or picked up by the handler.
- **Floor Zen:** Dog ignores food dropped on the floor.
- **Table / Counter Zen:** Dog ignores food on low tables, counters, or furniture.
- **Door Zen:** Dog waits politely at open doors without bolting until released.
- **Leash Zen:** Dog yields to leash pressure rather than pulling against it.

*Cross-references:* `docs/01-level-1/01-zen.md` through `docs/04-level-4/01-zen.md`.

### Premack Principle
The behavioral principle (Grandma's Law: *"Eat your vegetables, then you get dessert"*) stating that high-probability behaviors (jumping, running, chasing, sniffing, looking away) can serve as powerful reinforcers for low-probability behaviors (staying calm, holding position, eye contact).

*Cross-references:* `docs/04-level-4/02-focus.md#L119`.

### The 4 Ds
The four primary dimensions along which criteria are systematically increased:
1. **Difficulty:** Variations in topography, body posture, handler positioning, or surface textures (grass, tile, stairs).
2. **Distance:** Physical separation between handler and dog, or distance between dog and target/mat.
3. **Distraction:** Environmental competition (sounds, smells, people, other dogs, dropped food, wildlife).
4. **Duration:** The length of time the dog maintains a position or behavior before the click/release.

*Cross-references:* `docs/00-foundations/06-the-thinking-of-training.md`.

### Chutes and Ladders (Laddering)
A training methodology for managing criteria and building stamina:
- **Ladder:** Incrementally raising criteria one small step at a time (e.g., 1s, 2s, 3s).
- **Chute:** When the dog fails a repetition, immediately slide down the "chute" back to easy baseline criteria (e.g., return to 1s) to deliver several successful, sub-threshold reinforcements before building up again.

### The 3 Rs (Remind, Review, Reteach)
Whenever any training factor or environment changes (e.g., moving from the living room to the backyard, switching handler hands, or changing direction), the handler must make the exercise substantially easier to **Remind** the dog, **Review** the mechanics, and **Reteach** the behavior in the new context.

*Cross-references:* `docs/00-foundations/06-the-thinking-of-training.md`.

### Latent Learning
Learning and neural consolidation that occurs *after* a training session has ended, during periods of rest and sleep (*l'esprit d'escalier*). When a dog struggles, ending the session cleanly allows latent learning to resolve the problem before the next attempt.

*Cross-references:* `docs/00-foundations/06-the-thinking-of-training.md`.

### Rate of Reinforcement
The frequency of clicks/rewards delivered per minute. High reinforcement rates give the dog clear, continuous feedback, preventing frustration, confusion, and loss of focus.

### Limited Hold
A temporal restriction specifying that reinforcement is only available if the dog performs the behavior within a predetermined time window (e.g., allowing 60 seconds for elimination on cue; if the dog does not eliminate within 60 seconds, the opportunity ends and the dog is brought inside).

*Cross-references:* `docs/04-level-4/11-handling.md`.

### Stimulus Control
The state of fluency in which a behavior:
1. Occurs immediately when the cue is presented.
2. Does *not* occur when the cue is absent (dog stops uninvited volunteering).
3. Does *not* occur in response to any other cue.
4. No other behavior is offered in response to the cue.

*Cross-references:* `docs/03-level-3/11-distance.md`.

### 80% Rule (Bob Bailey)
The benchmark criteria for progression: advance to a harder step or higher criterion only when the dog achieves at least 80% success (e.g., 8 out of 10 correct repetitions in a set).

### Banking on Behaviour
Building a rich history of reinforcement ("depositing pennies in the bank") across hundreds of repetitions before reducing reinforcement frequency or asking for demanding chains ("twofers" or "threefers").

### The "Big 3"
The three foundational calm/stationing behaviors that form the bedrock of canine self-control and house manners:
1. **Go To Mat**
2. **Crate**
3. **Relax**

### Life Rewards
Naturally occurring environmental consequences valued by the dog (opening doors, going for a walk, greeting a friend, getting out of the car, playing with a toy) incorporated as reinforcers in the training contract.

### Contract
The reciprocal training agreement: *"I get what I want, then you get what you want."*

---

## Acquisition Techniques (Getting Behaviour)

According to Bob Bailey's three rules (*"1. Get the behavior; 2. Get the behavior; 3. Get the behavior"*), reinforcement requires first obtaining the action. The curriculum defines four acquisition techniques and combination training:

```
                  ┌───────────────────────────────┐
                  │      Getting Behaviour        │
                  └──────────────┬────────────────┘
         ┌───────────────┬───────┴───────┬───────────────┐
         ▼               ▼               ▼               ▼
   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │  Shaping  │   │  Luring   │   │ Capturing │   │ Modeling  │
   └───────────┘   └───────────┘   └───────────┘   └───────────┘
         ▲               ▲               ▲          (Discouraged)
         └───────────────┼───────────────┘
                         │
           ┌─────────────┴─────────────┐
           │   Combination Training    │
           └───────────────────────────┘
```

### Shaping
Building a behavior by marking and rewarding successive approximations (tiny movements in the desired direction) without physical guidance or lures. Develops problem-solving creativity in the dog.

### Luring
Using a treat, toy, or target near the dog's nose to physically guide head and body position into the desired behavior. Lures must be faded quickly (within 5–6 repetitions) to empty-hand cues to avoid treat dependency ("no ticket, no laundry").

### Capturing (Waiting)
Setting up environmental setting factors and waiting for the dog to spontaneously perform a natural behavior (yawning, stretching, shaking, lying down, peeing), then marking and rewarding the exact instant it occurs.

### Modeling
Physically placing or pushing the dog's body into position (e.g., pushing the hindquarters down to sit). **Strongly discouraged in the Levels** because it bypasses the dog's active cognitive learning and creates resistance through the opposition reflex.

### Combination Training
Strategically combining shaping, luring, and capturing across different steps of a complex exercise (e.g., luring an initial movement, capturing a pause, and shaping the final posture).

### Crossover Dog & Crossover Trainer
- **Crossover Dog:** A dog previously trained with traditional, compulsion-based, or correction-heavy methods who must learn that voluntary experimentation and creativity are safe and rewarded.
- **Crossover Trainer:** A handler transitioning from traditional correction methods to reward-based operant conditioning.

---

## Cues, Markers & Communication

### Marker (Bridge / Clicker)
A distinct auditory, visual, or tactile signal (such as a clicker, verbal *"Yes"*, flashlight, or shoulder tap) that marks the exact microsecond the dog performs the correct criterion, bridging the gap until the reward is delivered.

### Click — Beat — Treat
The essential rhythm of reinforcement delivery:
1. **Click:** The clicker marks the behavior.
2. **Beat:** A deliberate half-second pause where the handler remains motionless (preventing the dog from watching the treat hand).
3. **Treat:** The hand reaches for and delivers the reward.

### Cue (vs. Command)
- **Cue:** An informational green light signaling that performing a specific behavior will now be reinforced.
- **Command:** An imperative demand historically enforced through threats of punishment. The Levels exclusively use cues.

### New Cues (Changing Cues)
The process of transferring stimulus control to a new verbal cue or hand signal using the dog's associative learning:
1. Give the **NEW** cue first.
2. Pause a fraction of a second.
3. Give the **OLD** cue.
4. Mark (click) and reward the behavior.
5. Repeat until the dog anticipates and responds directly to the new cue.

### Modifier Cues (Directional Cues)
Informational cues (such as `Left`, `Right`, `Go Ahead`, `Over`) that qualify or direct a subsequent action rather than triggering an isolated motor program.

*Cross-references:* `docs/04-level-4/12-communication.md`.

### Default Behaviour (Default Cue)
A behavior triggered directly by an environmental stimulus without requiring an explicit verbal command or handler gesture.
Examples:
- Leash attached to collar = keep the leash loose.
- Open doorway = wait calmly until invited.
- Arriving at handler's side = swing finish / sit in heel position.
- Food falling to the floor = look away and check in with handler.

### No-Reward Marker
An optional non-punitive verbal marker indicating that a specific attempt did not meet criteria, prompting the dog to reset and try again. Used sparingly to avoid demotivating sensitive dogs.

---

## Behavioural Architecture & Chains

### Behaviour Chain
A sequence of distinct behavioral units ("links") performed in succession before receiving a terminal reinforcer. Each completed link serves as the secondary reinforcer for the preceding link and the cue for the next link.

### Back-Chaining
Assembling a chain starting from the final link and working backward toward the beginning. Because the dog is always moving toward the most well-practiced, highly reinforced link, back-chaining produces fast, confident, and reliable performance.

### Poisoned Cue / Poisoned Chain
A cue or behavioral link that has become contaminated with hesitation, fear, or frustration due to conflicting criteria, repeated failures, or accidental punishment. A poisoned cue must be retired and replaced with a newly taught cue.

### Rapid-Fire Reinforcement
Delivering treats in immediate, rapid succession while the dog holds a static position (such as Down or Go To Mat) to prevent the dog from breaking position and to reinforce sustained duration.

### Threshold of Behaviour
The limit of distance, duration, or distraction at which a dog can reliably perform a behavior without breaking criteria. Effective training operates just sub-threshold.

---

## Problem Solving & Troubleshooting

```
                      ┌───────────────────────────────┐
                      │  Troubleshooting Flowchart   │
                      └───────────────┬───────────────┘
                                      │
                   Are you getting the behaviour you want?
                                      │
                       ┌──────────────┴──────────────┐
                      YES                            NO
                       │                             │
             Are there unwanted            Do you care enough
               side effects?               to work to get it?
                 ┌─────┴─────┐                 ┌─────┴─────┐
                YES          NO               YES          NO
                 │           │                 │           │
                 ▼           ▼                 ▼           ▼
             CHANGE       Keep doing        CHANGE      Keep doing
            SOMETHING     what you're      SOMETHING    what you're
                            doing                         doing
```

### Splitting vs. Lumping
- **Splitting:** Breaking a training goal down into the smallest possible teachable increments ("Splitters rule!").
- **Lumping:** Attempting to train multiple composite skills or large behavioral chunks simultaneously, leading to failure and frustration.

### Extinction & Extinction Burst
- **Extinction:** The systematic decrease and eventual cessation of a behavior when reinforcement is completely withheld.
- **Extinction Burst:** A predictable, temporary surge in frequency, intensity, or variability of the behavior when reinforcement is first withheld before the behavior declines.

### Setting Factors
The environmental, physical, and emotional variables that influence training success:
- Handler preparedness and clarity of the plan.
- Dog's hunger level and physical comfort.
- Quiet, non-distracting environment.
- Equipment organized within easy reach.

### "Can't Teach a Negative"
You cannot train the absence of a behavior (e.g., "don't jump" or "don't bark"). You must train an **incompatible positive behavior** (e.g., "keep four feet on the floor" or "go lie on your mat").

### "Hey Stupid" Reaction
The dog's visible frustration or exaggerated re-offering of a previously rewarded behavior when criteria are raised or when stimulus control is introduced. The handler waits calmly for stillness before clicking.

### Opposition Reflex (Freedom Reflex)
The involuntary physiological response where an animal pushes or pulls against physical pressure (e.g., leaning against a tight leash or collar). Avoided by using positive reinforcement and loose-leash defaults rather than physical force.

### Management vs. Training
> *"Management affects THIS behavior. Training affects the NEXT behavior."* — Karen Pryor (*cited in 00-foundations/05-the-organization-of-training.md*)

Management uses barriers, crates, gates, and leashes to prevent mistakes in the present; training teaches voluntary self-control for the future.

---

## Curriculum Behaviors & Standard Cues Directory

| Behavior Key | Behavior Name | Recommended / Default Cue | Primary Focus | Curriculum Levels |
| :--- | :--- | :--- | :--- | :--- |
| `zen` | **Zen** | `Leave It` (or default silence) | Impulse control, ignoring food, floor & door manners | Level 1, 2, 3, 4 |
| `come` | **Come** | `Come` / `Puppy Puppy` / Whistle | Immediate recall from distance & distractions | Level 1, 2, 3, 4 |
| `sit` | **Sit** | `Sit` (verbal & hand signal) | Posture, sit stay, sit from down, parking | Level 1, 2, 3 |
| `target` | **Target** | `Touch` / `Punch It` | Hand nose-touches, paw targeting, object targets | Level 1, 2, 3, 4 |
| `down` | **Down** | `Down` (verbal & hand signal) | Down stay, out-of-sight down, emergency drop | Level 1, 2, 3 |
| `focus` | **Focus** | `Watch` (or default eye contact) | Sustained eye contact, looking past distractions | Level 2, 3, 4 |
| `lazy-leash` | **Lazy Leash** | Default: leash attached to collar | Loose-leash walking, changing pace & direction | Level 2, 3, 4 |
| `go-to-mat` | **Go To Mat** | `Go To Mat` | Distance send to station, long-duration down | Level 2, 3, 4 |
| `crate` | **Crate** | `Get In` / `Kennel Up` / `Hit The Rack` | Entering on cue, door manners, resting quietly | Level 2, 3, 4 |
| `distance` | **Distance** | `Go Around` / `Go 'Round` / `Go Ahead` | Circling chairs/poles, directional distance sends | Level 2, 3, 4 |
| `jump` | **Jump** | `Hup` / `Jump` / `Over` | Clearing agility jumps, vehicle entry & exit | Level 2, 3 |
| `relax` | **Relax** | `Settle` | Physiological muscle relaxation on hip / side | Level 2, 3, 4 |
| `handling` | **Handling** | `Stand` / `Steady` / `Hurry Up` | Grooming, vet exam tolerance, elimination on cue | Level 2, 3, 4 |
| `tricks` | **Tricks** | Individual trick cues | Cognitive enrichment, shaping practice | Level 2 |
| `communication` | **Communication** | `Left` / `Right` / `Swing` / `Tuck` | Body awareness, personal space, directional modifiers | Level 2, 3, 4 |
| `retrieve` | **Retrieve** | `Get It` / `Hold` / `Thank You` | Dumbbell/toy retrieve chain, clean mouth release | Level 3, 4 |

---

## Codebase & Schema Terminology Mapping

| Curriculum Domain Concept | TypeScript Type (`src/types/curriculum.ts`) | Parser Function (`src/parser/content-parser.ts`) | Source Markdown Location |
| :--- | :--- | :--- | :--- |
| **Consolidated Dataset** | `TrainingLevelsData` | `compileCurriculum()` | `src/data/training-levels.json` |
| **Level** | `LevelData` | `parseOverviewFile()` | `docs/0X-level-X/00-overview.md` |
| **Behavior** | `BehaviorData` | `parseBehaviorFile()` | `docs/0X-level-X/XX-behavior.md` |
| **Step** | `StepData` | `parseBehaviorFile()` | `## Step X: ...` headings |
| **Criteria Table** | `CriteriaTableRow[]` | `parseCriteriaTable()` | `\| Step \| Criteria \|` tables |
| **Comebefores** | `BehaviorData.comebefores` | `parseBehaviorFile()` | `**Comebefores:** ...` block |
| **Comeafters** | `StepData.comeafters` | `parseBehaviorFile()` | `- [ ] **Comeafters:** ...` |
| **Try It Cold** | `StepData.tryItCold` | `parseBehaviorFile()` | `- [ ] **Try It Cold:** ...` |
| **Callout / Tip / Warning** | `Callout` (`CalloutType`) | `parseCallouts()` | `> [!TIP]`, `> [!WARNING]`, etc. |
| **Homework** | `Homework` | `parseHomeworkFile()` | `docs/0X-level-X/XX-homework.md` |
| **Foundations** | `FoundationItem` | `parseFoundationFile()` | `docs/00-foundations/*.md` |
| **Appendices & Indices** | `AppendixItem` | `parseAppendixFile()` | `docs/05-appendices/*.md` |

---

## Alphabetical Index

- [3-Minute Behaviours](#overview--purpose)
- [3 Rs (Remind, Review, Reteach)](#the-3-rs-remind-review-reteach)
- [4 Ds (Difficulty, Distance, Distraction, Duration)](#the-4-ds)
- [80% Rule (Bob Bailey)](#80-rule-bob-bailey)
- [Back-Chaining](#back-chaining)
- [Banking on Behaviour](#banking-on-behaviour)
- [Behavior / Behaviour](#behavior-behaviour)
- [Behaviour Chain](#behaviour-chain)
- [Big 3](#the-big-3)
- [Bridge](#marker-bridge--clicker)
- [Capturing (Waiting)](#capturing-waiting)
- [Changing Cues](#new-cues-changing-cues)
- [Chutes and Ladders (Laddering)](#chutes-and-ladders-laddering)
- [Click — Beat — Treat](#click--beat--treat)
- [Clicker](#marker-bridge--clicker)
- [Combination Training](#combination-training)
- [Come](#curriculum-behaviors--standard-cues-directory)
- [Comeafters](#comeafters)
- [Comebefores](#comebefores)
- [Command](#cue-vs-command)
- [Communication](#curriculum-behaviors--standard-cues-directory)
- [Contract](#contract)
- [Crate](#curriculum-behaviors--standard-cues-directory)
- [Criteria (Criterion)](#criteria-criterion)
- [Crossover Dog & Crossover Trainer](#crossover-dog--crossover-trainer)
- [Cue](#cue-vs-command)
- [Default Behaviour](#default-behaviour-default-cue)
- [Directional Cues](#modifier-cues-directional-cues)
- [Distance](#curriculum-behaviors--standard-cues-directory)
- [Down](#curriculum-behaviors--standard-cues-directory)
- [Extinction & Extinction Burst](#extinction--extinction-burst)
- [Focus](#curriculum-behaviors--standard-cues-directory)
- [Go To Mat](#curriculum-behaviors--standard-cues-directory)
- [Handling](#curriculum-behaviors--standard-cues-directory)
- [Hey Stupid Reaction](#hey-stupid-reaction)
- [Homework](#homework)
- [In The Game](#in-the-game)
- [Jump](#curriculum-behaviors--standard-cues-directory)
- [Latent Learning](#latent-learning)
- [Lazy Leash](#curriculum-behaviors--standard-cues-directory)
- [Level](#level)
- [Life Rewards](#life-rewards)
- [Limited Hold](#limited-hold)
- [Lumping](#splitting-vs-lumping)
- [Luring](#luring)
- [Management vs. Training](#management-vs-training)
- [Marker](#marker-bridge--clicker)
- [Modeling](#modeling)
- [Modifier Cues](#modifier-cues-directional-cues)
- [New Cues](#new-cues-changing-cues)
- [No-Reward Marker](#no-reward-marker)
- [Opposition Reflex (Freedom Reflex)](#opposition-reflex-freedom-reflex)
- [Poisoned Cue / Poisoned Chain](#poisoned-cue--poisoned-chain)
- [Pre-Brief, Be Brief, Debrief](#pre-brief-be-brief-debrief)
- [Premack Principle](#premack-principle)
- [Rapid-Fire Reinforcement](#rapid-fire-reinforcement)
- [Rate of Reinforcement](#rate-of-reinforcement)
- [Relax](#curriculum-behaviors--standard-cues-directory)
- [Retrieve](#curriculum-behaviors--standard-cues-directory)
- [Setting Factors](#setting-factors)
- [Shaping](#shaping)
- [Sit](#curriculum-behaviors--standard-cues-directory)
- [Split](#split)
- [Splitting](#splitting-vs-lumping)
- [Step](#step)
- [Stimulus Control](#stimulus-control)
- [Target](#curriculum-behaviors--standard-cues-directory)
- [Threshold of Behaviour](#threshold-of-behaviour)
- [Tricks](#curriculum-behaviors--standard-cues-directory)
- [Troubleshooting Flowchart](#problem-solving--troubleshooting)
- [Try It Cold](#try-it-cold)
- [Waiting](#capturing-waiting)
- [Zen](#zen-self-control)
