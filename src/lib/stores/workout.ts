import { writable, derived } from 'svelte/store';
import type { Movement, WorkoutPlan, DailyLog } from '../types';
import { defaultMovements } from '../data/defaultMovements';
import type { PlanTemplate } from '../data/planTemplates';
import { get, set } from 'idb-keyval';

// ============================================================
//  Helpers
// ============================================================

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns 0–13 (Mon–Sun across 2 weeks).
 *  Odd ISO week  → Week 1 (days 0–6)
 *  Even ISO week → Week 2 (days 7–13)
 */
export function todayDayIndex(): number {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const dayInWeek = dow === 0 ? 6 : dow - 1; // 0=Mon…6=Sun

  // ISO week number
  const tmp = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const isoWeek = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  const isWeek2 = isoWeek % 2 === 0;
  return isWeek2 ? dayInWeek + 7 : dayInWeek;
}

/** Returns 1 or 2 — which plan-week applies today. */
export function currentPlanWeek(): 1 | 2 {
  return todayDayIndex() >= 7 ? 2 : 1;
}

// ============================================================
//  Default PPL workout plan
// ============================================================

function defaultPlan(): WorkoutPlan {
  // Week 1 (days 0-6) and Week 2 (days 7-13) — PPL repeated
  const week1 = [
    { dayIndex: 0, label: 'Push', isRest: false, movementIds: ['bench-press', 'incline-bench', 'dumbbell-fly', 'ohp', 'lateral-raise', 'tricep-pushdown'] },
    { dayIndex: 1, label: 'Pull', isRest: false, movementIds: ['deadlift', 'pull-up', 'lat-pulldown', 'bent-over-row', 'bicep-curl', 'hammer-curl'] },
    { dayIndex: 2, label: 'Legs', isRest: false, movementIds: ['squat', 'leg-press', 'rdl', 'leg-curl', 'leg-extension', 'calf-raise'] },
    { dayIndex: 3, label: 'Rest', isRest: true, movementIds: [] },
    { dayIndex: 4, label: 'Push', isRest: false, movementIds: ['bench-press', 'incline-bench', 'ohp', 'lateral-raise', 'skull-crusher', 'tricep-pushdown'] },
    { dayIndex: 5, label: 'Pull + Core', isRest: false, movementIds: ['pull-up', 'lat-pulldown', 'seated-row', 'bicep-curl', 'plank', 'russian-twist'] },
    { dayIndex: 6, label: 'Rest', isRest: true, movementIds: [] },
  ];
  const week2 = week1.map(d => ({ ...d, dayIndex: d.dayIndex + 7 }));
  return { days: [...week1, ...week2] };
}

// ============================================================
//  Stores & Persistence
// ============================================================

export const isReady = writable(false);
export const movements = writable<Movement[]>(defaultMovements);
export const workoutPlan = writable<WorkoutPlan>(defaultPlan());
export const dailyLogs = writable<DailyLog[]>([]);
export const customTemplates = writable<PlanTemplate[]>([]);

async function initStore<T>(key: string, fallback: T, store: ReturnType<typeof writable<T>>) {
  const dbVal = await get<T>(key);
  let finalVal: T;

  if (dbVal === undefined) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        finalVal = JSON.parse(raw) as T;
        localStorage.removeItem(key); // clear legacy storage
      } catch {
        finalVal = fallback;
      }
    } else {
      finalVal = fallback;
    }
  } else {
    finalVal = dbVal as T;
  }
  store.set(finalVal);
}

Promise.all([
  initStore('sb-movements', defaultMovements, movements),
  initStore('sb-plan', defaultPlan(), workoutPlan),
  initStore('sb-logs', [], dailyLogs),
  initStore('sb-custom-templates', [], customTemplates)
]).then(() => {
  isReady.set(true);

  movements.subscribe(val => set('sb-movements', JSON.parse(JSON.stringify(val))).catch(console.error));
  workoutPlan.subscribe(val => set('sb-plan', JSON.parse(JSON.stringify(val))).catch(console.error));
  dailyLogs.subscribe(val => set('sb-logs', JSON.parse(JSON.stringify(val))).catch(console.error));
  customTemplates.subscribe(val => set('sb-custom-templates', JSON.parse(JSON.stringify(val))).catch(console.error));
});

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

/** Replace the entire workout plan with a new set of days (e.g. from a template). */
export function applyPlanTemplate(days: WorkoutPlan['days']) {
  workoutPlan.set({ days });
}

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

export function reorderMovementInDay(dayIndex: number, movementId: string, direction: 'up' | 'down') {
  workoutPlan.update(plan => ({
    ...plan,
    days: plan.days.map(d => {
      if (d.dayIndex !== dayIndex) return d;
      const idx = d.movementIds.indexOf(movementId);
      if (idx === -1) return d;
      const newIds = [...d.movementIds];
      if (direction === 'up' && idx > 0) {
        [newIds[idx - 1], newIds[idx]] = [newIds[idx], newIds[idx - 1]];
      } else if (direction === 'down' && idx < newIds.length - 1) {
        [newIds[idx + 1], newIds[idx]] = [newIds[idx], newIds[idx + 1]];
      }
      return { ...d, movementIds: newIds };
    })
  }));
}

export function saveCustomTemplate(name: string, description: string, days: WorkoutPlan['days']) {
  const id = `custom-${Date.now()}`;
  const tpl: PlanTemplate = {
    id,
    name,
    description,
    icon: '⭐',
    schedule: 'Custom',
    difficulty: 'Intermediate',
    // Must clone days deeply so mutations don't leak
    days: JSON.parse(JSON.stringify(days))
  };
  customTemplates.update(ts => [...ts, tpl]);
}

export function deleteCustomTemplate(id: string) {
  customTemplates.update(ts => ts.filter(t => t.id !== id));
}

// ============================================================
//  Actions — Daily Log
// ============================================================

/** Add one set to a movement (increments completedSets by 1). */
export function addSet(movementId: string) {
  const today = todayStr();
  dailyLogs.update(logs => {
    const existing = logs.find(l => l.date === today);
    if (existing) {
      return logs.map(l =>
        l.date === today
          ? { ...l, completedSets: { ...l.completedSets, [movementId]: (l.completedSets[movementId] ?? 0) + 1 } }
          : l
      );
    } else {
      return [...logs, { date: today, completedSets: { [movementId]: 1 }, weights: {}, sessionReps: {} }];
    }
  });
}

/** Remove the last logged set for a movement (decrements count, clears that set's weight/reps). */
export function removeLastSet(movementId: string) {
  const today = todayStr();
  dailyLogs.update(logs => {
    const existing = logs.find(l => l.date === today);
    if (!existing) return logs;
    const current = existing.completedSets[movementId] ?? 0;
    if (current <= 0) return logs;
    const next = current - 1;
    return logs.map(l => {
      if (l.date !== today) return l;
      const newWeights = [...(l.weights?.[movementId] ?? [])]; newWeights.splice(next, 1);
      const newSessReps = [...(l.sessionReps?.[movementId] ?? [])]; newSessReps.splice(next, 1);
      return {
        ...l,
        completedSets: { ...l.completedSets, [movementId]: next },
        weights: { ...l.weights, [movementId]: newWeights },
        sessionReps: { ...(l.sessionReps ?? {}), [movementId]: newSessReps },
      };
    });
  });
}

/**
 * Legacy: tap on set N (1-indexed) to toggle complete/undo.
 * Kept for backward-compat with any existing call-sites.
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
