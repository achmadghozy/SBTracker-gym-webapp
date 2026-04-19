import { writable, derived } from 'svelte/store';
import type { Movement, WorkoutPlan, DailyLog } from '../types';
import { defaultMovements } from '../data/defaultMovements';

// ============================================================
//  Helpers
// ============================================================

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist<T>(key: string, store: ReturnType<typeof writable<T>>) {
  store.subscribe(val => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* noop */ }
  });
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** JS getDay() returns 0=Sun…6=Sat → convert to 0=Mon…6=Sun */
export function todayDayIndex(): number {
  const js = new Date().getDay(); // 0=Sun
  return js === 0 ? 6 : js - 1;
}

// ============================================================
//  Default PPL workout plan
// ============================================================

function defaultPlan(): WorkoutPlan {
  return {
    days: [
      { dayIndex: 0, label: 'Push',        isRest: false, movementIds: ['bench-press', 'incline-bench', 'dumbbell-fly', 'ohp', 'lateral-raise', 'tricep-pushdown'] },
      { dayIndex: 1, label: 'Pull',        isRest: false, movementIds: ['deadlift', 'pull-up', 'lat-pulldown', 'bent-over-row', 'bicep-curl', 'hammer-curl'] },
      { dayIndex: 2, label: 'Legs',        isRest: false, movementIds: ['squat', 'leg-press', 'rdl', 'leg-curl', 'leg-extension', 'calf-raise'] },
      { dayIndex: 3, label: 'Rest',        isRest: true,  movementIds: [] },
      { dayIndex: 4, label: 'Push',        isRest: false, movementIds: ['bench-press', 'incline-bench', 'ohp', 'lateral-raise', 'skull-crusher', 'tricep-pushdown'] },
      { dayIndex: 5, label: 'Pull + Core', isRest: false, movementIds: ['pull-up', 'lat-pulldown', 'seated-row', 'bicep-curl', 'plank', 'russian-twist'] },
      { dayIndex: 6, label: 'Rest',        isRest: true,  movementIds: [] },
    ],
  };
}

// ============================================================
//  Stores
// ============================================================

export const movements = writable<Movement[]>(
  load('sb-movements', defaultMovements)
);
persist('sb-movements', movements);

export const workoutPlan = writable<WorkoutPlan>(
  load('sb-plan', defaultPlan())
);
persist('sb-plan', workoutPlan);

export const dailyLogs = writable<DailyLog[]>(
  load('sb-logs', [])
);
persist('sb-logs', dailyLogs);

// ---- Derived: today's log ----
export const todayLog = derived(dailyLogs, ($logs) => {
  const today = todayStr();
  const log = $logs.find(l => l.date === today);
  return log
    ? { ...log, weights: log.weights ?? {}, sessionReps: log.sessionReps ?? {} }
    : { date: today, completedSets: {}, weights: {}, sessionReps: {} };
});

// ---- Derived: last logged weight per movement (across all sessions) ----
// Scans logs newest-first so the first match per movement is the most recent.
export const lastWeights = derived(dailyLogs, ($logs) => {
  const result: Record<string, number> = {};
  const sorted = [...$logs].sort((a, b) => b.date.localeCompare(a.date));
  for (const log of sorted) {
    const weights = log.weights ?? {};
    for (const [movId, wArr] of Object.entries(weights)) {
      if (!(movId in result)) {
        const lastW = [...wArr].reverse().find(w => w > 0);
        if (lastW !== undefined) result[movId] = lastW;
      }
    }
  }
  return result;
});

// ---- Derived: last logged reps per movement (across all sessions) ----
export const lastReps = derived(dailyLogs, ($logs) => {
  const result: Record<string, number> = {};
  const sorted = [...$logs].sort((a, b) => b.date.localeCompare(a.date));
  for (const log of sorted) {
    const sReps = log.sessionReps ?? {};
    for (const [movId, rArr] of Object.entries(sReps)) {
      if (!(movId in result)) {
        const lastR = [...rArr].reverse().find(r => r > 0);
        if (lastR !== undefined) result[movId] = lastR;
      }
    }
  }
  return result;
});

// ============================================================
//  Actions — Movements
// ============================================================

