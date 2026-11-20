import type {
  AppendixArticle,
  ComebeforePrerequisite,
  FoundationArticle,
  TheoryBehavior,
  TheoryLevel,
} from "./types";

export const FOUNDATION_ARTICLES: FoundationArticle[] = [
  {
    id: "how-levels-work",
    slug: "how-levels-work",
    title: "How Levels Work",
    summary:
      "Progression criteria, the Three Ds (Distance, Duration, Distraction), and why behaviors advance independently.",
    readTime: "4 min read",
    sections: [
      {
        heading: "Criterion-Based Advancement",
        body: "Each behavior is broken into observable steps rather than time-based weeks. A dog advances to the next step only after achieving roughly 80% success across two short sessions without prompting or bribery.",
      },
      {
        heading: "Raising One D at a Time",
        body: "Difficulty grows along three axes: Duration, Distance, and Distraction. When increasing one axis—such as adding two steps of distance to a Stay—temporarily lower duration and distraction so the dog succeeds effortlessly.",
      },
      {
        heading: "Independent Behavior Tracks",
        body: "Dogs rarely progress at identical speeds across every skill. Your dog may hold a Level 3 Mat while still refining Level 1 Loose Leash Walking outdoors; train each behavior at its own current step.",
      },
    ],
  },
  {
    id: "markers-and-reinforcement",
    slug: "markers-and-reinforcement",
    title: "Markers & Reinforcement",
    summary:
      "Precision timing with event markers, release cues, and fading food rewards without losing reliability.",
    readTime: "5 min read",
    sections: [
      {
        heading: "Event Marker vs. Release Cue",
        body: "A marker (click or sharp 'Yes!') pinpoints the exact instant the dog earns reinforcement and ends the repetition. Use a distinct release word (such as 'Free' or 'Break') when teaching duration behaviors like Stay or Mat.",
      },
      {
        heading: "Marker-to-Reward Discipline",
        body: "Every marker is a binding contract: if you mark, you always deliver a reinforcer within 1–2 seconds. Keep food hidden until after the marker so your hand never becomes a prerequisite lure.",
      },
      {
        heading: "Reward Placement & Rate",
        body: "Deliver reinforcement where it supports the behavior—at your seam for Loose Leash Walking, on the mat for Mat settling, or tossed behind to reset a Recall rep. Aim for 8–12 clean repetitions per minute during acquisition.",
      },
    ],
  },
  {
    id: "comebefore-prerequisites",
    slug: "comebefore-prerequisites",
    title: "Comebefore Prerequisites",
    summary:
      "Why foundational impulse control and engagement skills unlock reliable higher-level behaviors.",
    readTime: "3 min read",
    sections: [
      {
        heading: "Building Blocks Before Complexity",
        body: "Comebefore prerequisites prevent frustration by ensuring your dog already understands the underlying mechanics—such as offering attention or ignoring static food—before you add cues, motion, or competing environments.",
      },
      {
        heading: "Diagnosing Gaps Through Prerequisites",
        body: "When a Level 2 or Level 3 behavior breaks down, check its Comebefore chain first. Most leash-pulling or broken stays trace back to unfinished Eye Contact or Zen fundamentals rather than stubbornness.",
      },
    ],
  },
];

export const COMEBEFORE_PREREQUISITES: ComebeforePrerequisite[] = [
  {
    id: "cb-stay",
    behavior: "Stay (Level 2)",
    requires: ["Eye Contact", "Zen"],
    rationale:
      "Duration requires calm stillness and the habit of checking in rather than mugging hands.",
  },
  {
    id: "cb-llw",
    behavior: "Loose Leash Walking (Level 2)",
    requires: ["Eye Contact", "Zen", "Recall"],
    rationale:
      "A dog that chooses disengagement from distractions and orients toward the handler keeps slack naturally.",
  },
  {
    id: "cb-mat-settle",
    behavior: "Mat Settling (Level 3)",
    requires: ["Mat", "Zen", "Stay"],
    rationale:
      "Relaxing through household activity combines boundary clarity with impulse control.",
  },
  {
    id: "cb-off-leash",
    behavior: "Off-Leash Reliability (Level 4)",
    requires: ["Emergency Recall", "Loose Leash Walking", "Complex Zen"],
    rationale:
      "Freedom off-leash depends on automatic orientation and strong leave-it habits around wildlife or dogs.",
  },
];

