/* ==========================================================================
   RAJESHWARI PORTFOLIO — CYBER-LUXE INTERACTIVE APP CONTROLLER
   3D Tilt Cards, Neon Cursor Spotlight, Domain Switcher, Reels Playback
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initDomainTabs();
  initSmoothScroll();
  initMarqueeVideos();
  initReelModal();
  init3DTilt();
  initCyberSpotlight();
  initCyberBackgroundCanvas();
});

/* Dynamic Interactive Neon Particle Constellation Network */
function initCyberBackgroundCanvas() {
  const canvas = document.getElementById('cyber-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = Math.min(window.innerWidth > 768 ? 75 : 35, 90);
  const colors = ['#d946ef', '#f43f5e', '#c084fc', '#06b6d4', '#fbbf24'];
  
  let mouse = { x: -1000, y: -1000, radius: 170 };
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });
  
  class Particle {
    constructor() {
      this.reset();
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }
    
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.75;
      this.vy = (Math.random() - 0.5) * 0.75;
      this.radius = 1.6 + Math.random() * 2.2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.baseAlpha = 0.35 + Math.random() * 0.45;
      this.alpha = this.baseAlpha;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Screen wrap
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
      
      // Mouse interaction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 2.5;
        this.y -= (dy / dist) * force * 2.5;
        this.alpha = Math.min(1, this.baseAlpha + force * 0.5);
      } else {
        this.alpha = this.baseAlpha;
      }
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Connect particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 130) {
          const lineAlpha = (1 - dist / 130) * 0.28;
          ctx.save();
          ctx.globalAlpha = lineAlpha;
          ctx.strokeStyle = '#d946ef';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
      
      // Connect to mouse
      const mdx = mouse.x - particles[i].x;
      const mdy = mouse.y - particles[i].y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 150) {
        const mLineAlpha = (1 - mdist / 150) * 0.55;
        ctx.save();
        ctx.globalAlpha = mLineAlpha;
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#06b6d4';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.restore();
      }
      
      particles[i].update();
      particles[i].draw();
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

/* 1. 3D Dynamic Interactive Tilt & Sheen on Cards */
function init3DTilt() {
  const cards = document.querySelectorAll('.tilt-card-3d');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -9;
      const rotateY = ((x - centerX) / centerX) * 9;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
    });
  });
}

/* 2. Interactive Neon Ambient Cursor Spotlight */
function initCyberSpotlight() {
  // Only enable on desktop pointer devices
  if (window.matchMedia('(pointer: coarse)').matches) return;
  
  const spotlight = document.createElement('div');
  spotlight.className = 'cyber-spotlight';
  document.body.appendChild(spotlight);
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function renderSpotlight() {
    // Smooth trailing physics
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;
    spotlight.style.left = `${currentX}px`;
    spotlight.style.top = `${currentY}px`;
    requestAnimationFrame(renderSpotlight);
  }
  
  renderSpotlight();
}

/* 3. Video Autoplay & Viewport Controller */
function initMarqueeVideos() {
  const marqueeVideos = document.querySelectorAll('.marquee-video-card video');
  const marqueeWrap = document.querySelector('.video-marquee-wrap');
  const instaVideos = document.querySelectorAll('.insta-reel-card video');

  // Helper to ensure a video plays continuously and muted for browser autoplay policies
  function ensurePlay(v) {
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be restricted until user gesture; retry on first interaction
      });
    }
  }

  // Configure all marquee videos
  marqueeVideos.forEach(v => {
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');

    // Autoplay when media data is ready
    v.addEventListener('loadeddata', () => ensurePlay(v));
    v.addEventListener('canplay', () => ensurePlay(v));

    // Ensure seamless looped playback
    v.addEventListener('ended', () => {
      v.currentTime = 0;
      ensurePlay(v);
    });

    // If video pauses unexpectedly while marquee section is active, restart it
    v.addEventListener('pause', () => {
      const modal = document.getElementById('reelModal');
      if (!modal || !modal.classList.contains('active')) {
        setTimeout(() => ensurePlay(v), 250);
      }
    });

    ensurePlay(v);
  });

  // Observe the marquee section as a WHOLE container (prevents sliding cards from being paused!)
  if (marqueeWrap && 'IntersectionObserver' in window) {
    const marqueeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          marqueeVideos.forEach(v => ensurePlay(v));
        } else {
          marqueeVideos.forEach(v => v.pause());
        }
      });
    }, { threshold: 0.05 });

    marqueeObserver.observe(marqueeWrap);
  } else {
    marqueeVideos.forEach(v => ensurePlay(v));
  }

  // Observe Instagram grid reels (static cards)
  if (instaVideos.length && 'IntersectionObserver' in window) {
    const instaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const v = entry.target;
        if (entry.isIntersecting) {
          ensurePlay(v);
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.1 });

    instaVideos.forEach(v => {
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      instaObserver.observe(v);
    });
  }

  // Global user interaction trigger to bypass aggressive browser autoplay blocks
  const unlockAutoplay = () => {
    marqueeVideos.forEach(v => {
      if (v.paused) ensurePlay(v);
    });
    instaVideos.forEach(v => {
      if (v.paused) ensurePlay(v);
    });
    window.removeEventListener('pointerdown', unlockAutoplay);
    window.removeEventListener('scroll', unlockAutoplay);
    window.removeEventListener('touchstart', unlockAutoplay);
  };
  window.addEventListener('pointerdown', unlockAutoplay, { once: true });
  window.addEventListener('scroll', unlockAutoplay, { once: true, passive: true });
  window.addEventListener('touchstart', unlockAutoplay, { once: true, passive: true });
}

