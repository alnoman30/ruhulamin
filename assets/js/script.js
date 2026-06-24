/* =====================================================================
   GLOBAL SETUP
   Each section is wrapped + element-guarded so a missing element on one
   page never throws and never blocks the other sections.
   ===================================================================== */

gsap.registerPlugin(ScrollTrigger, SplitText);

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

    // Check if GSAP exists
    if (typeof gsap === "undefined") {
        console.warn("GSAP is not loaded.");
        return;
    }

    const heroPerson = document.querySelector("#hero-main-person");
    const heroTool = document.querySelector("#hero-ai-tool");

    // Main person (chair rocking effect)
    if (heroPerson) {
        gsap.to(heroPerson, {
            x: -18,
            duration: 4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "bottom center"
        });

        // Optional subtle body sway
        gsap.to(heroPerson, {
            rotation: -1.2,
            duration: 4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "bottom center"
        });
    }

    // AI Tool floating effect
    if (heroTool) {
        gsap.to(heroTool, {
            y: -12,
            rotation: 1.5,
            duration: 2.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
        });
    }

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


// Cursor follow on project card animation
document.addEventListener('DOMContentLoaded', () => {
  safe('portfolio', function () {
    if (!window.gsap) return;
    const grid = document.getElementById('works-grid');
    if (!grid) return;                         // bail on pages without portfolio

    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.reveal-head', {
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '#works', start: 'top 80%' }
    });
    gsap.from('.work-card', {
      y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '#works-grid', start: 'top 85%' }
    });

    const medias  = [...grid.querySelectorAll('.work-media')];
    const buttons = medias.map((m) => m.querySelector('.view-work')).filter(Boolean);
    if (!medias.length) return;

    buttons.forEach((btn) =>
      gsap.set(btn, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 })
    );

    const showBtn = (btn) => gsap.to(btn, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.8)' });
    const hideBtn = (btn) => gsap.to(btn, { scale: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });

    medias.forEach((media) => {
      const btn = media.querySelector('.view-work');
      if (!btn) return;
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });

      const pos = (e) => {
        const r = media.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };

      media.addEventListener('mouseenter', (e) => {
        buttons.forEach((b) => { if (b !== btn) hideBtn(b); });
        const p = pos(e);
        gsap.set(btn, { x: p.x, y: p.y });
        showBtn(btn);
      });
      media.addEventListener('mousemove', (e) => { const p = pos(e); xTo(p.x); yTo(p.y); });
      media.addEventListener('mouseleave', () => hideBtn(btn));
    });

    grid.addEventListener('mouseleave', () => buttons.forEach(hideBtn));
  });
});


// SplideJS testimonial
document.addEventListener("DOMContentLoaded", function () {

    if (typeof Splide === "undefined") return;

    const testimonialCarousel = document.querySelector("#testimonial-carousel");

    if (!testimonialCarousel) return;

    new Splide(testimonialCarousel, {
        type: "slide",
        perPage: 2,
        perMove: 1,
        autoplay: true,
        interval: 5000,
        pauseOnHover: false,
        arrows: false,
        pagination: true,
        speed: 800,
        gap: "32px",

        breakpoints: {
            768: {
                perPage: 1,
                gap: "1rem",
                pagination: false,
                arrows: true,
            }
        }
    }).mount();

});
//  footer cta image animation

(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".reveal-image").forEach((image) => {

        let floatTween;

        const tl = gsap.timeline({
            paused: true,
            onComplete: () => {

                if (!floatTween) {
                    floatTween = gsap.to(image, {
                        x: "+=15",
                        duration: 2.5,
                        ease: "sine.inOut",
                        repeat: -1,
                        yoyo: true
                    });
                }
            }
        });

        tl.fromTo(
            image,
            {
                clipPath: "inset(0 50% 0 50%)",
                opacity: 0.4
            },
            {
                clipPath: "inset(0 0% 0 0%)",
                opacity: 1,
                duration: 1.6,
                ease: "expo.out"
            }
        );

        ScrollTrigger.create({
            trigger: image,
            start: "top 80%",

            onEnter: () => {
                tl.restart();
            },

            onEnterBack: () => {
                tl.restart();
            },

            onLeave: () => {
                if (floatTween) floatTween.pause();
            },

            onLeaveBack: () => {
                if (floatTween) floatTween.pause();
            }
        });
    });
})();

