import type { Movement } from '../types';

// ============================================================
//  Default movement library — 30+ exercises across 6 groups
//  sets/reps are no longer stored here; they're set per session
// ============================================================

export const defaultMovements: Movement[] = [

  // ── Chest ──────────────────────────────────────────────────
  { id: 'bench-press',     name: 'Bench Press',          muscleGroup: 'chest'     },
  { id: 'incline-bench',   name: 'Incline Bench Press',  muscleGroup: 'chest'     },
  { id: 'dumbbell-fly',    name: 'Dumbbell Fly',          muscleGroup: 'chest'     },
  { id: 'cable-crossover', name: 'Cable Crossover',       muscleGroup: 'chest'     },
  { id: 'chest-dips',      name: 'Chest Dips',            muscleGroup: 'chest'     },
  { id: 'push-up',         name: 'Push-Up',               muscleGroup: 'chest'     },

  // ── Back ───────────────────────────────────────────────────
  { id: 'deadlift',        name: 'Deadlift',              muscleGroup: 'back'      },
  { id: 'pull-up',         name: 'Pull-Up',               muscleGroup: 'back'      },
  { id: 'lat-pulldown',    name: 'Lat Pulldown',          muscleGroup: 'back'      },
  { id: 'bent-over-row',   name: 'Bent Over Row',         muscleGroup: 'back'      },
  { id: 'seated-row',      name: 'Seated Cable Row',      muscleGroup: 'back'      },
  { id: 'tbar-row',        name: 'T-Bar Row',             muscleGroup: 'back'      },

  // ── Shoulders ──────────────────────────────────────────────
  { id: 'ohp',             name: 'Overhead Press',        muscleGroup: 'shoulders' },
  { id: 'lateral-raise',   name: 'Lateral Raise',         muscleGroup: 'shoulders' },
  { id: 'front-raise',     name: 'Front Raise',           muscleGroup: 'shoulders' },
  { id: 'face-pull',       name: 'Face Pull',             muscleGroup: 'shoulders' },
  { id: 'arnold-press',    name: 'Arnold Press',          muscleGroup: 'shoulders' },
  { id: 'rear-delt-fly',   name: 'Rear Delt Fly',         muscleGroup: 'shoulders' },

  // ── Arms ───────────────────────────────────────────────────
  { id: 'bicep-curl',      name: 'Bicep Curl',            muscleGroup: 'arms'      },
  { id: 'hammer-curl',     name: 'Hammer Curl',           muscleGroup: 'arms'      },
  { id: 'preacher-curl',   name: 'Preacher Curl',         muscleGroup: 'arms'      },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown',       muscleGroup: 'arms'      },
  { id: 'skull-crusher',   name: 'Skull Crushers',        muscleGroup: 'arms'      },
  { id: 'dumbbell-kickback', name: 'Tricep Kickback',     muscleGroup: 'arms'      },

  // ── Legs ───────────────────────────────────────────────────
  { id: 'squat',           name: 'Squat',                 muscleGroup: 'legs'      },
  { id: 'leg-press',       name: 'Leg Press',             muscleGroup: 'legs'      },
  { id: 'rdl',             name: 'Romanian Deadlift',     muscleGroup: 'legs'      },
  { id: 'leg-curl',        name: 'Leg Curl',              muscleGroup: 'legs'      },
  { id: 'leg-extension',   name: 'Leg Extension',         muscleGroup: 'legs'      },
  { id: 'calf-raise',      name: 'Calf Raise',            muscleGroup: 'legs'      },
  { id: 'bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'legs'      },

  // ── Core ───────────────────────────────────────────────────
  { id: 'plank',           name: 'Plank',                 muscleGroup: 'core'      },
  { id: 'crunches',        name: 'Crunches',              muscleGroup: 'core'      },
  { id: 'russian-twist',   name: 'Russian Twist',         muscleGroup: 'core'      },
  { id: 'leg-raise',       name: 'Leg Raise',             muscleGroup: 'core'      },
  { id: 'ab-wheel',        name: 'Ab Wheel Rollout',      muscleGroup: 'core'      },
  { id: 'hanging-knee',    name: 'Hanging Knee Raise',    muscleGroup: 'core'      },
];
