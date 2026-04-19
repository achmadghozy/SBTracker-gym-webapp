<script lang="ts">
  import { DAY_SHORT } from '../types';

  type Page = 'overview' | 'workout-plan' | 'movements';

  interface Props {
    current: Page;
    onChange: (p: Page) => void;
  }

  let { current, onChange }: Props = $props();

  const tabs: { id: Page; label: string; icon: string }[] = [
    { id: 'overview',     label: 'Today',     icon: 'home'     },
    { id: 'workout-plan', label: 'Plan',       icon: 'calendar' },
    { id: 'movements',    label: 'Movements',  icon: 'dumbbell' },
  ];
</script>

<nav class="bottom-nav" aria-label="Main navigation">
  {#each tabs as tab}
    <button
      class="nav-item"
      class:active={current === tab.id}
      onclick={() => onChange(tab.id)}
      aria-label={tab.label}
      aria-current={current === tab.id ? 'page' : undefined}
      id={`nav-${tab.id}`}
    >
      <span class="nav-icon" aria-hidden="true">
        {#if tab.icon === 'home'}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        {:else if tab.icon === 'calendar'}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
          </svg>
        {:else}
          <!-- Dumbbell icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6.5 6.5h11"/>
            <path d="M6.5 17.5h11"/>
            <path d="M3 9.5h3v5H3z"/>
            <path d="M18 9.5h3v5h-3z"/>
            <path d="M6 8v8"/>
            <path d="M18 8v8"/>
          </svg>
        {/if}
      </span>
      <span class="nav-label">{tab.label}</span>
      {#if current === tab.id}
        <span class="nav-dot" aria-hidden="true"></span>
      {/if}
    </button>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--nav-height);
    background: rgba(18, 18, 21, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-bottom: env(safe-area-inset-bottom, 0);
    z-index: 40;
    max-width: 480px;
    margin: 0 auto;
    /* Stretch to full width but keep centered on desktop */
    width: 100%;
    left: 50%;
    transform: translateX(-50%);
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 0.5rem 0;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.2s var(--ease);
    position: relative;
    touch-action: manipulation;
  }

  .nav-item:active {
    transform: scale(0.92);
  }

  .nav-item.active {
    color: var(--accent);
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s var(--ease);
  }

  .nav-item.active .nav-icon {
    transform: translateY(-1px);
  }

  .nav-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .nav-dot {
    position: absolute;
    bottom: 6px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--accent);
    animation: pop-in 0.2s var(--ease);
  }
</style>
