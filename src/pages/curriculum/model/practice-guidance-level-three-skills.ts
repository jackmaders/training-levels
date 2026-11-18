import type { BehaviorRule } from "./practice-guidance.types";

const FIVE_SECONDS = 5;

const PRACTICE_GUIDANCE_LEVEL_THREE_SKILLS: Readonly<Record<string, BehaviorRule>> = {
  "level-3/communication": {
    conditions:
      "Keep paw contacts gentle and wait briefly so your Dog initiates the communication signal rather than guessing frantically.",
    progression:
      "Shape palm paw touches (Punch It), transfer to a hanging bell (Ring The Bell), then build unprompted potty ringing and meal/toy paw lifts.",
    readiness:
      "Does your Dog offer the clear communication signal cleanly on cue or unprompted in the context named by this Step?",
    restart:
      "Return to an easier prompt or reward position and reinforce one calm, deliberate paw motion before raising criteria.",
    setup:
      "Have small treats, a clicker, and a safe hanging bell positioned at paw height by the door when working Steps 2-3.",
    steps: {
      1: {
        progression:
          "Present a flat palm (Punch It once consistent) and click deliberate gentle paw touches to your hand.",
      },
      2: {
        progression:
          "Hold the bell in your palm with Punch It, transfer onto the hanging door bell, and put Ring The Bell on cue.",
      },
      3: {
        progression:
          "Cue Ring The Bell before every outside trip, then pause quietly by the door until she rings unprompted to ask out.",
      },
      4: {
        progression:
          "Shape a crisp right front paw lift off the floor without touching your hand, rewarding steady balanced lifts.",
      },
      5: {
        progression:
          "Pause briefly before offering dinner or a favorite toy so she initiates the right paw lift to ask politely.",
      },
    },
  },
  "level-3/handling": {
    conditions:
      "Use a low, stable, non-slip table and require true Settle relaxation; stop handling immediately if she tenses or pulls away.",
    progression:
      "Establish 1 minute of relaxed settling on the table first, then introduce brief stranger touch, sustained calm touch, full-body checks, and vet mock exams.",
    readiness:
      "Does your Dog remain relaxed on the table while experiencing the exact touch, body part, or examiner named by this Step?",
    restart:
      "Ask the helper to step back, return to calm Settle alone on the table, and reintroduce touch more softly.",
    setup:
      "Set a sturdy low table with a non-slip mat, treats, a clicker, and brief helpers before adding mock exam handling.",
    steps: {
      1: {
        practiceTargets: [
          "Settle calmly on the low non-slip table for 15 seconds.",
          "Settle calmly on the low non-slip table for 30 seconds.",
          "Settle calmly on the low non-slip table for 1 minute.",
        ],
        progression:
          "Cue Settle on the low non-slip table and build calm, soft relaxation from 15 seconds up to 1 minute.",
        targetAdvancement: "app default",
      },
      2: {
        progression:
          "Have a stranger gently brush her shoulder once with the back of their fingers, then mark and treat.",
      },
      3: {
        progression:
          "Keep her in a relaxed Settle as a stranger walks up and touches her side; pause if she stiffens.",
      },
      4: {
        progression:
          "While she stays relaxed on the table, have a stranger calmly touch her shoulder, head, tail, and feet one area at a time.",
      },
      5: {
        progression:
          "Practice calm Settled handling in a vet exam room with a vet or vet tech conducting a gentle mock exam.",
      },
    },
  },
  "level-3/retrieve": {
    conditions:
      "Mark calm holds with Yes (never tug), and keep objects safe and comfortable for her mouth size.",
    progression:
      "Reward taking three separate objects first, build shared holds with Get It, transfer to solo holds with Thank You, then add movement and new contexts.",
    readiness:
      "Does your Dog willingly take, hold, or release the object cleanly under the exact duration and cue conditions of this Step?",
    restart:
      "Shorten hold time by a step or return to shared holds if she drops early, chews hard, or hesitates to reach.",
    setup:
      "Prepare a spoon, a pen or pencil, and a third safe household object alongside high-value treats.",
    steps: {
      1: {
        practiceTargets: [
          "Put her mouth calmly around the pen or pencil on Yes.",
          "Put her mouth calmly around the spoon on Yes.",
          "Put her mouth calmly around a third safe object on Yes without tugging.",
        ],
        progression:
          "Present a pen, spoon, and third safe object one at a time, marking calm mouth placement with Yes.",
        targetAdvancement: "source",
      },
      2: {
        practiceTargets: [
          "Complete 2 to 3 calm shared grabs on Get It without tugging.",
          "Hold the object together for 1 second, then 2 seconds on Get It.",
          "Hold the object together for 3 seconds, then 4 seconds on Get It.",
          "Hold the object together for 5 seconds on Get It.",
        ],
        progression:
          "Run 2 to 3 rapid shared grabs to shorten releases, then add Get It and build shared hold time from 1 to 5 seconds.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargets: [
          "Hold the object together for 15 seconds without letting go.",
          "Hold together 5 seconds, lift a finger for 1/4 second, then hold together 5 seconds.",
          "Hold together 5 seconds, solo hold 1 to 4 seconds with Thank You, then hold together 5 seconds.",
          "Hold together 5 seconds, solo hold 5 seconds with Thank You, then hold together 5 seconds.",
        ],
        progression:
          "Reach a 15-second shared hold, lift a finger for 1/4 second in the middle, then fade hands up to 5 seconds solo with Thank You.",
        targetAdvancement: "source",
      },
      4: {
        progression:
          "Place the object to her right so she turns clockwise to take it from your hand, then step back smoothly as she reaches.",
      },
      5: {
        progression:
          "Generalize calm pickups and holds across more household objects, rooms, and outdoor spaces.",
      },
    },
  },
  "level-3/target": {
    conditions:
      "Use Paws Up on stable, non-slip horizontal and vertical surfaces that will not slide or tip under her weight.",
    progression:
      "Build comfortable front-paw footing on a stool, add 5-second holds on a smaller stool, transfer to vertical targets, then generalize to life.",
    readiness:
      "Does your Dog place and keep both front paws squarely on the target surface for the full duration of this Step?",
    restart:
      "Use a lower or wider target or shorten the count to 1 second if she hops down early or hesitates.",
    setup:
      "Prepare a sturdy low stool, a taller narrow stool, and a safe vertical wall mat or door target with treats ready.",
    steps: {
      1: {
        progression:
          "Mark front paws stepping squarely onto a stable horizontal stool or platform and release calmly.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE_SECONDS,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold front paws up on a small horizontal stool for {value}.",
          unit: "second",
        },
        progression:
          "Switch to a taller, narrower horizontal stool and ladder calm front-paw holds from 1 second up to 5 seconds.",
      },
      3: {
        progression:
          "Cue Paws Up close to a stable vertical target (door or wall pad) and mark balanced vertical paw contact.",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE_SECONDS,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold front paws up on a vertical surface for {value}.",
          unit: "second",
        },
        progression:
          "Build vertical Paws Up duration from 1 second up to 5 seconds without scratching or jumping off early.",
      },
      5: {
        progression:
          "Practice Paws Up on safe real-life objects such as park benches, boulders, trees, and low walls.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_THREE_SKILLS };