// Global h1, h2 animation
function headingReveal() {

    const headings = document.querySelectorAll("h1, h2");


    headings.forEach((heading) => {


        // Skip animation if class exists
        if (heading.classList.contains("no-heading-animation")) {
            return;
        }


        const split = new SplitText(heading, {
            type: "words"
        });


        // Create mask wrapper
        split.words.forEach((word) => {

            const mask = document.createElement("span");


            mask.style.cssText = `
                display:inline-block;
                overflow:hidden;
                vertical-align:top;
            `;


            word.parentNode.insertBefore(mask, word);

            mask.appendChild(word);


            word.style.display = "inline-block";

        });



        // Initial state
        gsap.set(split.words, {

            yPercent: 110,

            opacity: 0,

            skewY: 4

        });



        // Reveal
        gsap.to(split.words, {

            yPercent: 0,

            opacity: 1,

            skewY: 0,

            duration: 1,

            ease: "expo.out",


            stagger: {
                each: 0.06
            },


            scrollTrigger: {

                trigger: heading,

                start: "top 85%",

                once: true

            }

        });


    });

}


headingReveal();


// FAQ Accordion js
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const toggle = item.querySelector(".faq-toggle");
    const content = item.querySelector(".faq-content");
    const icon = item.querySelector(".faq-icon");

    toggle.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Close other accordions
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {

          const otherContent = otherItem.querySelector(".faq-content");
          const otherIcon = otherItem.querySelector(".faq-icon");

          otherItem.classList.remove("active");

          gsap.to(otherContent, {
            height: 0,
            opacity: 0,
            duration: 0.4,
            ease: "power3.inOut"
          });

          gsap.to(otherIcon, {
            rotation: 0,
            y: 0,
            scale: 1,
            duration: 0.25,
            ease: "power3.out"
          });
        }
      });


      if (isOpen) {

        item.classList.remove("active");

        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power3.inOut"
        });


        gsap.to(icon, {
          rotation: 0,
          y: 0,
          scale: 1,
          duration: 0.25,
          ease: "back.out(1.5)"
        });


      } else {

        item.classList.add("active");

        gsap.to(content, {
          height: "auto",
          opacity: 1,
          duration: 0.45,
          ease: "power3.inOut"
        });


        // Faster premium icon animation
        gsap.timeline()
          .to(icon, {
            scale: 1.12,
            y: -2,
            duration: 0.12,
            ease: "power2.out"
          })
          .to(icon, {
            rotation: 180,
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "back.out(1.8)"
          });

      }
    });
  });
});

// about page card open animation
gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray(".timeline-item").forEach((item) => {

  const dot = item.querySelector(".timeline-dot");
  const arrow = item.querySelector(".timeline-arrow");

  const year = item.querySelector(".timeline-year");
  const title = item.querySelector(".timeline-title");
  const text = item.querySelector(".timeline-text");

  const content = [year, title, text];

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: item,
      start: "top 80%",
      end: "top 30%",
      scrub: true
    }
  });

  tl.fromTo(item,
    { opacity: 0, y: 60 },
    { opacity: 1, y: 0, duration: 1 }
  )
  .fromTo(content,
    { opacity: 0 },   // ❌ removed x movement
    { opacity: 1, stagger: 0.15, duration: 1 },
    0
  )
  .fromTo(dot,
    { backgroundColor: "rgba(255,255,255,.3)", scale: 1 },
    { backgroundColor: "#ffffff", scale: 1.6, duration: 1 },
    0
  )
  .fromTo(arrow,
    { scaleY: 0, y: -20, opacity: 0.2, transformOrigin: "top center" },
    { scaleY: 1, y: 0, opacity: 0.7, duration: 1 },
    0
  );

});


// projects
