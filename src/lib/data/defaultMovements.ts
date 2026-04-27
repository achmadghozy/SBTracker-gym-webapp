import type { Movement } from '../types';

// ============================================================
//  Default movement library — 36 exercises across 15 muscle groups
//  Volume (sets/reps) is determined per session, not stored here
// ============================================================

export const defaultMovements: Movement[] = [

  // ── Chest ──────────────────────────────────────────────────
  { id: 'bench-press',       name: 'Bench Press',            muscleGroup: 'chest'      },
  { id: 'incline-bench',     name: 'Incline Bench Press',    muscleGroup: 'chest'      },
  { id: 'decline-bench',     name: 'Decline Bench Press',    muscleGroup: 'chest'      },
  { id: 'dumbbell-fly',      name: 'Dumbbell Fly',           muscleGroup: 'chest'      },
  { id: 'cable-crossover',   name: 'Cable Crossover',        muscleGroup: 'chest'      },
  { id: 'chest-dips',        name: 'Chest Dips',             muscleGroup: 'chest'      },
  { id: 'push-up',           name: 'Push-Up',                muscleGroup: 'chest'      },
  { id: 'machine-chest',     name: 'Machine Chest Press',    muscleGroup: 'chest'      },
  { id: 'pec-deck',          name: 'Pec Deck Fly',           muscleGroup: 'chest'      },

  // ── Lats ───────────────────────────────────────────────────
  { id: 'pull-up',           name: 'Pull-Up',                muscleGroup: 'lats'       },
  { id: 'lat-pulldown',      name: 'Lat Pulldown',           muscleGroup: 'lats'       },
  { id: 'vbar-pulldown',     name: 'V-Bar Pulldown',         muscleGroup: 'lats'       },
  { id: 'straight-arm-pd',   name: 'Straight-Arm Pulldown',  muscleGroup: 'lats'       },
  { id: 'single-arm-row',    name: 'Single Arm DB Row',      muscleGroup: 'lats'       },
  { id: 'machine-pulldown',  name: 'Machine Pulldown',       muscleGroup: 'lats'       },

  // ── Upper Back ─────────────────────────────────────────────
  { id: 'bent-over-row',     name: 'Bent Over Row',          muscleGroup: 'upper-back' },
  { id: 'seated-row',        name: 'Seated Cable Row',       muscleGroup: 'upper-back' },
  { id: 'tbar-row',          name: 'T-Bar Row',              muscleGroup: 'upper-back' },
  { id: 'chest-supported-row', name: 'Chest-Supported Row',  muscleGroup: 'upper-back' },
  { id: 'pendlay-row',       name: 'Pendlay Row',            muscleGroup: 'upper-back' },
  { id: 'shrugs',            name: 'Barbell Shrugs',         muscleGroup: 'upper-back' },

  // ── Lower Back ─────────────────────────────────────────────
  { id: 'deadlift',          name: 'Deadlift',               muscleGroup: 'lower-back' },
  { id: 'rack-pull',         name: 'Rack Pull',              muscleGroup: 'lower-back' },
  { id: 'hyperextension',    name: 'Back Extension',         muscleGroup: 'lower-back' },
  { id: 'good-morning',      name: 'Good Morning',           muscleGroup: 'lower-back' },

  // ── Front Delt ─────────────────────────────────────────────
  { id: 'ohp',               name: 'Overhead Press',         muscleGroup: 'front-delt' },
  { id: 'arnold-press',      name: 'Arnold Press',           muscleGroup: 'front-delt' },
  { id: 'machine-shoulder',  name: 'Machine Shoulder Press', muscleGroup: 'front-delt' },
  { id: 'front-raise',       name: 'Front Raise',            muscleGroup: 'front-delt' },

  // ── Side Delt ──────────────────────────────────────────────
  { id: 'lateral-raise',     name: 'Lateral Raise',          muscleGroup: 'side-delt'  },
  { id: 'cable-lateral',     name: 'Cable Lateral Raise',    muscleGroup: 'side-delt'  },
  { id: 'machine-lateral',   name: 'Machine Lateral Raise',  muscleGroup: 'side-delt'  },
  { id: 'upright-row',       name: 'Upright Row',            muscleGroup: 'side-delt'  },

  // ── Rear Delt ──────────────────────────────────────────────
  { id: 'rear-delt-fly',     name: 'Rear Delt Fly',          muscleGroup: 'rear-delt'  },
  { id: 'machine-rear-delt', name: 'Machine Reverse Fly',    muscleGroup: 'rear-delt'  },
  { id: 'face-pull',         name: 'Face Pull',              muscleGroup: 'rear-delt'  },
  { id: 'reverse-cable-fly', name: 'Reverse Cable Fly',      muscleGroup: 'rear-delt'  },

  // ── Biceps ─────────────────────────────────────────────────
  { id: 'bicep-curl',        name: 'Bicep Curl',             muscleGroup: 'biceps'     },
  { id: 'hammer-curl',       name: 'Hammer Curl',            muscleGroup: 'biceps'     },
  { id: 'cable-curl',        name: 'Cable Curl',             muscleGroup: 'biceps'     },
  { id: 'preacher-curl',     name: 'Preacher Curl',          muscleGroup: 'biceps'     },
  { id: 'incline-curl',      name: 'Incline Dumbbell Curl',  muscleGroup: 'biceps'     },
  { id: 'spider-curl',       name: 'Spider Curl',            muscleGroup: 'biceps'     },

  // ── Triceps ────────────────────────────────────────────────
  { id: 'tricep-pushdown',   name: 'Tricep Pushdown',        muscleGroup: 'triceps'    },
  { id: 'rope-pushdown',     name: 'Rope Pushdown',          muscleGroup: 'triceps'    },
  { id: 'skull-crusher',     name: 'Skull Crushers',         muscleGroup: 'triceps'    },
  { id: 'close-grip-bench',  name: 'Close-Grip Bench Press', muscleGroup: 'triceps'    },
  { id: 'dumbbell-kickback', name: 'Tricep Kickback',        muscleGroup: 'triceps'    },
  { id: 'overhead-tricep',   name: 'Overhead Tricep Ext.',   muscleGroup: 'triceps'    },
  { id: 'tricep-dips',       name: 'Tricep Dips',            muscleGroup: 'triceps'    },

  // ── Forearms ───────────────────────────────────────────────
  { id: 'wrist-curl',        name: 'Wrist Curl',             muscleGroup: 'forearms'   },
  { id: 'reverse-wrist-curl',name: 'Reverse Wrist Curl',     muscleGroup: 'forearms'   },
  { id: 'reverse-curl',      name: 'Reverse Barbell Curl',   muscleGroup: 'forearms'   },
  { id: 'farmers-walk',      name: 'Farmer\'s Walk',         muscleGroup: 'forearms'   },

  // ── Quads ──────────────────────────────────────────────────
  { id: 'squat',             name: 'Squat',                  muscleGroup: 'quads'      },
  { id: 'front-squat',       name: 'Front Squat',            muscleGroup: 'quads'      },
  { id: 'goblet-squat',      name: 'Goblet Squat',           muscleGroup: 'quads'      },
  { id: 'leg-press',         name: 'Leg Press',              muscleGroup: 'quads'      },
  { id: 'leg-extension',     name: 'Leg Extension',          muscleGroup: 'quads'      },
  { id: 'bulgarian-split',   name: 'Bulgarian Split Squat',  muscleGroup: 'quads'      },
  { id: 'hack-squat',        name: 'Hack Squat',             muscleGroup: 'quads'      },

  // ── Hamstrings ─────────────────────────────────────────────
  { id: 'rdl',               name: 'Romanian Deadlift',      muscleGroup: 'hamstrings' },
  { id: 'leg-curl',          name: 'Leg Curl',               muscleGroup: 'hamstrings' },
  { id: 'seated-leg-curl',   name: 'Seated Leg Curl',        muscleGroup: 'hamstrings' },
  { id: 'nordic-curl',       name: 'Nordic Curl',            muscleGroup: 'hamstrings' },
  { id: 'stiff-leg-dl',      name: 'Stiff-Leg Deadlift',     muscleGroup: 'hamstrings' },
  { id: 'glute-ham-raise',   name: 'Glute-Ham Raise',        muscleGroup: 'hamstrings' },

  // ── Glutes ─────────────────────────────────────────────────
  { id: 'hip-thrust',        name: 'Hip Thrust',             muscleGroup: 'glutes'     },
  { id: 'glute-bridge',      name: 'Glute Bridge',           muscleGroup: 'glutes'     },
  { id: 'sumo-deadlift',     name: 'Sumo Deadlift',          muscleGroup: 'glutes'     },
  { id: 'cable-kickback',    name: 'Cable Glute Kickback',   muscleGroup: 'glutes'     },
  { id: 'step-ups',          name: 'Step-Ups',               muscleGroup: 'glutes'     },

  // ── Calves ─────────────────────────────────────────────────
  { id: 'calf-raise',        name: 'Standing Calf Raise',    muscleGroup: 'calves'     },
  { id: 'seated-calf',       name: 'Seated Calf Raise',      muscleGroup: 'calves'     },
  { id: 'leg-press-calf',    name: 'Leg Press Calf Raise',   muscleGroup: 'calves'     },
  { id: 'donkey-calf',       name: 'Donkey Calf Raise',      muscleGroup: 'calves'     },

  // ── Core ───────────────────────────────────────────────────
  { id: 'plank',             name: 'Plank',                  muscleGroup: 'core'       },
  { id: 'crunches',          name: 'Crunches',               muscleGroup: 'core'       },
  { id: 'decline-crunch',    name: 'Decline Crunch',         muscleGroup: 'core'       },
  { id: 'russian-twist',     name: 'Russian Twist',          muscleGroup: 'core'       },
  { id: 'cable-crunch',      name: 'Cable Crunch',           muscleGroup: 'core'       },
  { id: 'leg-raise',         name: 'Leg Raise',              muscleGroup: 'core'       },
  { id: 'hanging-knee',      name: 'Hanging Knee Raise',     muscleGroup: 'core'       },
  { id: 'ab-wheel',          name: 'Ab Wheel Rollout',       muscleGroup: 'core'       },
  { id: 'woodchoppers',      name: 'Cable Woodchoppers',     muscleGroup: 'core'       },
];
