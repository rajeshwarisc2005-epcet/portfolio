/* ==========================================================================
   HORIZONTAL GLOWING BUTTERFLY CONTROLLER
   Graceful horizontal gliding across viewport, smooth direction turns,
   and streaming trails of sparks and lights.
   ========================================================================== */

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    initHorizontalButterfly();
    initCursorSparkles();
    initFloatingPetals();
  });

  const LIGHT_COLORS = [
    { fill: '#ec4899', shadow: '0 0 16px rgba(236, 72, 153, 0.95), 0 0 30px rgba(244, 114, 182, 0.7)' },
    { fill: '#a855f7', shadow: '0 0 16px rgba(168, 85, 247, 0.95), 0 0 30px rgba(192, 132, 252, 0.7)' },
    { fill: '#f59e0b', shadow: '0 0 16px rgba(245, 158, 11, 0.95), 0 0 30px rgba(251, 191, 36, 0.75)' },
    { fill: '#38bdf8', shadow: '0 0 16px rgba(56, 189, 248, 0.95), 0 0 30px rgba(125, 211, 252, 0.7)' },
    { fill: '#ffffff', shadow: '0 0 18px rgba(255, 255, 255, 1), 0 0 32px rgba(253, 224, 71, 0.8)' }
  ];

  const STAR_CHARS = ['✦', '★', '✧', '⋆', '•'];

  function initHorizontalButterfly() {
    const container = document.getElementById('butterfly-container');
    const butterfly = document.getElementById('glowing-butterfly');
    if (!container || !butterfly) return;

    // Fixed comfortable horizontal cruise altitude
    const CRUISE_ALTITUDE_RATIO = 0.22; // 22% from top of screen
    let posY = window.innerHeight * CRUISE_ALTITUDE_RATIO;
    let posX = window.innerWidth * 0.15;
    let targetX = posX;

    let facingDirection = 1; // 1 = facing right, -1 = facing left
    let lastScrollY = window.scrollY;
    let isMoving = false;
    let moveTimeout = null;
    let lastSparkTime = 0;

    // Horizontal patrol state during idle
    let idleAngle = 0;
    let isScrolling = false;

    // Scroll Handler — Glides HORIZONTALLY based on scroll progression
    function onScroll() {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = maxScroll > 0 ? currentScrollY / maxScroll : 0;

      isScrolling = true;
      isMoving = true;
      butterfly.classList.add('is-moving');

      // Calculate horizontal path across the screen
      // Moves back and forth horizontally across multiple screen cycles as user scrolls down
      const cycles = 3.5;
      const wave = Math.sin(scrollProgress * Math.PI * cycles);
      const minX = 40;
      const maxX = window.innerWidth - 180;
      
      // Normalized position between minX and maxX
      targetX = minX + ((wave + 1) / 2) * (maxX - minX);

      // Determine horizontal direction
      if (scrollDiff > 0) {
        // Scrolling down: follow trajectory
        facingDirection = (Math.cos(scrollProgress * Math.PI * cycles) >= 0) ? 1 : -1;
      } else if (scrollDiff < 0) {
        // Scrolling up: reverse
        facingDirection = (Math.cos(scrollProgress * Math.PI * cycles) >= 0) ? -1 : 1;
      }

      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        isMoving = false;
        isScrolling = false;
        butterfly.classList.remove('is-moving');
      }, 160);

      // Emit continuous horizontal stream of sparks & lights
      const now = performance.now();
      if (now - lastSparkTime > 32) {
        emitHorizontalSparks(posX + (facingDirection === 1 ? 20 : 120), posY + 75);
        lastSparkTime = now;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Animation Loop — Pure horizontal movement with gentle bob
    function animate() {
      idleAngle += 0.02;

      // Update vertical position strictly to cruise altitude with micro-float
      const gentleBob = Math.sin(idleAngle * 1.8) * 8;
      posY = (window.innerHeight * CRUISE_ALTITUDE_RATIO) + gentleBob;

      // Idle smooth horizontal patrol if user isn't scrolling
      if (!isScrolling) {
        const minX = 60;
        const maxX = window.innerWidth - 190;
        const patrolWave = Math.sin(idleAngle * 0.6);
        targetX = minX + ((patrolWave + 1) / 2) * (maxX - minX);
        
        facingDirection = Math.cos(idleAngle * 0.6) >= 0 ? 1 : -1;

        // Emit occasional sparks while cruising
        if (Math.random() < 0.2) {
          emitHorizontalSparks(posX + (facingDirection === 1 ? 25 : 125), posY + 75);
        }
      }

      // Horizontal linear interpolation
      const ease = isMoving ? 0.12 : 0.045;
      const dx = targetX - posX;
      posX += dx * ease;

      // Apply purely horizontal translation & directional flip
      butterfly.style.transform = `translate3d(${posX}px, ${posY}px, 0) scaleX(${facingDirection})`;

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    // Horizontal Sparks & Lights Emitter
    function emitHorizontalSparks(x, y) {
      const color = LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)];
      const type = Math.random();

      const particle = document.createElement('div');
      particle.className = 'sparkle-particle';

      // Horizontal drift behind the butterfly
      const driftX = (facingDirection === 1 ? -1 : 1) * (Math.random() * 35 + 15);
      const driftY = (Math.random() - 0.5) * 22;

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--tx', `${driftX}px`);
      particle.style.setProperty('--ty', `${driftY}px`);

      if (type < 0.45) {
        // Twinkling Star Spark
        particle.className += ' sparkle-star';
        particle.textContent = STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)];
        const size = Math.random() * 12 + 10;
        particle.style.fontSize = `${size}px`;
        particle.style.color = color.fill;
        particle.style.textShadow = color.shadow;
      } else {
        // Radiant Light Orb
        particle.className += ' sparkle-orb';
        const size = Math.random() * 10 + 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = color.fill;
        particle.style.boxShadow = color.shadow;
      }

      container.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      }, 1300);
    }

    // Interactive Click: Flutters in place and casts light burst
    butterfly.addEventListener('click', (e) => {
      e.stopPropagation();
      for (let i = 0; i < 28; i++) {
        emitHorizontalSparks(posX + 75, posY + 75);
      }
      facingDirection *= -1; // Reverse horizontal direction
      targetX = facingDirection === 1 ? (window.innerWidth - 180) : 60;
      isMoving = true;
      butterfly.classList.add('is-moving');
      setTimeout(() => {
        isMoving = false;
        butterfly.classList.remove('is-moving');
      }, 450);
    });

    // Resize handler
    window.addEventListener('resize', () => {
      posY = window.innerHeight * CRUISE_ALTITUDE_RATIO;
      if (posX > window.innerWidth - 180) posX = window.innerWidth - 190;
    });
  }

  // Cursor Sparkles
  function initCursorSparkles() {
    let lastCursorSparkle = 0;
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastCursorSparkle > 40) {
        createCursorSparkle(e.clientX, e.clientY);
        lastCursorSparkle = now;
      }
    });

    function createCursorSparkle(x, y) {
      const sparkle = document.createElement('div');
      sparkle.className = 'cursor-sparkle';

      const color = LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)];
      const isStar = Math.random() > 0.5;

      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;

      if (isStar) {
        sparkle.textContent = '✦';
        sparkle.style.fontSize = `${Math.random() * 8 + 8}px`;
        sparkle.style.color = color.fill;
        sparkle.style.textShadow = color.shadow;
      } else {
        const size = Math.random() * 6 + 3;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.background = color.fill;
        sparkle.style.boxShadow = color.shadow;
      }

      const cdx = (Math.random() - 0.5) * 20;
      const cdy = Math.random() * -20 - 6;
      sparkle.style.setProperty('--cdx', `${cdx}px`);
      sparkle.style.setProperty('--cdy', `${cdy}px`);

      document.body.appendChild(sparkle);

      setTimeout(() => {
        if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
      }, 850);
    }
  }

  // Ambient Petals
  function initFloatingPetals() {
    const symbols = ['🌸', '✨', '🌺', '💖', '💫'];
    const count = 7;
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'floating-petal';
      petal.textContent = symbols[i % symbols.length];
      petal.style.left = `${Math.random() * 95}vw`;
      petal.style.fontSize = `${Math.random() * 10 + 14}px`;
      petal.style.animationDuration = `${Math.random() * 12 + 14}s`;
      petal.style.animationDelay = `${Math.random() * 10}s`;
      petal.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 140}px`);
      document.body.appendChild(petal);
    }
  }
})();
