<script lang="ts">
  import {
    movements,
    workoutPlan,
    addMovementToDay,
    removeMovementFromDay,
    updateDay,
    applyPlanTemplate,
    todayDayIndex,
    customTemplates,
    saveCustomTemplate,
    deleteCustomTemplate,
    reorderMovementInDay,
  } from "../stores/workout";
  import {
    MUSCLE_META,
    MUSCLE_GROUPS,
    DAY_SHORT,
    DAY_FULL,
    type Movement,
  } from "../types";
  import { PLAN_TEMPLATES, type PlanTemplate } from "../data/planTemplates";
  import { MUSCLE_ICONS } from "../../assets/muscleIcons";
  import { swipeClose } from "../actions/swipeClose";
  import { fade, fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { cubicOut } from "svelte/easing";

  // ── State ───────────────────────────────────────────────────
  const todayIdx = todayDayIndex(); // 0–13
  let selectedWeek = $state<1 | 2>(todayIdx >= 7 ? 2 : 1);
  let selectedDay = $state(todayIdx);
  let showPicker = $state(false);
  let editingLabel = $state(false);
  let labelDraft = $state("");
  let pickerSearch = $state("");

  // Sliced days for each week (days 0–6 and 7–13)
  let week1Days = $derived(
    $workoutPlan.days
      .filter((d) => d.dayIndex < 7)
      .sort((a, b) => a.dayIndex - b.dayIndex),
  );
  let week2Days = $derived(
    $workoutPlan.days
      .filter((d) => d.dayIndex >= 7)
      .sort((a, b) => a.dayIndex - b.dayIndex),
  );
  let visibleDays = $derived(selectedWeek === 1 ? week1Days : week2Days);

  // ── Derived ─────────────────────────────────────────────────
  let day = $derived($workoutPlan.days.find((d) => d.dayIndex === selectedDay));

  let dayMovements = $derived(
    (day?.movementIds ?? [])
      .map((id) => $movements.find((m) => m.id === id))
      .filter((m): m is Movement => m !== undefined),
  );

  // Movements not yet in this day's plan
  let availableMovements = $derived(
    $movements.filter((m) => !day?.movementIds.includes(m.id)),
  );

  let filteredAvailable = $derived(
    pickerSearch.trim() === ""
      ? availableMovements
      : availableMovements.filter(
          (m) =>
            m.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
            MUSCLE_META[m.muscleGroup].label
              .toLowerCase()
              .includes(pickerSearch.toLowerCase()),
        ),
  );

  // Group by muscle group for display in picker
  let groupedAvailable = $derived(
    MUSCLE_GROUPS.map((mg) => ({
      mg,
      moves: filteredAvailable.filter((m) => m.muscleGroup === mg),
    })).filter((g) => g.moves.length > 0),
  );

  // Muscle group breakdown chips for each day
  function getDayMuscleGroups(dayIdx: number) {
    const d = $workoutPlan.days.find((d) => d.dayIndex === dayIdx);
    if (!d || d.isRest) return [];
    const groups = new Set(
      d.movementIds
        .map((id) => $movements.find((m) => m.id === id)?.muscleGroup)
        .filter(Boolean),
    );
    return [...groups] as string[];
  }

  const todayIdxConst = todayIdx; // alias for template

  // ── Actions ─────────────────────────────────────────────────
  function selectDay(idx: number) {
    selectedDay = idx;
    showPicker = false;
    editingLabel = false;
    pickerSearch = "";
  }

  function toggleRest() {
    if (!day) return;
    updateDay(selectedDay, { isRest: !day.isRest });
  }

  function removeMove(id: string) {
    removeMovementFromDay(selectedDay, id);
  }

  function reorderMove(id: string, direction: "up" | "down") {
    reorderMovementInDay(selectedDay, id, direction);
  }

  function pickMovement(id: string) {
    addMovementToDay(selectedDay, id);
    // Don't close — let user keep adding
  }

  function closePicker() {
    showPicker = false;
    pickerSearch = "";
  }

  function startEditLabel() {
    if (!day) return;
    labelDraft = day.label;
    editingLabel = true;
  }

  function saveLabel() {
    if (labelDraft.trim()) {
      updateDay(selectedDay, { label: labelDraft.trim() });
    }
    editingLabel = false;
  }

  // ── Template picker ──────────────────────────────────
  let showTemplates = $state(false);
  let pendingTpl = $state<PlanTemplate | null>(null); // waiting for confirm
  let isApplying = $state(false);

  // ── Custom Template Saving ───────────────────────────
  let showSaveTemplate = $state(false);
  let saveTemplateName = $state("");
  let saveTemplateDesc = $state("");

  function submitSaveTemplate() {
    if (!saveTemplateName.trim()) return;
    saveCustomTemplate(
      saveTemplateName.trim(),
      saveTemplateDesc.trim(),
      $workoutPlan.days,
    );
    saveTemplateName = "";
    saveTemplateDesc = "";
    showSaveTemplate = false;
  }

  function previewTemplate(tpl: PlanTemplate) {
    pendingTpl = tpl;
  }

  async function confirmApply() {
    if (!pendingTpl) return;

    isApplying = true;
    await new Promise((r) => setTimeout(r, 50));

    applyPlanTemplate(pendingTpl.days);
    // Reset selection to week 1, day 0
    selectedWeek = 1;
    selectedDay = 0;
    pendingTpl = null;
    showTemplates = false;
    isApplying = false;
  }

  function cancelApply() {
    pendingTpl = null;
  }
</script>

<main class="page" id="workout-plan-page">
  <!-- ── Header ── -->
  <div class="page-header">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="page-title">Workout Plan</h1>
        <p class="page-sub">Build your weekly routine</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="btn btn-secondary btn-sm"
          onclick={() => (showSaveTemplate = true)}
          id="save-template-btn"
          aria-label="Save as Template"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            ></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </button>
        <button
          class="btn btn-secondary btn-sm"
          onclick={() => (showTemplates = true)}
          id="templates-btn"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect
              x="14"
              y="3"
              width="7"
              height="7"
              rx="1"
            />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect
              x="14"
              y="14"
              width="7"
              height="7"
              rx="1"
            />
          </svg>
          Templates
        </button>
      </div>
    </div>
  </div>

  <!-- ── Week tabs ── -->
  <div class="week-tabs" role="tablist" aria-label="Select week">
    <button
      class="week-tab"
      class:active={selectedWeek === 1}
      role="tab"
      onclick={() => {
        selectedWeek = 1;
        selectDay(week1Days[0]?.dayIndex ?? 0);
      }}
      aria-selected={selectedWeek === 1}
      id="week1-tab">Week 1</button
    >
    <button
      class="week-tab"
      class:active={selectedWeek === 2}
      role="tab"
      onclick={() => {
        selectedWeek = 2;
        selectDay(week2Days[0]?.dayIndex ?? 7);
      }}
      aria-selected={selectedWeek === 2}
      id="week2-tab"
      >Week 2
      {#if week2Days.length === 0}<span class="week-tab-note">(copy of W1)</span
        >{/if}
    </button>
  </div>

  <!-- ── Day selector ── -->
  <div class="day-selector" role="tablist" aria-label="Select day">
    {#each visibleDays as d}
      {@const isToday = d.dayIndex === todayIdxConst}
      {@const mgs = getDayMuscleGroups(d.dayIndex)}
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
        <span class="day-pill-name">{DAY_SHORT[d.dayIndex % 7]}</span>
        {#if d.isRest}
          <span class="day-pill-dot" style="background: var(--text-muted)"
          ></span>
        {:else if mgs.length > 0}
          <span
            class="day-pill-dot"
            style="background: {MUSCLE_META[mgs[0] as keyof typeof MUSCLE_META]
              ?.color ?? 'var(--surface-3)'}"
          ></span>
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
              onkeydown={(e) => e.key === "Enter" && saveLabel()}
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
                <button
                  class="edit-label-btn"
                  onclick={startEditLabel}
                  id="edit-label-btn"
                  aria-label="Edit day label"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                </button>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Rest toggle -->
        <div class="rest-toggle-wrap">
          <span class="rest-toggle-lbl">Rest</span>
          <label
            class="toggle"
            title="Toggle rest day"
            id={`rest-toggle-${day.dayIndex}`}
          >
            <input type="checkbox" checked={day.isRest} onchange={toggleRest} />
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>

      <!-- Muscle group chips if workout day -->
      {#if !day.isRest && dayMovements.length > 0}
        <div class="mg-chips">
          {#each [...new Set(dayMovements.map((m) => m.muscleGroup))] as mg}
            {@const meta = MUSCLE_META[mg]}
            <span
              class="plan-chip"
              style="background: color-mix(in srgb, {meta.color} 12%, transparent); color: {meta.color}; border-color: color-mix(in srgb, {meta.color} 30%, transparent)"
            >
              <img
                class="chip-mg-icon"
                src={MUSCLE_ICONS[mg]}
                alt={meta.label}
              />
              {meta.label}
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
          <p class="empty-desc">
            Tap "+ Add Exercise" to build this day's workout.
          </p>
        </div>
      {:else}
        <p class="section-label">Exercises</p>
        <div class="move-list" id="plan-move-list">
          {#each dayMovements as move, i (move.id)}
            {@const mg = MUSCLE_META[move.muscleGroup]}
            <div
              class="plan-move-card card"
              id={`plan-move-${move.id}`}
              animate:flip={{ duration: 250 }}
              style="animation-delay: {i * 30}ms"
            >
              <div class="flex items-center justify-between gap-3">
                <div
                  class="flex items-center gap-3 flex-1"
                  style="min-width: 0;"
                >
                  <span class="order-num">{i + 1}</span>
                  <span
                    class="move-emoji-wrap"
                    style="background: color-mix(in srgb, {mg.color} 14%, transparent); border-color: color-mix(in srgb, {mg.color} 28%, transparent);"
                  >
                    <img
                      class="plan-mg-icon"
                      src={MUSCLE_ICONS[move.muscleGroup]}
                      alt={mg.label}
                    />
                  </span>
                  <div
                    class="flex-1 min-w-0"
                    style="display: flex; flex-direction: column; justify-content: center; gap: 4px;"
                  >
                    <p class="move-name truncate">{move.name}</p>
                    <div style="display: flex; align-items: center;">
                      <span class="badge badge-mg" style="--mg: {mg.color}"
                        >{mg.label}</span
                      >
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="order-controls">
                    <button
                      class="order-btn"
                      onclick={() => reorderMove(move.id, "up")}
                      disabled={i === 0}
                      aria-label="Move up"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"><path d="M18 15l-6-6-6 6" /></svg
                      >
                    </button>
                    <div class="order-divider"></div>
                    <button
                      class="order-btn"
                      onclick={() => reorderMove(move.id, "down")}
                      disabled={i === dayMovements.length - 1}
                      aria-label="Move down"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"><path d="M6 9l6 6 6-6" /></svg
                      >
                    </button>
                  </div>

                  <button
                    class="btn-icon remove-btn"
                    onclick={() => removeMove(move.id)}
                    aria-label="Remove {move.name}"
                    id={`remove-move-${move.id}`}
                  >
                    <svg
                      width="14"
                      height="14"
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
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Add exercise button -->
      <button
        class="btn btn-secondary btn-full add-btn"
        onclick={() => {
          showPicker = true;
          pickerSearch = "";
        }}
        id="add-exercise-btn"
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
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Exercise
      </button>
    {:else}
      <!-- Rest day view -->
      <div class="rest-msg card">
        <p class="rest-msg-icon">😴</p>
        <p class="rest-msg-text">Rest day — recovery is part of the program.</p>
        <p class="text-xs text-muted mt-2">
          Toggle the switch above to add exercises.
        </p>
      </div>
    {/if}
  {/if}
</main>

<!-- ── Movement picker modal ── -->
{#if showPicker}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
  <div
    class="modal-overlay"
    transition:fade={{ duration: 200 }}
    onclick={(e) => {
      if (e.target === e.currentTarget) closePicker();
    }}
    id="picker-modal"
  >
    <div
      class="modal-sheet picker-sheet"
      transition:fly={{ y: "100%", duration: 300, easing: cubicOut }}
      use:swipeClose={{ onClose: closePicker }}
      role="dialog"
      aria-modal="true"
      aria-label="Add exercise"
      tabindex="-1"
    >
      <div class="modal-handle"></div>

      <div class="picker-header">
        <h2 class="modal-title" style="margin: 0">Add Exercise</h2>
        <button
          class="btn-icon"
          onclick={closePicker}
          aria-label="Close picker"
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

      <!-- Search -->
      <div class="picker-search-wrap">
        <svg
          class="search-icon"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <circle cx="11" cy="11" r="8" /><line
            x1="21"
            y1="21"
            x2="16.65"
            y2="16.65"
          />
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
          <p class="empty-desc">
            Every exercise in your library is already in today's plan.
          </p>
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
          <p class="section-label">
            {meta.label}
          </p>
          <div class="picker-group">
            {#each group.moves as move}
              {@const alreadyAdded =
                day?.movementIds.includes(move.id) ?? false}
              <button
                class="picker-item"
                class:picker-added={alreadyAdded}
                onclick={() => pickMovement(move.id)}
                id={`pick-${move.id}`}
                disabled={alreadyAdded}
              >
                <div class="flex items-center gap-3">
                  <span
                    class="picker-icon-wrap"
                    style="background: color-mix(in srgb, {MUSCLE_META[
                      move.muscleGroup
                    ]
                      .color} 14%, transparent); border: 1px solid color-mix(in srgb, {MUSCLE_META[
                      move.muscleGroup
                    ].color} 28%, transparent);"
                  >
                    <img
                      class="picker-mg-icon"
                      src={MUSCLE_ICONS[move.muscleGroup]}
                      alt={MUSCLE_META[move.muscleGroup].label}
                    />
                  </span>
                  <span class="picker-name">{move.name}</span>
                </div>
                <span class="picker-meta">
                  {#if alreadyAdded}
                    <span style="color: var(--green);">✓ Added</span>
                  {:else}
                    {MUSCLE_META[move.muscleGroup].label}
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

<!-- ── Template Picker Sheet ── -->
{#if showTemplates}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
  <div
    class="modal-overlay"
    transition:fade={{ duration: 200 }}
    onclick={(e) => {
      if (e.target === e.currentTarget) showTemplates = false;
    }}
    id="templates-overlay"
    tabindex="-1"
  >
    <div
      class="modal-sheet tpl-sheet"
      transition:fly={{ y: "100%", duration: 300, easing: cubicOut }}
      use:swipeClose={{ onClose: () => (showTemplates = false) }}
      aria-modal="true"
      aria-label="Choose a plan template"
      tabindex="-1"
    >
      <div class="modal-handle"></div>
      <div class="tpl-sheet-head">
        <h2 class="modal-title">Plan Templates</h2>
        <p class="tpl-sheet-sub">
          Pick a template to load. Your current plan will be replaced.
        </p>
      </div>

      <div class="tpl-list">
        {#if $customTemplates.length > 0}
          <div class="tpl-section">
            <h3 class="tpl-section-title">Your Templates</h3>
            {#each $customTemplates as tpl}
              <div class="tpl-card-wrap">
                <button
                  class="tpl-card"
                  onclick={() => previewTemplate(tpl)}
                  id={`tpl-${tpl.id}`}
                >
                  <span class="tpl-icon">{tpl.icon}</span>
                  <div class="tpl-info">
                    <p class="tpl-name">{tpl.name}</p>
                    {#if tpl.description}<p class="tpl-desc">
                        {tpl.description}
                      </p>{/if}
                    <div class="tpl-meta-row">
                      <span class="tpl-badge tpl-badge-schedule"
                        >{tpl.schedule}</span
                      >
                    </div>
                  </div>
                </button>
                <button
                  class="btn-icon delete-tpl-btn"
                  aria-label="Delete template"
                  onclick={(e) => {
                    e.stopPropagation();
                    deleteCustomTemplate(tpl.id);
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><path
                      d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"
                    /></svg
                  >
                </button>
              </div>
            {/each}
          </div>
          <h3 class="tpl-section-title">Pre-built Templates</h3>
        {/if}

        {#each PLAN_TEMPLATES as tpl}
          <button
            class="tpl-card"
            onclick={() => previewTemplate(tpl)}
            id={`tpl-${tpl.id}`}
          >
            <span class="tpl-icon">{tpl.icon}</span>
            <div class="tpl-info">
              <p class="tpl-name">{tpl.name}</p>
              <p class="tpl-desc">{tpl.description}</p>
              <div class="tpl-meta-row">
                <span class="tpl-badge tpl-badge-schedule">{tpl.schedule}</span>
                <span
                  class="tpl-badge tpl-badge-diff"
                  class:diff-beginner={tpl.difficulty === "Beginner"}
                  class:diff-intermediate={tpl.difficulty === "Intermediate"}
                  class:diff-advanced={tpl.difficulty === "Advanced"}
                  >{tpl.difficulty}</span
                >
              </div>
            </div>
            <svg
              class="tpl-arrow"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        {/each}
      </div>

      <button
        class="btn btn-secondary btn-full"
        onclick={() => (showTemplates = false)}
        style="margin-top: 0.75rem;"
      >
        Cancel
      </button>
    </div>
  </div>
{/if}

<!-- ── Confirm Apply Dialog ── -->
{#if pendingTpl}
  <div
    class="confirm-overlay"
    transition:fade={{ duration: 200 }}
    id="tpl-confirm-overlay"
    tabindex="-1"
  >
    <div
      class="confirm-dialog"
      transition:fly={{ y: 12, duration: 200, easing: cubicOut }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <span class="confirm-icon">{pendingTpl.icon}</span>
      <h3 class="confirm-title" id="confirm-title">
        Apply "{pendingTpl.name}"?
      </h3>
      <p class="confirm-body">
        This will replace your current workout plan with the <strong
          >{pendingTpl.name}</strong
        > template. Your logged sessions are not affected.
      </p>
      <div class="confirm-btns">
        <button
          class="btn btn-secondary"
          onclick={cancelApply}
          id="confirm-cancel-btn">Cancel</button
        >
        <button
          class="btn btn-primary"
          onclick={confirmApply}
          disabled={isApplying}
          id="confirm-apply-btn"
        >
          {#if isApplying}
            <span class="btn-spinner"></span> Applying...
          {:else}
            Apply Template
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ── Save Template Modal ── -->
{#if showSaveTemplate}
  <div
    class="modal-overlay"
    transition:fade={{ duration: 200 }}
    onclick={(e) => {
      if (e.target === e.currentTarget) showSaveTemplate = false;
    }}
    id="save-template-overlay"
    tabindex="-1"
  >
    <div
      class="confirm-dialog"
      transition:fly={{ y: 12, duration: 200, easing: cubicOut }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-template-title"
    >
      <h3 class="confirm-title" id="save-template-title">Save as Template</h3>
      <p class="confirm-body">Save your current plan to use it later.</p>

      <div
        style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; text-align: left;"
      >
        <label
          for="tpl-name-input"
          style="font-size: 0.85rem; color: var(--text-muted)"
          >Template Name</label
        >
        <input
          type="text"
          class="input"
          id="tpl-name-input"
          bind:value={saveTemplateName}
          placeholder="E.g. Summer Shred"
        />
      </div>
      <div
        style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; text-align: left;"
      >
        <label
          for="tpl-desc-input"
          style="font-size: 0.85rem; color: var(--text-muted)"
          >Description (optional)</label
        >
        <textarea
          class="input"
          id="tpl-desc-input"
          bind:value={saveTemplateDesc}
          placeholder="Brief details about this split..."
          rows="2"
        ></textarea>
      </div>

      <div class="confirm-btns" style="margin-top: 1.5rem;">
        <button
          class="btn btn-secondary"
          onclick={() => (showSaveTemplate = false)}
        >
          Cancel
        </button>
        <button
          class="btn btn-primary"
          onclick={submitSaveTemplate}
          disabled={!saveTemplateName.trim()}
        >
          Save Template
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .page-title {
    font-size: 1.625rem;
    font-weight: 900;
    letter-spacing: -0.04em;
  }
  .page-sub {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  /* ── Week tabs ── */
  .week-tabs {
    display: flex;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 3px;
  }

  .week-tab {
    flex: 1;
    padding: 0.4rem 0;
    border-radius: calc(var(--radius) - 2px);
    border: none;
    background: none;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.18s var(--ease);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
  }

  .week-tab.active {
    background: var(--accent);
    color: #09090b;
    box-shadow: 0 2px 8px rgba(167, 139, 250, 0.35);
  }

  .week-tab-note {
    font-size: 0.62rem;
    font-weight: 600;
    opacity: 0.7;
  }

  /* ── Day pill ── */
  .day-pill {
    position: relative;
  }

  .today-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 5px;
    height: 5px;
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
  .move-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

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
    flex-shrink: 0;
    overflow: hidden;
  }

  .plan-mg-icon {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }

  .chip-mg-icon {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  .picker-mg-icon {
    width: 18px;
    height: 18px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .picker-icon-wrap {
    width: 30px;
    height: 30px;
    border-radius: var(--radius-xs);
    display: flex;
    align-items: center;
    justify-content: center;
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

  .rest-msg-icon {
    font-size: 2.5rem;
    line-height: 1;
    margin-bottom: 0.75rem;
  }
  .rest-msg-text {
    font-size: 0.9rem;
    color: var(--text-sub);
  }

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

  .picker-item:active {
    transform: scale(0.98);
  }

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

  /* ── Template picker sheet ── */
  .tpl-sheet {
    max-height: 88vh;
    display: flex;
    flex-direction: column;
  }

  .tpl-sheet-head {
    margin-bottom: 0.875rem;
  }

  .tpl-sheet-sub {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
  }

  .tpl-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
    flex: 1;
    padding-right: 2px; /* space for scrollbar */
  }

  .tpl-card {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.8rem 0.875rem;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    text-align: left;
    transition:
      background 0.15s,
      border-color 0.15s,
      transform 0.12s;
    width: 100%;
  }

  .tpl-card:hover {
    background: var(--surface-3);
    border-color: rgba(167, 139, 250, 0.5);
  }
  .tpl-card:active {
    transform: scale(0.985);
  }

  .tpl-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    line-height: 1;
    margin-top: 1px;
  }

  .tpl-info {
    flex: 1;
    min-width: 0;
  }

  .tpl-name {
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 0.2rem;
    letter-spacing: -0.02em;
  }

  .tpl-desc {
    font-size: 0.73rem;
    color: var(--text-muted);
    line-height: 1.45;
    margin-bottom: 0.45rem;
  }

  .tpl-meta-row {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .tpl-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    border: 1px solid;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  .tpl-badge-schedule {
    background: rgba(167, 139, 250, 0.1);
    color: var(--accent);
    border-color: rgba(167, 139, 250, 0.3);
  }

  .tpl-badge-diff.diff-beginner {
    background: rgba(74, 222, 128, 0.1);
    color: var(--green);
    border-color: rgba(74, 222, 128, 0.3);
  }

  .tpl-badge-diff.diff-intermediate {
    background: rgba(251, 191, 36, 0.1);
    color: var(--orange);
    border-color: rgba(251, 191, 36, 0.3);
  }

  .tpl-badge-diff.diff-advanced {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .tpl-arrow {
    color: var(--text-muted);
    opacity: 0.45;
    flex-shrink: 0;
    align-self: center;
    transition:
      opacity 0.15s,
      transform 0.15s;
  }

  .tpl-card:hover .tpl-arrow {
    opacity: 0.9;
    transform: translateX(2px);
  }

  /* ── Confirm overlay ── */
  .confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    animation: fade-in 0.15s ease both;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .confirm-dialog {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    max-width: 20rem;
    width: 100%;
    text-align: center;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  }

  .confirm-icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.75rem;
  }

  .confirm-title {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-bottom: 0.5rem;
  }

  .confirm-body {
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.5;
    margin-bottom: 1.25rem;
  }

  .confirm-body strong {
    color: var(--text);
    font-weight: 700;
  }

  .confirm-btns {
    display: flex;
    gap: 0.5rem;
  }

  .confirm-btns .btn {
    flex: 1;
  }

  .btn-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 0.8s linear infinite;
    margin-right: 0.3rem;
    vertical-align: middle;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .order-num {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-muted);
    min-width: 1.2rem;
    text-align: center;
  }
  .order-controls {
    display: flex;
    align-items: center;
    background: var(--surface-2);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .order-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--text);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s var(--ease);
  }
  .order-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--text) 5%, transparent);
  }
  .order-btn:disabled {
    opacity: 0.25;
    cursor: default;
  }
  .order-divider {
    width: 1px;
    height: 16px;
    background: color-mix(in srgb, var(--text) 10%, transparent);
  }
</style>
