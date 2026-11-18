import type { BehaviorRule } from "./practice-guidance.types";

const TWO_FEET = 2;
const FIVE = 5;
const TEN = 10;
const FIFTEEN = 15;
const TWENTY = 20;
const FORTY = 40;
const SIXTY = 60;

const PRACTICE_GUIDANCE_LEVEL_THREE_FOUNDATIONS: Readonly<Record<string, BehaviorRule>> = {
  "level-3/come": {
    conditions:
      "Complete Comebefores first (Level 1-2 Come, Level 1-3 Zen, and Level 2 Lazy Leash and Focus). Use a long line where unsafe; drop the Come cue if she jumps up.",
    progression:
      "Add distance and distractions one step at a time while building reliable check-ins; keep distractions mild enough for joyful recalls.",
    readiness:
      "Does your Dog come promptly at the stated distance past the Step's distractions without needing repeated calls?",
    restart:
      "Move closer to your Dog or further from the distraction, lower distraction intensity, and rebuild enthusiasm before repeating the distance.",
    setup:
      "Use high-value treats, a clicker, and a long line away from traffic. Arrange helpers, dogs, or distractions before calling.",
    steps: {
      1: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: TWO_FEET,
          startAt: TWO_FEET,
          targetTemplate: "Call her {value} away with mild distractions.",
          unit: "foot",
        },
        progression:
          "Play the Come Game at short distance with easy distractions, stepping back only while she comes eagerly and dropping Come if she jumps.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TWENTY,
          increment: FIVE,
          restartAt: FIVE,
          startAt: FIVE,
          targetTemplate: "Call her {value} through or away from dogs and people.",
          unit: "foot",
        },
        progression:
          "Call her from 5 to 20 feet near calm people and dogs on a long line, rewarding check-ins and snappy turns back to you.",
      },
      3: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FORTY,
          increment: FIVE,
          restartAt: TWENTY,
          startAt: TWENTY,
          targetTemplate: "Call her {value} through or away from distractions.",
          unit: "foot",
        },
        progression:
          "Extend distance from 20 to 40 feet in 5-foot rungs past real distractions; reward promptly when she disengages and runs in.",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: SIXTY,
          increment: FIVE,
          restartAt: FORTY,
          startAt: FORTY,
          targetTemplate:
            "Call her {value} through or away from dogs and people, rewarding check-ins.",
          unit: "foot",
        },
        progression:
          "Build from 40 to 60 feet in 5-foot rungs around dogs and people, clicking voluntary check-ins as well as fast recalls.",
      },
      5: {
        progression:
          "Practice on a long line around her personal nightmare distractions, starting at an easy distance and clicking early turns toward you.",
      },
    },
  },
  "level-3/focus": {
    conditions:
      "Work default eye contact first and add Watch only after she holds focus cleanly; stay below her distraction threshold.",
    progression:
      "Build steady eye contact duration before adding distance or turning your gaze away, using the source's second-by-second counts.",
    readiness:
      "Does your Dog hold steady eye contact for the full duration under the exact distance and handler-gaze conditions of this Step?",
    restart:
      "Shorten the count, move closer, or lower environmental distractions until she offers relaxed, steady eye contact again.",
    setup:
      "Keep small high-value treats and a clicker ready. Use a mirror or window reflection when Step 4 calls for checking gaze without looking directly.",
    steps: {
      1: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: FIFTEEN,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold eye contact for {value}.",
          unit: "second",
        },
        progression:
          "Ladder eye contact from 1 second up to 15 seconds while standing nearby before adding distance.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold eye contact for {value} from 2 feet away.",
          unit: "second",
        },
        progression:
          "Step 2 feet away and rebuild steady eye contact up to 5 seconds using the Watch cue or default focus.",
      },
      3: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TEN,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold eye contact for {value} from 5 feet away.",
          unit: "second",
        },
        progression:
          "Move 5 feet away and build steady focus from 1 to 10 seconds before moving your gaze.",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TEN,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold eye contact for {value} while you look away.",
          unit: "second",
        },
        progression:
          "Use a mirror or window reflection to verify she holds eye contact while you look away, then fade the reflection until you rely on timing.",
      },
      5: {
        progression:
          "Use Focus to verify she is In The Game in distracting places; if she cannot glance at you, move somewhere quieter or use a sheet-draped pen.",
      },
    },
  },
  "level-3/zen": {
    conditions:
      "Work default waiting first and add Leave It only after the default pause works. Practice inside-to-outside on a long line or inside an exercise pen without blocking the door.",
    progression:
      "Open the door only as wide and as long as she waits calmly without body blocking, then add carrying items and calm greetings.",
    readiness:
      "Does your Dog wait without crossing the threshold until invited for the complete time and distraction conditions of this Step?",
    restart:
      "Close the door smoothly if she moves forward; reopen a narrower gap or shorten the wait before widening again.",
    setup:
      "Use a safe door with a long line or x-pen, high-value treats, and a clicker. Keep the door easy to close cleanly without catching paws.",
    steps: {
      1: {
        practiceTargets: [
          "Crack the door 1/4 inch without blocking; click if she stays back, then invite her through.",
          "Open the door 1 inch, 2 inches, then 3 inches without blocking while she waits for your invitation.",
          "Open the door fully without blocking; she waits until invited through.",
        ],
        progression:
          "Begin at 1/4 inch, then 1, 2, and 3 inches, and finally open wide without blocking her with your body; click waiting and invite her through.",
        targetAdvancement: "source",
      },
      2: {
        practiceTargets: [
          "Open the door 1 inch and wait up to 15 seconds with no cue while she stays back.",
          "Open the door 6 inches and ladder from 1 second up to 15 seconds with no cue.",
          "Open the door fully and hold 30 seconds with no cue before inviting her through.",
        ],
        progression:
          "Keep silent with no cue: hold 1 inch to 15 seconds, then 6 inches across 1 to 15 seconds, then full open for 30 seconds.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargets: [
          "Wait 15 seconds while you carry empty bags through the open door.",
          "Wait 30 seconds while you carry light bags out and in through the open door.",
          "Wait 45 seconds while you carry items out and in through the open door.",
          "Wait 1 minute while you carry bags out and in through the open door.",
        ],
        progression:
          "Build up to 1 minute carrying bags and items in and out while she waits calmly inside without stepping over the threshold.",
        targetAdvancement: "app default",
      },
      4: {
        practiceTargets: [
          "Wait inside the open door for 15 seconds while you step out to face an uninterested person.",
          "Wait inside the open door for 30 seconds while you greet an uninterested person.",
          "Wait inside the open door for 45 seconds while you chat with an uninterested person.",
          "Wait inside the open door for 1 minute while you greet a person not interested in the dog.",
        ],
        progression:
          "Step out to greet a calm, uninterested helper while she waits inside the open door up to 1 minute before her invitation.",
        targetAdvancement: "app default",
      },
      5: {
        progression:
          "Practice real-life doors, deliveries, and excited visitors on a long line until waiting at open doors is automatic.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_THREE_FOUNDATIONS };