export function addMovement(m: Movement) {
  movements.update(ms => [...ms, m]);
}

export function updateMovement(id: string, patch: Partial<Movement>) {
  movements.update(ms => ms.map(m => (m.id === id ? { ...m, ...patch } : m)));
}

export function deleteMovement(id: string) {
  movements.update(ms => ms.filter(m => m.id !== id));
  // Also remove from plan
  workoutPlan.update(plan => ({
    ...plan,
    days: plan.days.map(d => ({ ...d, movementIds: d.movementIds.filter(mid => mid !== id) })),
  }));
}

// ============================================================
//  Actions — Workout Plan
// ============================================================

export function updateDay(dayIndex: number, patch: Partial<WorkoutPlan['days'][0]>) {
  workoutPlan.update(plan => ({
    ...plan,
    days: plan.days.map(d => (d.dayIndex === dayIndex ? { ...d, ...patch } : d)),
  }));
}

export function addMovementToDay(dayIndex: number, movementId: string) {
  workoutPlan.update(plan => ({
    ...plan,
    days: plan.days.map(d =>
      d.dayIndex === dayIndex && !d.movementIds.includes(movementId)
        ? { ...d, movementIds: [...d.movementIds, movementId] }
        : d
    ),
  }));
}

export function removeMovementFromDay(dayIndex: number, movementId: string) {
  workoutPlan.update(plan => ({
    ...plan,
    days: plan.days.map(d =>
      d.dayIndex === dayIndex
        ? { ...d, movementIds: d.movementIds.filter(id => id !== movementId) }
        : d
    ),
  }));
}

// ============================================================
//  Actions — Daily Log
// ============================================================

/**
 * Tap on set N (1-indexed) to toggle:
 * - If completedSets < N → advance to N
 * - If completedSets === N → decrease to N-1 (undo)
 */
export function tapSet(movementId: string, setNum: number) {
  const today = todayStr();
  dailyLogs.update(logs => {
    const existing = logs.find(l => l.date === today);
    const current = existing?.completedSets[movementId] ?? 0;
    const next = current === setNum ? setNum - 1 : setNum;

    if (existing) {
      return logs.map(l =>
        l.date === today
          ? { ...l, completedSets: { ...l.completedSets, [movementId]: next } }
          : l
      );
    } else {
      return [...logs, { date: today, completedSets: { [movementId]: next }, weights: {}, sessionReps: {} }];
    }
  });
}

/**
 * Log the weight used for a specific set (1-indexed setNum).
 */
export function logWeight(movementId: string, setNum: number, weight: number) {
  const today = todayStr();
  dailyLogs.update(logs => {
    const existing = logs.find(l => l.date === today);

    const patch = (prev: number[]): number[] => {
      const arr = [...(prev ?? [])];
      arr[setNum - 1] = weight;
      return arr;
    };

    if (existing) {
      return logs.map(l =>
        l.date === today
          ? { ...l, weights: { ...(l.weights ?? {}), [movementId]: patch((l.weights ?? {})[movementId] ?? []) } }
          : l
      );
    } else {
      const arr: number[] = [];
      arr[setNum - 1] = weight;
      return [...logs, { date: today, completedSets: {}, weights: { [movementId]: arr }, sessionReps: {} }];
    }
  });
}

/**
 * Log the actual reps performed for a specific set (1-indexed setNum).
 * Only stored when it differs from the movement's default; always stored for history.
 */
export function logReps(movementId: string, setNum: number, reps: number) {
  const today = todayStr();
  dailyLogs.update(logs => {
    const existing = logs.find(l => l.date === today);

    const patch = (prev: number[]): number[] => {
      const arr = [...(prev ?? [])];
      arr[setNum - 1] = reps;
      return arr;
    };

    if (existing) {
      return logs.map(l =>
        l.date === today
          ? {
              ...l,
              sessionReps: {
                ...(l.sessionReps ?? {}),
                [movementId]: patch((l.sessionReps ?? {})[movementId] ?? []),
              },
            }
          : l
      );
    } else {
      const arr: number[] = [];
      arr[setNum - 1] = reps;
      return [...logs, { date: today, completedSets: {}, weights: {}, sessionReps: { [movementId]: arr } }];
    }
  });
}
