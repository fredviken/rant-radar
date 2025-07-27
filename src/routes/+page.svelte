<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import type { ApiResponse } from '$lib/types';
	import { addRecentAnalysis, getRecentAnalyses, type RecentAnalysis } from '$lib/recentAnalyses';

	let query = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let pageContainer: HTMLDivElement;
	let header: HTMLDivElement;
	let form: HTMLFormElement;
	let recentSection: HTMLDivElement = $state(null!);
	let recentAnalyses = $state<RecentAnalysis[]>([]);

	onMount(async () => {
		// Initial entrance animation for header and form
		const tl = gsap.timeline();
		
		tl.fromTo(header, 
			{ opacity: 0, y: -30 },
			{ opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
		)
		.fromTo(form,
			{ opacity: 0, y: 30 },
			{ opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
			"-=0.4"
		);

		// Load recent analyses and fetch their current status
		const recent = getRecentAnalyses();
		
		// Fetch status for each analysis
		const analysesWithStatus = await Promise.all(
			recent.map(async (analysis) => {
				try {
					const { data } = await supabase
						.from('jobs')
						.select('status')
						.eq('id', analysis.id)
						.single();
					
					return { ...analysis, status: data?.status || 'unknown' };
				} catch {
					return { ...analysis, status: 'unknown' };
				}
			})
		);
		
		recentAnalyses = analysesWithStatus;

		// Animate recent section after data is loaded and DOM is updated
		if (analysesWithStatus.length > 0) {
			setTimeout(() => {
				if (recentSection) {
					gsap.fromTo(recentSection,
						{ opacity: 0, y: 20 },
						{ opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.5 }
					);

					// Animate recent items with stagger
					gsap.fromTo(".recent-item",
						{ opacity: 0, x: -20, scale: 0.95 },
						{ opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "power2.out", delay: 0.5, stagger: 0.1 }
					);
				}
			}, 50); // Small delay to ensure DOM is updated
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!query.trim()) return;

		isLoading = true;
		error = '';

		// Exit animations before navigation
		const tl = gsap.timeline();
		
		tl.to(form, {
			opacity: 0,
			y: -20,
			scale: 0.95,
			duration: 0.4,
			ease: "power2.in"
		})
		.to(header, {
			opacity: 0,
			y: -20,
			scale: 0.95,
			duration: 0.3,
			ease: "power2.in"
		}, "-=0.2")
		.to(pageContainer, {
			opacity: 0,
			scale: 0.9,
			duration: 0.3,
			ease: "power2.in"
		}, "-=0.1");

		try {
			// Wait for animations to complete
			await tl;

			const { data, error: apiError } = await supabase.functions.invoke('api', {
				body: { query: query.trim() }
			});

			if (apiError) {
				throw new Error(apiError.message);
			}

			const response = data as ApiResponse;
			if (response?.success && response?.jobId) {
				// Save to recent analyses
				addRecentAnalysis(response.jobId, query.trim());
				
				// Redirect to job status page
				goto(`/${response.jobId}`);
			} else {
				throw new Error(response?.error || 'Failed to start analysis');
			}
		} catch (err) {
			console.error('Error:', err);
			error = err instanceof Error ? err.message : 'Something went wrong';
			
			// Animate back in on error
			gsap.to([pageContainer, header, form], {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: 0.5,
				ease: "power2.out",
				stagger: 0.1
			});
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Rant Radar - Turn criticism into constructive feedback</title>
	<meta name="description" content="AI-powered tool that analyzes Reddit complaints and transforms them into actionable insights. Enlightened by hate." />
</svelte:head>

<div bind:this={pageContainer} class="flex min-h-screen items-center justify-center p-8">
	<div class="w-full max-w-2xl space-y-8">
		<!-- Header -->
		<div bind:this={header} class="space-y-4 text-center opacity-0">
			<h1 class="text-4xl font-bold text-neutral-100">Rant radar</h1>
			<!-- <p class="text-xl text-neutral-400">
        Enlightened by hate
      </p> -->
			<p class="text-neutral-500">
				Turn criticism, complaints and rants into constructive feedback.
			</p>
		</div>

		<!-- Form -->
		<form bind:this={form} onsubmit={handleSubmit} class="space-y-6 opacity-0">
			<div class="space-y-2">
				<label for="query" class="block text-sm font-medium text-neutral-300">
					What would you like to analyze?
				</label>
				<div class="gap-4 grid-cols-1 sm:grid-cols-[1fr_auto] grid">
					<input
						id="query"
						bind:value={query}
						type="text"
						placeholder="A product, service or anything else..."
						class="w-full rounded-lg flex-1 border border-neutral-700 bg-neutral-800 px-4 py-2
                   text-neutral-100 placeholder-neutral-500
                   transition-colors focus:border-transparent focus:ring-2 focus:ring-amber-600
                   focus:outline-none"
						disabled={isLoading}
					/>

					<button
						type="submit"
						disabled={!query.trim() || isLoading}
						class="rounded-lg active:scale-95 duration-200 border cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:border-amber-400 w-full border-amber-500 bg-gradient-to-tl from-amber-700 to-amber-600 px-6 py-3 text-nowrap ring-1 ring-amber-800"
					>
						{isLoading ? 'Analyzing...' : 'Analyze complaints'}
					</button>
				</div>
			</div>
			<!-- Error Message -->
			{#if error}
				<div class="rounded-lg border border-red-700 bg-red-900/50 p-4">
					<p class="text-sm text-red-200">{error}</p>
				</div>
			{/if}
		</form>

		<!-- Recent Requests -->
		{#if recentAnalyses.length > 0}
			<div bind:this={recentSection} class="space-y-4 mt-16 opacity-0">
				<h2 class="text-lg font-medium text-neutral-300">Recent requests</h2>
				<div class="space-y-4">
					{#each recentAnalyses as analysis}
						<a 
							href="/{analysis.id}" 
							class="recent-item block p-3 rounded-lg border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 transition-colors opacity-0"
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<span class="text-neutral-200 font-medium">{analysis.query}</span>
									<span class="text-xs px-2 py-1 rounded-full capitalize" 
										class:bg-yellow-900={analysis.status === 'pending'}
										class:text-yellow-200={analysis.status === 'pending'}
										class:bg-blue-900={analysis.status === 'processing'}
										class:text-blue-200={analysis.status === 'processing'}
										class:bg-green-900={analysis.status === 'completed'}
										class:text-green-200={analysis.status === 'completed'}
										class:bg-red-900={analysis.status === 'failed'}
										class:text-red-200={analysis.status === 'failed'}
										class:bg-neutral-700={analysis.status === 'unknown'}
										class:text-neutral-400={analysis.status === 'unknown'}
									>
										{analysis.status}
									</span>
								</div>
								<span class="text-xs text-neutral-500">
									{new Date(analysis.createdAt).toLocaleString()}
								</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
