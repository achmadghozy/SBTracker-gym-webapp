<script lang="ts">
  import {
    movements,
    addMovement,
    updateMovement,
    deleteMovement,
    lastWeights,
  } from "../stores/workout";
  import {
    MUSCLE_META,
    MUSCLE_GROUPS,
    type Movement,
    type MuscleGroup,
  } from "../types";
  import { MUSCLE_ICONS } from '../../assets/muscleIcons';
  import { swipeClose } from '../actions/swipeClose';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  // ── Filter state ─────────────────────────────────────────────
  let activeFilter = $state<MuscleGroup | "all">("all");

  let filteredMovements = $derived(
    activeFilter === "all"
      ? $movements
      : $movements.filter((m) => m.muscleGroup === activeFilter),
  );

  // Group by muscle group for display
  let groups = $derived(
    MUSCLE_GROUPS.map((mg) => ({
      mg,
      moves: filteredMovements.filter((m) => m.muscleGroup === mg),
    })).filter((g) => g.moves.length > 0),
  );

  // Count per muscle group (for filter tab badges)
  function countForGroup(mg: MuscleGroup) {
    return $movements.filter((m) => m.muscleGroup === mg).length;
  }

  // ── Add / Edit modal ─────────────────────────────────────────
  let showForm = $state(false);
  let editId   = $state<string | null>(null);
  let fName    = $state('');
  let fGroup   = $state<MuscleGroup>('chest');

  function openAdd() {
    editId = null; fName = ''; fGroup = 'chest';
    showForm = true;
  }

  function openEdit(m: Movement) {
    editId = m.id; fName = m.name; fGroup = m.muscleGroup;
    showForm = true;
  }

  function closeForm() { showForm = false; editId = null; }

  function saveForm() {
    if (!fName.trim()) return;
    if (editId) {
      updateMovement(editId, { name: fName.trim(), muscleGroup: fGroup });
    } else {
      addMovement({ id: `custom-${Date.now()}`, name: fName.trim(), muscleGroup: fGroup, isCustom: true });
    }
    closeForm();
  }

  // ── Delete confirm sheet ──────────────────────────────────────
  let deleteTarget = $state<Movement | null>(null);

  function requestDelete(m: Movement) {
    deleteTarget = m;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMovement(deleteTarget.id);
    deleteTarget = null;
  }

  function cancelDelete() {
    deleteTarget = null;
  }
</script>

