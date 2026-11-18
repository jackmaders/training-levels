import type { BehaviorRule } from "./practice-guidance.types";

const PRACTICE_GUIDANCE_LEVEL_TWO_FOUNDATIONS: Readonly<Record<string, BehaviorRule>> = {
  "level-2/come": {
    conditions:
      "Use the source's safe people, distance, distractions, and long-line arrangement; do not call where a miss could put the Dog at risk.",
    progression:
      "Build the recall in easy games, adding only the Step's named distance, cue, person, or distraction at a time.",
    readiness:
      "Does your Dog come promptly and happily under the exact distance, cue, and distraction conditions of this Step?",
    restart:
      "Shorten the distance, remove the distraction, or return to a helper game that produces a joyful approach. Avoid repeating a failed cue.",
    setup:
      "Use high-value rewards, a clicker, and a fenced area or long line when needed. Arrange helpers before beginning and keep the Dog away from traffic.",
    steps: {
      1: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: 10,
          restartAt: 5,
          startAt: 5,
          targetTemplate: "Call her from {value} away, without your real Come cue.",
          unit: "foot",
        },
        progression:
          "Play the Come Game by yourself: call her when she is away from you, click, drop one treat at your feet, then toss a second across the room. If you finished Level 1 at 20 feet, start at 5 feet and work back up to 10 feet, without your real Come cue.",
        restart:
          "If she wanders off, you went too far too fast: start closer, cut distractions, and use better treats.",
      },
      2: {
        practiceTargets: [
          "Brush her collar lightly with your hand, then click.",
          "Snag her collar gently with one finger, then click.",
          "Hold her collar for 1 second while she stays calm.",
          "Hold her collar for 2 seconds while she stays calm.",
          "Hold her collar for 3 seconds while she stays calm.",
          "Hold her collar for 4 seconds while she stays calm.",
          "Hold her collar for 5 seconds while she stays calm.",
          "She comes to you past your open hand, held palm to the side.",
          "She comes to you and brushes your hand on the way in.",
          "She comes and you briefly close your hand on her before the click.",
          "Call her from 10 feet away and snap the leash on her collar.",
        ],
        progression:
          "First Ladder the collar hold: brush the collar, snag it with a finger, then hold it for 1 to 5 seconds while she stays calm. Then add the come, have her pass and brush your hand, and briefly close your hand on her before the click.",
        restart:
          "If she pulls back or does not volunteer her collar, go back to where she can succeed and explain it again.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: 40,
          increment: 5,
          restartAt: 10,
          startAt: 5,
          targetTemplate: "Call her from {value} away, without your real Come cue.",
          unit: "foot",
        },
        progression:
          "Forget the leash and stop using your Come cue. Start at 5 feet and Ladder up to 40 feet; one giant step further away each time is usually enough.",
        restart:
          "Any mistake, loss of interest, or sniffing: stop and go back to 10 feet. If she makes another mistake right away, go back to the beginning, or stop and try again later.",
      },
      4: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: 40,
          increment: 10,
          startAt: 10,
          targetTemplate: "Call her from {value} away and snap the leash on her collar.",
          unit: "foot",
        },
        progression:
          "Combine the 40-foot come with having her leash snapped on. Treat it as a chain: come running, stop within reach, stay still for the leash.",
        restart:
          "If any part of the chain breaks down, stop the whole chain and work that part by itself; plug it back in when it is good again.",
      },
      5: {
        progression:
          "Generalize the cue in the specific places and situations named by the Step, beginning each new context at an easy distance.",
      },
    },
  },
  "level-2/communication": {
    conditions:
      "Use the communication cue and handler response described by the Step; keep signals clear and consistent.",
    progression:
      "Reward the Dog's clear response to the cue, then add the Step's new signal, distance, or context one at a time.",
    readiness:
      "Does your Dog respond to the cue with the complete behavior named by this Step in its stated context?",
    restart:
      "Return to the familiar signal and easiest context, then rebuild the new cue or condition gradually.",
    setup:
      "Choose a quiet room with treats and a clicker ready. Decide the cue and response before starting and avoid repeating the signal.",
    steps: {
      1: {
        progression:
          "Pair the signal with the Dog's known response and reinforce the response promptly.",
      },
      2: {
        progression:
          "Present the signal once, wait for the response, and reward; reduce other prompts gradually.",
      },
      3: {
        progression:
          "Practice the new communication cue in short, easy repetitions before changing distance.",
      },
      4: {
        progression:
          "Add the Step's second signal or handler position separately, then combine after both work easily.",
      },
      5: {
        progression:
          "Use the established cue in the specific everyday context named by the Step and reinforce clear communication.",
      },
    },
  },
  "level-2/crate": {
    conditions:
      "Use a safe, comfortable crate with the door and duration arranged exactly as the Step requires; never use it to force confinement.",
    progression:
      "Reward voluntary entry and calm time; increase door movement, distance, or duration one at a time as described by the Step.",
    readiness:
      "Does your Dog remain relaxed for the complete door, distance, and time conditions of this Step?",
    restart:
      "Reopen the door, shorten the time, or move closer; return to voluntary entry and comfortable calm before increasing again.",
    setup:
      "Use the Dog's familiar crate with bedding, treats, and a safe chew if the source calls for it. Keep sessions short and the door easy to open.",
    steps: {
      1: {
        progression:
          "Reward looking at, approaching, and entering the open crate voluntarily; allow the Dog to leave.",
      },
      2: {
        progression:
          "Close the door briefly only after comfortable entry; extend the closed-door time in small successful increments.",
      },
      3: {
        conditions: "Leave the crate door open throughout.",
        practiceTargetLadder: {
          advancement: "source",
          endAt: 10,
          restartAt: 1,
          startAt: 1,
          targetTemplate:
            "She enters the crate, lies down, and stays down for {value} (door open).",
        },
        progression:
          "Work it like Level 2 Down: she goes in and lies down, you silently count one, click, and treat; then count two, and so on up to 10 seconds. The click ends the behavior.",
        restart: "Make it easier after a mistake by returning to a shorter count.",
      },
      4: {
        conditions:
          "Never close the door on her during this Step; she is working to earn the click.",
        practiceTargetLadder: {
          advancement: "source",
          endAt: 30,
          restartAt: 10,
          startAt: 10,
          targetTemplate:
            "She enters the crate, lies down, and stays down for {value} (door open).",
        },
        progression:
          "Continue Laddering her time in the crate until she stays down for 30 seconds.",
        restart:
          "Make it easier when she makes a mistake; the app restarts at the 10 seconds she already achieved.",
      },
      5: {
        progression:
          "Generalize calm voluntary crate use to the specific everyday context named by the Step.",
      },
    },
  },
  "level-2/distance": {
    conditions:
      "Use a stable pole, the specified handler-to-pole distance, and the door setup for this Step; keep the path safe.",
    progression:
      "Teach the go-around with a nearby pole, then increase handler distance or change the pole/location as specified, one feature at a time.",
    readiness:
      "Does your Dog complete the full go-around and return to face you at the specified distance and new object or doorway?",
    restart:
      "Move closer to the pole, use the familiar pole, or return to guiding the path; rebuild distance in small steps.",
    setup:
      "Choose a stable pole or safe doorway and have small rewards ready. Begin close enough to guide around the object without pulling the Dog.",
    steps: {
      1: { progression: "Guide a close go-around and reward the Dog for returning to face you." },
      2: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: 24,
          increment: 2,
          restartAt: 2,
          startAt: 2,
          targetTemplate: "She goes around the pole while you stand {value} from it.",
          unit: "inch",
        },
        progression:
          "Repeat the Step 1 go-around a few times, then shuffle backward an inch or two as she goes around the pole. Put the cue back on when she can do 2 feet without hesitation.",
        restart:
          "If she makes a mistake or forgets, move forward until you are right in front of the pole and show her again.",
      },
      3: {
        practiceTargetLadder: {
          advancement: "app default",
          endAt: 5,
          restartAt: 2,
          startAt: 2,
          targetTemplate: "She goes around the pole while you stand {value} from it.",
          unit: "foot",
        },
        progression: "Continue climbing the Ladder from 2 feet to 5 feet with the familiar pole.",
        restart:
          "Any time she hesitates, forgets, or does not go far enough, Chute back to the beginning, explain it again, and climb back up.",
      },
      4: {
        practiceTargets: [
          "Standing right beside the new pole, help her go around it.",
          "She goes around the new pole while you stand 1 foot from it.",
          "She goes around the new pole while you stand 2 feet from it.",
          "Cue Go'Round 2 feet from the new pole; she goes around it.",
        ],
        progression:
          "Stop using your cue, choose a pole that is really different, and start very close to it. Review the behavior from the beginning, then put the cue back on when she loves the new pole.",
        restart: "Move back to right beside the new pole and review the go-around.",
        targetAdvancement: "app default",
      },
      5: {
        progression:
          "Practice the doorway path in small pieces; reward the turn to face you while you remain on the original side.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_TWO_FOUNDATIONS };