export const APPENDIX_ARTICLES: AppendixArticle[] = [
  {
    id: "target-sticks",
    slug: "target-sticks",
    title: "Target Sticks",
    category: "Tools & Mechanics",
    summary:
      "Using a neutral nose-touch object to guide position, turns, and distance work without food luring.",
    sections: [
      {
        heading: "Charging the Target",
        body: "Present the tip of the target stick two inches from your dog's nose, mark the instant their nose makes contact, and withdraw the stick as you deliver the reward.",
        tips: [
          "Keep sessions to 6–8 reps so the dog stays eager to investigate.",
          "Move the stick to a slightly new angle on each presentation.",
        ],
      },
      {
        heading: "Transferring to Movement",
        body: "Once your dog touches the tip reliably from two feet away, sweep the stick smoothly to guide heel alignment, mat entry, or weaves without holding food in your hand.",
      },
    ],
  },
  {
    id: "zen-variations",
    slug: "zen-variations",
    title: "Zen Variations",
    category: "Impulse Control",
    summary:
      "Expanding default leave-it habits from closed-fist food to floor drops, toys, and doorway thresholds.",
    sections: [
      {
        heading: "Static vs. Motion Zen",
        body: "Static Zen teaches your dog to back away from stationary temptations; Motion Zen introduces rolling kibble, bounced toys, and moving feet while preserving the dog's choice to look back to you.",
        tips: [
          "Cover dropped items quickly with your foot—never yank the collar.",
          "Reward from your opposite hand so the dog learns good things come from disengaging.",
        ],
      },
      {
        heading: "Threshold & Doorway Zen",
        body: "Apply Zen at crates, car doors, and front entries by waiting for an unprompted pause and eye contact before giving your release cue.",
      },
    ],
  },
  {
    id: "troubleshooting-plateaus",
    slug: "troubleshooting-plateaus",
    title: "Troubleshooting Plateaus",
    category: "Coaching Notes",
    summary:
      "Diagnostic checklist when a behavior stalls across multiple sessions or degrades in new environments.",
    sections: [
      {
        heading: "Split the Criterion Smaller",
        body: "If success drops below 70%, your jump between steps is too wide. Drop back one full step for three clean reps, then introduce an intermediate half-step.",
        tips: [
          "Check whether two Ds changed at once (e.g., new park + longer duration).",
          "Inspect reward value—dry kibble rarely competes with squirrels during early proofing.",
        ],
      },
      {
        heading: "Verify Clean Mechanics",
        body: "Film a 30-second clip of your session. Common hidden culprits include repeating cues, moving your treat hand before the marker, or marking after the dog breaks position.",
      },
    ],
  },
];

