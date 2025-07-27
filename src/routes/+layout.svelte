<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>


<svelte:head>
	<title>Rant Radar</title>
</svelte:head>

<div class="relative">
	<div
		class="absolute inset-0 size-full bg-dot-amber-500 animate-pulse mask-radial-at-center opacity-70"
		style="
				-webkit-mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 90%, rgba(0,0,0,1) 100%);
				mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 90%, rgba(0,0,0,1) 100%);
			"
	></div>
	<div class="relative !z-50">{@render children()}</div>
</div>
