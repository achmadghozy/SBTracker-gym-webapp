import type { Movement } from '../types';

// ============================================================
//  Default movement library — 30+ exercises across 6 groups
// ============================================================

export const defaultMovements: Movement[] = [

  // ── Chest ──────────────────────────────────────────────────
  { id: 'bench-press',     name: 'Bench Press',         muscleGroup: 'chest',     sets: 4, reps: 8,  unit: 'reps' },
  { id: 'incline-bench',   name: 'Incline Bench Press', muscleGroup: 'chest',     sets: 3, reps: 10, unit: 'reps' },
  { id: 'dumbbell-fly',    name: 'Dumbbell Fly',         muscleGroup: 'chest',     sets: 3, reps: 12, unit: 'reps' },
  { id: 'cable-crossover', name: 'Cable Crossover',      muscleGroup: 'chest',     sets: 3, reps: 15, unit: 'reps' },
  { id: 'chest-dips',      name: 'Chest Dips',           muscleGroup: 'chest',     sets: 3, reps: 10, unit: 'reps' },
  { id: 'push-up',         name: 'Push-Up',              muscleGroup: 'chest',     sets: 3, reps: 15, unit: 'reps' },

  // ── Back ───────────────────────────────────────────────────
  { id: 'deadlift',        name: 'Deadlift',             muscleGroup: 'back',      sets: 4, reps: 5,  unit: 'reps' },
  { id: 'pull-up',         name: 'Pull-Up',              muscleGroup: 'back',      sets: 4, reps: 8,  unit: 'reps' },
  { id: 'lat-pulldown',    name: 'Lat Pulldown',         muscleGroup: 'back',      sets: 3, reps: 10, unit: 'reps' },
  { id: 'bent-over-row',   name: 'Bent Over Row',        muscleGroup: 'back',      sets: 4, reps: 8,  unit: 'reps' },
  { id: 'seated-row',      name: 'Seated Cable Row',     muscleGroup: 'back',      sets: 3, reps: 12, unit: 'reps' },
  { id: 'tbar-row',        name: 'T-Bar Row',            muscleGroup: 'back',      sets: 3, reps: 10, unit: 'reps' },

  // ── Shoulders ──────────────────────────────────────────────
  { id: 'ohp',             name: 'Overhead Press',       muscleGroup: 'shoulders', sets: 4, reps: 8,  unit: 'reps' },
  { id: 'lateral-raise',   name: 'Lateral Raise',        muscleGroup: 'shoulders', sets: 3, reps: 15, unit: 'reps' },
  { id: 'front-raise',     name: 'Front Raise',          muscleGroup: 'shoulders', sets: 3, reps: 12, unit: 'reps' },
  { id: 'face-pull',       name: 'Face Pull',            muscleGroup: 'shoulders', sets: 3, reps: 15, unit: 'reps' },
  { id: 'arnold-press',    name: 'Arnold Press',         muscleGroup: 'shoulders', sets: 3, reps: 10, unit: 'reps' },
  { id: 'rear-delt-fly',   name: 'Rear Delt Fly',        muscleGroup: 'shoulders', sets: 3, reps: 15, unit: 'reps' },

  // ── Arms ───────────────────────────────────────────────────
  { id: 'bicep-curl',      name: 'Bicep Curl',           muscleGroup: 'arms',      sets: 3, reps: 12, unit: 'reps' },
  { id: 'hammer-curl',     name: 'Hammer Curl',          muscleGroup: 'arms',      sets: 3, reps: 12, unit: 'reps' },
  { id: 'preacher-curl',   name: 'Preacher Curl',        muscleGroup: 'arms',      sets: 3, reps: 10, unit: 'reps' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown',      muscleGroup: 'arms',      sets: 3, reps: 12, unit: 'reps' },
  { id: 'skull-crusher',   name: 'Skull Crushers',       muscleGroup: 'arms',      sets: 3, reps: 10, unit: 'reps' },
  { id: 'dumbbell-kickback', name: 'Tricep Kickback',    muscleGroup: 'arms',      sets: 3, reps: 15, unit: 'reps' },

  // ── Legs ───────────────────────────────────────────────────
  { id: 'squat',           name: 'Squat',                muscleGroup: 'legs',      sets: 4, reps: 8,  unit: 'reps' },
  { id: 'leg-press',       name: 'Leg Press',            muscleGroup: 'legs',      sets: 4, reps: 10, unit: 'reps' },
  { id: 'rdl',             name: 'Romanian Deadlift',    muscleGroup: 'legs',      sets: 3, reps: 10, unit: 'reps' },
  { id: 'leg-curl',        name: 'Leg Curl',             muscleGroup: 'legs',      sets: 3, reps: 12, unit: 'reps' },
  { id: 'leg-extension',   name: 'Leg Extension',        muscleGroup: 'legs',      sets: 3, reps: 12, unit: 'reps' },
  { id: 'calf-raise',      name: 'Calf Raise',           muscleGroup: 'legs',      sets: 4, reps: 20, unit: 'reps' },
  { id: 'bulgarian-split', name: 'Bulgarian Split Squat',muscleGroup: 'legs',      sets: 3, reps: 10, unit: 'reps' },

  // ── Core ───────────────────────────────────────────────────
  { id: 'plank',           name: 'Plank',                muscleGroup: 'core',      sets: 3, reps: 60, unit: 'secs' },
  { id: 'crunches',        name: 'Crunches',             muscleGroup: 'core',      sets: 3, reps: 20, unit: 'reps' },
  { id: 'russian-twist',   name: 'Russian Twist',        muscleGroup: 'core',      sets: 3, reps: 20, unit: 'reps' },
  { id: 'leg-raise',       name: 'Leg Raise',            muscleGroup: 'core',      sets: 3, reps: 15, unit: 'reps' },
  { id: 'ab-wheel',        name: 'Ab Wheel Rollout',     muscleGroup: 'core',      sets: 3, reps: 10, unit: 'reps' },
  { id: 'hanging-knee',    name: 'Hanging Knee Raise',   muscleGroup: 'core',      sets: 3, reps: 15, unit: 'reps' },
];
