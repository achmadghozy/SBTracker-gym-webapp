<script lang="ts">
  import {
    movements, workoutPlan,
    addMovementToDay, removeMovementFromDay, updateDay,
    todayDayIndex,
  } from '../stores/workout';
  import { MUSCLE_META, MUSCLE_GROUPS, DAY_SHORT, DAY_FULL, type Movement } from '../types';

  // ── State ───────────────────────────────────────────────────
  let selectedDay  = $state(todayDayIndex());
  let showPicker   = $state(false);
  let editingLabel = $state(false);
  let labelDraft   = $state('');
  let pickerSearch = $state('');

  // ── Derived ─────────────────────────────────────────────────
  let day = $derived($workoutPlan.days[selectedDay]);

  let dayMovements = $derived(
    (day?.movementIds ?? [])
      .map(id => $movements.find(m => m.id === id))
      .filter((m): m is Movement => m !== undefined)
  );

  // Movements not yet in this day's plan
  let availableMovements = $derived(
    $movements.filter(m => !day?.movementIds.includes(m.id))
  );

  let filteredAvailable = $derived(
    pickerSearch.trim() === ''
      ? availableMovements
      : availableMovements.filter(m =>
          m.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
          MUSCLE_META[m.muscleGroup].label.toLowerCase().includes(pickerSearch.toLowerCase())
        )
  );

  // Group by muscle group for display in picker
  let groupedAvailable = $derived(
    MUSCLE_GROUPS.map(mg => ({
      mg,
      moves: filteredAvailable.filter(m => m.muscleGroup === mg),
    })).filter(g => g.moves.length > 0)
  );

  // Muscle group breakdown chips for each day
  function getDayMuscleGroups(dayIdx: number) {
    const d = $workoutPlan.days[dayIdx];
    if (!d || d.isRest) return [];
    const groups = new Set(
      d.movementIds
        .map(id => $movements.find(m => m.id === id)?.muscleGroup)
        .filter(Boolean)
    );
    return [...groups] as string[];
  }

  const todayIdx = todayDayIndex();

  // ── Actions ─────────────────────────────────────────────────
  function selectDay(idx: number) {
    selectedDay  = idx;
    showPicker   = false;
    editingLabel = false;
    pickerSearch = '';
  }

  function toggleRest() {
    updateDay(selectedDay, { isRest: !day.isRest });
  }

  function removeMove(id: string) {
    removeMovementFromDay(selectedDay, id);
  }

  function pickMovement(id: string) {
    addMovementToDay(selectedDay, id);
    // Don't close — let user keep adding
  }

  function closePicker() {
    showPicker   = false;
    pickerSearch = '';
  }

  function startEditLabel() {
    labelDraft   = day.label;
    editingLabel = true;
  }

  function saveLabel() {
    if (labelDraft.trim()) {
      updateDay(selectedDay, { label: labelDraft.trim() });
    }
    editingLabel = false;
  }
</script>

