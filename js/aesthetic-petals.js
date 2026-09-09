/* ==========================================================================
   AESTHETIC & FEMININE AMBIENT PETALS & FAIRYDUST SPARKLES
   Gentle drifting sakura & rose petals with subtle cursor stardust
   ========================================================================== */

(function () {
  'use strict';

  // Petal SVG shapes (delicate, curved sakura & rose petals)
  const petalSVGs = [
    // Soft Sakura Blossom Petal with notch
    `<svg class="petal-svg" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sakuraGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fed7aa" stop-opacity="0.85" />
          <stop offset="35%" stop-color="#fbcfe8" stop-opacity="0.9" />
          <stop offset="80%" stop-color="#f472b6" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#ec4899" stop-opacity="0.75" />
        </linearGradient>
      </defs>
      <path d="M16 2 C9 5 2 13 2 23 C2 31 8 36 16 36 C24 36 30 31 30 23 C30 13 23 5 16 2 Z" fill="url(#sakuraGrad1)" />
      <path d="M16 2 L16 10" stroke="#f43f5e" stroke-width="0.8" stroke-linecap="round" opacity="0.4" />
    </svg>`,

    // Curled Rose Petal
    `<svg class="petal-svg" viewBox="0 0 34 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="roseGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff1f2" stop-opacity="0.9" />
          <stop offset="45%" stop-color="#fda4af" stop-opacity="0.85" />
          <stop offset="85%" stop-color="#fb7185" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#e11d48" stop-opacity="0.7" />
        </linearGradient>
      </defs>
      <path d="M17 1 C7 3 1 12 1 21 C1 30 8 35 17 35 C26 35 33 30 33 21 C33 12 27 3 17 1 Z" fill="url(#roseGrad2)" />
    </svg>`,

    // Golden Blush Ethereal Petal
    `<svg class="petal-svg" viewBox="0 0 30 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldBlushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8" />
          <stop offset="50%" stop-color="#fbcfe8" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#c084fc" stop-opacity="0.75" />
        </linearGradient>
      </defs>
      <path d="M15 1 C8 4 2 11 2 20 C2 28 8 33 15 33 C22 33 28 28 28 20 C28 11 22 4 15 1 Z" fill="url(#goldBlushGrad)" />
    </svg>`
  ];

  function initAestheticPetals() {
    const container = document.getElementById('ambient-petals-container');
    if (!container) return;

    // Maintain a peaceful density of 18-24 floating petals
    const MAX_PETALS = 20;

    function spawnPetal() {
      if (document.hidden) return;
      if (container.childElementCount >= MAX_PETALS) return;

      const petal = document.createElement('div');
      petal.className = 'petal-item';

      // Random SVG
      petal.innerHTML = petalSVGs[Math.floor(Math.random() * petalSVGs.length)];

      // Random starting coordinates across the top of viewport
      const startX = Math.random() * window.innerWidth;
      const driftX = (Math.random() - 0.4) * 160; // gentle horizontal breeze drift
      const rotation = (Math.random() - 0.5) * 720;
      const duration = 9 + Math.random() * 8; // 9s - 17s for tranquil slow motion
      const size = 18 + Math.random() * 16; // 18px - 34px

      petal.style.left = `${startX}px`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 1.18}px`;
      petal.style.setProperty('--fall-x', `${driftX}px`);
      petal.style.setProperty('--fall-rot', `${rotation}deg`);
      petal.style.animationDuration = `${duration}s`;

      container.appendChild(petal);

      // Remove after animation completes
      setTimeout(() => {
        if (petal.parentNode === container) {
          container.removeChild(petal);
        }
      }, duration * 1000);
    }

    // Initial gentle batch
    for (let i = 0; i < 8; i++) {
      setTimeout(spawnPetal, i * 400);
    }

    // Continuous tranquil interval
    setInterval(spawnPetal, 700);
  }

  /* Fairy Stardust Cursor Sparkles */
  function initFairyStardust() {
    let lastTime = 0;
    const sparkleColors = ['#f472b6', '#c084fc', '#fbbf24', '#fb7185', '#a855f7', '#fbcfe8'];

    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastTime < 55) return; // throttle for silky performance
      lastTime = now;

      createSparkle(e.clientX, e.clientY);
    });

    function createSparkle(x, y) {
      const star = document.createElement('div');
      star.className = 'cursor-stardust';

      const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      const size = 6 + Math.random() * 7;
      const dx = (Math.random() - 0.5) * 36;
      const dy = (Math.random() - 0.5) * 36 - 15;

      star.style.left = `${x - size / 2}px`;
      star.style.top = `${y - size / 2}px`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.setProperty('--sdx', `${dx}px`);
      star.style.setProperty('--sdy', `${dy}px`);
      star.style.background = `radial-gradient(circle, #ffffff 15%, ${color} 85%, transparent 100%)`;
      star.style.boxShadow = `0 0 10px ${color}, 0 0 20px rgba(236,72,153,0.4)`;

      document.body.appendChild(star);

      setTimeout(() => {
        if (star.parentNode === document.body) {
          document.body.removeChild(star);
        }
      }, 900);
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAestheticPetals();
      initFairyStardust();
    });
  } else {
    initAestheticPetals();
    initFairyStardust();
  }
})();
