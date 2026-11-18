import type { BehaviorRule } from "./practice-guidance.types";

const PRACTICE_GUIDANCE_LEVEL_FOUR_ADVANCED: Readonly<Record<string, BehaviorRule>> = {
  "level-4/communication": {
    conditions:
      "Complete Level 1-4 Target, Jump, Distance, Retrieve, and Level 2 Focus; always cue the Dog's own Left and Right before the action cue so she waits for both words.",
    progression:
      "Establish Left and Right as directional modifiers on hand nose-targets and foot paw-targets, then send left/right to floor props, jumps, and spins.",
    readiness:
      "Does your Dog turn toward her own correct side on random Left and Right cues and wait to execute the paired action cue?",
    restart:
      "Withdraw hands or step closer to the correct side target on a miss, practice single-side turns calmly, and mix actions so she waits for the second cue.",
    setup:
      "Prepare treats, clicker, a helper sitting in a chair for Step 2, matching pairs of target props (such as boots), and two jumps.",
    steps: {
      1: {
        practiceTargets: [
          "Hold hands on both sides of her head during Watch and click random glances at slight hand motion.",
          "Say Left or Right just before moving that hand until she turns on the word alone.",
          "Cue Watch, then alternate random Left Touch and Right Touch hand targets cleanly.",
        ],
        progression:
          "Use random Left/Right sequencing so she listens instead of alternating mechanically, then practice again with her sitting facing away from you.",
        targetAdvancement: "source",
      },
      2: {
        practiceTargets: [
          "Transfer Punch It from your hand to whichever foot you present.",
          "With her lying between your feet, subtle-twitch each foot, click glances, and add Left/Right.",
          "Pair random Left Punch It and Right Punch It on your feet and between a seated helper's feet.",
        ],
        progression:
          "Let her lie down between your feet to see both sides clearly, verify random side repeats like Right twice then Left, and proof with a helper.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargets: [
          "Teach Punch It on one boot out to 5 feet away, then place two boots 10 feet apart facing one.",
          "Step back off the line so both boots stay visible and cue Left or Right while angled slightly.",
          "Move the boots closer together and cue Left (click look) then Punch It, and Right Punch It.",
        ],
        progression:
          "Start facing one boot with the other behind you, then move back so she must pick between two visible targets—expect your legs to make right turns slightly harder.",
        restart:
          "If she heads for the wrong boot, stop her calmly and step closer to the intended boot until she locks onto it cleanly.",
        targetAdvancement: "source",
      },
      4: {
        progression:
          "Refresh Level 2 Jump, then run the exact two-boot spatial progression with two jumps until Left Hup and Right Hup work near, far, and jumping toward you.",
        restart:
          "Remember Left and Right stay relative to the Dog even when jumping toward you; step closer to the target jump whenever she confuses directions.",
      },
      5: {
        progression:
          "Lure clockwise and counterclockwise spins without a pole, put Spin on cue in both directions, refresh hand/foot directions, then cue Left Spin and Right Spin.",
        restart:
          "If she spins prematurely on Left or Right alone, immediately mix in Left Hup or Right Punch It until she waits for the second cue.",
      },
    },
  },
  "level-4/handling": {
    conditions:
      "DO NOT USE A CLICKER (clicking stops elimination midstream); use a timed limited hold on lead, keep her gently moving, and confine her inside after misses.",
    progression:
      "Establish reliable on-lead elimination at home and away within a 1-minute hold, add Hurry Up as she begins to squat, then tighten the hold to 30 seconds.",
    readiness:
      "Does your Dog eliminate on lead within the target hold time after a single calm Hurry Up cue without needing off-lead roaming or specific turf?",
    restart:
      "Say nothing after an unsuccessful hold, take her straight back inside to a crate or tether, drop Hurry Up on new surfaces until she succeeds, and try next schedule.",
    setup:
      "Use a leash, high-value post-potty treats, cleanup baggies, designated home and away spots, a timer, and a crate or tether indoors.",
    steps: {
      1: {
        practiceTargets: [
          "Wait until she needs to go, take her on lead to her home spot, and give a 1 minute limited hold without a clicker.",
          "Once she goes reliably in the 1 minute hold, say Hurry Up as she squats and reward after she finishes.",
        ],
        progression:
          "Prime lightly indoors, keep her gently moving on lead for 1 minute in silence, reward warmly after she finishes, and confine indoors for 15-60 minutes if not.",
        targetAdvancement: "source",
      },
      2: {
        practiceTargets: [
          "Take her on lead to an away-from-home spot on familiar footing for a 1 minute limited hold without a clicker.",
          "Once she goes reliably away from home within 1 minute, add Hurry Up as she squats and reward after.",
        ],
        progression:
          "Pick an away spot with familiar grass or gravel so only the location changes, keep the exact 1-minute routine, and never allow off-lead shortcuts afterward.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargets: [
          "Give a 1 minute limited hold at her home spot and cue Hurry Up once as she begins to squat.",
          "Shorten the limited hold at her home spot to 45 seconds with one Hurry Up cue.",
          "Shorten the limited hold at her home spot to 30 seconds with one Hurry Up cue.",
        ],
        progression:
          "Cue Hurry Up just once when arriving at her proven home spot and progressively tighten your limited hold from 1 minute down to 30 seconds.",
        targetAdvancement: "app default",
      },
      4: {
        practiceTargets: [
          "At a new away-from-home spot, give a 1 minute limited hold without over-cueing.",
          "Shorten the away-from-home limited hold to 45 seconds with one Hurry Up cue.",
          "Cue Hurry Up once away from home and eliminate on lead within a 30 seconds limited hold.",
        ],
        progression:
          "Test Hurry Up once in a fresh location down or across the street; drop the cue if she hesitates until the routine clicks there, then tighten to 30 seconds.",
        targetAdvancement: "app default",
      },
      5: {
        practiceTargets: [
          "On a brand new surface, give a 1 minute limited hold silently and reward after she finishes.",
          "Shorten the limited hold on the new surface to 45 seconds as she gains confidence.",
          "Cue Hurry Up once on the brand new surface and eliminate on lead within 30 seconds.",
        ],
        progression:
          "After roughly 20 solid reps on one spot/surface, rotate across new surfaces (pavement, concrete, gravel, grates) from 1 minute down to 30 seconds.",
        targetAdvancement: "app default",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_FOUR_ADVANCED };
