import type { BehaviorRule } from "./practice-guidance.types";

const PRACTICE_GUIDANCE_LEVEL_TWO_POSITION: Readonly<Record<string, BehaviorRule>> = {
  "level-2/focus": {
    conditions:
      "Use the source's quiet setup and increase eye-contact duration or distraction only as the selected Step asks.",
    progression:
      "Shape voluntary eye contact; build the stated hold in small increments and add the cue only after the response is understood.",
    readiness:
      "Does your Dog offer the full eye-contact duration or distraction in this Step without repeated prompting?",
    restart:
      "Shorten the eye-contact hold or reduce the distraction and rebuild from a voluntary glance.",
    setup:
      "Have small treats and a clicker ready in a quiet place. Keep your face neutral and reward near your body so eye contact remains comfortable.",
    steps: {
      1: { progression: "Mark brief offered eye contact before asking for any duration." },
      2: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: 2,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold eye contact for {value}.",
        },
        progression:
          "Still sitting down: glance, silently count one, click, treat; then count one, two. If she gives lightning-fast glances, click the second glance instead of the first.",
        restart:
          "When she looks away before you finish your count, click the first glance another 3 times, then start the count again.",
      },
      3: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: 6,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold eye contact for {value}.",
        },
        progression:
          "Continue the Ladder up to 6 seconds; look for eye lock, not eye flicks. Add the Watch cue when you are up to 5 seconds.",
        restart: "Every single time she breaks eye contact, Chute back to 1 second.",
      },
      4: {
        practiceTargetLadder: {
          advancement: "source",
          endAt: 10,
          restartAt: 1,
          startAt: 1,
          targetTemplate: "Hold eye contact for {value}.",
        },
        progression:
          "Climb the Ladder to 10 seconds; this is usually the hardest Focus Step. Put the cue back on when you are up to 10 seconds.",
        restart: "As in Step 3, Chute back to 1 second when she breaks eye contact.",
      },
      5: {
        progression:
          "Use the source's focus check as information about engagement; keep criteria observable and return to an easier focus game if attention fades.",
      },
    },
  },
  "level-2/go-to-mat": {
    conditions:
      "Use the mat, distance, duration, and release cue in the selected Step; keep the route to the mat clear.",
    progression:
      "Reward approaching and settling on the mat, then build the Step's duration or handler movement in small approximations.",
    readiness:
      "Does your Dog go to and remain on the mat for the full time and conditions named in this Step?",
    restart:
      "Move closer, shorten the hold, or return to rewarding an easy mat approach before rebuilding.",
    setup:
      "Place a familiar non-slip mat in a quiet space. Have treats ready for delivery on the mat and choose a clear release cue.",
    steps: {
      1: {
        progression:
          "Reward voluntary interest and movement toward the mat before requiring a settled position.",
      },
      2: {
        practiceTargets: [
          "With the mat 2 feet away, she goes to it and stands on it with all 4 paws.",
          "With the mat 2 feet away, she goes to it and lies down on it, without the cue.",
          "Cue Go To Mat 2 feet from the mat; she walks all 4 paws onto it and lies down.",
        ],
        progression:
          "Stop saying Go To Mat. With the mat 2 feet away, click going to and standing on it, then cue, capture, lure, or shape the down on the mat. Bring the cue back when she runs to the mat and flings herself down.",
        readiness: "Is as much of her as possible on the mat when she lies down?",
        targetAdvancement: "source",
      },
      3: {
        practiceTargets: [
          "From 2 feet, she goes to the mat and lies down on it.",
          "From 2 feet 6 inches, she goes to the mat and lies down on it.",
          "From 3 feet, she goes to the mat and lies down on it.",
          "From 3 feet 6 inches, she goes to the mat and lies down on it.",
          "From 4 feet, she goes to the mat and lies down on it.",
          "From 4 feet 6 inches, she goes to the mat and lies down on it.",
          "From 5 feet, she goes to the mat and lies down on it.",
        ],
        progression:
          "Stop using your cue. Click her for going to the mat 3 or 4 times, then increase the distance by 6 inches; moving your chair is easier for her than moving the mat. She must still lie down with all of her on the mat.",
        restart:
          "Count any hesitation as a mistake: move back to your original distance and start again.",
        targetAdvancement: "source",
      },
      4: {
        practiceTargets: [
          "Up close, she goes to the new mat and stands on it.",
          "Up close, she goes to the new mat and lies down on it.",
          "Cue Go To Mat 2 feet from the new mat; she steps onto it and lies down.",
        ],
        progression:
          "Pick a really different mat and start at the beginning with no cue: teach that the new object is a mat, then work quickly through Step 2 again. Put the cue back on when she has the idea.",
        targetAdvancement: "source",
      },
      5: {
        progression:
          "Generalize the mat behavior to the Step's stated situations and keep a clear release cue.",
      },
    },
  },
  "level-2/handling": {
    conditions:
      "Use only the handling touch and body area specified in this Step; let the Dog move away and keep interactions brief.",
    progression:
      "Shape voluntary calm participation, starting with small approximations to the touch and extending contact only when the Dog remains comfortable.",
    readiness:
      "Does your Dog remain loose and comfortable through the full handling action described in this Step?",
    restart:
      "Stop the touch, give space, and return to a smaller approach or duration; do not restrain or push through avoidance.",
    setup:
      "Choose a quiet place and prepare small treats. Sit or kneel safely, touch gently, and leave room for the Dog to step away.",
    steps: {
      1: {
        progression:
          "Reward calm acceptance of the first brief touch before repeating or extending it.",
      },
      2: {
        progression:
          "Move the hand gradually toward the named body area, rewarding calm behavior at each small step.",
      },
      3: {
        progression:
          "Build contact duration or gentle movement in small increments, watching for relaxed body language.",
      },
      4: {
        progression:
          "Introduce the Step's tool or helper at a comfortable distance before bringing it closer.",
      },
      5: {
        progression:
          "Practice the complete brief handling routine only when earlier touches remain comfortable.",
      },
    },
  },
  "level-2/jump": {
    conditions:
      "Use a stable, low obstacle and the source's approach, jump, and return arrangement; do not jump a growing or injured Dog.",
    progression:
      "Shape a confident approach and low jump; increase height, distance, or object complexity only as the Step describes and one at a time.",
    readiness:
      "Does your Dog perform the complete jump and return described by this Step with a relaxed, safe landing?",
    restart:
      "Lower the obstacle, shorten the approach, or return to crossing a ground-level pole before raising the challenge.",
    setup:
      "Set a stable low bar on a non-slip surface with ample landing room. Have treats or a toy ready and avoid slippery floors.",
    steps: {
      1: {
        progression:
          "Reward stepping over or confidently crossing a very low obstacle before adding height.",
      },
      2: {
        practiceTargets: [
          "With the bar touching the pole, help her over the bar and around the pole from close by.",
          "From 2 feet, she goes over the bar on the floor and around the pole, without the cue.",
          "Cue Hup 2 feet from the pole; she goes over the bar and around the pole.",
        ],
        progression:
          "Put the bar on the floor with one end touching your Level 2 Distance pole and ask her to go around the pole, helping with a lure or body language if needed. Put the cue back on when she is happy to do it.",
        targetAdvancement: "source",
      },
      3: {
        practiceTargets: [
          "She steps back and forth over the 4-inch bar (lure, shape, or use treats around it).",
          "From 2 feet, she goes over the 4-inch bar and around the pole, without the cue.",
          "Cue Hup 2 feet from the pole; she goes over the 4-inch bar and around the pole.",
        ],
        progression:
          "Stop using your Hup cue and raise the bar to 4 inches. If she has trouble, lure or shape it, or show her the bar again. Put the cue back on when she eagerly goes around the pole and over the bar.",
        targetAdvancement: "source",
      },
      4: {
        practiceTargets: [
          "Standing right beside it, she goes over the 6-inch bar.",
          "From 1 foot, she goes over the 6-inch bar and returns to you.",
          "From 2 feet, she goes over the 6-inch bar and returns to you.",
          "From 3 feet, she goes over the 6-inch bar and returns to you.",
          "From 4 feet, she goes over the 6-inch bar and returns to you.",
          "From 5 feet, she goes over the 6-inch bar and returns to you.",
          "Cue Hup 5 feet from the pole; she goes over the 6-inch bar.",
        ],
        progression:
          "Change one thing at a time: raise the bar from 4 to 6 inches with your distance back to nothing, then Ladder the distance a few inches at a time (for example, 4 inches each time she goes out) to 5 feet. Put the cue back on the finished behavior.",
        restart:
          "Change only one of height or distance at a time; return to standing beside the bar if she struggles.",
        targetAdvancement: "app default",
      },
      5: {
        progression:
          "Generalize the safe jump to the specific setup named by the Step; stop if the Dog hesitates or lands poorly.",
      },
    },
  },
  "level-2/lazy-leash": {
    conditions:
      "Use the source's leash length, route, and distraction level; practice where you can safely stop or turn.",
    progression:
      "Reinforce a loose leash and attention; change distance, direction, or distraction gradually rather than pulling the Dog into position.",
    readiness:
      "Does the leash remain slack through the full walking pattern or distraction described by this Step?",
    restart:
      "Stop safely, wait for slack, or return to a quieter and shorter route; resume only when the Dog can re-engage.",
    setup:
      "Fit a comfortable leash and harness or collar. Carry small rewards and choose a safe low-distraction route with room to turn.",
    steps: {
      1: {
        progression:
          "Reward slack leash close to home before asking for a longer walk or stronger distraction.",
      },
      2: {
        conditions:
          "Start in a small room with no distractions and no leash; add the buckle collar and leash only after several capture sessions, and never use the leash to control her.",
        practiceTargets: [
          "Standing still, she finds position on your left with the leash loose.",
          "Take half a step forward; she moves up into position with the leash loose.",
          "Take 1 step forward; she keeps position with the leash loose.",
          "Take 2 steps forward; she keeps position with the leash loose.",
          "Take 3 steps forward; she keeps position with the leash loose.",
          "Take 4 steps forward; she keeps position with the leash loose.",
          "Take 5 steps forward; she keeps position with the leash loose.",
          "Turn a quarter turn to your right; she finds position with the leash loose.",
          "Turn 180° to your right; she finds position with the leash loose.",
          "Stand 2 seconds, take 2 steps forward, and turn 90° right; the leash stays loose.",
          "Stand 5 seconds, walk 5 steps forward, and turn 180° right; the leash stays loose.",
        ],
        progression:
          "Capture her being near you on your left, then add the leash. Ladder the distance you move (1, 2, 3, 4, then 5 steps), then quarter and 180° turns to your right, then combine the parts with each part made easier.",
        restart:
          "If the leash tightens, she failed: go back and explain the single behaviors again.",
        targetAdvancement: "source",
      },
      3: {
        progression:
          "Increase walking distance or context in small successful pieces; reward check-ins and slack.",
      },
      4: {
        progression:
          "Practice the source's distraction or route change at a distance the Dog can handle, then gradually approach.",
      },
      5: {
        progression:
          "Generalize the loose-leash habit across the named walking contexts, reducing difficulty whenever the leash tightens.",
      },
    },
  },
};

export { PRACTICE_GUIDANCE_LEVEL_TWO_POSITION };
