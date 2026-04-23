<script lang="ts">
  import "./app.css";
  import BottomNav from "./lib/components/BottomNav.svelte";
  import Overview from "./lib/pages/Overview.svelte";
  import WorkoutPlan from "./lib/pages/WorkoutPlan.svelte";
  import Movements from "./lib/pages/Movements.svelte";

  type Page = "overview" | "workout-plan" | "movements";
  let currentPage = $state<Page>("overview");

  function navigate(page: Page) {
    currentPage = page;
    // Smooth scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

<div id="app-shell">
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
</style>
