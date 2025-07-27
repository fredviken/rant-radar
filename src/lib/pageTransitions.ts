import { gsap } from 'gsap';

export const pageTransitions = {
  // Exit animation for page leaving
  exitPage: (element: HTMLElement) => {
    return gsap.to(element, {
      opacity: 0,
      scale: 0.95,
      y: -20,
      duration: 0.4,
      ease: "power2.in"
    });
  },

  // Enter animation for page entering
  enterPage: (element: HTMLElement) => {
    return gsap.fromTo(element, 
      {
        opacity: 0,
        scale: 0.95,
        y: 20
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }
    );
  },

  // Seamless transition between states
  seamlessTransition: async (exitElement: HTMLElement, enterCallback: () => void) => {
    // Exit current state
    await gsap.to(exitElement, {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in"
    });

    // Call the callback to change state
    enterCallback();

    // Small delay to ensure DOM updates
    await new Promise(resolve => setTimeout(resolve, 50));

    // Enter new state
    return gsap.fromTo(exitElement, 
      {
        opacity: 0,
        scale: 1.1
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      }
    );
  }
};