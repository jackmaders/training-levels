import type { BehaviorRule } from "./practice-guidance.types";

const PRACTICE_GUIDANCE_LEVEL_TWO_STAYS: Readonly<Record<string, BehaviorRule>> = {
  "level-2/down": {
    conditions:
      "Practice the Step's down, duration, handler distance, and return sequence; use a stable comfortable surface.",
    progression:
      "Build duration and handler movement separately before combining them where the source says to; count at the stated pace.",
    readiness:
      "Does your Dog remain down for the full time and handler movement specified by this Step?",
    restart:
      "Reduce time or distance separately to the last successful point; for combined criteria, rebuild each part before combining them.",
    setup:
      "Use treats, clicker, and a comfortable non-slip surface. Keep the Dog's reward delivery low and return to her before reinforcing distance work.",
    steps: {
      1: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: 10,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold the down for {value}.",
        },
        progression:
          "Start at 1 second and add a second after each success until the Dog can stay down for 10 seconds; keep handler distance unchanged.",
        restart: "After a break, make the count shorter and rebuild from 1 second.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: 60,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold the down for {value}.",
        },
        progression:
          "Continue the source's one-second ladder toward 60 seconds. The Dog may first need 10 rapid-fire down/reward repetitions before the 1-second hold; restart at 1 second after a repeated break.",
        restart:
          "After a click-related rise, resume from the count already achieved if it is occasional; if the Dog keeps rising, restart at 1 second.",
      },
      3: {
        practiceTargets: [
          "Take a half step forward and return before clicking if the Dog stays down.",
          "Take one whole step forward and return before clicking if the Dog stays down.",
          "Walk 2 feet away and return before clicking if the Dog stays down.",
          "Walk 3 feet away and return before clicking if the Dog stays down.",
          "Continue adding a small amount of distance toward 10 feet, returning before clicking.",
          "Walk 10 feet away, turn, and return before clicking if the Dog stays down.",
        ],
        progression:
          "Combine the 1-minute hold with walking 10 feet away, turning, and returning. If the return breaks the stay, first reward tiny return movements, then rebuild the walk out from 2 feet toward 10 feet.",
        restart:
          "After a miss at a new distance, return to an easier distance. For a duration miss near 15 seconds, the source allows one restart at 5 seconds; if that also fails, restart at 1 second.",
        targetAdvancement: "source",
      },
      4: {
        practiceTargets: [
          "At 3 feet away, hold the down for 1 second.",
          "At 3 feet away, increase the down hold one second at a time toward 20 seconds.",
          "Walk 5 feet away and return while the Dog remains down.",
          "Walk 10 feet away and return while the Dog remains down.",
          "Walk 12 feet away and return while the Dog remains down.",
          "Walk 15 feet away and return while the Dog remains down.",
          "Walk 17 feet away and return while the Dog remains down.",
          "Walk 20 feet away and return while the Dog remains down.",
          "Combine the source's 20-foot walk with a 1-minute down stay, alternating time and distance increases.",
        ],
        progression:
          "Transfer the 1-minute hold to distance: start 3 feet away and build time to 20 seconds, then increase distance in the source's 5, 10, 12, 15, 17, 20-foot examples. Combine 20 feet with the 1-minute hold by alternating distance and time increases.",
        restart:
          "After a miss on distance, restart at about half the failed distance (for example, 9 feet after a miss at 18 feet). Reduce time or distance separately when recombining them.",
        targetAdvancement: "source",
      },
      5: {
        progression:
          "Practice default cues and reduce clicks only when the behavior is stable; observe the Dog rather than imposing a fixed success percentage.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_TWO_STAYS };
