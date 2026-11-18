import type { BehaviorRule } from "./practice-guidance.types";

const THREE = 3;

const PRACTICE_GUIDANCE_LEVEL_FOUR_FOUNDATIONS: Readonly<Record<string, BehaviorRule>> = {
  "level-4/come": {
    conditions:
      "Complete Level 1 Come, all Zen behaviors, and all Distance behaviors; train on a long line or in a safe enclosed area and wait until sure before cueing Come.",
    progression:
      "Build recalls past helpers who hold eye contact, pet, or feed, then transfer the recall to a whistle and play outdoor Hide and Seek.",
    readiness:
      "Does your Dog disengage immediately from the active helper or locate you outside on a single Come or whistle cue?",
    restart:
      "Have your helper pause interaction before you call, move closer, replay Monkey In The Middle or the Come Game, and pay with extra-high-value rewards.",
    setup:
      "Bring jackpot rewards (such as canned cat food or liverwurst for whistle work), willing friends or strangers, a long line, and a practiced whistle.",
    steps: {
      1: {
        practiceTargets: [
          "Play Monkey In The Middle and the Come Game until she turns away from a talking helper.",
          "Have your helper keep eye contact until you call, then look up at the ceiling as you call.",
          "Have your helper keep making eye contact with her even after you call.",
        ],
        progression:
          "Use Monkey In The Middle so she engages appropriately with people, then keep helper eye contact longer past the call until she turns away eagerly.",
        targetAdvancement: "source",
      },
      2: {
        practiceTargets: [
          "Have your helper pet her, then stop petting right before you call.",
          "Have your helper pet her until you call, straightening up as soon as you call.",
          "Have your helper keep petting gently even after you call; she breaks off and comes.",
        ],
        progression:
          "Fade helper assistance across three stages and ensure the helper stops all petting if she fails to break off immediately when called.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargets: [
          "Have your helper feed her, stop offering food, then you call.",
          "Have your helper stop offering food right after you call.",
          "Have your helper keep offering food while you call and pay with higher-value treats.",
        ],
        progression:
          "Give the helper plain kibble while you hold a richer jackpot so choosing you over visible food always pays better.",
        targetAdvancement: "source",
      },
      4: {
        progression:
          "Practice a consistent whistle pattern away from your Dog first, then pair Whistle immediately before Come (or capture volunteered recalls) for jackpot rewards.",
        restart:
          "Return to pairing the whistle right before Come at short range or restart the Come Game without blowing the whistle until she moves toward you.",
      },
      5: {
        progression:
          "Duck behind a tree or obstacle in a safe yard, field, or fenced lot while her focus drifts, watch discreetly so she does not panic, and whistle once to be found.",
        restart:
          "Hide closer and in partial view, whistle sooner if she looks worried, and celebrate enthusiastically when she tracks you down.",
      },
    },
  },
  "level-4/focus": {
    conditions:
      "Complete Level 1-3 Zen, Level 2-3 Focus, Relax, Sit, and Down; practice Look (pointed with your near arm) alongside Watch so neither cue confuses the other.",
    progression:
      "Teach Look toward a treat on the ground, pair Look with Hup over a jump, hold Watch near high-value temptations, and mark one of two floor targets.",
    readiness:
      "Does your Dog snap her eyes toward the marked target on Look, wait for your cue or release, and choose the correct target cleanly?",
    restart:
      "Move farther from tempting targets or closer to the jump or floor treat, reinforce plain Watch again, and rebuild one piece at a time.",
    setup:
      "Use visible treats that contrast with the floor, a clicker, a 6-inch jump, favorite toys, and real-world distractions or scary objects for threshold work.",
    steps: {
      1: {
        practiceTargets: [
          "Toss a treat about 2 feet in front of her and click when she glances at it before releasing.",
          "Build her glance on the floor treat up to a steady 3-second stare before clicking.",
          "Cue Look before tossing or pointing, clicking when she snaps her eyes straight ahead.",
        ],
        progression:
          "Keep her beside you on your left, build a 3-second stare at the dropped treat, then name the forward snap Look and alternate Look with Watch.",
        targetAdvancement: "source",
      },
      2: {
        practiceTargets: [
          "Lower the jump bar to the floor close up, toss a treat beyond it, and click her stare before stepping over.",
          "Stand 3 to 5 feet from the 6 inch jump, toss a treat over it, and click her stare before releasing.",
          "Stand 3 to 5 feet from the 6 inch jump, cue Look, and reward her focus with Hup to jump.",
        ],
        progression:
          "Use the Premack Principle: build excitement staring over the jump, add Look once she anticipates the far side, then reward Look with Hup.",
        restart:
          "If she ducks around the jump, drop the bar right onto the floor and work from just a step away before raising it back to 6 inches.",
        targetAdvancement: "source",
      },
      3: {
        progression:
          "Start far enough from mediocre kibble to hold Watch cleanly, ladder back to 5 feet alternating Look and Watch, then upgrade to toys and wonderful or scary items.",
        restart:
          "Back farther away from the exciting item until she offers Watch comfortably, then reward calmly and rebuild distance.",
      },
      4: {
        practiceTargets: [
          "Place 2 treats 12 feet apart, face one directly, point with your left arm, cue Look, and release her.",
          "Place 2 treats 5 feet left and right and 3 feet ahead, wait for a look to the left one, and send her.",
          "With both treats visible 3 feet ahead, send her to the right treat first while blocking neither.",
          "Place 2 treats 5 feet apart and 5 feet ahead, mark one with your left arm and Look, and release her.",
        ],
        progression:
          "Start directly between widely spaced treats, move off the line so both remain visible, send to the harder right side first, then narrow spacing to 5 feet.",
        restart:
          "If she glances over her shoulder at the other treat, step much closer to the intended treat until she locks eyes on it cleanly.",
        targetAdvancement: "source",
      },
      5: {
        progression:
          "Test Look and Watch under real distractions—outside a dog park, during kitchen prep, near fear triggers below threshold, or around poles past a food bowl.",
      },
    },
  },
  "level-4/lazy-leash": {
    conditions:
      "Complete Level 2-3 Lazy Leash and all Zen behaviors; never pull, nag, or repeat Easy when over threshold—reset, move away, or change to Watch.",
    progression:
      "Teach another person to pass L3 Step 3 with your Dog, fade treats across 1-minute and 3-minute walks near distractions, and generalize to daily walks.",
    readiness:
      "Does your Dog maintain slack in the leash for the entire timed walk or helper pass without nagging or continuous treats?",
    restart:
      "Back up or peel off away from where she tightened the leash, reset to one calm step, or move farther from distractions before building time again.",
    setup:
      "Use a 6-foot leash, high-value treats for training and resets, a willing helper, and routes with controlled distances from people and dogs.",
    steps: {
      1: {
        practiceTargets: [
          "Write your teaching plan and coach the new trainer through short loose-leash turns in a quiet spot.",
          "Coach your helper to walk 5 steps forward, turn around, and walk 5 steps back on a loose leash.",
          "Coach your helper to walk 10 steps forward, turn around, and walk 10 steps back with people and dogs in the area.",
        ],
        progression:
          "Choose a trusted helper, prepare a simple session plan, coach their timing and resets, and celebrate once they pass Level 3 Step 3 cleanly.",
        targetAdvancement: "app default",
      },
      2: {
        practiceTargets: [
          "Walk 15 seconds on a Lazy Leash in a low-distraction area.",
          "Walk 30 seconds on a Lazy Leash without clicking or treating.",
          "Walk 45 seconds on a Lazy Leash without clicking or treating.",
          "Walk 1 minute on a Lazy Leash without clicking or treating.",
        ],
        progression:
          "Start in a quiet lot or early-morning sidewalk, keep extra-special treats only for surprises, and ladder up to a full 60-second treat-free walk.",
        targetAdvancement: "app default",
      },
      3: {
        practiceTargets: [
          "Walk 15 seconds on a Lazy Leash far from people and dogs.",
          "Walk 30 seconds on a Lazy Leash with people and dogs in view.",
          "Walk 45 seconds on a Lazy Leash closer to people and dogs.",
          "Walk 1 minute on a Lazy Leash with dogs and people in the area.",
        ],
        progression:
          "Keep distractions under distance control (such as walking on grass parallel to a busy path) and never sacrifice slack in the leash just to finish the minute.",
        restart:
          "If a particular distraction like birds or dogs breaks her focus, pause duration work and retrain that distraction at a comfortable distance first.",
        targetAdvancement: "app default",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: THREE,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Walk {value} on a Lazy Leash near dogs and people without treats.",
          unit: "minute",
        },
        progression:
          "Maintain default loose leash from 1 to 3 minutes around familiar distractions, boosting click rate briefly or moving directly away if a trigger overwhelms her.",
      },
      5: {
        progression:
          "Increase walk distance, duration, and distractions one at a time; step off the path into a driveway whenever either of you starts to lose focus.",
      },
    },
  },
  "level-4/zen": {
    conditions:
      "Complete Level 1-3 Zen first; work genuine Zen self-control rather than a rigid stay, and keep Leave It calm whenever you cue it.",
    progression:
      "Refresh hand and floor Zen, build uncovered coffee-table holds and out-of-sight exits using a mirror, then drop treats before giving the cue.",
    readiness:
      "Does your Dog leave the treat untouched on the table, while you are out of sight, or as it drops without grabbing or hovering?",
    restart:
      "Cover or pick up the kibble, chute back to hand or floor Zen or step 1 at the table, and reward from your hand instead of letting her take the table bait.",
    setup:
      "Keep boring kibble for table or floor bait, cooked chicken or great treats in your hand, a coffee table, and a mirror or reflection window.",
    steps: {
      1: {
        practiceTargets: [
          "Uncover kibble on the coffee table and hold Zen for 5 seconds while standing straight.",
          "Leave uncovered kibble on the coffee table untouched for 15 seconds.",
          "Leave uncovered kibble on the coffee table untouched for 30 seconds.",
          "Leave uncovered kibble on the coffee table untouched for 1 minute.",
        ],
        progression:
          "Refresh hand and floor Zen, cover then uncover kibble on the table, reward from your hand with great treats, and ladder up to 1 minute without hovering.",
        targetAdvancement: "app default",
      },
      2: {
        practiceTargets: [
          "Take 1 step away from the baited table, click, return, and reward from your hand.",
          "Chute and ladder steps out to the doorway, step out of sight once, and return to reward.",
          "Step in and out of sight 3 times while watching via mirror before returning to reward.",
        ],
        progression:
          "Step sideways and backward first, vary whether you click away or on return, and watch via mirror so you never click her sneaking the kibble.",
        restart:
          "If she follows you out of the room or eyes the table, return to hand, floor, and 1-step table Zen—or solve out-of-sight stays in Level 4 Sit and Down first.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargets: [
          "Step out of sight for 5 seconds, click while unseen, and return to reward.",
          "Stay out of sight for 15 seconds watching via mirror, click while unseen, and return.",
          "Stay out of sight for 30 seconds watching via mirror, click while unseen, and return.",
          "Stay out of sight for 45 seconds watching via mirror, click while unseen, and return.",
          "Stay out of sight for 1 minute while she leaves the table treat alone.",
        ],
        progression:
          "Click while still out of sight so she learns the rule holds when you are gone, then return and celebrate warmly for a full minute of self-control.",
        restart:
          "If she makes a mistake while you are out, chute right back to stepping briefly out of sight (5 seconds) and rebuild slowly.",
        targetAdvancement: "app default",
      },
      4: {
        practiceTargets: [
          "Review floor Zen, then drop a treat the last inch or two while cueing Leave It.",
          "Toss a treat slightly away from her, cueing Leave It just before your hand releases it.",
          "Drop a treat straight down and cue Leave It at the exact moment it falls.",
          "Drop a treat first and cue Leave It only after it starts falling.",
        ],
        progression:
          "Move from static floor Zen to low drops, covered drops or gates, simultaneous cues, and finally late Leave It cues mid-fall.",
        restart:
          "Drop the cue temporarily, lower the drop height, toss farther away or behind a gate, and restore Leave It once she succeeds consistently.",
        targetAdvancement: "source",
      },
      5: {
        progression:
          "Pick real-life hard Zens—countertops, toddler snacks, fallen pans, toys, or wildlife—and always pay from your hand with a different reward than the bait.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_FOUR_FOUNDATIONS };
