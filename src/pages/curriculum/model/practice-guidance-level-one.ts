import type { BehaviorRule } from "./practice-guidance.types";

const PRACTICE_GUIDANCE_LEVEL_ONE: Readonly<Record<string, BehaviorRule>> = {
  "level-1/come": {
    conditions:
      "Keep the recall game cheerful and set the distance and helper arrangement for the current Step.",
    progression:
      "Build the Come Game in small approximations; add distance or a new context one change at a time and reserve the named cue until the source says to add it.",
    readiness:
      "Does your Dog complete the whole Come Game described in this Step promptly and happily, with its specified people and distance?",
    restart:
      "If she hesitates or stops coming happily, reduce the distance or return to the preceding game; do not repeat a failed call.",
    setup:
      "Use two people when the Step calls for them, with treats and a clicker for each. Use a long line or safe enclosed room when needed; never practice near traffic.",
    steps: {
      1: {
        progression:
          "Start with the Dog near you; mark looking toward and moving to the treat at your feet before adding a call.",
        restart:
          "Move closer and make the treat easy to find; return to a look or one step toward you.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: 10,
          restartAt: 3,
          startAt: 3,
          targetTemplate: "Stand {value} apart and call her back and forth, without your real cue.",
          unit: "foot",
        },
        progression:
          "Begin 3 feet apart (6 feet if she will probably come). When she no longer hesitates, the person she leaves takes half a step back each round until you are 10 feet apart. Do not use your real Come cue yet.",
        restart:
          "If you get too far apart for her to succeed, go immediately back to your original distance and start again.",
      },
      3: {
        practiceTargets: [
          "At 10 feet apart, call her back and forth until she realizes the other person has the next treat.",
          "At 10 feet apart, she eats the treat and turns to run to the other person without being called; say your cue as she turns.",
        ],
        progression:
          "Repeat the two-person game until she volunteers to turn to the other person; then name the behavior as she turns.",
        readiness:
          "Does she volunteer the next run without being called again, as well as meeting the stated distance?",
        targetAdvancement: "source",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: 20,
          increment: 2,
          restartAt: 10,
          startAt: 10,
          targetTemplate: "Stand {value} apart and play the Come Game, without your real cue.",
          unit: "foot",
        },
        progression:
          "Stop using your real cue. Move very slightly backwards while she runs to the other person, and keep stepping further apart while she runs happily, until you reach 20 feet.",
        restart:
          "Any time she stops running, or stops running happily, shorten the distance to one she can handle, then increase it gradually again.",
      },
      5: {
        conditions:
          "Use a safe familiar home area and one easy hiding place before adding rooms or harder hiding spots.",
        progression:
          "Play hide-and-seek from an easy nearby hiding place; increase difficulty only after several days of easy finds.",
      },
    },
  },
  "level-1/down": {
    conditions:
      "Work on the down itself; do not add a stay. Use only the leash and handler position required by this Step.",
    progression:
      "Capture, lure, or shape the down as described. Reward each offered approximation; add the named cue only when the Dog is offering the behavior reliably.",
    readiness:
      "Does your Dog lie down in the complete setup for this Step, with the specified cue and equipment?",
    restart:
      "Make the position easier, remove the newest cue or condition, or return to capturing/luring an offered down. Never use the leash to force the position.",
    setup:
      "Use a comfortable, non-slip surface, treats, and a clicker. Keep rewards low and close to the front paws; add a loose leash only for the leash Step.",
    steps: {
      1: {
        progression:
          "Capture naturally offered downs or shape a small movement toward the floor; toss the treat to reset when you want another down.",
      },
      2: {
        progression:
          "Practice the hand signal and voice cue separately; fade any lure before asking for the signal alone.",
      },
      3: {
        progression:
          "Re-teach the down from the beginning with the handler in the changed position named by the Step.",
      },
      4: {
        progression:
          "Let the Dog wear a loose leash while reteaching the down; add no leash pressure.",
      },
      5: {
        progression:
          "Ask for a down before one ordinary reward such as a meal, pet, or door opening; keep each use easy.",
      },
    },
  },
  "level-1/sit": {
    conditions:
      "Practice the source's current setup and change only the named cue, handler position, or life reward.",
    progression:
      "First reinforce offered sits; then add the cue or change the situation as each Step directs. Keep repetition easy and frequent.",
    readiness:
      "Does your Dog offer or respond with the complete sit in this Step's specified setup, without a lure or extra cue?",
    restart:
      "Remove the newest cue or distraction and return to a setup where your Dog offers the sit readily.",
    setup:
      "Use treats and a clicker in a quiet room; keep rewards within reach and avoid pushing your Dog into position.",
    steps: {
      1: {
        progression:
          "Capture naturally offered sits; click as the Dog sits and reward so another sit is easy to offer.",
      },
      2: {
        progression:
          "Pair the hand signal with the known sit, then reduce the voice cue until the hand signal works alone.",
      },
      3: {
        progression:
          "Practice the known sit while you change from the original handler position to the position named by the Step.",
      },
      4: {
        progression:
          "Build the sit around the open door in small approximations; reward before increasing the door opening or movement.",
      },
      5: {
        progression:
          "Ask for a sit before one wanted event at a time; reward with the event or a treat, without adding duration demands.",
      },
    },
  },
  "level-1/target": {
    conditions:
      "Present the target in the position and at the distance specified by the Step; keep the Dog free to move away.",
    progression:
      "Mark small voluntary orientation and approach, then gradually require closer nose contact or a changed target position as the Step says.",
    readiness:
      "Does your Dog touch or follow the target in the Step's full position and distance without being lured?",
    restart:
      "Bring the target closer and lower the distance or movement demand until your Dog chooses to engage again.",
    setup:
      "Use the target object or hand described in the Step, a clicker, and small treats. Present a clear target without pushing it toward the Dog.",
    steps: {
      1: {
        progression:
          "Click an orientation toward the target, then progressively closer approaches until the Dog touches it.",
      },
      2: {
        progression:
          "Reward nose contact, then add the source's named movement or target location in small increments.",
      },
      3: {
        practiceTargets: [
          "Dog reaches forward, without stepping, to touch your hand.",
          "Hold your hand about half an inch beyond her reach for about 2 seconds, without a cue; she steps to touch it.",
          "Dog takes 1 step to touch your hand.",
          "Dog takes 2 steps to touch your hand.",
          "Dog takes 3 steps to touch your hand.",
        ],
        progression:
          "After a few basic touches, place your hand so she reaches forward. Then hold it about half an inch beyond her reach for about 2 seconds without a cue, and ask for a bit more each time until she takes 3 steps.",
        restart: "If she starts to quit, Chute back to an easy touch and work her back up.",
        targetAdvancement: "source",
      },
      4: {
        progression:
          "Practice the target with the body position or object variation named by this Step, changing one feature at a time.",
      },
      5: {
        progression:
          "Generalize the established target across the locations and people named by the Step, resetting to an easy presentation in each new context.",
      },
    },
  },
  "level-1/zen": {
    conditions: "Begin in the stated position with the treat protected as the Step describes.",
    progression:
      "Shape the nose moving away; for duration Steps, count from one and add one second after success. Change hand or food access only when the Step asks.",
    readiness:
      "Can your Dog meet this Step's full criterion without touching or bopping the food hand?",
    restart:
      "After touching or bopping, explain the earlier, easier Step again; for the 5-second hold, restart the count at one.",
    setup:
      "Sit close to your Dog and hold the treat at nose height. Keep it still and protected; have a clear floor space for dropping the reward.",
    steps: {
      1: {
        progression:
          "Mark the first small nose movement away from the closed fist; do not wait for a long stay.",
        restart:
          "If the Dog grabs or paws hard, protect the treat with a glove, cup, or shoe and make the setup easier.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: 5,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Dog stays away from the treat in your closed fist for {value}.",
        },
        progression:
          "After the nose moves away, count 1 second; add one second after each success up to 5.",
        restart:
          "If the Dog touches or bops the fist, return to Step 1 and restart the count at 1.",
      },
      3: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: 5,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Dog stays away from the treat in your open hand for {value}.",
        },
        progression:
          "Fade the closed fist by briefly opening the hand, then close it again if the Dog comes forward; once understood, build the hold from 1 to 5 seconds.",
        restart:
          "Close the hand to restore the easier picture, then rebuild the hold from 1 second.",
      },
      4: {
        progression:
          "Move the protected treat from the hand to a dish, then uncover it only as the Dog understands the prior picture.",
        restart:
          "Cover the treat with your hand again and return to the Step 1 nose-away response.",
      },
      5: {
        progression:
          "Vary treat, person, and place one at a time; use the hand Zen she already knows to introduce new safe objects.",
        restart:
          "When a new object is too hard, protect it and return to the familiar treat and hand setup.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_ONE };
