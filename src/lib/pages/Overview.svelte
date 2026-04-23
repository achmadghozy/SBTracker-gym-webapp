<script lang="ts">
  import {
    movements,
    workoutPlan,
    todayLog,
    dailyLogs,
    tapSet,
    logWeight,
    logReps,
    lastWeights,
    lastReps,
    todayDayIndex,
  } from "../stores/workout";
  import { MUSCLE_META, DAY_FULL, type Movement } from "../types";

  // ── Computed today data ──────────────────────────────────────
  const now = new Date();
  const dayIdx = todayDayIndex();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Reactive references from stores
  let plan = $derived($workoutPlan.days[dayIdx]);
  let todayMoves = $derived(
    (plan?.movementIds ?? [])
      .map((id) => $movements.find((m) => m.id === id))
      .filter((m): m is Movement => m !== undefined),
  );

  let totalSets = $derived(todayMoves.reduce((s, m) => s + m.sets, 0));
  let completedSets = $derived(
    todayMoves.reduce((s, m) => s + ($todayLog.completedSets[m.id] ?? 0), 0),
  );
  let progress = $derived(
    totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
  );
  let isComplete = $derived(totalSets > 0 && completedSets >= totalSets);

  // Total volume logged today (sum of weight × reps for each completed set)
  let totalVolume = $derived(
    todayMoves.reduce((vol, m) => {
      const done = $todayLog.completedSets[m.id] ?? 0;
      const weights = $todayLog.weights[m.id] ?? [];
      for (let i = 0; i < done; i++) {
        vol += (weights[i] ?? 0) * m.reps;
      }
      return vol;
    }, 0),
  );

  // ── Weight + Reps logging sheet ─────────────────────────────
  let sheetMove = $state<Movement | null>(null);
  let sheetSetNum = $state(0); // 1-indexed
  let sheetWeight = $state(0);
  let sheetReps = $state(0); // actual reps for this set

  function openWeightSheet(move: Movement, setNum: number) {
    sheetMove = move;
    sheetSetNum = setNum;
    // Weight pre-fill: today set → today prev set → last session → 0
    const todayWArr = $todayLog.weights[move.id] ?? [];
    sheetWeight =
      todayWArr[setNum - 1] ??
      todayWArr[setNum - 2] ??
      $lastWeights[move.id] ??
      0;
    // Reps pre-fill: today's logged reps → last session's reps → movement default
    const todayRArr = ($todayLog.sessionReps ?? {})[move.id] ?? [];
    sheetReps =
      todayRArr[setNum - 1] ??
      todayRArr[setNum - 2] ??
      $lastReps[move.id] ??
      move.reps;
  }

  function closeSheet() {
    sheetMove = null;
  }

  function confirmSet() {
    if (!sheetMove) return;
    if (sheetWeight > 0) logWeight(sheetMove.id, sheetSetNum, sheetWeight);
    // Always log reps (even if default, for history tracking)
    logReps(sheetMove.id, sheetSetNum, sheetReps);
    const currentDone = $todayLog.completedSets[sheetMove.id] ?? 0;
    if (currentDone < sheetSetNum) tapSet(sheetMove.id, sheetSetNum);
    closeSheet();
  }

  function undoSet(movId: string, setNum: number) {
    tapSet(movId, setNum);
  }
  function adjustWeight(delta: number) {
    sheetWeight = Math.max(0, sheetWeight + delta);
  }
  function adjustReps(delta: number) {
    sheetReps = Math.max(1, sheetReps + delta);
  }

  // ── Progress sheet ───────────────────────────────────────────
  let progressMove = $state<Movement | null>(null);

  function openProgress(move: Movement) {
    progressMove = move;
  }

  function closeProgress() {
    progressMove = null;
  }

  // Returns exactly 7 entries — Mon through Sun of the current week.
  // Each entry has data if that day had a logged weight for this movement.
  interface WeekDay {
    date: string;
    dayLabel: string;
    isToday: boolean;
    hasData: boolean;
    hasReps: boolean;
    maxWeight: number;
    avgWeight: number;
    maxReps: number;
    avgReps: number;
    totalReps: number;
    sets: number;
    weights: number[];
    reps: number[];
  }

  function getWeekProgress(movId: string): WeekDay[] {
    const today = new Date();
    const dow = today.getDay();
    const diffToMon = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    monday.setHours(0, 0, 0, 0);

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return labels.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const log = $dailyLogs.find((l) => l.date === key);
      const allW = log?.weights?.[movId] ?? [];
      const nonZ = allW.filter((x) => x > 0);
      // Reps: session reps if logged, else movement default for any completed set
      const allR = (log?.sessionReps ?? {})[movId] ?? [];
      const nonZR = allR.filter((x) => x > 0);
      const completedCount = log?.completedSets[movId] ?? 0;
      return {
        date: key,
        dayLabel: label,
        isToday: key === todayKey,
        hasData: nonZ.length > 0,
        hasReps: nonZR.length > 0 || completedCount > 0,
        maxWeight: nonZ.length ? Math.max(...nonZ) : 0,
        avgWeight: nonZ.length
          ? Math.round(nonZ.reduce((a, b) => a + b, 0) / nonZ.length)
          : 0,
        maxReps: nonZR.length ? Math.max(...nonZR) : completedCount > 0 ? 0 : 0,
        avgReps: nonZR.length
          ? Math.round(nonZR.reduce((a, b) => a + b, 0) / nonZR.length)
          : 0,
        totalReps: nonZR.length ? nonZR.reduce((a, b) => a + b, 0) : 0,
        sets: completedCount,
        weights: allW,
        reps: allR,
      };
    });
  }

  // Also keep past sessions list for the detail rows
  function getPastSessions(movId: string) {
    return $dailyLogs
      .filter((log) => {
        const w = log.weights?.[movId];
        const r = log.sessionReps?.[movId];
        return (
          (w && w.some((x) => x > 0)) ||
          (r && r.some((x) => x > 0)) ||
          (log.completedSets[movId] ?? 0) > 0
        );
      })
      .map((log) => {
        const allW = log.weights?.[movId] ?? [];
        const allR = (log.sessionReps ?? {})[movId] ?? [];
        const d = new Date(log.date + "T00:00:00");
        return {
          date: log.date,
          label: d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          weights: allW,
          reps: allR,
          sets: log.completedSets[movId] ?? 0,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }

  // ── Progress chart mode ──────────────────────────────────────
  let chartMode = $state<"weight" | "reps">("weight");

  // Reset chart mode whenever a new movement is opened
  $effect(() => {
    if (progressMove) chartMode = "weight";
  });
</script>

<main class="page" id="overview-page">
  <!-- ── Header ── -->
  <div class="page-header">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="app-title">SB Tracker</h1>
        <p class="date-label">{dateStr}</p>
      </div>
      <div class="streak-badge">
        <span class="streak-fire">🔥</span>
        <span class="streak-num" id="streak-count">Day {dayIdx + 1}</span>
      </div>
    </div>
  </div>

  <!-- ── Greeting + Plan Summary card ── -->
  <div class="greeting-card card" id="greeting-card">
    <div class="greeting-row">
      <div>
        <p class="greeting-text">{greeting}! 💪</p>
        <p class="greeting-sub">
          {#if plan?.isRest}
            Rest day — recharge and recover.
          {:else if todayMoves.length === 0}
            No workout scheduled today.
          {:else}
            {DAY_FULL[dayIdx]} · <strong>{plan.label}</strong>
          {/if}
        </p>
      </div>
    </div>

    {#if !plan?.isRest && todayMoves.length > 0}
      <!-- Progress bar -->
      <div class="progress-section" id="workout-progress">
        <div class="flex items-center justify-between mb-2">
          <span class="section-label" style="margin: 0">Today's Progress</span>
          <span class="progress-pct" class:done={isComplete}>
            {#if isComplete}✓ Done!{:else}{completedSets}/{totalSets} sets{/if}
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progress}%"></div>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="stats-row" style="margin-top: 0.875rem;">
        <div class="stat-box">
          <span class="stat-box-val">{todayMoves.length}</span>
          <span class="stat-box-lbl">Exercises</span>
        </div>
        <div class="stat-box">
          <span class="stat-box-val">{totalSets}</span>
          <span class="stat-box-lbl">Sets</span>
        </div>
        <div
          class="stat-box"
          style="border-color: rgba(167,139,250,0.2); background: var(--accent-dim);"
        >
          <span class="stat-box-val" style="color: var(--accent);"
            >{totalVolume > 0
              ? totalVolume >= 1000
                ? (totalVolume / 1000).toFixed(1) + "k"
                : totalVolume
              : "—"}</span
          >
          <span class="stat-box-lbl" style="color: var(--accent); opacity: 0.7;"
            >Vol (kg)</span
          >
        </div>
      </div>
    {/if}
  </div>

  <!-- ── Rest day ── -->
  {#if plan?.isRest}
    <div class="rest-card card">
      <div class="rest-icon">😴</div>
      <h2 class="rest-title">Rest Day</h2>
      <p class="rest-desc">
        Recovery is where the gains are made.<br />Eat well, sleep well, come
        back stronger.
      </p>
      <div class="rest-tips">
        <div class="rest-tip">🥩 High protein meal</div>
        <div class="rest-tip">💧 Stay hydrated</div>
        <div class="rest-tip">🛌 8h sleep target</div>
      </div>
    </div>

    <!-- ── No plan ── -->
  {:else if todayMoves.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📅</div>
      <p class="empty-title">No workout planned</p>
      <p class="empty-desc">
        Set up today's exercises in the Workout Plan tab.
      </p>
    </div>

    <!-- ── Workout list ── -->
  {:else}
    <p class="section-label" id="movements-label">Exercises</p>

    {#each todayMoves as move, i}
      {@const done = $todayLog.completedSets[move.id] ?? 0}
      {@const wArr = $todayLog.weights[move.id] ?? []}
      {@const mg = MUSCLE_META[move.muscleGroup]}
      {@const allDone = done >= move.sets}

      <div
        class="move-card card"
        class:move-complete={allDone}
        id={`move-card-${move.id}`}
        style="animation-delay: {i * 40}ms"
      >
        <!-- Top row -->
        <div
          class="flex items-center justify-between"
          style="margin-bottom: 0.75rem;"
        >
          <button
            class="move-header-btn"
            onclick={() => openProgress(move)}
            aria-label="View progress for {move.name}"
          >
            <span
              class="move-icon-wrap"
              style="background: color-mix(in srgb, {mg.color} 14%, transparent); border-color: color-mix(in srgb, {mg.color} 30%, transparent);"
            >
              <span class="move-icon">{mg.icon}</span>
            </span>
            <div>
              <h3 class="move-name" class:strikethrough={allDone}>
                {move.name}
              </h3>
              <div class="move-subtitle">
                <span class="badge badge-mg" style="--mg: {mg.color}"
                  >{mg.label}</span
                >
                {#if $lastWeights[move.id]}
                  <span class="last-w-badge">
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      ><path d="M12 20V10" /><path d="M18 20V4" /><path
                        d="M6 20v-4"
                      /></svg
                    >
                    Last: {$lastWeights[move.id]}kg
                  </span>
                {/if}
              </div>
            </div>
          </button>
          <div class="move-meta">
            <span class="meta-sets"
              >{move.sets}<span class="meta-x">×</span>{move.reps}</span
            >
            <span class="meta-unit"
              >{move.unit === "secs" ? "secs" : "reps"}</span
            >
          </div>
        </div>

        <!-- Set dots -->
        <div class="set-dots" role="group" aria-label="Sets for {move.name}">
          {#each Array(move.sets) as _, s}
            {@const setDone = done >= s + 1}
            {@const setWeight = wArr[s]}
            {@const setReps = ($todayLog.sessionReps ?? {})[move.id]?.[s]}
            <button
              class="set-dot-wrap"
              class:set-done={setDone}
              onclick={() =>
                setDone
                  ? undoSet(move.id, s + 1)
                  : openWeightSheet(move, s + 1)}
              aria-label="Set {s + 1}{setDone
                ? ' — tap to undo'
                : ' — tap to log'}"
              id={`set-btn-${move.id}-${s + 1}`}
            >
              <span class="set-num">{s + 1}</span>
              {#if setDone && setWeight}
                <span class="weight-chip"
                  >{setReps && setReps !== move.reps
                    ? `${setReps}×`
                    : ""}{setWeight}kg</span
                >
              {:else if setDone && setReps && setReps !== move.reps}
                <span class="weight-chip">{setReps} reps</span>
              {:else if setDone}
                <span class="weight-chip">✓</span>
              {/if}
            </button>
          {/each}

          {#if allDone}
            <span class="all-done-badge">✓ All sets done</span>
          {/if}
        </div>
      </div>
    {/each}

    <!-- Completion banner -->
    {#if isComplete}
      <div class="complete-banner" id="completion-banner">
        <span class="complete-icon">🏆</span>
        <div>
          <p class="complete-title">Workout Complete!</p>
          <p class="complete-sub">
            Crushed it — {totalVolume > 0
              ? `${totalVolume}kg total volume`
              : "great work!"}. 💪
          </p>
        </div>
      </div>
    {/if}
  {/if}
</main>

<!-- ── Weight logging bottom sheet ── -->
{#if sheetMove}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
  <div
    class="modal-overlay"
    tabindex="-1"
    onclick={(e) => {
      if (e.target === e.currentTarget) closeSheet();
    }}
    id="weight-sheet-overlay"
  >
    <div
      class="modal-sheet weight-sheet"
      aria-modal="true"
      aria-label="Log set weight"
      tabindex="-1"
    >
      <div class="modal-handle"></div>

      <!-- Header -->
      <div class="ws-header">
        <div>
          <p class="ws-title">{sheetMove.name}</p>
          <p class="ws-sub">
            <span
              class="badge badge-mg"
              style="--mg: {MUSCLE_META[sheetMove.muscleGroup].color}"
            >
              {MUSCLE_META[sheetMove.muscleGroup].label}
            </span>
            &nbsp;· Set {sheetSetNum} of {sheetMove.sets} · {sheetMove.reps}
            {sheetMove.unit}
          </p>
        </div>
        <button
          class="btn-icon ws-close"
          onclick={closeSheet}
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Weight + Reps entry -->
      <div class="ws-body">
        <!-- Two-column: Weight | Reps -->
        <div class="ws-inputs-row">
          <!-- Weight column -->
          <div class="ws-input-col">
            <p class="label ws-col-label">Weight</p>
            <div class="ws-stepper-wrap">
              <div class="weight-stepper">
                <button
                  onclick={() => adjustWeight(-2.5)}
                  aria-label="Decrease weight">−</button
                >
                <input
                  type="number"
                  min="0"
                  max="999"
                  step="2.5"
                  bind:value={sheetWeight}
                  id="weight-input"
                  aria-label="Weight in kg"
                />
                <button
                  onclick={() => adjustWeight(2.5)}
                  aria-label="Increase weight">+</button
                >
              </div>
              <span class="weight-unit-label">kg</span>
            </div>
          </div>

          <!-- Reps column -->
          <div class="ws-input-col">
            <p class="label ws-col-label">Reps</p>
            <div class="ws-stepper-wrap">
              <div class="weight-stepper reps-stepper">
                <button
                  onclick={() => adjustReps(-1)}
                  aria-label="Decrease reps">−</button
                >
                <input
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  bind:value={sheetReps}
                  id="reps-input"
                  aria-label="Reps"
                />
                <button onclick={() => adjustReps(1)} aria-label="Increase reps"
                  >+</button
                >
              </div>
              <span class="weight-unit-label">reps</span>
            </div>
          </div>
        </div>

        <!-- Quick-select weight presets -->
        <div class="weight-presets">
          {#each [5, 10, 20, 40, 60, 80, 100] as preset}
            <button
              class="preset-chip"
              class:active={sheetWeight === preset}
              onclick={() => (sheetWeight = preset)}>{preset}</button
            >
          {/each}
        </div>

        <p class="ws-hint">Tap − / + to adjust, or type directly.</p>
      </div>

      <!-- Actions -->
      <div class="ws-actions">
        <button class="btn btn-secondary" onclick={closeSheet} id="ws-skip-btn">
          Skip weight
        </button>
        <button
          class="btn btn-primary ws-confirm-btn"
          onclick={confirmSet}
          id="ws-confirm-btn"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Log Set {sheetSetNum}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ── Progress sheet ── -->
{#if progressMove}
  {@const pWeek = getWeekProgress(progressMove.id)}
  {@const pHistory = getPastSessions(progressMove.id)}
  {@const pmg = MUSCLE_META[progressMove.muscleGroup]}
  {@const weekMax = Math.max(...pWeek.map((d) => d.maxWeight), 1)}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
  <div
    class="modal-overlay"
    tabindex="-1"
    onclick={(e) => {
      if (e.target === e.currentTarget) closeProgress();
    }}
    id="progress-sheet-overlay"
  >
    <div
      class="modal-sheet progress-sheet"
      aria-modal="true"
      aria-label="Weight progress"
      tabindex="-1"
    >
      <div class="modal-handle"></div>

      <!-- Header -->
      <div class="ps-header">
        <div>
          <p class="ps-title">{progressMove.name}</p>
          <div class="ps-sub">
            <span class="badge badge-mg" style="--mg: {pmg.color}"
              >{pmg.label}</span
            >
            {#if $lastWeights[progressMove.id]}
              <span class="ps-best"
                >Best: {$lastWeights[progressMove.id]}kg</span
              >
            {/if}
          </div>
        </div>
        <button class="btn-icon" onclick={closeProgress} aria-label="Close">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" /><line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
            />
          </svg>
        </button>
      </div>

      <!-- Week label + chart mode toggle -->
      <div class="ps-chart-header">
        <p class="ps-week-label" style="margin: 0">This Week</p>
        <div class="chart-mode-tabs">
          <button
            class="chart-tab"
            class:active={chartMode === "weight"}
            onclick={() => (chartMode = "weight")}
            id="chart-tab-weight">Weight</button
          >
          <button
            class="chart-tab"
            class:active={chartMode === "reps"}
            onclick={() => (chartMode = "reps")}
            id="chart-tab-reps">Reps</button
          >
        </div>
      </div>

      <!-- 7-bar weekly chart -->
      <div class="ps-chart-wrap">
        {#if true}
          {@const weekRepsMax = Math.max(...pWeek.map((d) => d.totalReps), 1)}
          <svg
            class="ps-chart"
            viewBox="0 0 238 110"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Weekly {chartMode} progress"
          >
            {#each pWeek as day, i}
              {@const BAR_W = 28}
              {@const CHART_H = 80}
              {@const x = i * (BAR_W + 6)}
              {@const isWeight = chartMode === "weight"}
              {@const hasBar = isWeight ? day.hasData : day.totalReps > 0}
              {@const barVal = isWeight ? day.maxWeight : day.totalReps}
              {@const barMax = isWeight ? weekMax : weekRepsMax}
              {@const barH = hasBar
                ? Math.max(6, Math.round((barVal / barMax) * CHART_H))
                : 0}
              {@const barColor = day.isToday
                ? "var(--accent)"
                : isWeight
                  ? "var(--surface-3)"
                  : "var(--green)"}

              <!-- Today column background -->
              {#if day.isToday}
                <rect
                  x={x - 2}
                  y="0"
                  width={BAR_W + 4}
                  height={CHART_H + 26}
                  rx="6"
                  fill="rgba(167,139,250,0.07)"
                />
              {/if}

              <!-- Empty track -->
              <rect
                {x}
                y={CHART_H - 4}
                width={BAR_W}
                height={4}
                rx="2"
                fill="var(--surface-3)"
                opacity="0.4"
              />

              <!-- Data bar -->
              {#if hasBar}
                <rect
                  {x}
                  y={CHART_H - barH}
                  width={BAR_W}
                  height={barH}
                  rx="4"
                  fill={barColor}
                  opacity={day.isToday ? 1 : 0.82}
                />
                <!-- Value label -->
                {#if barH >= 16}
                  <text
                    x={x + BAR_W / 2}
                    y={CHART_H - barH + 11}
                    text-anchor="middle"
                    font-size="8"
                    font-weight="700"
                    fill={day.isToday ? "#09090b" : "var(--text-sub)"}
                    >{barVal}</text
                  >
                {:else}
                  <text
                    x={x + BAR_W / 2}
                    y={CHART_H - barH - 3}
                    text-anchor="middle"
                    font-size="8"
                    font-weight="700"
                    fill={day.isToday ? "var(--accent)" : "var(--text-sub)"}
                    >{barVal}</text
                  >
                {/if}
              {/if}

              <!-- Day label -->
              <text
                x={x + BAR_W / 2}
                y={CHART_H + 14}
                text-anchor="middle"
                font-size="8.5"
                font-weight={day.isToday ? "700" : "500"}
                fill={day.isToday ? "var(--accent)" : "var(--text-muted)"}
                >{day.dayLabel}</text
              >

              <!-- Today dot -->
              {#if day.isToday}
                <circle
                  cx={x + BAR_W / 2}
                  cy={CHART_H + 24}
                  r="2.5"
                  fill="var(--accent)"
                />
              {/if}
            {/each}
          </svg>
        {/if}
      </div>

      <!-- This-week summary chips -->
      {#if pWeek.filter((d) => d.hasData).length > 0}
        <div class="ps-week-stats">
          <div class="ps-week-stat">
            <span class="ps-week-stat-val"
              >{pWeek.filter((d) => d.hasData).length}</span
            >
            <span class="ps-week-stat-lbl">days logged</span>
          </div>
          <div class="ps-week-stat">
            <span class="ps-week-stat-val">{weekMax}kg</span>
            <span class="ps-week-stat-lbl">week best</span>
          </div>
          <div class="ps-week-stat">
            <span class="ps-week-stat-val"
              >{pWeek
                .filter((d) => d.hasData)
                .reduce((s, d) => s + d.sets, 0)}</span
            >
            <span class="ps-week-stat-lbl">total sets</span>
          </div>
        </div>
      {/if}

      <!-- Recent session list -->
      {#if pHistory.length > 0}
        <p class="section-label" style="margin-top: 1rem;">Recent Sessions</p>
        <div class="ps-sessions">
          {#each pHistory as s}
            <div class="ps-session-row">
              <span class="ps-date">{s.label}</span>
              <div class="ps-weights">
                {#each Array(Math.max(s.weights.length, s.reps.length)) as _, si}
                  {@const w = s.weights[si]}
                  {@const r = s.reps[si]}
                  {#if (w && w > 0) || (r && r > 0)}
                    <span class="ps-w-chip">
                      <span style="color: var(--text-muted); font-weight:500"
                        >S{si + 1}</span
                      >
                      {#if r && r > 0}{r}×{/if}{#if w && w > 0}{w}kg{/if}
                    </span>
                  {/if}
                {/each}
              </div>
              <span class="ps-sets">{s.sets} sets</span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="ps-empty">
          <span style="font-size: 2rem;">📊</span>
          <p style="font-weight: 600; color: var(--text-sub);">
            No weight history yet
          </p>
          <p style="font-size: 0.82rem; color: var(--text-muted);">
            Log weights on the Today tab to build your graph.
          </p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* ── Header ── */
  .app-title {
    font-size: 1.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #fff 40%, var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .date-label {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-top: 2px;
    font-weight: 500;
  }

  .streak-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--orange-dim);
    border: 1px solid rgba(251, 146, 60, 0.25);
    border-radius: 999px;
    padding: 0.3rem 0.75rem;
  }

  .streak-fire {
    font-size: 1rem;
  }
  .streak-num {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--orange);
  }

  /* ── Greeting card ── */
  .greeting-card {
    background: linear-gradient(135deg, #1c1828 0%, var(--surface) 100%);
    border-color: rgba(167, 139, 250, 0.15);
    margin-bottom: 0.125rem;
  }

  .greeting-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .greeting-text {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .greeting-sub {
    font-size: 0.875rem;
    color: var(--text-sub);
  }

  .greeting-sub strong {
    color: var(--text);
  }

  .progress-section {
    margin-top: 0.75rem;
  }

  .progress-pct {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-sub);
    transition: color 0.3s;
  }

  .progress-pct.done {
    color: var(--green);
  }

  /* ── Rest day card ── */
  .rest-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem 1.5rem;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .rest-icon {
    font-size: 3rem;
    line-height: 1;
  }
  .rest-title {
    font-size: 1.25rem;
    margin-top: 0.25rem;
  }
  .rest-desc {
    font-size: 0.875rem;
    color: var(--text-sub);
    line-height: 1.6;
  }

  .rest-tips {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .rest-tip {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.3rem 0.75rem;
    font-size: 0.78rem;
    color: var(--text-sub);
    font-weight: 500;
  }

  /* ── Movement card ── */
  .move-card {
    animation: page-in 0.35s var(--ease) both;
    transition:
      border-color 0.25s,
      background 0.25s,
      box-shadow 0.25s;
  }

  .move-card.move-complete {
    border-color: rgba(74, 222, 128, 0.25);
    background: linear-gradient(
      135deg,
      rgba(74, 222, 128, 0.05) 0%,
      var(--surface) 60%
    );
  }

  .move-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: var(--radius);
    border: 1px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .move-icon {
    font-size: 1.2rem;
    line-height: 1;
  }

  .move-name {
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
    transition: color 0.2s;
    line-height: 1.2;
    margin-bottom: 3px;
  }

  .move-name.strikethrough {
    color: var(--text-muted);
    text-decoration: line-through;
  }

  .move-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .meta-sets {
    font-size: 1.125rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .meta-x {
    font-size: 0.85rem;
    font-weight: 400;
    opacity: 0.5;
    margin: 0 1px;
  }

  .meta-unit {
    font-size: 0.7rem;
    color: var(--text-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── Set dots (redesigned) ── */
  .set-dots {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .set-dot-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 40px;
    min-height: 40px;
    border-radius: var(--radius-xs);
    border: 1.5px solid var(--border-2);
    background: var(--surface-2);
    cursor: pointer;
    transition: all 0.18s var(--ease);
    flex-shrink: 0;
    padding: 3px 2px;
    gap: 1px;
  }

  .set-dot-wrap:hover {
    border-color: var(--accent);
    background: var(--accent-dim);
  }

  .set-dot-wrap:active {
    transform: scale(0.92);
  }

  .set-dot-wrap.set-done {
    background: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 12px var(--accent-glow);
  }

  .set-dot-wrap.set-done .set-num {
    color: #09090b;
  }

  .set-dot-wrap.set-done .weight-chip {
    color: rgba(9, 9, 11, 0.7);
  }

  .set-num {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
    line-height: 1;
  }

  .all-done-badge {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--green);
    background: var(--green-dim);
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    margin-left: 0.125rem;
    align-self: center;
    animation: pop-in 0.25s var(--ease);
  }

  /* ── Completion banner ── */
  .complete-banner {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(
      135deg,
      rgba(74, 222, 128, 0.1),
      rgba(167, 139, 250, 0.1)
    );
    border: 1px solid rgba(74, 222, 128, 0.25);
    border-radius: var(--radius-lg);
    margin-top: 0.75rem;
    animation: bounce-in 0.5s var(--ease);
  }

  .complete-icon {
    font-size: 2.5rem;
    line-height: 1;
  }
  .complete-title {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .complete-sub {
    font-size: 0.84rem;
    color: var(--text-sub);
    margin-top: 2px;
  }

  /* ── Weight sheet ── */
  .weight-sheet {
    animation: slide-up 0.32s var(--ease) !important;
  }

  .ws-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .ws-title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-bottom: 0.375rem;
  }

  .ws-sub {
    font-size: 0.8rem;
    color: var(--text-sub);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .ws-close {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .ws-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .weight-presets {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 1rem;
  }

  .preset-chip {
    padding: 0.3rem 0.65rem;
    border-radius: 999px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-sub);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s var(--ease);
  }

  .preset-chip:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .preset-chip.active {
    background: var(--accent-dim);
    border-color: rgba(167, 139, 250, 0.4);
    color: var(--accent);
  }

  .ws-hint {
    font-size: 0.74rem;
    color: var(--text-muted);
    text-align: center;
    margin-top: 1rem;
  }

  .ws-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .ws-actions .btn {
    flex: 1;
  }

  .ws-confirm-btn {
    font-size: 0.95rem;
  }

  /* ── Progress sheet ── */
  .progress-sheet {
    animation: slide-up 0.32s var(--ease) !important;
    max-height: 88svh;
  }

  .move-header-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
    flex: 1;
    min-width: 0;
  }

  .move-subtitle {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
    margin-top: 3px;
  }

  .last-w-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--orange);
    background: var(--orange-dim);
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    letter-spacing: -0.01em;
    border: 1px solid rgba(251, 146, 60, 0.2);
  }

  .ps-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .ps-title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-bottom: 0.375rem;
  }

  .ps-sub {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .ps-best {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
  }

  .ps-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 0;
    text-align: center;
  }

  .ps-chart-wrap {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem 0.75rem 0.5rem;
    overflow-x: auto;
  }

  .ps-chart {
    width: 100%;
    min-width: 120px;
    display: block;
  }

  .ps-sessions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .ps-session-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .ps-date {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    min-width: 44px;
    flex-shrink: 0;
  }

  .ps-weights {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
    flex: 1;
  }

  .ps-w-chip {
    font-size: 0.72rem;
    font-weight: 700;
    background: var(--surface-3);
    color: var(--text);
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    gap: 2px;
    display: inline-flex;
  }

  .ps-sets {
    font-size: 0.7rem;
    color: var(--text-muted);
    font-weight: 600;
    flex-shrink: 0;
  }

  /* Week chart extras */
  .ps-week-label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
    margin-bottom: 0.625rem;
  }

  .ps-week-stats {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.875rem;
  }

  .ps-week-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 0.625rem 0.5rem;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .ps-week-stat-val {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .ps-week-stat-lbl {
    font-size: 0.62rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    text-align: center;
  }

  /* ── Weight sheet: two-column input layout ── */
  .ws-inputs-row {
    display: flex;
    gap: 0.875rem;
    width: 100%;
    margin-bottom: 0;
  }

  .ws-input-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }

  .ws-col-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-muted);
    margin: 0;
    text-align: center;
  }

  .ws-stepper-wrap {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  /* Reps stepper is slightly narrower than weight stepper */
  .reps-stepper input {
    width: 3rem;
  }

  /* ── Progress chart header ── */
  .ps-chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.625rem;
  }

  .chart-mode-tabs {
    display: flex;
    gap: 2px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 2px;
  }

  .chart-tab {
    padding: 0.2rem 0.7rem;
    border-radius: 999px;
    border: none;
    background: none;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.18s var(--ease);
  }

  .chart-tab.active {
    background: var(--accent);
    color: #09090b;
  }
</style>
