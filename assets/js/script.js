/* =====================================================================
   GLOBAL SETUP
   Each section is wrapped + element-guarded so a missing element on one
   page never throws and never blocks the other sections.
   ===================================================================== */

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------------
   LENIS SMOOTH SCROLL  (single instance — used everywhere)
   --------------------------------------------------------------------- */
let lenis = null;

if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.3,
    infinite: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) { lenis.scrollTo(value, { immediate: true }); }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.body.style.transform ? 'transform' : 'fixed',
  });
}

/* small helper: run a block and never let it crash the rest of the file */
function safe(name, fn) {
  try { fn(); } catch (err) { console.warn('[' + name + '] skipped:', err.message); }
}

/* ---------------------------------------------------------------------
   NAVBAR — scrolled state
   --------------------------------------------------------------------- */
safe('navbar-scroll', function () {
  const navbar = document.getElementById('navbar');
  if (!navbar || !lenis) return;

  let tickingNav = false;
  lenis.on('scroll', ({ scroll }) => {
    if (tickingNav) return;
    tickingNav = true;
    requestAnimationFrame(() => {
      navbar.classList.toggle('navbar--scrolled', scroll > 100);
      tickingNav = false;
    });
  });
});

/* ---------------------------------------------------------------------
   MOBILE MENU
   --------------------------------------------------------------------- */
safe('mobile-menu', function () {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const navbar     = document.getElementById('navbar');
  if (!hamburger || !mobileMenu) return;

  const hamTop = hamburger.querySelector('.ham-top');
  const hamMid = hamburger.querySelector('.ham-mid');
  const hamBot = hamburger.querySelector('.ham-bot');
  let menuOpen = false;

  const toggleMenu = () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
      navbar && navbar.classList.add('navbar--menu-open');
      if (hamTop) hamTop.style.transform = 'translateY(0px) rotate(45deg)';
      if (hamMid) { hamMid.style.opacity = '0'; hamMid.style.transform = 'scaleX(0)'; }
      if (hamBot) { hamBot.style.width = '24px'; hamBot.style.transform = 'translateY(0px) rotate(-45deg)'; }
    } else {
      mobileMenu.style.maxHeight = '0';
      navbar && navbar.classList.remove('navbar--menu-open');
      if (hamTop) hamTop.style.transform = '';
      if (hamMid) { hamMid.style.opacity = ''; hamMid.style.transform = ''; }
      if (hamBot) { hamBot.style.width = ''; hamBot.style.transform = ''; }
    }
  };

  hamburger.addEventListener('click', toggleMenu);
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { if (menuOpen) toggleMenu(); });
  });
});

/* ---------------------------------------------------------------------
   ACTIVE NAV ITEM
   --------------------------------------------------------------------- */
safe('active-nav', function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const navItems = navbar.querySelectorAll('.nav-item');

  navItems.forEach(function (item) {
    const link = item.querySelector('a');
    if (!link) return;
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');

      // set active state
      navItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');

      // only block placeholder links ("#"); real links navigate normally
      if (!href || href === '#') {
        e.preventDefault();
      }
    });
  });
});


