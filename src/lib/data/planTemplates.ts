import type { WorkoutPlan } from '../types';

// ============================================================
//  Workout Plan Templates
//  dayIndex 0–6  = Week 1 Mon–Sun
//  dayIndex 7–13 = Week 2 Mon–Sun
// ============================================================

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  schedule: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  days: WorkoutPlan['days'];
}

// ── Movement pools (by movement ID) ──────────────────────────
// Push = chest + front delt + side delt + triceps
const PUSH_MOVES = [
  'bench-press', 'incline-bench', 'ohp',
  'lateral-raise', 'front-raise', 'tricep-pushdown', 'skull-crusher',
];
// Pull = lats + upper-back + rear-delt + biceps
const PULL_MOVES = [
  'pull-up', 'lat-pulldown', 'bent-over-row', 'seated-row',
  'face-pull', 'bicep-curl', 'hammer-curl',
];
// Legs = quads + hamstrings + glutes + calves
const LEGS_MOVES = [
  'squat', 'leg-press', 'rdl', 'leg-curl', 'hip-thrust', 'calf-raise',
];
// Upper = balanced chest/back/shoulder/arms
const UPPER_MOVES = [
  'bench-press', 'ohp', 'bent-over-row', 'lat-pulldown',
  'lateral-raise', 'bicep-curl', 'tricep-pushdown',
];
// Full Body A — compound emphasis
const FB_A_MOVES = [
  'bench-press', 'bent-over-row', 'squat', 'ohp',
  'bicep-curl', 'tricep-pushdown', 'plank',
];
// Full Body B — variety / isolation emphasis
const FB_B_MOVES = [
  'incline-bench', 'lat-pulldown', 'leg-press', 'lateral-raise',
  'hammer-curl', 'skull-crusher', 'crunches',
];
// Push + Legs combined
const PPL_PLUS_PUSH = [
  'bench-press', 'incline-bench', 'ohp', 'lateral-raise',
  'tricep-pushdown', 'squat', 'calf-raise',
];
// Pull + Legs combined
const PPL_PLUS_PULL = [
  'deadlift', 'pull-up', 'lat-pulldown', 'bent-over-row',
  'bicep-curl', 'rdl', 'leg-curl',
];

// Bro split pools
const CHEST_MOVES = ['bench-press', 'incline-bench', 'dumbbell-fly', 'cable-crossover', 'chest-dips'];
const BACK_MOVES = ['deadlift', 'pull-up', 'bent-over-row', 'lat-pulldown', 'seated-row', 'face-pull'];
const SHLDR_MOVES = ['ohp', 'lateral-raise', 'front-raise', 'rear-delt-fly', 'arnold-press'];
const ARMS_MOVES = ['bicep-curl', 'hammer-curl', 'preacher-curl', 'tricep-pushdown', 'skull-crusher'];
const LEGS_BRO = ['squat', 'leg-press', 'rdl', 'leg-curl', 'leg-extension', 'hip-thrust', 'calf-raise'];
const CORE_MOVES = ['plank', 'crunches', 'russian-twist', 'leg-raise', 'ab-wheel'];

// ── Helpers ───────────────────────────────────────────────────
function rest(dayIndex: number): WorkoutPlan['days'][0] {
  return { dayIndex, label: 'Rest', isRest: true, movementIds: [] };
}
function workout(dayIndex: number, label: string, movementIds: string[]): WorkoutPlan['days'][0] {
  return { dayIndex, label, isRest: false, movementIds };
}

// ─────────────────────────────────────────────────────────────
//  1. Full Body Every Other Day
// ─────────────────────────────────────────────────────────────
const fullBodyEOD: PlanTemplate = {
  id: 'full-body-eod',
  name: 'Full Body Every Other Day',
  description: 'Trains the entire body in each session. Alternates Full Body A & B with a rest day between every workout.',
  icon: '🌐',
  schedule: '3 days/week · 2-week cycle',
  difficulty: 'Beginner',
  days: [
    workout(0, 'Full Body A', FB_A_MOVES),
    rest(1),
    workout(2, 'Full Body B', FB_B_MOVES),
    rest(3),
    workout(4, 'Full Body A', FB_A_MOVES),
    rest(5),
    rest(6),
    workout(7, 'Full Body B', FB_B_MOVES),
    rest(8),
    workout(9, 'Full Body A', FB_A_MOVES),
    rest(10),
    workout(11, 'Full Body B', FB_B_MOVES),
    rest(12),
    rest(13),
  ],
};

