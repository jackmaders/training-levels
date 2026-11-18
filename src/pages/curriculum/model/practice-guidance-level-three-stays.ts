import type { BehaviorRule } from "./practice-guidance.types";

const THREE_MINUTES = 3;
const FIVE = 5;
const TEN = 10;
const THIRTY = 30;

const PRACTICE_GUIDANCE_LEVEL_THREE_STAYS: Readonly<Record<string, BehaviorRule>> = {
  "level-3/crate": {
    conditions:
      "Use your chosen cue (Get In, Kennel Up, Go To Mat, or Hit The Rack) and keep the door open during distance and duration ladders until Step 5.",
    progression:
      "Build distance and duration separately before mixing them; advance only while she stays settled in the crate until returned to and released.",
    readiness:
      "Does your Dog enter, lie down, and remain calmly in the crate for the full distance, time, and context of this Step?",
    restart:
      "Cut back on distance, duration, or both to the last easy rung after any break or restlessness.",
    setup:
      "Use a comfortable crate with bedding, treats, and a clicker. Return to the crate before reinforcing or releasing.",
    steps: {
      1: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "She enters, downs, and you walk {value} away and return.",
          unit: "foot",
        },
        progression:
          "Cue her into the crate for a down, then take 1 to 5 steps (about 1 to 5 feet) away and return before clicking.",
      },
      2: {
        practiceTargets: [
          "Enter and down; go 2 feet away for 15 seconds and return.",
          "Enter and down; go 3 feet away for 30 seconds and return.",
          "Enter and down; go 4 feet away for 45 seconds and return.",
          "Enter and down; go 5 feet away for 1 minute and return.",
        ],
        progression:
          "Climb the source's combined rungs: 2 feet/15 seconds, 3 feet/30 seconds, 4 feet/45 seconds, and 5 feet/1 minute.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargets: [
          "Enter and down; build distance separately from 5 feet to 10 feet and return.",
          "Enter and down at 5 feet away; build duration separately from 1 minute to 2 minutes.",
          "Mix rungs such as 8 feet for 90 seconds and 10 feet for 30 seconds.",
          "Enter and down; go 10 feet away for 2 minutes and return.",
        ],
        progression:
          "Ladder 5 to 10 feet and 1 to 2 minutes separately, then mix distance and time up to 10 feet for 2 minutes.",
        targetAdvancement: "source",
      },
      4: {
        practiceTargets: [
          "Enter and down; go 10 feet away for 2 minutes and 30 seconds and return.",
          "Enter and down; go 10 feet away for 3 minutes and return.",
        ],
        progression:
          "Extend the 10-foot stay from 2 minutes up to 3 minutes while staying quiet and predictable.",
        targetAdvancement: "app default",
      },
      5: {
        progression:
          "Generalize calm crate stays to an unfamiliar crate, veterinary kennels, and a secured crate inside a moving car.",
      },
    },
  },
  "level-3/down": {
    conditions:
      "Cue Down and Stay where you can step cleanly out of sight around a corner or doorframe and return before rewarding.",
    progression:
      "Introduce brief visual disappearances before timing out-of-sight stays, then add mild distractions and longer hallway walks.",
    readiness:
      "Does your Dog hold the down stay calmly out of sight for the complete count and conditions of this Step?",
    restart:
      "Return to shorter disappearances or remove the distraction; rebuild from 1 second out of sight after repeated breaks.",
    setup:
      "Place a non-slip mat near an interior doorway or hallway corner with treats and a clicker ready.",
    steps: {
      1: {
        practiceTargets: [
          "Cue Down and Stay; step out of sight once and return.",
          "Step in and out of sight 2 times while she stays down.",
          "Step in and out of sight 3 times while she holds the down stay.",
        ],
        progression:
          "Step smoothly out of sight for an instant and reappear, building up to 3 consecutive disappearances in one stay.",
        targetAdvancement: "source",
      },
      2: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: TEN,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold the down stay while you go out of sight for {value} and return.",
          unit: "second",
        },
        progression:
          "Build out-of-sight time 1 second at a time from 1 second up to 10 seconds before returning to reward.",
      },
      3: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: THIRTY,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold the down stay while you go out of sight for {value} and return.",
          unit: "second",
        },
        progression:
          "Continue the 1-second out-of-sight ladder from 1 second up to 30 seconds; stay calm when returning.",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: THIRTY,
          increment: FIVE,
          restartAt: FIVE,
          startAt: FIVE,
          targetTemplate:
            "Hold the down stay out of sight for {value} with 1 distraction and return.",
          unit: "second",
        },
        progression:
          "Add one mild distraction (knock, dropped toy, or helper walking by) and ladder out-of-sight holds up to 30 seconds.",
      },
      5: {
        progression:
          "Walk down the hall to a real closet (such as the linen closet), pause briefly, and return while she stays down.",
      },
    },
  },
  "level-3/go-to-mat": {
    conditions:
      "Use Go To Mat on four new mats across Steps 1-4; note syllabus Steps 3-4 state 10 feet while prose mentions 5 feet.",
    progression:
      "Establish calm downs on each unfamiliar mat before increasing send distance, duration, or removing visible treats.",
    readiness:
      "Does your Dog go directly to the specified new mat and stay down for the full distance, time, and distraction conditions?",
    restart:
      "Move closer to the mat, shorten the down time, or reduce distractions before sending her from full distance again.",
    setup:
      "Prepare four distinct mats (including one raised bed or bench mat for Step 2) in calm rooms before adding distractions.",
    steps: {
      1: {
        practiceTargets: [
          "Go 2 feet to the first new mat and down on it for 15 seconds.",
          "Go 2 feet to the first new mat and down on it for 30 seconds.",
          "Go 2 feet to the first new mat and down on it for 1 minute.",
        ],
        progression:
          "Introduce the first new mat at 2 feet and build the down hold up to 1 minute.",
        targetAdvancement: "app default",
      },
      2: {
        practiceTargets: [
          "Go 5 feet to a raised mat off the ground and down on it for 30 seconds.",
          "Go 5 feet to the raised mat off the ground and down on it for 1 minute.",
          "Go 5 feet to the raised mat off the ground and down on it for 2 minutes.",
        ],
        progression:
          "Send her 5 feet to a second new mat elevated off the ground and extend the hold to 2 minutes.",
        targetAdvancement: "app default",
      },
      3: {
        practiceTargets: [
          "Go 5 to 10 feet to a third new mat for 30 seconds with one distraction.",
          "Go 10 feet to the third new mat and down on it for 1 minute with one distraction.",
        ],
        progression:
          "Send her to a third new mat (building to the syllabus 10 feet) and hold 1 minute with one distraction.",
        targetAdvancement: "app default",
      },
      4: {
        practiceTargets: [
          "Go 10 feet to a fourth new mat and down for 1 minute with treats out of sight.",
          "Go 10 feet to the fourth new mat and down for 2 minutes with no treats.",
          "Go 10 feet to the fourth new mat and down for 3 minutes with no treats.",
        ],
        progression:
          "Send her 10 feet to a fourth new mat without carrying treats and build duration to 3 minutes.",
        targetAdvancement: "app default",
      },
      5: {
        progression:
          "Pair the doorbell or knock with Go To Mat until the doorbell sound cues her to go directly to her mat.",
      },
    },
  },
  "level-3/relax": {
    conditions:
      "Require true floppy physical relaxation on cue (Settle), not a stiff stay; stop or reset on any tension.",
    progression:
      "Lengthen quiet settles before introducing playing dogs, a moving car, and calm grooming handling.",
    readiness:
      "Does your Dog settle into genuine floppy relaxation for the complete time and distraction context of this Step?",
    restart:
      "Chute back to an easier distance or shorter settle immediately if her muscles tighten or she stares intently.",
    setup:
      "Use a comfortable resting spot or mat with calm, low-key reinforcement that will not excite her out of relaxation.",
    steps: {
      1: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: THREE_MINUTES,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Settle and remain truly relaxed for {value}.",
          unit: "minute",
        },
        progression:
          "The source suggests 10-second increments starting from 1 minute; this app default ladders 1-minute rungs up to 3 minutes of floppy relaxation.",
      },
      2: {
        progression:
          "Cue Settle far enough from playing dogs that she drops into true relaxation; decrease distance gradually across sessions.",
      },
      3: {
        practiceTargets: [
          "Settle in sight of playing dogs for 1 minute without tension.",
          "Settle in sight of playing dogs for 2 minutes without tension.",
          "Settle for 3 minutes in sight of other dogs playing.",
        ],
        progression:
          "Hold true relaxation in sight of playing dogs up to 3 minutes; Chute immediately on any sign of tension.",
        restart: "Chute back to greater distance or a 1-minute settle on any tension.",
        targetAdvancement: "app default",
      },
      4: {
        progression:
          "Practice Settle safely restrained in a parked car first, then during calm short drives in a moving car.",
      },
      5: {
        progression:
          "Cue Settle and begin gentle grooming strokes; pause brushing at any stiffness and resume only when she softens again.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_THREE_STAYS };