<main class="page" id="workout-plan-page">
  <!-- ── Header ── -->
  <div class="page-header">
    <h1 class="page-title">Workout Plan</h1>
    <p class="page-sub">Build your weekly routine</p>
  </div>

  <!-- ── Day selector ── -->
  <div class="day-selector" role="tablist" aria-label="Select day">
    {#each $workoutPlan.days as d}
      {@const isToday  = d.dayIndex === todayIdx}
      {@const mgs      = getDayMuscleGroups(d.dayIndex)}
      <button
        class="day-pill"
        class:active={selectedDay === d.dayIndex}
        class:today={isToday}
        class:rest={d.isRest}
        role="tab"
        aria-selected={selectedDay === d.dayIndex}
        id={`day-tab-${d.dayIndex}`}
        onclick={() => selectDay(d.dayIndex)}
      >
        {#if isToday}
          <span class="today-dot" title="Today"></span>
        {/if}
        <span class="day-pill-name">{DAY_SHORT[d.dayIndex]}</span>
        {#if d.isRest}
          <span class="day-pill-dot" style="background: var(--text-muted)"></span>
        {:else if mgs.length > 0}
          <!-- Colour strip from first muscle group -->
          <span class="day-pill-dot" style="background: {MUSCLE_META[mgs[0] as keyof typeof MUSCLE_META]?.color ?? 'var(--surface-3)'}"></span>
        {:else}
          <span class="day-pill-dot"></span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- ── Day content ── -->
  {#if day}
    <!-- Day header card -->
    <div class="day-header-card card">
      <div class="day-header-top">
        <div class="day-header-info">
          <span class="day-full-name">{DAY_FULL[day.dayIndex]}</span>
          {#if editingLabel}
            <input
              class="input label-input"
              bind:value={labelDraft}
              onblur={saveLabel}
              onkeydown={(e) => e.key === 'Enter' && saveLabel()}
              id="label-input"
              placeholder="E.g. Push Day"
              autofocus
            />
          {:else}
            <div class="day-label-row">
              <span class="day-label-text">
                {#if day.isRest}😴 Rest Day{:else}{day.label}{/if}
              </span>
              {#if !day.isRest}
                <button class="edit-label-btn" onclick={startEditLabel} id="edit-label-btn" aria-label="Edit day label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Rest toggle -->
        <div class="rest-toggle-wrap">
          <span class="rest-toggle-lbl">Rest</span>
          <label class="toggle" title="Toggle rest day" id={`rest-toggle-${day.dayIndex}`}>
            <input type="checkbox" checked={day.isRest} onchange={toggleRest} />
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>

      <!-- Muscle group chips if workout day -->
      {#if !day.isRest && dayMovements.length > 0}
        <div class="mg-chips">
          {#each [...new Set(dayMovements.map(m => m.muscleGroup))] as mg}
            {@const meta = MUSCLE_META[mg]}
            <span class="plan-chip" style="background: color-mix(in srgb, {meta.color} 12%, transparent); color: {meta.color}; border-color: color-mix(in srgb, {meta.color} 30%, transparent)">
              {meta.icon} {meta.label}
            </span>
          {/each}
          <span class="plan-chip">{day.movementIds.length} exercises</span>
        </div>
      {/if}
    </div>

    {#if !day.isRest}
      <!-- Movement list -->
      {#if dayMovements.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🏋️</div>
          <p class="empty-title">No exercises yet</p>
          <p class="empty-desc">Tap "+ Add Exercise" to build this day's workout.</p>
        </div>
      {:else}
        <p class="section-label">Exercises</p>
        <div class="move-list" id="plan-move-list">
          {#each dayMovements as move, i}
            {@const mg = MUSCLE_META[move.muscleGroup]}
            <div
              class="plan-move-card card"
              id={`plan-move-${move.id}`}
              style="animation-delay: {i * 30}ms"
            >
              <div class="flex items-center gap-3">
                <span
                  class="move-emoji-wrap"
                  style="background: color-mix(in srgb, {mg.color} 14%, transparent); border-color: color-mix(in srgb, {mg.color} 28%, transparent);"
                >
                  {mg.icon}
                </span>
                <div class="flex-1 truncate">
                  <p class="move-name truncate">{move.name}</p>
                  <span class="badge badge-mg" style="--mg: {mg.color}">{mg.label}</span>
                </div>
                <div class="move-reps">{move.sets}×{move.reps}</div>
                <button
                  class="btn-icon remove-btn"
                  onclick={() => removeMove(move.id)}
                  aria-label="Remove {move.name}"
                  id={`remove-move-${move.id}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6"  y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Add exercise button -->
      <button
        class="btn btn-secondary btn-full add-btn"
        onclick={() => { showPicker = true; pickerSearch = ''; }}
        id="add-exercise-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5"  y1="12" x2="19" y2="12"/>
        </svg>
        Add Exercise
      </button>

    {:else}
      <!-- Rest day view -->
      <div class="rest-msg card">
        <p class="rest-msg-icon">😴</p>
        <p class="rest-msg-text">Rest day — recovery is part of the program.</p>
        <p class="text-xs text-muted mt-2">Toggle the switch above to add exercises.</p>
      </div>
    {/if}
  {/if}
</main>

<!-- ── Movement picker modal ── -->
{#if showPicker}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
  <div
    class="modal-overlay"
    onclick={(e) => { if (e.target === e.currentTarget) closePicker(); }}
    id="picker-modal"
  >
    <div class="modal-sheet picker-sheet" role="dialog" aria-modal="true" aria-label="Add exercise" tabindex="-1">
      <div class="modal-handle"></div>

      <div class="picker-header">
        <h2 class="modal-title" style="margin: 0">Add Exercise</h2>
        <button class="btn-icon" onclick={closePicker} aria-label="Close picker">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Search -->
      <div class="picker-search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          class="input picker-search"
          type="search"
          placeholder="Search exercises…"
          bind:value={pickerSearch}
          id="picker-search-input"
        />
      </div>

      {#if availableMovements.length === 0}
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <p class="empty-title">All movements added</p>
          <p class="empty-desc">Every exercise in your library is already in today's plan.</p>
        </div>
      {:else if groupedAvailable.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p class="empty-title">No results</p>
          <p class="empty-desc">Try a different search term.</p>
        </div>
      {:else}
        {#each groupedAvailable as group}
          {@const meta = MUSCLE_META[group.mg]}
          <p class="section-label">{meta.icon} {meta.label}</p>
          <div class="picker-group">
            {#each group.moves as move}
              {@const alreadyAdded = day.movementIds.includes(move.id)}
              <button
                class="picker-item"
                class:picker-added={alreadyAdded}
                onclick={() => pickMovement(move.id)}
                id={`pick-${move.id}`}
                disabled={alreadyAdded}
              >
                <span class="picker-name">{move.name}</span>
                <span class="picker-meta">
                  {#if alreadyAdded}
                    <span style="color: var(--green);">✓ Added</span>
                  {:else}
                    {move.sets}×{move.reps}
                  {/if}
                </span>
              </button>
            {/each}
          </div>
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style>
  .page-title { font-size: 1.625rem; font-weight: 900; letter-spacing: -0.04em; }
  .page-sub   { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }

  /* ── Day pill ── */
  .day-pill { position: relative; }

  .today-dot {
    position: absolute;
    top: 4px; right: 4px;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--orange);
  }

  /* ── Day header card ── */
  .day-header-card {
    margin-bottom: 0.5rem;
  }

  .day-header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .day-header-info {
    flex: 1;
    min-width: 0;
  }

  .day-full-name {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-bottom: 0.25rem;
  }

  .day-label-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .day-label-text {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.02em;
  }

  .edit-label-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-xs);
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .edit-label-btn:hover {
    background: var(--surface-3);
    color: var(--text);
    border-color: var(--border-2);
  }

  .label-input {
    font-size: 1rem;
    font-weight: 700;
  }

  .rest-toggle-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .rest-toggle-lbl {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .mg-chips {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
  }

  /* ── Plan move card ── */
  .move-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .plan-move-card {
    animation: page-in 0.3s var(--ease) both;
  }

  .move-emoji-wrap {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-xs);
    border: 1px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;
  }

  .move-name {
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  .move-reps {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-sub);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .remove-btn {
    background: var(--red-dim);
    color: var(--red);
    border-color: rgba(248, 113, 113, 0.2);
    width: 30px;
    height: 30px;
    border-radius: var(--radius-xs);
    flex-shrink: 0;
  }

  .remove-btn:hover {
    background: rgba(248, 113, 113, 0.22);
    color: var(--red);
  }

  /* ── Add button ── */
  .add-btn {
    margin-top: 0.875rem;
    border-style: dashed;
  }

  /* ── Rest message ── */
  .rest-msg {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2.5rem 1.5rem;
    margin-top: 0.5rem;
  }

  .rest-msg-icon { font-size: 2.5rem; line-height: 1; margin-bottom: 0.75rem; }
  .rest-msg-text { font-size: 0.9rem; color: var(--text-sub); }

  /* ── Picker ── */
  .picker-sheet {
    animation: slide-up 0.3s var(--ease) !important;
  }

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.875rem;
  }

  .picker-search-wrap {
    position: relative;
    margin-bottom: 0.5rem;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }

  .picker-search {
    padding-left: 2.25rem;
  }

  .picker-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-bottom: 0.5rem;
  }

  .picker-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.2s var(--ease);
    text-align: left;
  }

  .picker-item:hover:not(:disabled) {
    border-color: var(--accent);
    background: var(--accent-dim);
  }

  .picker-item:active { transform: scale(0.98); }

  .picker-added {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .picker-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
  }

  .picker-meta {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 500;
  }
</style>
