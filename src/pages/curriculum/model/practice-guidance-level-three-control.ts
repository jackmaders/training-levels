import type { BehaviorRule } from "./practice-guidance.types";

const FIVE = 5;
const TEN = 10;
const TWENTY = 20;
const THIRTY = 30;

const PRACTICE_GUIDANCE_LEVEL_THREE_CONTROL: Readonly<Record<string, BehaviorRule>> = {
  "level-3/distance": {
    conditions:
      "Use Go'Round around a stable chair or stool with non-slip footing; keep treats off your body during Step 3.",
    progression:
      "Teach the chair go-around close first, extend distance to 5 and 10 feet, fade treats on your person, then generalize objects.",
    readiness:
      "Does your Dog circle the object cleanly on Go'Round and return to you under the distance and treat conditions of this Step?",
    restart:
      "Step closer to the object or restore visible setup cues briefly, then rebuild distance in 1-foot increments.",
    setup:
      "Set a sturdy chair or stool in clear floor space with small treats and a clicker ready.",
    steps: {
      1: {
        progression:
          "Guide a close Go'Round around a chair or stool and mark as she clears the far side and comes back to face you.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Cue Go'Round around a chair {value} away.",
          unit: "foot",
        },
        progression:
          "Step back 1 foot at a time from the chair until she goes smoothly around it from 5 feet away.",
      },
      3: {
        practiceTargets: [
          "Leave treats out of reach and cue Go'Round around a chair 2 feet away.",
          "Cue Go'Round around a chair 5 feet away with no treats on your person.",
        ],
        progression:
          "Keep treats stored away from your body and rebuild Go'Round out to 5 feet so she works without food on you.",
        targetAdvancement: "app default",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TEN,
          restartAt: FIVE,
          startAt: FIVE,
          targetTemplate: "Cue Go'Round around a chair {value} away.",
          unit: "foot",
        },
        progression:
          "Extend Go'Round distance from 5 feet up to 10 feet in 1-foot rungs; restart at 5 feet if she cuts short.",
      },
      5: {
        progression:
          "Practice Go'Round around cones, boxes, trash cans, and trees, starting close to each unfamiliar object.",
      },
    },
  },
  "level-3/jump": {
    conditions:
      "Practice away from traffic using a car crate or rear seat-belt harness; close the door calmly if she starts out early.",
    progression:
      "Separate waiting to enter, waiting to exit, and waiting on a loose leash before chaining all three together.",
    readiness:
      "Does your Dog wait calmly at the open car door and on a loose leash for the complete sequence and timing of this Step?",
    restart:
      "Close the door gently if she breaks the wait or step back into position; shorten the count before rebuilding.",
    setup:
      "Use a safely parked vehicle with treats, a clicker, and a secure crate or rear harness inside.",
    steps: {
      1: {
        progression:
          "Open the car door smoothly while holding back if needed; release her to jump in only when she waits calmly for your cue.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: THIRTY,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Wait {value} after the car door opens before exiting on cue.",
          unit: "second",
        },
        progression:
          "With her buckled or crated safely inside, open the car door and ladder her calm wait from 1 second up to 30 seconds before cueing exit.",
      },
      3: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TEN,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Exit the car on cue, then wait on a loose leash for {value}.",
          unit: "second",
        },
        progression:
          "After she jumps out on cue, stay put beside the car and build a calm loose-leash wait from 1 to 10 seconds before walking off.",
      },
      4: {
        practiceTargets: [
          "Wait 10 seconds for an invitation to jump in, then close the car door.",
          "Reopen the door and wait 30 seconds for an invitation to jump out.",
          "Complete the full chain: 10s wait in, 30s wait out, and 10s loose-leash wait to walk around the car.",
        ],
        progression:
          "Chain all three parts together: 10 seconds to enter, close and reopen door, 30 seconds to exit, and 10 seconds loose leash around the car.",
        targetAdvancement: "source",
      },
      5: {
        progression:
          "Repeat the entire car-door wait chain in a different vehicle or through a hatchback or sliding door.",
      },
    },
  },
  "level-3/lazy-leash": {
    conditions:
      "Keep the leash snap hanging straight down throughout every Step; halt or reset immediately if the leash tightens.",
    progression:
      "Master calm threshold exits first, then walk toward a focal point, add turns near dogs and people, and finally add personal distractions.",
    readiness:
      "Does the leash snap stay hanging down with zero tension across the entire distance, turn, and distraction setup?",
    restart:
      "Stop moving forward on any tension, reset behind the threshold or further from distractions, and earn slack before resuming.",
    setup:
      "Attach a 6-foot leash to her collar or harness, carry high-value treats, and choose a clear path near an outside door.",
    steps: {
      1: {
        practiceTargets: [
          "Wait at the outside door with the leash snap hanging down.",
          "Open the outside door and step across with the leash snap hanging down.",
          "Walk through the outside door while the leash stays loose.",
        ],
        progression:
          "Pair calm door manners with slack leash walking so the snap hangs straight down from inside to outside.",
        targetAdvancement: "app default",
      },
      2: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TEN,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Walk {value} outdoors toward a single focal point on a loose leash.",
          unit: "foot",
        },
        progression:
          "Pick one clear outdoor focal point and build loose-leash walking from 1 to 10 feet toward it.",
      },
      3: {
        practiceTargets: [
          "Walk 10 feet forward on a loose leash with dogs and people in the area.",
          "Walk 10 feet forward, turn, and walk 10 feet back with dogs and people in the area.",
        ],
        progression:
          "Walk 10 feet out, turn calmly, and walk 10 feet back with the snap hanging down while calm dogs and people are nearby.",
        targetAdvancement: "app default",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TWENTY,
          increment: FIVE,
          restartAt: FIVE,
          startAt: FIVE,
          targetTemplate:
            "Walk {value} forward and back with personal distractions on a loose leash.",
          unit: "foot",
        },
        progression:
          "Increase distance from 5 to 20 feet out and back in 5-foot rungs while personal distractions are present.",
      },
      5: {
        progression:
          "Work around her toughest personal distractions at whatever distance preserves a hanging snap, closing distance slowly.",
      },
    },
  },
  "level-3/sit": {
    conditions:
      "Alternate training days with Level 3 Down so distant position changes stay crisp and do not blur with out-of-sight stays.",
    progression:
      "Teach the sit-from-down transition beside you first, then move to 2 feet and 5 feet, add down-from-sit at 5 feet, and apply in daily life.",
    readiness:
      "Does your Dog shift cleanly into position from the specified distance without creeping forward toward you?",
    restart:
      "Step closer until she tucks cleanly in place without sliding forward, then rebuild distance in small steps.",
    setup:
      "Work on a non-slip surface with treats and a clicker ready, keeping rewards delivered back at her position so she does not creep.",
    steps: {
      1: {
        progression:
          "Ask for Sit while she is in a down right in front of you; mark and reward her for folding back into a clean sit.",
      },
      2: {
        practiceTargets: [
          "Cue Sit from a down 1 foot away without creeping forward.",
          "Cue Sit from a down 2 feet away without creeping forward.",
        ],
        progression:
          "Step 1 then 2 feet back while she stays down, cue Sit, and reward in place so she does not crawl toward you.",
        targetAdvancement: "app default",
      },
      3: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Cue Sit from a down {value} away.",
          unit: "foot",
        },
        progression:
          "Ladder sit-from-down distance 1 foot at a time from 1 foot up to 5 feet without forward creeping.",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Cue Down from a sit {value} away.",
          unit: "foot",
        },
        progression:
          "Reverse the transition: ladder down-from-sit 1 foot at a time up to 5 feet away.",
      },
      5: {
        progression:
          "Apply Sit across everyday routines—at curbs, doorways, meals, and greeting pauses—on a single calm cue.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_THREE_CONTROL };
