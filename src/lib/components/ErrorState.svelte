<script lang="ts">
  interface Props {
    error: string;
    onRetry?: () => void;
  }

  let { error, onRetry }: Props = $props();
</script>

<div class="p-6 bg-red-900/50 border border-red-700 rounded-lg text-center">
  <div class="space-y-4">
    <div class="text-red-400 text-5xl">⚠️</div>
    <div>
      <h3 class="text-lg font-semibold text-red-200 mb-2">Something went wrong</h3>
      <p class="text-red-200">{error}</p>
    </div>
    {#if onRetry}
      <button 
        onclick={onRetry}
        class="px-4 py-2 bg-red-800 hover:bg-red-700 text-red-100 rounded-lg transition-colors"
      >
        Try Again
      </button>
    {/if}
  </div>
</div>