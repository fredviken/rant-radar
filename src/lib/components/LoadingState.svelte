<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  interface Props {
    createdAt?: string;
  }

  let { createdAt }: Props = $props();

  let loadingContainer: HTMLDivElement;
  let spinner: HTMLDivElement;
  let innerRing: HTMLDivElement;
  let textElement: HTMLParagraphElement;
  let emojiContainer: HTMLDivElement;
  let loadingTextIndex = $state(0);
  let elapsedTime = $state('');

  const loadingTexts = [
    "Scanning Reddit for complaints...",
    "Analyzing user frustrations...",
    "Transforming rants into insights...",
    "Processing negative feedback...",
    "Enlightening through hate...",
    "Extracting constructive criticism...",
    "Turning complaints into gold..."
  ];

  const angryEmojis = ['😠', '😡', '🤬', '😤', '🙄', '😒', '😑', '💢', '🔥', '⚡'];
  const insightfulEmojis = ['🤓', '🧠', '💡', '✨', '🎯', '🔍', '📊', '💎', '🏆', '⚡', '🎉', '🚀'];

  function updateElapsedTime() {
    if (!createdAt) return;
    
    const start = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    
    if (minutes > 0) {
      elapsedTime = `${minutes}m ${seconds}s`;
    } else {
      elapsedTime = `${seconds}s`;
    }
  }

  function createFloatingEmoji() {
    const emoji = document.createElement('div');
    emoji.textContent = angryEmojis[Math.floor(Math.random() * angryEmojis.length)];
    emoji.className = 'absolute text-2xl pointer-events-none';
    
    // Position at center of spinner (50% of the spinner container)
    emoji.style.left = '50%';
    emoji.style.top = '50%';
    emoji.style.transform = 'translate(-50%, -50%)';
    
    emojiContainer.appendChild(emoji);

    // Random direction for shooting out from spinner
    const angle = Math.random() * Math.PI * 2; // Full 360 degrees
    const distance = 200 + Math.random() * 300; // 200-500px distance
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance;

    // Animate the emoji shooting out from spinner center
    gsap.to(emoji, {
      x: endX,
      y: endY,
      rotation: Math.random() * 720, // Multiple rotations
      scale: 0.5 + Math.random() * 0.5, // Shrink as it goes out
      opacity: 0,
      duration: 1.5 + Math.random() * 1, // 1.5-2.5 seconds
      ease: "power2.out",
      onComplete: () => {
        emoji.remove();
      }
    });
  }

  function createInsightBurst() {
    // Create burst of insightful emojis from center
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const emoji = document.createElement('div');
        emoji.textContent = insightfulEmojis[Math.floor(Math.random() * insightfulEmojis.length)];
        emoji.className = 'absolute text-3xl pointer-events-none';
        
        // Start from center of screen
        emoji.style.left = '50%';
        emoji.style.top = '50%';
        emoji.style.transform = 'translate(-50%, -50%)';
        
        emojiContainer.appendChild(emoji);

        // Random direction for burst effect
        const angle = (Math.PI * 2 * i) / 15 + (Math.random() - 0.5) * 0.8;
        const distance = 200 + Math.random() * 300;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        // Animate the burst
        gsap.to(emoji, {
          x: endX,
          y: endY,
          rotation: Math.random() * 720,
          scale: 0.5 + Math.random() * 1,
          opacity: 0,
          duration: 1.5 + Math.random() * 0.5,
          ease: "power2.out",
          onComplete: () => {
            emoji.remove();
          }
        });
      }, i * 50); // Stagger the burst
    }
  }

  // Export functions so parent can trigger them
  function exitLoadingSpinner() {
    return gsap.to(loadingContainer, {
      y: -window.innerHeight,
      opacity: 0,
      duration: 0.8,
      ease: "power2.in"
    });
  }

  export { createInsightBurst, exitLoadingSpinner };

  onMount(() => {
    // Initial entrance animation
    gsap.fromTo(loadingContainer, 
      { 
        opacity: 0, 
        scale: 0.8,
        y: 50 
      },
      { 
        opacity: 1, 
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)" 
      }
    );

    // Spinner animations
    gsap.to(spinner, {
      rotation: 360,
      duration: 2,
      ease: "none",
      repeat: -1
    });


    // Text transition function
    const animateText = () => {
      const tl = gsap.timeline();
      
      tl.to(textElement, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in"
      })
      .call(() => {
        loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;
      })
      .to(textElement, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    const textInterval = setInterval(animateText, 5000);

    // Start emoji bubbling (more frequent)
    const emojiInterval = setInterval(createFloatingEmoji, 400 + Math.random() * 200); // Every 0.4-0.6 seconds

    // Update elapsed time every second
    let timerInterval: NodeJS.Timeout | null = null;
    if (createdAt) {
      updateElapsedTime(); // Initial update
      timerInterval = setInterval(updateElapsedTime, 1000);
    }

    return () => {
      clearInterval(textInterval);
      clearInterval(emojiInterval);
      if (timerInterval) clearInterval(timerInterval);
      gsap.killTweensOf([spinner, textElement, loadingContainer]);
    };
  });
</script>

<div class="flex items-center justify-center min-h-screen relative">
  <div bind:this={loadingContainer} class="text-center space-y-8 relative z-10">
    <!-- Big Spinner -->
    <div class="relative">
      <div bind:this={spinner} class="rounded-full h-24 w-24 border-4 border-neutral-700 border-t-amber-400 mx-auto"></div>
      <!-- Emoji container positioned relative to spinner -->
      <div bind:this={emojiContainer} class="absolute inset-0 pointer-events-none"></div>
    </div>
    
    <!-- Loading Text -->
    <div class="space-y-2">
      <p bind:this={textElement} class="text-2xl font-semibold text-neutral-100">
        {loadingTexts[loadingTextIndex]}
      </p>
      <div class="space-y-1">
        <p class="text-neutral-500">
          This may take a few minutes
        </p>
        {#if elapsedTime}
          <p class="text-amber-400 text-sm font-medium">
            Running for {elapsedTime}
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>