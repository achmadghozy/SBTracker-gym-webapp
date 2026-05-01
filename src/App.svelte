<script lang="ts">
  import "./app.css";
  import BottomNav from "./lib/components/BottomNav.svelte";
  import Overview from "./lib/pages/Overview.svelte";
  import WorkoutPlan from "./lib/pages/WorkoutPlan.svelte";
  import Movements from "./lib/pages/Movements.svelte";
  import { isReady } from "./lib/stores/workout";

  type Page = "overview" | "workout-plan" | "movements";
  let currentPage = $state<Page>("overview");

  function navigate(page: Page) {
    currentPage = page;
    // Smooth scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

<div id="app-shell">
  {#if $isReady}
    {#key currentPage}
      {#if currentPage === "overview"}
        <Overview />
      {:else if currentPage === "workout-plan"}
        <WorkoutPlan />
      {:else}
        <Movements />
      {/if}
    {/key}

    <BottomNav current={currentPage} onChange={navigate} />
  {:else}
    <div class="loading-screen">
      <div class="spinner"></div>
    </div>
  {/if}
</div>

<style>
  #app-shell {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    max-width: 100%;
    margin: 0 auto;
    position: relative;
  }

  /* Desktop centering border — mobile app frame on desktop */
  @media (min-width: 470px) {
    :global(body) {
      background: #050507;
    }

    #app-shell {
      border-left: 1px solid rgba(255, 255, 255, 0.05);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 60px rgba(0, 0, 0, 0.6);
    }
  }

  .loading-screen {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100svh;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(167, 139, 250, 0.2);
    border-radius: 50%;
    border-top-color: var(--accent);
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
