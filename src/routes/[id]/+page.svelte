<script lang="ts">
  import { page } from '$app/state';
  import { supabase } from '$lib/supabase';
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap';
  import { pageTransitions } from '$lib/pageTransitions';
  import type { Job } from '$lib/types';
  import type { RealtimeChannel } from '@supabase/supabase-js';
  import LoadingState from '$lib/components/LoadingState.svelte';
  import ErrorState from '$lib/components/ErrorState.svelte';
  import CompletedState from '$lib/components/CompletedState.svelte';

  let job = $state<Job | null>(null);
  let loading = $state(true);
  let error = $state('');
  let realtimeChannel: RealtimeChannel | null = null;
  let pageContainer: HTMLDivElement;
  // let previousStatus: string | null = null;
  let loadingComponent = $state<LoadingState | undefined>();
  let completedContainer = $state<HTMLDivElement | undefined>();

  const jobId = $derived(page.params.id);

  async function loadJob() {
    try {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      job = data as Job;
    } catch (err) {
      console.error('Error loading job:', err);
      error = err instanceof Error ? err.message : 'Failed to load job';
    } finally {
      loading = false;
    }
  }

  function setupRealtime() {
    realtimeChannel = supabase
      .channel(`job:${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          console.log('Job updated:', payload.new);
          const newJob = payload.new as Job;
          
          // Trigger insight burst when completing
          if (job && job.status !== 'completed' && newJob.status === 'completed' && loadingComponent) {
            loadingComponent.createInsightBurst();
            
            // Wait for burst, then custom transition
            setTimeout(async () => {
              // Exit spinner upward
              if (loadingComponent) {
                await loadingComponent.exitLoadingSpinner();
              }
              
              // Change state
              job = newJob;
              
              // Wait for DOM update, then slide in completed content
              setTimeout(() => {
                if (completedContainer) {
                  pageTransitions.slideInFromBottom(completedContainer);
                }
              }, 50);
            }, 1000);
          } else if (job && job.status !== newJob.status && pageContainer) {
            // Regular transition for other status changes
            pageTransitions.seamlessTransition(pageContainer, () => {
              job = newJob;
            });
          } else {
            job = newJob;
          }
        }
      )
      .subscribe();
  }

  onMount(() => {
    loadJob();
    setupRealtime();
    
    // Initial page entrance animation
    if (pageContainer) {
      pageTransitions.enterPage(pageContainer);
    }
  });

  onDestroy(() => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
  });
</script>

<div class="min-h-screen">
  <div bind:this={pageContainer} class="max-w-4xl mx-auto space-y-8" class:py-8={!(loading || (job && (job.status === 'pending' || job.status === 'processing')))}>

    {#if loading || (job && (job.status === 'pending' || job.status === 'processing'))}
      <LoadingState bind:this={loadingComponent} createdAt={job?.created_at} />
    {:else if error}
      <ErrorState {error} onRetry={loadJob} />
    {:else if job?.status === 'failed'}
      <ErrorState error={job.error_message || 'Analysis failed'} onRetry={loadJob} />
    {:else if job?.status === 'completed'}
      <div bind:this={completedContainer} class="space-y-8">
        <CompletedState {job} />
        <!-- Back to Home -->
        <div class="text-left">
          <a href="/" class="inline-flex items-center px-4 py-2 border border-neutral-700 bg-neutral-600/10 backdrop-blur-sm text-neutral-100 rounded-lg transition-colors">
            ← Analyze another query
          </a>
        </div>
      </div>
    {/if}

  </div>
</div>