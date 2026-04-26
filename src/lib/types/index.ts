// ============================================================
//  SB TRACKER — Shared Types
// ============================================================

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';

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
  sessionReps?: Record<string, number[]>; // movementId → actual reps per set (overrides default)
}

// ---- Muscle group metadata ----
export const MUSCLE_META: Record<MuscleGroup, { label: string; color: string; icon: string }> = {
  chest:     { label: 'Chest',     color: 'var(--mg-chest)',     icon: '💪' },
  back:      { label: 'Back',      color: 'var(--mg-back)',      icon: '🏋️' },
  shoulders: { label: 'Shoulders', color: 'var(--mg-shoulders)', icon: '🔥' },
  arms:      { label: 'Arms',      color: 'var(--mg-arms)',      icon: '⚡' },
  legs:      { label: 'Legs',      color: 'var(--mg-legs)',      icon: '🦵' },
  core:      { label: 'Core',      color: 'var(--mg-core)',      icon: '🎯' },
};

export const MUSCLE_GROUPS: MuscleGroup[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'];

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_FULL  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
