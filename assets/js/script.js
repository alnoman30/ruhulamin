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


// 
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".service-item");

  items.forEach((item) => {
    const icon = item.querySelector(".service-item-svg");

    let bounds;
    let targetX = 0;
    let targetY = 0;

    item.addEventListener("mouseenter", () => {
      bounds = item.getBoundingClientRect();
    });

    item.addEventListener("mousemove", (e) => {
      if (!bounds || !icon) return;

      const relX = e.clientX - bounds.left;
      const relY = e.clientY - bounds.top;

      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      // softer pull strength
      targetX = (relX - centerX) * 0.12;
      targetY = (relY - centerY) * 0.12;
    });

    item.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;

      gsap.to(icon, {
        x: 0,
        y: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.35)"
      });
    });

    // smooth RAF loop (this is what makes it buttery)
    function animate() {
      if (icon) {
        gsap.to(icon, {
          x: targetX,
          y: targetY,
          duration: 0.8,
          ease: "power3.out",
          overwrite: "auto"
        });
      }
      requestAnimationFrame(animate);
    }

    animate();
  });
});