<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import type { Job } from '$lib/types';

  interface Props {
    job: Job;
  }

  let { job }: Props = $props();

  const sortedComplaints = $derived(
    job.result?.complaints 
      ? [...job.result.complaints].sort((a, b) => (b.sources?.length || 0) - (a.sources?.length || 0))
      : []
  );

  onMount(() => {
    // Animate in the header stats
    gsap.fromTo('.stats-header', {
      opacity: 0,
      y: -20
    }, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Animate in the summary
    gsap.fromTo('.summary-section', {
      opacity: 0,
      y: 20
    }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay: 0.2,
      ease: 'power2.out'
    });

    // Stagger animate the complaint cards
    gsap.fromTo('.complaint-card', {
      opacity: 0,
      y: 30,
      scale: 0.98
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.4,
      ease: 'power2.out'
    });

  });
</script>

<div class="space-y-8 py-16">
  <!-- Header Stats -->
  <div class="stats-header">
    <h2 class="text-2xl font-semibold text-neutral-100 mb-3">Anlysis completed!</h2>
    <p class="text-neutral-400">
      {job.result?.complaints?.length || 0} complaints • {job.result?.totalPostsAnalyzed || 0} posts analyzed
    </p>
  </div>

  <!-- Summary -->
  {#if job.result?.summary}
    <div class="summary-section">
      <p class="text-neutral-400 leading-relaxed">{job.result.summary}</p>
    </div>
  {/if}

  <!-- Complaints Grid -->
  {#if sortedComplaints.length > 0}
    <div class="grid gap-6">
      {#each sortedComplaints as complaint}
        <div class="complaint-card p-6 bg-neutral-800 border border-neutral-700 rounded-lg">
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <h4 class="font-semibold text-neutral-100 text-lg flex-1">{complaint.issue}</h4>
            <div class="flex items-center space-x-2 ml-4 flex-shrink-0">
              <span class="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs rounded">
                {complaint.category}
              </span>
            </div>
          </div>
          
          
          <!-- Source Badges -->
          {#if complaint.sources && complaint.sources.length > 0}
            <div>
              <p class="text-neutral-400 text-sm mb-2">Sources ({complaint.sources.length})</p>
              <div class="flex flex-wrap gap-2">
              {#each complaint.sources as source}
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-2 py-1 bg-neutral-700 hover:bg-neutral-600 
                         text-neutral-300 rounded-full text-xs 
                         transition-colors hover:text-neutral-100"
                >
                  <!-- Reddit Logo SVG -->
                  <svg class="w-3 h-3 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  <span class="font-medium">r/{source.subreddit}</span>
                  <span class="truncate max-w-[200px]">
                    {source.postTitle.length > 25 ? source.postTitle.slice(0, 25) + '...' : source.postTitle}
                  </span>
                </a>
              {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

</div>