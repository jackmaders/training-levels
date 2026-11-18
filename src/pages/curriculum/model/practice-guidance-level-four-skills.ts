import type { BehaviorRule } from "./practice-guidance.types";

const TWO = 2;
const FIVE = 5;
const TEN = 10;
const FIFTEEN = 15;

const PRACTICE_GUIDANCE_LEVEL_FOUR_SKILLS: Readonly<Record<string, BehaviorRule>> = {
  "level-4/distance": {
    conditions:
      "Complete Level 1 Come, Level 3 Handling, and Level 4 Go To Mat, Crate, and Target; stop repeating Go'Round on a miss and rebuild close up without pressure.",
    progression:
      "Proof Go'Round around standing and seated helpers, fade visible treats, build seated-person sends from 5 to 15 feet, then generalize to large and brand-new objects.",
    readiness:
      "Does your Dog circle the helper or object cleanly from the full distance on a single Go'Round cue without treats in sight?",
    restart:
      "Chute closer after a single miss so confidence stays high, check that the helper stays neutral, and rebuild distance one small step at a time.",
    setup:
      "Use basic equipment, a neutral helper, a chair, several large objects (car, bush, tent, or grouped chairs), and unfamiliar props.",
    steps: {
      1: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Send her {value} away to go around a standing person.",
          unit: "foot",
        },
        progression:
          "Have your helper keep arms still and eyes away from the Dog; drop the cue and lure or shape close up if she hesitates before restoring Go'Round out to 5 feet.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate:
            "Send her {value} away to go around a seated person with no visible treats.",
          unit: "foot",
        },
        progression:
          "Warm up on the empty chair, start her looping behind the seated helper's back if the lap tempts her, and fade visible treats out to 5 feet.",
      },
      3: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIFTEEN,
          increment: TWO,
          restartAt: FIVE,
          startAt: FIVE,
          targetTemplate: "Send her {value} away to go around a seated person.",
          unit: "foot",
        },
        progression:
          "Alternate distance sessions with Level 4 Go To Mat Step 3 and advance carefully from 5 to 15 feet, moving closer immediately after any single miss.",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Send her {value} away to go around a large object.",
          unit: "foot",
        },
        progression:
          "Grow object size gradually (such as chair cluster or unfolded tent), click partway around and toss a treat ahead when out of view behind it, then return to 5 feet.",
      },
      5: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Send her {value} away to go around a totally new object.",
          unit: "foot",
        },
        progression:
          "Generalize Go'Round from 5 feet on unfamiliar props (such as park trash cans or street fixtures) until any pointed object works reliably.",
      },
    },
  },
  "level-4/retrieve": {
    conditions:
      "Complete Level 1-2 Target and Level 3 Retrieve; keep practicing Level 3 Retrieve Step 4 during Steps 1-3, and never grab an object before cueing Thank You.",
    progression:
      "Move the three articles onto the floor in rapid shaping stages—approach, open mouth, lift, then full retrieve chain—before finishing with the hot-dog trick.",
    readiness:
      "Does your Dog complete the target behavior across all three articles (wood, metal, and cloth) willingly without dropping early or chewing?",
    restart:
      "If any link in the retrieve chain breaks, isolate it separately (such as Level 3 Step 4 from hand or lifting off a low stool) before reconnecting the chain.",
    setup:
      "Bring high-value treats, a clicker, three retrieve articles (wooden mixing spoon, metal object, and cloth or plastic item), plus a wrapped frozen wiener for Step 5.",
    steps: {
      1: {
        practiceTargets: [
          "Shape her to go to the wooden mixing spoon 3 to 4 feet away without picking it up yet.",
          "Shape her to find and approach the metal article anywhere in the room.",
          "Shape her to find and approach the cloth article as well (all 3 articles).",
        ],
        progression:
          "Shape steps toward the spoon quickly without cueing yet, move on to Step 2 as soon as she approaches eagerly, and generalize across all three articles.",
        targetAdvancement: "source",
      },
      2: {
        practiceTargets: [
          "Send her to the wooden spoon and click only when she opens her mouth over it.",
          "Click when she opens her mouth over the metal article on the floor.",
          "Click when she opens her mouth over the cloth article on the floor (all 3 articles).",
        ],
        progression:
          "Wait at the spoon without clicking until she tries opening her mouth over it, then repeat swiftly across the metal and cloth articles.",
        restart:
          "If she stalls on opening her mouth, refresh Level 3 Retrieve Step 4 from your hand before sending her back to the floor article.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargets: [
          "Wait for her mouth to close on the wooden spoon and lift it off the floor (or a low stool first).",
          "Click as she lifts the metal article off the floor.",
          "Click as she lifts the cloth article off the floor (all 3 articles).",
        ],
        progression:
          "Start with the curved mixing spoon before flush items, wait until she lifts an inch off the ground, and pay generously even if she drops at the click.",
        restart:
          "If picking flush items off the floor stalls, place the article on a low stool alternating with your hand, then return it to the floor.",
        targetAdvancement: "source",
      },
      4: {
        practiceTargets: [
          "Cue Get It for the wooden spoon, hold together briefly, and release on Thank You.",
          "Complete the full Get It to Thank You retrieve chain with the metal article.",
          "Complete the full Get It to Thank You retrieve chain with the cloth article (all 3 articles).",
        ],
        progression:
          "Chain stay, Get It, pickup, return, calm shared hold, and Thank You—backing up to speed returns or gently tapping the spoon to proof grip.",
        restart:
          "If she spits the object early, stand still looking at the dropped item without picking it up (or end the short round) and drill holding from hand separately.",
        targetAdvancement: "source",
      },
      5: {
        progression:
          "Work Hand Zen then Hand Target onto a frozen wrapped hot dog inside a sandwich bag, gradually removing bag and wrapper as it thaws without grabbing.",
      },
    },
  },
  "level-4/target": {
    conditions:
      "Complete Level 1 Target and Level 3 Target; switch to your left-arm send signal with the Dog on your left and require both front paw pads to hit cleanly.",
    progression:
      "Add sending distance from 2 to 10 feet across new vertical surfaces, narrow down to trees and posts, then build 10-foot sends with Look and Go.",
    readiness:
      "Does your Dog run straight from the target distance to plant both front paws on the vertical surface—or bolt straight out on Look then Go?",
    restart:
      "Move closer immediately if she misses, drifts sideways, or stops short, refresh close right-hand prompts if needed, and rebuild inches at a time.",
    setup:
      "Gather high-value treats, a clicker, varied wide and narrow vertical targets (walls, trees, posts), and a favorite ball or small mat for Step 5.",
    steps: {
      1: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TWO,
          restartAt: 1,
          startAt: 1,
          targetTemplate:
            "Point with your left arm and cue Paws Up from {value} to hit a vertical surface with both front paws.",
          unit: "foot",
        },
        progression:
          "Fade right-hand pulling into a left-arm send, feed with your right hand behind you to reset her on your left, and back up slightly while she runs in.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: TWO,
          startAt: TWO,
          targetTemplate:
            "Send her {value} with your left arm and Paws Up to hit a new vertical surface.",
          unit: "foot",
        },
        progression:
          "Restart close on the second vertical wall using your right hand briefly if needed, then step backward inches per rep while she travels out to 5 feet.",
      },
      3: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TEN,
          restartAt: FIVE,
          startAt: FIVE,
          targetTemplate:
            "Send her {value} straight to hit another new vertical surface with both front paws.",
          unit: "foot",
        },
        progression:
          "Keep shoulders, face, and toes aimed directly at the new wall and step back slightly per repetition out to 10 feet without sacrificing speed or clean hits.",
      },
      4: {
        progression:
          "Work single obstacles first so she does not guess benches, starting with a wide tree trunk and progressively choosing thinner saplings and signposts.",
        restart:
          "If she guesses nearby objects or freezes at a skinny post, step closer to a wider tree with no competing obstacles and rebuild narrow precision gradually.",
      },
      5: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TEN,
          increment: TWO,
          restartAt: TWO,
          startAt: TWO,
          targetTemplate:
            "Pause after Look, cue Go, and click while she runs {value} straight away from you.",
          unit: "foot",
        },
        progression:
          "Shape 1 step, 2 steps, and 3 steps forward before throwing the ball or sending to a small mat, adding a clear pause between Look and Go (or Hike).",
        restart:
          "Never click if she glances back at you, and call her back for a calm reset if she breaks on Look before you give the Go cue.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_FOUR_SKILLS };
