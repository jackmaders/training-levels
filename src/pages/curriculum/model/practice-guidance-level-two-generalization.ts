import type { BehaviorRule } from "./practice-guidance.types";

const PRACTICE_GUIDANCE_LEVEL_TWO_GENERALIZATION: Readonly<Record<string, BehaviorRule>> = {
  "level-2/relax": {
    conditions:
      "Use the source's bed or resting place and the named duration, handler movement, or distraction; avoid asking a worried Dog to stay put.",
    progression:
      "Reward relaxed body language and build the stated duration or distraction in small changes; return to easy settling when tension appears.",
    readiness:
      "Does your Dog settle with relaxed body language for the full time and situation specified by this Step?",
    restart:
      "Reduce time or distraction, increase distance from the trigger, and reward calm settling before progressing.",
    setup:
      "Use a comfortable bed or mat in a quiet area. Keep rewards close and calm; plan a low-level version of any sound or movement in the Step.",
    steps: {
      1: { progression: "Mark and calmly reward offered settling before adding duration." },
      2: {
        progression:
          "Build the hold toward the Step's stated time in short, comfortable increments.",
      },
      3: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: 60,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "She settles and stays relaxed for {value}.",
        },
        progression:
          "Stop using your cue, get her relaxed, and climb the time ladder rung by rung: settle for a silent count of one, click and treat; settle for two, click and treat; and so on to 1 minute.",
      },
      4: {
        practiceTargets: [
          "A short settle, a short and easy excite, then another short settle.",
          "Bounce between short settles and a few seconds of mild excitement until she changes easily.",
          "Make the settle last longer, keeping the excitement mild.",
          "Keep the settle short and get her more excited.",
          "Settle 1 minute, excite, settle 1 minute, excite, settle 1 minute, with your cues back on.",
        ],
        progression:
          "Stop using your cues. Start with a short settle, a short and easy excite, and another short settle, and bounce between them until she changes easily. Make one job harder at a time, then put the whole sequence together and put your cues back on.",
        targetAdvancement: "source",
      },
      5: {
        progression:
          "Generalize calm settling to the stated household context; keep the option to leave available.",
      },
    },
  },
  "level-2/sit": {
    conditions:
      "Follow the current Step's sit duration, handler movement, or functional context; keep the Dog comfortable and avoid leash pressure.",
    progression:
      "Build one criterion at a time, rewarding offered sits before adding duration, distance, or real-life distractions.",
    readiness:
      "Can your Dog meet the complete time, distance, and context stated by this Step without repeated cues?",
    restart:
      "Reduce duration or distance, return closer, or rehearse the easier sit before combining conditions again.",
    setup:
      "Use treats, a clicker, and a comfortable surface. Plan the handler movement or functional reward before asking for the sit.",
    steps: {
      1: {
        practiceTargets: [
          "Beside you, she sits without moving for 1 second.",
          "Beside you, she sits without moving for 2 seconds.",
          "Beside you, she sits without moving for 3 seconds.",
          "Beside you, she sits without moving for 4 seconds.",
          "Beside you, she sits without moving for 5 seconds.",
          "Beside you, she sits without moving for 6 seconds.",
          "Beside you, she sits without moving for 7 seconds.",
          "Beside you, she sits without moving for 8 seconds.",
          "Beside you, she sits without moving for 9 seconds.",
          "Beside you, she sits without moving for 10 seconds.",
          "Take half a step sideways away from her; she stays sitting.",
          "Take a whole step sideways; she stays sitting.",
          "Take one step sideways and half a step forward; she stays sitting.",
          "Take one step sideways and one step forward; she stays sitting.",
          "Take half a step sideways and one step forward; she stays sitting.",
          "Take one step forward; she stays sitting.",
          "Take 2 steps forward; she stays sitting.",
          "Take 3 steps forward; she stays sitting.",
          "Walk out to 5 feet; she stays sitting.",
          "Walk 3 feet away, turn, and walk back to her; she stays sitting.",
          "Walk 4 feet away, turn, and walk back to her; she stays sitting.",
          "Walk 5 feet away and return, pivoting back to her side; she sits until you are beside her.",
        ],
        progression:
          "Keep the Dog's feet and bottom planted. First build a stationary sit to 10 seconds, then walk away one step at a time toward 5 feet, and separately teach the return before combining the full out-and-back.",
        restart:
          "Any foot movement or whining returns this source ladder to its beginning; simplify the handler movement and build again.",
        targetAdvancement: "source",
      },
      2: {
        conditions:
          "Practice the final 5-foot, 30-second hold on a different surface, then on the Dog's left or right without pivoting, standing, or fussing.",
        practiceTargets: [
          "Walk 3 feet away, turn, and stay 1 second, then return.",
          "Walk 3 feet away, turn, and stay 2 seconds, then return.",
          "Walk 3 feet away, turn, and stay 3 seconds, then return.",
          "Walk 3 feet away, turn, and stay 4 seconds, then return.",
          "Walk 3 feet away, turn, and stay 5 seconds, then return.",
          "Walk 3 feet away, turn, and stay 10 seconds, then return.",
          "Walk 3 feet away, turn, and stay 15 seconds, then return.",
          "Walk 3 feet away, turn, and stay 20 seconds, then return.",
          "Walk 3 feet away, turn, and stay 25 seconds, then return.",
          "Walk 3 feet away, turn, and stay 30 seconds, then return.",
          "Walk 5 feet away, stay 30 seconds, and return; she stays sitting.",
        ],
        progression:
          "At 3 feet, build the away-time from 1 second to 5 seconds, then to 30 seconds; alternate clicks at the end of the count and after returning. Restore the 5-foot distance after the duration is steady.",
        targetAdvancement: "app default",
      },
      3: {
        conditions:
          "After the 10-foot, 1-minute behavior is steady, transfer it to an inside doorway first; use an outside door only in a safe fenced area.",
        practiceTargets: [
          "Walk 5 feet away, stay 30 seconds, and return.",
          "Walk 6 feet away, stay 30 seconds, and return.",
          "Walk 6 feet away, stay 40 seconds, and return.",
          "Walk 7 feet away, stay 40 seconds, and return.",
          "Walk 7 feet away, stay 50 seconds, and return.",
          "Walk 8 feet away, stay 50 seconds, and return.",
          "Walk 8 feet away, stay 1 minute, and return.",
          "Walk 9 feet away, stay 1 minute, and return.",
          "Walk 10 feet away, stay 1 minute, and return.",
        ],
        progression:
          "Alternate adding a few seconds and a little distance until the source's 10 feet and 1 minute are both met; return to the Dog before rewarding.",
        targetAdvancement: "app default",
      },
      4: {
        progression:
          "Train the Step's combined duration and handler movement as separate parts before combining them.",
      },
      5: {
        progression:
          "Use the sit in the functional situations named by the Step and reinforce the behavior with the relevant life reward.",
      },
    },
  },
  "level-2/target": {
    conditions:
      "Use the Step's target object, position, and movement; make the target easy to reach and allow the Dog to disengage.",
    progression:
      "Shape voluntary nose contact or following, then add the specific distance or movement in small increments.",
    readiness:
      "Does your Dog follow or touch the target for the complete movement and distance described by this Step?",
    restart:
      "Bring the target closer, slow its movement, or return to a stationary touch before increasing the challenge.",
    setup:
      "Prepare the source's target and small rewards. Keep the target visible and move it smoothly; do not use it to pull the Dog beyond comfort.",
    steps: {
      1: { progression: "Reinforce a clear touch of the target before moving it." },
      2: {
        progression:
          "Move the target a short distance, then extend the follow distance only after easy success.",
      },
      3: {
        progression: "Add the Step's new target location or body position one change at a time.",
      },
      4: {
        progression:
          "Practice the target movement in the exact surface, direction, or handler position described by the Step.",
      },
      5: {
        progression:
          "Generalize known target behavior to the source's named situations; start each new condition with an easy touch.",
      },
    },
  },
  "level-2/tricks": {
    conditions:
      "Use the safe object and trick behavior chosen for this Step; split a new movement into small approximations.",
    progression:
      "Shape one small action at a time, marking closer approximations; pause or make the criterion easier if the Dog stops offering behavior.",
    readiness:
      "Can your Dog offer the chosen trick response reliably in the Step's stated setup without a lure?",
    restart:
      "Return to an earlier, easier approximation or remove the object and reward a small related movement.",
    setup:
      "Prepare the safe object, clicker, and small treats. Work in a clear, quiet area and keep the trick low impact.",
    steps: {
      1: { progression: "Choose one easy trick and reinforce its first voluntary approximation." },
      2: {
        progression:
          "Break the selected movement into smaller actions and reinforce each step toward the trick.",
      },
      3: {
        progression:
          "Add the named object or body movement only after the simpler approximation is fluent.",
      },
      4: {
        progression:
          "Practice the trick from the source's changed position or context, lowering the criterion at first.",
      },
      5: {
        progression:
          "Link the chosen trick into a short sequence only when its parts are already comfortable.",
      },
    },
  },
  "level-2/zen": {
    conditions:
      "Use a safe, low-value food item on the floor, with your foot or hand ready to protect it as instructed.",
    progression:
      "Start with the Dog moving away from the protected floor treat; build the Step's duration or change the reward and cue only as described.",
    readiness:
      "Can your Dog meet this Step's full food, duration, cue, and reward conditions without moving toward the item?",
    restart:
      "Cover the item again, shorten the count, or return to the previous Step's easier food and cue picture after a miss.",
    setup:
      "Choose a safe treat and non-slip floor. Have a separate reward in your hand and a shoe or hand ready to cover the floor item.",
    steps: {
      1: {
        conditions:
          "Use a low-value treat on a safe floor and protect it with your foot; do not test with unsafe or hazardous objects.",
        progression:
          "Mark the first movement away from the uncovered floor treat while your foot can protect it.",
      },
      2: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: 10,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Stay away from the floor treat for {value}.",
        },
        progression:
          "Build the floor Zen hold from 1 second toward 10 seconds, increasing by one second after success.",
        restart: "If the Dog moves toward the food, cover it and restart the count at 1 second.",
      },
      3: {
        conditions:
          "Include a different place from the Step's first teaching location before treating the criterion as ready.",
        practiceTargetLadder: {
          advancement: "source",
          endAt: 30,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Stay off the floor treat for {value}.",
        },
        progression:
          "Continue the one-second duration ladder beyond the previous 10-second Step and work toward 30 seconds; repeat it on a different surface and in a different place.",
        restart:
          "Cover the treat and return to a shorter count after a miss, then rebuild the hold.",
      },
      4: {
        progression:
          "Vary whether the Dog receives the floor item or a different reward from your hand; keep the cue and protected setup clear.",
        readiness:
          "Can the Dog stay off the dropped item when the reward may come from your hand instead?",
      },
      5: {
        conditions:
          "Use only safe objects and supervise; prevent access to hazardous food, medicine, and other dangerous items.",
        progression:
          "Practice safe everyday drops and defaults; reward often from your hand while keeping chosen off-limits items inaccessible.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_TWO_GENERALIZATION };