/* 3.5 Lightbox Reel Video Player Modal */
function initReelModal() {
  const modal = document.getElementById('reelModal');
  if (!modal) return;

  const modalVideo = document.getElementById('reelModalVideo');
  const modalTitle = document.getElementById('reelModalTitle');
  const closeBtn = modal.querySelector('.reel-modal-close');
  const backdrop = modal.querySelector('.reel-modal-backdrop');
  const playToggle = document.getElementById('reelPlayToggle');
  const muteToggle = document.getElementById('reelMuteToggle');
  const progressBar = document.getElementById('reelProgressBar');
  const progressWrap = modal.querySelector('.reel-progress-wrap');
  const prevBtn = modal.querySelector('.reel-nav-prev');
  const nextBtn = modal.querySelector('.reel-nav-next');
  const cards = Array.from(document.querySelectorAll('.marquee-video-card'));

  // Distinct reel list (unique src and title)
  const distinctReels = [
    { src: 'assets/videos/Video-36409.mp4', fallback: 'https://rajeshwari-shivakumar-chikkamath.netlify.app/Video-36409.mp4', title: 'Strategic Motion & Leadership' },
    { src: 'assets/videos/Video-42518.mp4', fallback: 'https://rajeshwari-shivakumar-chikkamath.netlify.app/Video-42518.mp4', title: 'Executive Focus & Agile Analysis' },
    { src: 'assets/videos/Video-82802.mp4', fallback: 'https://rajeshwari-shivakumar-chikkamath.netlify.app/Video-82802.mp4', title: 'Engineering Architecture in Motion' },
    { src: 'assets/videos/Video-79557.mp4', fallback: 'https://rajeshwari-shivakumar-chikkamath.netlify.app/Video-79557.mp4', title: 'Leadership Reflections & Advisory' },
    { src: 'assets/videos/Video-61556.mp4', fallback: 'https://rajeshwari-shivakumar-chikkamath.netlify.app/Video-61556.mp4', title: 'Personal Presence & Executive Brand' },
    { src: 'assets/videos/Video-67414.mp4', fallback: 'https://rajeshwari-shivakumar-chikkamath.netlify.app/Video-67414.mp4', title: 'Foundation & Social Impact Initiatives' }
  ];

  let currentIndex = 0;

  function openReel(index) {
    currentIndex = (index + distinctReels.length) % distinctReels.length;
    const reel = distinctReels[currentIndex];
    
    if (modalTitle) modalTitle.textContent = reel.title;
    modalVideo.src = reel.src;
    modalVideo.currentTime = 0;
    modalVideo.muted = false; // Enable audio for interactive viewing!
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    updateControlsUI();

    modalVideo.play().then(() => {
      updateControlsUI();
    }).catch(() => {
      // If browser blocks unmuted play without direct user audio permission, fallback to muted then user can unmute
      modalVideo.muted = true;
      modalVideo.play().catch(() => {});
      updateControlsUI();
    });
  }

  function closeReel() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalVideo.pause();
    modalVideo.src = '';

    // Ensure all background marquee videos are resumed smoothly
    const marqueeVideos = document.querySelectorAll('.marquee-video-card video');
    marqueeVideos.forEach(v => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }

  function updateControlsUI() {
    if (!playToggle || !muteToggle) return;
    const iconPause = playToggle.querySelector('.icon-pause');
    const iconPlay = playToggle.querySelector('.icon-play');
    const iconVolOn = muteToggle.querySelector('.icon-volume-on');
    const iconVolOff = muteToggle.querySelector('.icon-volume-off');

    if (modalVideo.paused) {
      if (iconPause) iconPause.style.display = 'none';
      if (iconPlay) iconPlay.style.display = 'block';
    } else {
      if (iconPause) iconPause.style.display = 'block';
      if (iconPlay) iconPlay.style.display = 'none';
    }

    if (modalVideo.muted) {
      if (iconVolOn) iconVolOn.style.display = 'none';
      if (iconVolOff) iconVolOff.style.display = 'block';
    } else {
      if (iconVolOn) iconVolOn.style.display = 'block';
      if (iconVolOff) iconVolOff.style.display = 'none';
    }
  }

  // Card click opens modal
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(card.getAttribute('data-index') || '0', 10);
      openReel(idx);
    });
  });

  // Modal controls
  if (closeBtn) closeBtn.addEventListener('click', closeReel);
  if (backdrop) backdrop.addEventListener('click', closeReel);

  if (playToggle) {
    playToggle.addEventListener('click', () => {
      if (modalVideo.paused) {
        modalVideo.play();
      } else {
        modalVideo.pause();
      }
      updateControlsUI();
    });
  }

  if (muteToggle) {
    muteToggle.addEventListener('click', () => {
      modalVideo.muted = !modalVideo.muted;
      updateControlsUI();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => openReel(currentIndex - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => openReel(currentIndex + 1));
  }

  // Progress update & scrubbing
  modalVideo.addEventListener('timeupdate', () => {
    if (modalVideo.duration && progressBar) {
      const pct = (modalVideo.currentTime / modalVideo.duration) * 100;
      progressBar.style.width = `${pct}%`;
    }
  });

  modalVideo.addEventListener('ended', () => {
    // Automatically advance to next reel
    openReel(currentIndex + 1);
  });

  if (progressWrap) {
    progressWrap.addEventListener('click', (e) => {
      const rect = progressWrap.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      if (modalVideo.duration) {
        modalVideo.currentTime = pct * modalVideo.duration;
      }
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeReel();
    if (e.key === 'ArrowRight') openReel(currentIndex + 1);
    if (e.key === 'ArrowLeft') openReel(currentIndex - 1);
    if (e.key === ' ') {
      e.preventDefault();
      if (modalVideo.paused) modalVideo.play();
      else modalVideo.pause();
      updateControlsUI();
    }
  });
}

/* 4. Header & Navigation */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.style.display === 'flex';
      navMenu.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) {
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.background = '#0d081a';
        navMenu.style.padding = '2rem';
        navMenu.style.borderBottom = '1px solid rgba(217, 70, 239, 0.35)';
        navMenu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.9)';
      }
    });

    // Close on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navMenu.style.display = 'none';
        }
      });
    });
  }
}

