<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import type { ApiResponse } from '$lib/types';

	let query = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let pageContainer: HTMLDivElement;
	let header: HTMLDivElement;
	let form: HTMLFormElement;

	onMount(() => {
		// Initial entrance animation
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

<div bind:this={pageContainer} class="flex min-h-screen items-center justify-center p-8">
	<div class="w-full max-w-2xl space-y-8">
		<!-- Header -->
		<div bind:this={header} class="space-y-4 text-center">
			<h1 class="text-4xl font-bold text-neutral-100">Rant radar</h1>
			<!-- <p class="text-xl text-neutral-400">
        Enlightened by hate
      </p> -->
			<p class="text-neutral-500">
				Turn criticism, complaints and rants into constructive feedback.
			</p>
		</div>

		<!-- Form -->
		<form bind:this={form} onsubmit={handleSubmit} class="space-y-6">
			<div class="space-y-2">
				<label for="query" class="block text-sm font-medium text-neutral-300">
					What would you like to analyze?
				</label>
				<div class="gap-4 grid-cols-1 sm:grid-cols-[1fr_auto] grid">
					<input
						id="query"
						bind:value={query}
						type="text"
						placeholder="e.g., Supabase, React, Vercel..."
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
	</div>
</div>