<main class="page" id="movements-page">
  <!-- ── Header ── -->
  <div class="page-header">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="page-title">Movements</h1>
        <p class="page-sub">{$movements.length} exercises in library</p>
      </div>
      <button
        class="btn btn-primary btn-sm"
        onclick={openAdd}
        id="add-movement-btn"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New
      </button>
    </div>
  </div>

  <!-- ── Filter tabs ── -->
  <div class="filter-tabs" role="tablist" aria-label="Filter by muscle group">
    <button
      class="filter-tab"
      class:active={activeFilter === "all"}
      role="tab"
      aria-selected={activeFilter === "all"}
      onclick={() => (activeFilter = "all")}
      id="filter-all"
    >
      All
      <span class="tab-count">{$movements.length}</span>
    </button>

    {#each MUSCLE_GROUPS as mg}
      {@const meta = MUSCLE_META[mg]}
      {@const count = countForGroup(mg)}
      <button
        class="filter-tab"
        class:active={activeFilter === mg}
        role="tab"
        aria-selected={activeFilter === mg}
        onclick={() => (activeFilter = mg)}
        id={`filter-${mg}`}
      >
        <img class="tab-mg-icon" src={MUSCLE_ICONS[mg]} alt={meta.label} />
        {meta.label}
        <span class="tab-count">{count}</span>
      </button>
    {/each}
  </div>

  <!-- ── Movement groups ── -->
  {#if groups.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🏋️</div>
      <p class="empty-title">No movements yet</p>
      <p class="empty-desc">Tap "New" to add your first exercise.</p>
    </div>
  {:else}
    {#each groups as group}
      {@const meta = MUSCLE_META[group.mg]}

      <div class="group-section" id={`group-${group.mg}`}>
          <div class="group-header">
            <span class="group-label">{meta.label}</span>
            <span class="group-count">{group.moves.length}</span>
          </div>

        <div class="moves-grid">
          {#each group.moves as move, i}
            <div
              class="move-card card"
              id={`move-lib-${move.id}`}
              style="animation-delay: {i * 20}ms"
            >
              <div class="flex items-start justify-between gap-2">
                <!-- Left: icon + name -->
                <div
                  class="flex items-center gap-2 flex-1"
                  style="min-width: 0;"
                >
                  <span
                    class="mv-icon-wrap"
                    style="background: color-mix(in srgb, {meta.color} 14%, transparent); border-color: color-mix(in srgb, {meta.color} 28%, transparent);"
                  >
                    <img class="mv-mg-icon" src={MUSCLE_ICONS[group.mg]} alt={meta.label} />
                  </span>
                  <div class="flex-1 truncate">
                    <div class="flex items-center gap-2">
                      <p class="mv-name truncate">{move.name}</p>
                      {#if move.isCustom}
                        <span class="badge badge-accent custom-tag">Custom</span
                        >
                      {/if}
                    </div>
                    <div class="mv-stats">
                      {#if $lastWeights[move.id]}
                        <span class="last-weight-pill">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/></svg>
                          {$lastWeights[move.id]}kg
                        </span>
                      {:else}
                        <span class="stat-lbl" style="font-size:0.7rem">No sessions yet</span>
                      {/if}
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="move-actions">
                  <button
                    class="btn-icon action-btn"
                    onclick={() => openEdit(move)}
                    aria-label="Edit {move.name}"
                    id={`edit-move-${move.id}`}
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
                      <path
                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      />
                      <path
                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      />
                    </svg>
                  </button>
                  <button
                    class="btn-icon action-btn danger-btn"
                    onclick={() => requestDelete(move)}
                    aria-label="Delete {move.name}"
                    id={`delete-move-${move.id}`}
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
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</main>

<!-- ── Add / Edit modal ── -->
{#if showForm}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
  <div
    class="modal-overlay"
    transition:fade={{ duration: 200 }}
    onclick={(e) => {
      if (e.target === e.currentTarget) closeForm();
    }}
    id="movement-form-modal"
    tabindex="-1"
  >
    <div
      class="modal-sheet"
      transition:fly={{ y: '100%', duration: 300, easing: cubicOut }}
      use:swipeClose={{ onClose: closeForm }}
      aria-modal="true"
      aria-label={editId ? "Edit exercise" : "Add exercise"}
      tabindex="-1"
    >
      <div class="modal-handle"></div>
      <h2 class="modal-title">{editId ? "Edit Exercise" : "New Exercise"}</h2>

      <form
        onsubmit={(e) => {
          e.preventDefault();
          saveForm();
        }}
        class="form-stack"
        id="movement-form"
      >
        <!-- Name -->
        <div class="form-group">
          <label class="label" for="f-name">Exercise Name</label>
          <input
            id="f-name"
            class="input"
            bind:value={fName}
            placeholder="e.g. Bench Press"
            required
          />
        </div>

        <!-- Muscle group -->
        <div class="form-group">
          <label class="label" for="f-group">Muscle Group</label>
          <select id="f-group" class="input" bind:value={fGroup}>
            {#each MUSCLE_GROUPS as mg}
              <option value={mg}
                >{MUSCLE_META[mg].icon} {MUSCLE_META[mg].label}</option
              >
            {/each}
          </select>
        </div>

        <!-- Buttons -->
        <div class="form-btns">
          <button
            type="button"
            class="btn btn-secondary"
            onclick={closeForm}
            id="cancel-form-btn"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" id="save-form-btn">
            {editId ? "Save Changes" : "Add Exercise"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- ── Delete confirmation sheet ── -->
{#if deleteTarget}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
  <div
    class="modal-overlay"
    transition:fade={{ duration: 200 }}
    onclick={(e) => {
      if (e.target === e.currentTarget) cancelDelete();
    }}
    id="delete-confirm-modal"
    tabindex="-1"
  >
    <div
      class="modal-sheet delete-sheet"
      transition:fly={{ y: '100%', duration: 300, easing: cubicOut }}
      use:swipeClose={{ onClose: cancelDelete }}
      aria-modal="true"
      aria-label="Confirm delete"
      tabindex="-1"
    >
      <div class="modal-handle"></div>

      <div class="del-icon-wrap">
        <span class="del-icon">🗑️</span>
      </div>
      <h2 class="del-title">Remove Exercise?</h2>
      <p class="del-body">
        "<strong>{deleteTarget.name}</strong>" will be removed from your library
        and any workout plans that use it.
      </p>

      <div class="del-actions">
        <button
          class="btn btn-secondary btn-full"
          onclick={cancelDelete}
          id="cancel-delete-btn"
        >
          Cancel
        </button>
        <button
          class="btn btn-danger btn-full"
          onclick={confirmDelete}
          id="confirm-delete-btn"
        >
          Remove
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

  /* ── Tab count badge ── */
  .tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--surface-3);
    color: var(--text-muted);
    font-size: 0.62rem;
    font-weight: 700;
  }

  .filter-tab.active .tab-count {
    background: rgba(167, 139, 250, 0.25);
    color: var(--accent);
  }

  /* ── Group section ── */
  .group-section {
    margin-bottom: 0.25rem;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    margin-top: 1.125rem;
  }

  .group-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .group-label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-sub);
    flex: 1;
  }

  .group-count {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-muted);
    background: var(--surface-2);
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
  }

  /* ── Move card ── */
  .moves-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .move-card {
    animation: page-in 0.3s var(--ease) both;
    padding: 0.875rem 1rem;
  }

  .mv-icon-wrap {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-xs);
    border: 1px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }

  .mv-mg-icon {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }

  .tab-mg-icon {
    width: 14px;
    height: 14px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .mv-name {
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  .mv-stats {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.25rem;
  }

  .stat-pill {
    display: flex;
    align-items: baseline;
    gap: 0.2rem;
  }

  .stat-val {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-sub);
  }

  .stat-lbl {
    font-size: 0.68rem;
    color: var(--text-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-sep {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .last-weight-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    letter-spacing: -0.01em;
  }

  .custom-tag {
    flex-shrink: 0;
    font-size: 0.6rem;
  }

  /* ── Actions ── */
  .move-actions {
    display: flex;
    gap: 0.375rem;
    align-items: flex-start;
    flex-shrink: 0;
  }

  .action-btn {
    width: 30px;
    height: 30px;
    border-radius: var(--radius-xs);
    flex-shrink: 0;
  }

  .danger-btn {
    color: var(--red);
    background: var(--red-dim);
    border-color: rgba(248, 113, 113, 0.2);
  }

  .danger-btn:hover {
    background: rgba(248, 113, 113, 0.22);
    color: var(--red);
  }

  /* ── Form ── */
  .form-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.75rem;
  }

  .form-btns {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .form-btns .btn {
    flex: 1;
  }

  /* ── Delete confirm sheet ── */
  .delete-sheet {
    text-align: center;
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1.75rem);
    animation: slide-up 0.3s var(--ease) !important;
  }

  .del-icon-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 0.75rem;
  }

  .del-icon {
    font-size: 2.25rem;
    line-height: 1;
    animation: bounce-in 0.4s var(--ease);
  }

  .del-title {
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-bottom: 0.625rem;
  }

  .del-body {
    font-size: 0.875rem;
    color: var(--text-sub);
    line-height: 1.5;
    max-width: 280px;
    margin: 0 auto 1.5rem;
  }

  .del-body strong {
    color: var(--text);
  }

  .del-actions {
    display: flex;
    gap: 0.75rem;
  }
</style>