/* ---------------------------------------------------------------------
   BRAND / PARTNER SLIDER
   --------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  safe('partner-slider', function () {
    const partnerSliderEl = document.getElementById('partner-slider');
    if (!partnerSliderEl || typeof Splide === 'undefined') return;

    const partnerSplide = new Splide('#partner-slider', {
      type: 'loop', drag: 'free', focus: 'center',
      perPage: 6, gap: '0px', arrows: false, pagination: false,
      autoScroll: { speed: 1, pauseOnHover: true, pauseOnFocus: false },
      breakpoints: {
        1280: { perPage: 5 }, 1024: { perPage: 4 },
        768: { perPage: 3 },  640: { perPage: 3, gap: '8px' }
      }
    });

    if (window.splide && window.splide.Extensions) {
      partnerSplide.mount(window.splide.Extensions);
    } else {
      partnerSplide.mount();
    }
  });
});


// animated svg
document.querySelectorAll(".magnet-item").forEach((item) => {
  const icon = item.querySelector(".magnet-item-svg");
  let bounds;

  item.addEventListener("mouseenter", () => {
    bounds = item.getBoundingClientRect();
  });

  item.addEventListener("mousemove", (e) => {
    if (!bounds || !icon) return;

    const x = e.clientX - bounds.left - bounds.width / 2;
    const y = e.clientY - bounds.top - bounds.height / 2;

    gsap.to(icon, {
      x: x * 0.08,
      y: y * 0.08,
      duration: 1.2,
      ease: "power2.out"
    });
  });

  item.addEventListener("mouseleave", () => {
    gsap.to(icon, {
      x: 0,
      y: 0,
      duration: 1.4,
      ease: "elastic.out(1, 0.3)"
    });
  });
});

// Hero banner image animation
document.addEventListener("DOMContentLoaded", function () {

    // Smooth fade + come-up animation on load
    gsap.from("#hero-main-person, #hero-ai-tool", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.15
    });

    // Main person (chair rocking effect)
    gsap.to("#hero-main-person", {
        x: -18,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "bottom center"
    });

    // Optional subtle body sway
    gsap.to("#hero-main-person", {
        rotation: -1.2,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "bottom center"
    });

    // AI Tool floating effect
    gsap.to("#hero-ai-tool", {
        y: -12,
        rotation: 1.5,
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
    });

});


// Counter animation
document.addEventListener('DOMContentLoaded', () => {

    const counters = document.querySelectorAll('.counter');

    function formatNum(n, format) {
        return format === 'comma'
            ? n.toLocaleString()
            : n;
    }

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            const el = entry.target;

            if (el.dataset.animated === 'true') return;

            el.dataset.animated = 'true';

            const target = parseInt(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            const format = el.dataset.format || '';

            const duration = 1800;
            const steps = 60;
            const increment = target / steps;
            const interval = duration / steps;

            let current = 0;

            const timer = setInterval(() => {

                current += increment;

                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }

                el.textContent =
                    prefix +
                    formatNum(Math.round(current), format) +
                    suffix;

            }, interval);

            observer.unobserve(el);

        });

    }, {
        threshold: 0.5
    });

    counters.forEach(counter => {
        observer.observe(counter);
    });

});


// 
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap) return;

  const grid = document.getElementById('works-grid');
  if (!grid) return;

  gsap.registerPlugin(ScrollTrigger);

  /* =========================
     SCROLL ANIMATIONS
  ========================= */

  gsap.from('.reveal-head', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#works',
      start: 'top 80%'
    }
  });

  gsap.from('.work-card', {
    y: 60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#works-grid',
      start: 'top 85%'
    }
  });

  /* =========================
     CURSOR VIEW WORK EFFECT
  ========================= */

  const medias = grid.querySelectorAll('.work-media');

  medias.forEach((media) => {
    const btn = media.querySelector('.view-work');
    if (!btn) return;

    // initial state
    gsap.set(btn, {
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      opacity: 0
    });

    const xTo = gsap.quickTo(btn, 'x', {
      duration: 0.5,
      ease: 'power3.out'
    });

    const yTo = gsap.quickTo(btn, 'y', {
      duration: 0.5,
      ease: 'power3.out'
    });

    const getPos = (e) => {
      const rect = media.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const showBtn = () => {
      gsap.to(btn, {
        scale: 1,
        opacity: 1,
        duration: 0.45,
        ease: 'back.out(1.8)'
      });
    };

    const hideBtn = () => {
      gsap.to(btn, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      });
    };

    media.addEventListener('mouseenter', (e) => {
      const pos = getPos(e);

      gsap.set(btn, {
        x: pos.x,
        y: pos.y
      });

      showBtn();
    });

    media.addEventListener('mousemove', (e) => {
      const pos = getPos(e);
      xTo(pos.x);
      yTo(pos.y);
    });

    media.addEventListener('mouseleave', () => {
      hideBtn();
    });
  });

  /* Hide all when leaving grid */
  grid.addEventListener('mouseleave', () => {
    grid.querySelectorAll('.view-work').forEach((btn) => {
      gsap.to(btn, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      });
    });
  });
});