/* 5. Interactive Domain Showcase (Neon Accents) */
const domainsData = [
  {
    num: "01",
    title: "Digital Software",
    color: "#d946ef",
    badgeBg: "rgba(217, 70, 239, 0.14)",
    body: "Translating complex technical architectures into actionable product specifications that teams can actually ship.",
    tags: ["Software Architecture", "Product Requirements", "API Analysis", "Data Flow", "UI/UX Specs"]
  },
  {
    num: "02",
    title: "Industrial Engineering",
    color: "#f43f5e",
    badgeBg: "rgba(244, 63, 94, 0.14)",
    body: "Bridging operational complexity with precision documentation — so no context is lost between the floor and the boardroom.",
    tags: ["Process Optimization", "Systems Requirements", "Risk & Compliance", "Lean Six Sigma"]
  },
  {
    num: "03",
    title: "Civil Construction",
    color: "#06b6d4",
    badgeBg: "rgba(6, 182, 212, 0.14)",
    body: "From foundation to façade — requirements that keep multi-phase construction programs on time and in scope.",
    tags: ["Portfolio Management", "BIM Requirements", "Stakeholder Alignment", "Regulatory Compliance"]
  },
  {
    num: "04",
    title: "Agile & Strategy",
    color: "#fbbf24",
    badgeBg: "rgba(251, 191, 36, 0.14)",
    body: "Not just agile certifications — actual frameworks tuned to each organization's rhythm, culture, and constraints.",
    tags: ["Scrum / Kanban", "OKR Design", "Sprint Planning", "Agile Coaching", "Retrospectives"]
  }
];

function initDomainTabs() {
  const tabButtons = document.querySelectorAll('.domain-tab-btn');
  const displayNum = document.getElementById('domain-active-num');
  const displayTitle = document.getElementById('domain-active-title');
  const displayBody = document.getElementById('domain-active-body');
  const displayTags = document.getElementById('domain-active-tags');

  if (!tabButtons.length || !displayTitle) return;

  function switchDomain(index) {
    const data = domainsData[index];
    if (!data) return;

    // Active button state
    tabButtons.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === index);
      if (idx === index) {
        btn.style.borderLeftColor = data.color;
      }
    });

    // Animation transition
    const card = document.querySelector('.domain-display-card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(14px)';

    setTimeout(() => {
      displayNum.textContent = `DOMAIN / ${data.num}`;
      displayNum.style.color = data.color;
      displayTitle.textContent = data.title;
      displayBody.textContent = data.body;

      displayTags.innerHTML = data.tags.map(tag => 
        `<span class="domain-tag-pill" style="border-color: ${data.color}55; background: ${data.badgeBg}; color: #ffffff;">${tag}</span>`
      ).join('');

      card.style.borderColor = `${data.color}66`;
      card.style.boxShadow = `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px ${data.color}33`;
      card.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 180);
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      switchDomain(idx);
    });
  });

  // Initialize with first domain
  switchDomain(0);
}

/* 6. Smooth Scroll Spy */
function initSmoothScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}