export const THEORY_LEVELS: TheoryLevel[] = [
  {
    id: "level-1",
    number: 1,
    title: "Level 1 — Foundation Habits",
    focus:
      "Voluntary engagement, basic impulse control, stationing, and enthusiastic recalls in quiet spaces.",
    overview: [
      "Level 1 establishes the communication loop between you and your dog inside low-distraction environments. Instead of nagging for attention, you reinforce choices your dog offers on their own.",
      "Mastery at Level 1 looks effortless in your living room or backyard and sets every Comebefore prerequisite needed for Leash Skills and Duration in Level 2.",
    ],
    behaviors: [
      {
        id: "eye-contact",
        levelId: "level-1",
        name: "Eye Contact",
        summary:
          "Unprompted check-ins that build automatic handler focus before adding distractions.",
        prerequisites: [],
        theory: [
          "Voluntary eye contact teaches your dog that looking at your face turns on reinforcement without needing a cue.",
          "Avoid calling your dog's name repeatedly while waiting; stillness lets them solve the puzzle and builds stronger habit strength.",
        ],
        steps: [
          {
            step: 1,
            title: "Capture First Glance",
            criteria:
              "Mark and reward 5 consecutive glances within 3 seconds each in a quiet room.",
            notes:
              "Hold hands still at your waist so the dog looks at your eyes rather than your pockets.",
          },
          {
            step: 2,
            title: "Hold for Two Seconds",
            criteria:
              "Wait for 2 full seconds of steady eye contact before marking across 8 of 10 reps.",
          },
          {
            step: 3,
            title: "Mild Environmental Noise",
            criteria: "Offer eye contact within 5 seconds after entering a new room or quiet yard.",
          },
        ],
      },
      {
        id: "zen",
        levelId: "level-1",
        name: "Zen",
        summary:
          "Default 'leave it' impulse control: backing away from food until given permission.",
        prerequisites: [],
        theory: [
          "Zen reverses the natural reflex to lunge toward tempting food. Moving away from the reward makes the reward appear.",
          "Never say 'leave it' during initial Zen reps—let the visible treat itself be the cue to pause and look back.",
        ],
        steps: [
          {
            step: 1,
            title: "Closed Fist Zen",
            criteria:
              "Dog pulls nose back from a closed treat fist within 2 seconds on 5 consecutive reps.",
          },
          {
            step: 2,
            title: "Open Palm Zen",
            criteria:
              "Open palm remains uncovered for 3 seconds without the dog lunging; reward from opposite hand.",
          },
          {
            step: 3,
            title: "Floor Zen",
            criteria:
              "Dog ignores a treat placed on the floor 12 inches away for 3 seconds and looks up.",
          },
        ],
      },
      {
        id: "mat",
        levelId: "level-1",
        name: "Mat",
        summary: "Enthusiastic entry onto a portable boundary with an implied settle.",
        prerequisites: ["Eye Contact"],
        theory: [
          "A portable mat gives your dog clear spatial clarity anywhere you travel. Keeping the mat off the floor between sessions preserves its novelty and value.",
        ],
        steps: [
          {
            step: 1,
            title: "Four Paws On",
            criteria: "Dog steps onto the mat unprompted within 3 seconds of placement.",
          },
          {
            step: 2,
            title: "Down on Mat",
            criteria: "Dog folds into a down on the mat without luring across 4 of 5 placements.",
          },
          {
            step: 3,
            title: "Wait for Release",
            criteria: "Dog holds position on the mat for 10 seconds until released with 'Free'.",
          },
        ],
      },
      {
        id: "recall",
        levelId: "level-1",
        name: "Recall",
        summary: "Fast turn-and-sprint toward the handler on cue in low-distraction spaces.",
        prerequisites: ["Eye Contact"],
        theory: [
          "Every Level 1 Recall must feel like winning the lottery. Say the cue once, move backward to invite chase, and pay generously at your side.",
        ],
        steps: [
          {
            step: 1,
            title: "Short Hallway Sprint",
            criteria:
              "Dog turns immediately on cue from 6 feet away and reaches your hand within 2 seconds.",
          },
          {
            step: 2,
            title: "Collar Touch Finish",
            criteria:
              "Dog allows a gentle collar touch before receiving the reward on 5 consecutive reps.",
          },
          {
            step: 3,
            title: "Yard Distance (15 ft)",
            criteria:
              "Immediate turn and sprint from 15 feet in a fenced yard while mildly sniffing.",
          },
        ],
      },
    ],
  },
  {
    id: "level-2",
    number: 2,
    title: "Level 2 — Impulse Control & Focus",
    focus:
      "Duration stays, loose leash mechanics, hand/stick targeting, and recalls past mild distractions.",
    overview: [
      "Level 2 begins stretching the Three Ds—adding real duration to Stay, teaching your dog where to walk alongside a moving handler, and introducing mild competing scents or sounds.",
      "Keep sessions short and upbeat; whenever a behavior stalls outdoors, verify the step indoors first.",
    ],
    behaviors: [
      {
        id: "stay",
        levelId: "level-2",
        name: "Stay",
        summary: "Holding a sit or down through handler movement and step-aways until released.",
        prerequisites: ["Eye Contact", "Zen"],
        theory: [
          "Treat Stay as an implied contract: position means stay until you hear the release cue. Return to your dog to reward rather than calling them out of Stay on most repetitions.",
        ],
        steps: [
          {
            step: 1,
            title: "15-Second Duration",
            criteria: "Hold sit or down for 15 seconds while handler stands 2 feet away.",
          },
          {
            step: 2,
            title: "Three Steps Back",
            criteria:
              "Handler takes 3 steps back, pauses 3 seconds, returns, and rewards in position.",
          },
          {
            step: 3,
            title: "Gentle Distractions",
            criteria:
              "Hold position for 10 seconds while handler tosses a toy lightly to the side.",
          },
        ],
      },
      {
        id: "loose-leash-walking",
        levelId: "level-2",
        name: "Loose Leash Walking",
        summary: "Maintaining a relaxed J-shaped leash at walking pace past everyday sights.",
        prerequisites: ["Eye Contact", "Zen", "Recall"],
        theory: [
          "Loose leash walking is a partnership habit rather than a rigid obedience heel. Reward frequently at your pants seam whenever the leash stays slack, and stop forward motion the instant tension appears.",
        ],
        steps: [
          {
            step: 1,
            title: "Reinforcement Zone Check-Ins",
            criteria: "Walk 10 paces indoors with zero leash tension and 2 voluntary check-ins.",
          },
          {
            step: 2,
            title: "Sidewalk Driveway Stretch",
            criteria:
              "Walk 30 feet outside on a quiet sidewalk with a slack leash and smooth turns.",
          },
          {
            step: 3,
            title: "Past Stationary Distraction",
            criteria: "Pass a placed bowl or novel object 6 feet off-path without pulling.",
          },
        ],
      },
      {
        id: "target",
        levelId: "level-2",
        name: "Target",
        summary: "Crisp nose-to-palm or target-stick touches for effortless positioning.",
        prerequisites: ["Eye Contact"],
        theory: [
          "Targeting gives you a clean, non-food way to steer your dog onto scales, into crates, or back into position at your side.",
        ],
        steps: [
          {
            step: 1,
            title: "Palm Target on Cue",
            criteria: "Dog trots 4 feet to press nose firmly against open palm on cue.",
          },
          {
            step: 2,
            title: "Target Stick Transfer",
            criteria:
              "Dog follows and touches a target stick tip across 3 consecutive angle changes.",
          },
        ],
      },
      {
        id: "recall-distraction",
        levelId: "level-2",
        name: "Recall Under Distraction",
        summary: "Disengaging from mild scents or sights on a long line to return at speed.",
        prerequisites: ["Recall", "Zen"],
        theory: [
          "Practice on a 20-foot long line so your dog never rehearses ignoring the cue. Wait for a natural micro-pause in sniffing before calling during early reps.",
        ],
        steps: [
          {
            step: 1,
            title: "Leave Sniff Spot",
            criteria:
              "Respond on first cue from 15 feet away while exploring grass on a long line.",
          },
          {
            step: 2,
            title: "Past Stationary Helper",
            criteria: "Recall cleanly past a quiet seated helper 10 feet off the line of travel.",
          },
        ],
      },
    ],
  },
  {
    id: "level-3",
    number: 3,
    title: "Level 3 — Real-World Proofing",
    focus:
      "Distance stays, structured heel transitions, prolonged mat settling, and rapid emergency recalls.",
    overview: [
      "Level 3 bridges backyard fluency to real-world environments—parks, cafés, and busy sidewalks. Behaviors are tested with realistic competing rewards.",
      "Focus on clean single cues and high-value variable reinforcement schedules.",
    ],
    behaviors: [
      {
        id: "distance-stay",
        levelId: "level-3",
        name: "Distance Stay",
        summary: "Holding position across 25+ feet and out-of-sight intervals.",
        prerequisites: ["Stay"],
        theory: [
          "Break distance and out-of-sight challenges into tiny slices: step behind a doorframe for 1 second before building to 10 seconds.",
        ],
        steps: [
          {
            step: 1,
            title: "25-Foot Open Space",
            criteria: "Hold down-stay for 30 seconds while handler walks 25 feet away in a park.",
          },
          {
            step: 2,
            title: "Brief Out of Sight",
            criteria:
              "Hold stay for 5 seconds while handler steps behind a visual barrier and returns.",
          },
          {
            step: 3,
            title: "Circle & Distraction",
            criteria: "Remain settled while handler jogs a full circle around the dog at 10 feet.",
          },
        ],
      },
      {
        id: "heel-position",
        levelId: "level-3",
        name: "Heel & Position",
        summary: "Short stretches of attentive left-side alignment through tight spaces and turns.",
        prerequisites: ["Loose Leash Walking", "Target"],
        theory: [
          "Unlike Loose Leash Walking, Heel asks for active alignment beside your left leg during brief passes through crowds or narrow doorways.",
        ],
        steps: [
          {
            step: 1,
            title: "Pivot into Heel",
            criteria: "Dog swings smoothly into left-side heel position from front on cue.",
          },
          {
            step: 2,
            title: "Pace Changes & Turns",
            criteria:
              "Maintain shoulder alignment through slow, normal, and 90-degree left/right turns.",
          },
        ],
      },
      {
        id: "mat-settling",
        levelId: "level-3",
        name: "Mat Settling",
        summary: "Relaxed chin-rest settling on a mat for 5+ minutes around movement.",
        prerequisites: ["Mat", "Zen", "Stay"],
        theory: [
          "True settling looks like a hip roll or heavy sigh rather than rigid anticipation. Deliver calm, quiet rewards between the front paws.",
        ],
        steps: [
          {
            step: 1,
            title: "Hip Roll Relax",
            criteria:
              "Dog settles onto one hip on the mat within 60 seconds without repeated cues.",
          },
          {
            step: 2,
            title: "Five-Minute Café Settle",
            criteria: "Hold relaxed mat settle for 5 minutes while people walk past at 6 feet.",
          },
        ],
      },
      {
        id: "emergency-recall",
        levelId: "level-3",
        name: "Emergency Recall",
        summary: "Conditioned reflex U-turn recall reserved strictly for urgent real-world stops.",
        prerequisites: ["Recall Under Distraction"],
        theory: [
          "Use a unique whistle or word paired exclusively with jackpot reinforcement so the cue triggers an automatic U-turn without hesitation.",
        ],
        steps: [
          {
            step: 1,
            title: "Jackpot Conditioning",
            criteria:
              "Immediate head whip toward handler upon cue across 10 spaced conditioning trials.",
          },
          {
            step: 2,
            title: "Chase Interruption",
            criteria: "Turn away mid-trot toward a rolled ball or decoy on first cue.",
          },
        ],
      },
    ],
  },
  {
    id: "level-4",
    number: 4,
    title: "Level 4 — Mastery & Generalization",
    focus:
      "Off-leash reliability, calm public manners, heavily proofed stays, and motion-zen impulse control.",
    overview: [
      "Level 4 generalizes all core habits across unfamiliar places, dogs, and wildlife. Reinforcement becomes intermittent and natural life rewards—sniffing, greeting, or play—do the heavy lifting.",
    ],
    behaviors: [
      {
        id: "off-leash-reliability",
        levelId: "level-4",
        name: "Off-Leash Reliability",
        summary:
          "Automatic check-ins and trail-yield behaviors while moving freely in safe spaces.",
        prerequisites: ["Emergency Recall", "Loose Leash Walking", "Complex Zen"],
        theory: [
          "Reliable off-leash hiking relies on frequent voluntary check-ins and immediate recalls past joggers, cyclists, and wildlife.",
        ],
        steps: [
          {
            step: 1,
            title: "30-Foot Trail Tether",
            criteria:
              "Check in voluntarily every 20–30 feet on an unfenced trail (verified on drag line).",
          },
          {
            step: 2,
            title: "Yield to Oncoming Traffic",
            criteria:
              "Return to heel or mat off-trail on cue as joggers or dogs pass within 8 feet.",
          },
        ],
      },
      {
        id: "public-manners",
        levelId: "level-4",
        name: "Public Manners",
        summary: "Calm greetings, doorway pauses, and quiet settling in dog-friendly venues.",
        prerequisites: ["Mat Settling", "Heel & Position"],
        theory: [
          "Teach a default polite sit or eye check-in whenever strangers approach rather than letting excitement trigger jumping.",
        ],
        steps: [
          {
            step: 1,
            title: "Four-on-the-Floor Greeting",
            criteria: "Maintain all four paws grounded during a 10-second friendly greeting.",
          },
          {
            step: 2,
            title: "15-Minute Patio Down",
            criteria: "Rest calmly under or beside a chair for 15 minutes in a busy outdoor venue.",
          },
        ],
      },
      {
        id: "proofed-stay",
        levelId: "level-4",
        name: "Proofed Stay",
        summary:
          "Holding position through high-arousal distractions, bounced balls, and passing dogs.",
        prerequisites: ["Distance Stay", "Zen"],
        theory: [
          "Always test high-arousal proofing safely with space and clear resets so your dog practices winning rather than breaking.",
        ],
        steps: [
          {
            step: 1,
            title: "Bounced Ball Proofing",
            criteria:
              "Hold down-stay while a ball bounces 5 feet in front of the dog and rolls past.",
          },
          {
            step: 2,
            title: "2-Minute Group Stay",
            criteria: "Hold 2-minute stay at 20 feet while another dog walks past at 12 feet.",
          },
        ],
      },
      {
        id: "complex-zen",
        levelId: "level-4",
        name: "Complex Zen",
        summary: "Ignoring scattered food, moving toys, and dropped high-value items on sight.",
        prerequisites: ["Zen", "Stay"],
        theory: [
          "Complex Zen turns dropped food and fast motion into an automatic cue to glance back at you.",
        ],
        steps: [
          {
            step: 1,
            title: "Tossed Treat Walk-By",
            criteria: "Walk past a treat tossed 3 feet ahead without breaking stride or sniffing.",
          },
          {
            step: 2,
            title: "Toy & Food Combo",
            criteria:
              "Disengage from a moving squeaky toy on a single calm cue or unprompted glance.",
          },
        ],
      },
    ],
  },
];

export function getLevelById(levelId: string): TheoryLevel | undefined {
  return THEORY_LEVELS.find((level) => level.id === levelId);
}

export function getBehaviorById(
  levelId: string,
  behaviorId: string,
): { level: TheoryLevel; behavior: TheoryBehavior } | undefined {
  const level = getLevelById(levelId);
  if (!level) return undefined;
  const behavior = level.behaviors.find((item) => item.id === behaviorId);
  if (!behavior) return undefined;
  return { level, behavior };
}
