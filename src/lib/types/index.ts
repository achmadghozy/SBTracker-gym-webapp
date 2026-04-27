// ============================================================
//  SB TRACKER — Shared Types
// ============================================================

export type MuscleGroup =
  // Chest
  | 'chest'
  // Back
  | 'lats'
  | 'upper-back'
  | 'lower-back'
  // Shoulders
  | 'front-delt'
  | 'side-delt'
  | 'rear-delt'
  // Arms
  | 'biceps'
  | 'triceps'
  | 'forearms'
  // Legs
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  // Core
  | 'core';

export interface Movement {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom?: boolean;
}

export interface PlanDay {
  dayIndex: number;   // 0–6 = Week 1 Mon–Sun, 7–13 = Week 2 Mon–Sun
  label: string;      // "Push", "Pull", "Legs", "Rest"
  isRest: boolean;
  movementIds: string[];
}

export interface WorkoutPlan {
  days: PlanDay[];
}

export interface DailyLog {
  date: string;                           // "YYYY-MM-DD"
  completedSets: Record<string, number>;  // movementId → sets completed
  weights: Record<string, number[]>;      // movementId → weight per set (kg)
  sessionReps?: Record<string, number[]>; // movementId → actual reps per set
}

// ─── Muscle group metadata ────────────────────────────────────────────────────
export interface MuscleGroupMeta {
  label: string;
  color: string;
  icon: string;  // emoji fallback (used in text contexts, select options, etc.)
}

export const MUSCLE_META: Record<MuscleGroup, MuscleGroupMeta> = {
  // Chest
  chest:        { label: 'Chest',      color: '#f87171', icon: '🫀' },
  // Back
  lats:         { label: 'Lats',       color: '#38bdf8', icon: '🪽' },
  'upper-back': { label: 'Upper Back', color: '#22d3ee', icon: '🔝' },
  'lower-back': { label: 'Lower Back', color: '#67e8f9', icon: '🔙' },
  // Shoulders
  'front-delt': { label: 'Front Delt', color: '#a78bfa', icon: '⬆️' },
  'side-delt':  { label: 'Side Delt',  color: '#c084fc', icon: '↔️' },
  'rear-delt':  { label: 'Rear Delt',  color: '#e879f9', icon: '🔄' },
  // Arms
  biceps:       { label: 'Biceps',     color: '#fb923c', icon: '💪' },
  triceps:      { label: 'Triceps',    color: '#fbbf24', icon: '🦾' },
  forearms:     { label: 'Forearms',   color: '#fcd34d', icon: '✊' },
  // Legs
  quads:        { label: 'Quads',      color: '#4ade80', icon: '🦵' },
  hamstrings:   { label: 'Hamstrings', color: '#34d399', icon: '🦿' },
  glutes:       { label: 'Glutes',     color: '#fb7185', icon: '🍑' },
  calves:       { label: 'Calves',     color: '#a3e635', icon: '🦶' },
  // Core
  core:         { label: 'Core',       color: '#facc15', icon: '🎯' },
};

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'lats', 'upper-back', 'lower-back',
  'front-delt', 'side-delt', 'rear-delt',
  'biceps', 'triceps', 'forearms',
  'quads', 'hamstrings', 'glutes', 'calves',
  'core',
];

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_FULL  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
