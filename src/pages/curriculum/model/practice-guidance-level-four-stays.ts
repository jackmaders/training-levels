import type { BehaviorRule } from "./practice-guidance.types";

const FIVE = 5;
const TEN = 10;
const FIFTEEN = 15;
const TWO = 2;
const THREE = 3;

const PRACTICE_GUIDANCE_LEVEL_FOUR_STAYS: Readonly<Record<string, BehaviorRule>> = {
  "level-4/crate": {
    conditions:
      "Complete Level 2-3 Crate and Level 3 Down and Jump; work alongside Level 4 Go To Mat, Zen, and Relax, valuing quiet calm over a rigid down.",
    progression:
      "Keep leaving and returning calm, click inside the crate and after opening the door so she never bolts, and proof distractions separately from time.",
    readiness:
      "Does your Dog stay calm and quiet in the crate for the full target duration and distractions, waiting calmly until released when the door opens?",
    restart:
      "Chute back to a shorter duration she handles calmly—even brief exits or 1-minute closed-door holds—and split chores or triggers into smaller pieces.",
    setup:
      "Place a crate near a doorway, prepare high-value treats, a timer, two specific distractions, and quiet chores.",
    steps: {
      1: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate:
            "Enter crate and remain calm for {value} while you step momentarily out of sight.",
          unit: "minute",
        },
        progression:
          "Build from 3-minute L3 holds by stepping out the door and straight back in, clicking both out of sight and inside the room on your way to 5 minutes.",
      },
      2: {
        practiceTargets: [
          "Close the crate door and wait 10 seconds calmly before opening and clicking.",
          "Close the crate door and wait 30 seconds calmly before opening and clicking.",
          "Close the door and step 5 feet away for 1 minute while she remains calm.",
          "Close the door and step 10 feet away for 2 minutes while she remains calm.",
          "Close the door and step 10 feet away for 3 minutes while she remains calm.",
          "Close the door and remain calm for 5 minutes as you go in and out of sight 3 times.",
        ],
        progression:
          "Retrain briefly with the closed door from 10 and 30 seconds through 1-to-3-minute distance checks, then ladder to 5 minutes with three calm out-of-sight passes.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TEN,
          restartAt: 1,
          startAt: 1,
          targetTemplate:
            "Close the crate door and stay out of sight for {value} with 2 distractions.",
          unit: "minute",
        },
        progression:
          "Work both chosen distractions separately at short durations before combining them with out-of-sight holds up to 10 minutes (using 30-second boosts if sticky around 8.5 minutes).",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIFTEEN,
          restartAt: TEN,
          startAt: TEN,
          targetTemplate:
            "Close the crate door and stay out of sight for {value} with 2 different distractions.",
          unit: "minute",
        },
        progression:
          "Extend from 10 to 15 minutes using two new distractions; vary clicks when approaching, touching, and opening the door so reunions never trigger fussing.",
        restart:
          "If two new distractions cause whining or bouncing, drop back under 10 minutes—or separate the distractions from duration—and keep arrivals matter-of-fact.",
      },
      5: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: FIVE,
          restartAt: 1,
          startAt: 1,
          targetTemplate:
            "In a strange location, stay calm in the closed crate for {value} while you do chores.",
          unit: "minute",
        },
        progression:
          "Warm up in the new location by rewarding single chore pieces (opening an exit door, fetching one item) before chaining 1-to-5-minute hands-off chores.",
      },
    },
  },
  "level-4/go-to-mat": {
    conditions:
      "Complete Level 2-3 Go To Mat, Crate, and Relax, plus Level 1-4 Zen; maintain every link in the chain (locate, go, step on, lie down, stay).",
    progression:
      "Generalize from familiar mats to odd household objects, worn personal items, seated chatting, and active chores, introducing one variable at a time.",
    readiness:
      "Does your Dog go cleanly to the target object at distance and stay down calmly for the full duration without treats or handler hovering?",
    restart:
      "Isolate whichever link failed: step closer, place a strange object atop or beside a familiar mat, refresh praise-only payoffs, or chute duration back.",
    setup:
      "Gather two non-mat objects (such as a shopping bag, magazine, or cereal box), a well-worn personal item (jacket, sock, or shoe), a mat, treats, and a timer.",
    steps: {
      1: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: TWO,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Send her {value} to lie down on a common object that is not a mat.",
          unit: "foot",
        },
        progression:
          "Keep distance tiny so she can focus on treating a non-mat object (bag, dishcloth, tissue, or Post-It) as her parking spot.",
      },
      2: {
        practiceTargets: [
          "From 2 feet away, go to a new non-mat object and lie down for 30 seconds.",
          "From 5 feet away, go to the new non-mat object and lie down for 1 minute while fading treats.",
          "From 5 feet away with no treats, go to the new non-mat object and lie down for 2 minutes.",
        ],
        progression:
          "Teach the strange surface, 5-foot distance, and treat-fading schedule (mixing five treated reps with praise-only reps) separately before combining for 2 minutes.",
        targetAdvancement: "app default",
      },
      3: {
        practiceTargets: [
          "Send 5 feet to a worn personal item and stay down for 1 minute while you sit.",
          "Send 15 feet to the personal item and stay down for 2 minutes during brief seated chatting.",
          "Send 15 feet to the personal item and stay down for 5 minutes while seated and talking.",
          "Send 15 feet to the personal item and stay down for 10 minutes while you sit and talk.",
        ],
        progression:
          "Use an item carrying your scent for several days, generalize training while seated, then ladder greetings and phone or helper conversations out to 10 minutes.",
        targetAdvancement: "app default",
      },
      4: {
        practiceTargets: [
          "Go 10 feet to a mat and stay down for 5 minutes while you do light chores.",
          "Go 10 feet to a mat and stay down for 6 minutes while you do chores.",
          "Go 10 feet to a mat and stay down for 8 minutes while you do chores.",
          "Go 10 feet to a mat and stay down for 10 minutes while you do chores.",
          "Go 10 feet to a mat and stay down for 13 minutes while you do chores.",
          "Go 10 feet to a mat and stay down for 17 minutes while you do chores.",
          "Go 10 feet to a mat and stay down for 20 minutes while you do chores.",
        ],
        progression:
          "Start with calm chores like folding tea towels at 10 feet before noisier sweeping or laundry, building steadily to a 20-minute chore hold.",
        restart:
          "If she breaks late (such as 17 minutes), chute back to 5 minutes and climb through 6, 8, 10, 13, and 17—or drop to 2-minute increments if she breaks twice.",
        targetAdvancement: "source",
      },
      5: {
        progression:
          "Combine Level 3 doorbell-to-mat sends with Step 3 chatting holds while a helper rings, enters, sits for a snack and conversation, and says goodbye.",
        restart:
          "Rehearse the doorbell cue and seated visitor holds separately with short visits before chaining arrival, snack, chat, and departure.",
      },
    },
  },
  "level-4/relax": {
    conditions:
      "Complete Level 2-3 Relax, Down, and Zen plus Level 2-4 Lazy Leash; never force a down—true relaxation requires loose muscles and staying In The Game.",
    progression:
      "Prove a loose Lazy Leash near her hardest distraction first, ask calmly for Down, then click soft eyes, dropped chin, and relaxed breathing on Settle.",
    readiness:
      "Does your Dog keep loose muscles and soft breathing in sight of her hardest distraction or inside the tough new environment?",
    restart:
      "Step behind visual cover or increase distance until she offers a genuine relaxed Lazy Leash again, then rebuild Down and short Settle holds.",
    setup:
      "Use a flat leash, high-value treats, a chair or park bench for timed sits, and two challenging real-world distractions.",
    steps: {
      1: {
        progression:
          "Start far enough back—or step briefly in and out of visual cover—and adjust distance, distraction intensity, and exposure time until she holds a calm Lazy Leash for 1 to 2 minutes.",
      },
      2: {
        progression:
          "Warm up Down out of sight first, walk casually on a Lazy Leash near the distraction, and quietly cue Down once (helping with a gentle lure if needed, never nagging).",
        restart:
          "If she cannot down calmly without staring or trembling, move farther away and verify a true relaxed Lazy Leash in Step 1 before trying Down again.",
      },
      3: {
        practiceTargets: [
          "Settle with loose muscles for 15 seconds in sight of her worst distraction.",
          "Settle with loose muscles for 30 seconds in sight of her worst distraction.",
          "Settle with loose muscles for 45 seconds in sight of her worst distraction.",
          "Settle with loose muscles for 1 minute in sight of her worst distraction.",
        ],
        progression:
          "Sit comfortably farther back than Step 2, ask for Down then Settle, click every softened muscle or dropped chin, and walk away calmly on a loose leash afterward.",
        targetAdvancement: "app default",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: THREE,
          restartAt: 1,
          startAt: 1,
          targetTemplate:
            "Settle with loose muscles for {value} in sight of her worst distraction.",
          unit: "minute",
        },
        progression:
          "Extend Settle from 1 to 3 minutes while watching for relaxed posture; if she dozes off, wake her gently with a treat right at her nose.",
      },
      5: {
        progression:
          "Pick a tough new location (pet store bird aisle, outdoor cafe, or active yard), establish threshold distance with Lazy Leash, and build relaxed settles there.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_FOUR_STAYS };