// ─────────────────────────────────────────────────────────────
//  2. Upper / Lower
// ─────────────────────────────────────────────────────────────
const upperLower: PlanTemplate = {
  id: 'upper-lower',
  name: 'Upper / Lower',
  description: 'Alternates upper and lower body days. Great for balanced development and recovery.',
  icon: '↕️',
  schedule: '4 days/week · 2-week cycle',
  difficulty: 'Intermediate',
  days: [
    workout(0, 'Upper', UPPER_MOVES),
    workout(1, 'Lower', LEGS_MOVES),
    workout(2, 'Upper', UPPER_MOVES),
    workout(3, 'Lower', LEGS_MOVES),
    workout(4, 'Upper', UPPER_MOVES),
    workout(5, 'Lower', LEGS_MOVES),
    workout(6, 'Upper', UPPER_MOVES),
    workout(7, 'Lower', LEGS_MOVES),
    workout(8, 'Upper', UPPER_MOVES),
    workout(9, 'Lower', LEGS_MOVES),
    workout(10, 'Upper', UPPER_MOVES),
    workout(11, 'Lower', LEGS_MOVES),
    workout(12, 'Upper', UPPER_MOVES),
    workout(13, 'Lower', LEGS_MOVES),
  ],
};

// ─────────────────────────────────────────────────────────────
//  3. Bro Split
// ─────────────────────────────────────────────────────────────
const broSplit: PlanTemplate = {
  id: 'bro-split',
  name: 'Bro Split',
  description: 'One muscle group per day. Maximum volume per muscle with full weekly recovery.',
  icon: '💪',
  schedule: '5–6 days/week · weekly cycle',
  difficulty: 'Intermediate',
  days: [
    workout(0, 'Chest', CHEST_MOVES),
    workout(1, 'Back', BACK_MOVES),
    workout(2, 'Shoulders', SHLDR_MOVES),
    workout(3, 'Arms', ARMS_MOVES),
    workout(4, 'Legs', LEGS_BRO),
    workout(5, 'Core', CORE_MOVES),
    rest(6),
    workout(7, 'Chest', CHEST_MOVES),
    workout(8, 'Back', BACK_MOVES),
    workout(9, 'Shoulders', SHLDR_MOVES),
    workout(10, 'Arms', ARMS_MOVES),
    workout(11, 'Legs', LEGS_BRO),
    workout(12, 'Core', CORE_MOVES),
    rest(13),
  ],
};

// ─────────────────────────────────────────────────────────────
//  4. Push / Pull / Legs
// ─────────────────────────────────────────────────────────────
const pushPullLegs: PlanTemplate = {
  id: 'push-pull-legs',
  name: 'Push / Pull / Legs',
  description: 'The classic PPL. Each muscle group hits twice per week across a 2-week rotating cycle.',
  icon: '🔄',
  schedule: '6 days/week · 2-week cycle',
  difficulty: 'Advanced',
  days: [
    workout(0, 'Push', PUSH_MOVES),
    workout(1, 'Pull', PULL_MOVES),
    workout(2, 'Legs', LEGS_MOVES),
    workout(3, 'Push', PUSH_MOVES),
    workout(4, 'Pull', PULL_MOVES),
    workout(5, 'Legs', LEGS_MOVES),
    rest(6),
    workout(7, 'Push', PUSH_MOVES),
    workout(8, 'Pull', PULL_MOVES),
    workout(9, 'Legs', LEGS_MOVES),
    workout(10, 'Push', PUSH_MOVES),
    workout(11, 'Pull', PULL_MOVES),
    workout(12, 'Legs', LEGS_MOVES),
    rest(13),
  ],
};

// ─────────────────────────────────────────────────────────────
//  5. Push / Pull (legs included in each session)
// ─────────────────────────────────────────────────────────────
const pushPull: PlanTemplate = {
  id: 'push-pull',
  name: 'Push / Pull',
  description: 'Push and Pull sessions each include compound leg movements, training the full body in just 2 day types.',
  icon: '⚡',
  schedule: '4 days/week · 2-week cycle',
  difficulty: 'Intermediate',
  days: [
    workout(0, 'Push + Legs', PPL_PLUS_PUSH),
    workout(1, 'Pull + Legs', PPL_PLUS_PULL),
    rest(2),
    workout(3, 'Push + Legs', PPL_PLUS_PUSH),
    workout(4, 'Pull + Legs', PPL_PLUS_PULL),
    rest(5),
    rest(6),
    workout(7, 'Push + Legs', PPL_PLUS_PUSH),
    workout(8, 'Pull + Legs', PPL_PLUS_PULL),
    rest(9),
    workout(10, 'Push + Legs', PPL_PLUS_PUSH),
    workout(11, 'Pull + Legs', PPL_PLUS_PULL),
    rest(12),
    rest(13),
  ],
};

// ─────────────────────────────────────────────────────────────
export const PLAN_TEMPLATES: PlanTemplate[] = [
  fullBodyEOD,
  upperLower,
  broSplit,
  pushPullLegs,
  pushPull,
];
