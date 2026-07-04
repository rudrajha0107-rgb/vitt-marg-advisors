/* =================================================================
   VITT-MARG ADVISORS — script.js
   Pure vanilla ES6. No libraries.
   -----------------------------------------------------------------
   MODULES
   01. Utilities
   02. Premium loader
   03. Custom cursor + glow
   04. Mouse-follow ambient glow
   05. Navbar (stick, blur, mobile, active link)
   06. Scroll progress bar
   07. Reveal-on-scroll (IntersectionObserver)
   08. Hero staged intro
   09. Counter animation
   10. 3D tilt cards
   11. Magnetic buttons
   12. Ripple effect
   13. Parallax (blobs / hero)
   14. Testimonials carousel
   15. Pricing billing toggle
   16. FAQ accordion
   17. Insights spotlight follow
   18. Contact form validation
   19. Back to top
   20. Footer year + smooth anchors
   21. Boot
   ================================================================= */

'use strict';

/* =========================================================
   01. UTILITIES
   ========================================================= */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

function throttle(fn, wait = 100) {
  let last = 0, timer = null;
  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

function debounce(fn, wait = 200) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* Easing */
const easeOutCubic   = t => 1 - Math.pow(1 - t, 3);
const easeOutExpo    = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* =========================================================
   02. PREMIUM LOADER
   ========================================================= */
function initLoader() {
  const loader = $('#loader');
  const bar    = $('#loaderBar');
  const pct    = $('#loaderPct');
  const ring   = $('.loader__ring-fill');
  if (!loader) return;

  let progress = 0;
  const RING_LEN = 339; // 2*pi*r, r=54
  const startTime = performance.now();
  const minDuration = 1400;

  function tick() {
    const elapsed = performance.now() - startTime;
    const target = Math.min(100, (elapsed / minDuration) * 100);
    progress = lerp(progress, target, 0.12);

    const shown = Math.round(progress);
    if (bar) bar.style.width = shown + '%';
    if (pct) pct.textContent = shown + '%';
    if (ring) ring.style.strokeDashoffset = RING_LEN - (RING_LEN * shown) / 100;

    if (shown < 100) requestAnimationFrame(tick);
    else finish();
  }

  function finish() {
    loader.classList.add('is-done');
    document.body.classList.add('is-loaded');
    setTimeout(() => {
      loader.style.display = 'none';
      startHeroIntro();
    }, 800);
  }

  if (prefersReduced) {
    if (bar) bar.style.width = '100%';
    if (pct) pct.textContent = '100%';
    setTimeout(finish, 200);
    return;
  }

  requestAnimationFrame(tick);
}

/* =========================================================
   03. CUSTOM CURSOR + GLOW
   ========================================================= */
function initCursor() {
  if (isTouch) return;
  const cursor = $('#cursor');
  const dot    = $('#cursorDot');
  if (!cursor || !dot) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let dx = mx, dy = my;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function render() {
    dx = lerp(dx, mx, 0.9);
    dy = lerp(dy, my, 0.9);
    cx = lerp(cx, mx, 0.18);
    cy = lerp(cy, my, 0.18);
    dot.style.transform    = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';
    cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
    requestAnimationFrame(render);
  }
  render();

  const map = { link: 'is-link', button: 'is-button', card: 'is-card' };
  $$('[data-cursor]').forEach(el => {
    const cls = map[el.getAttribute('data-cursor')];
    if (!cls) return;
    el.addEventListener('mouseenter', () => cursor.classList.add(cls));
    el.addEventListener('mouseleave', () => cursor.classList.remove(cls));
  });

  document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));

  $$('input, textarea, select').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('is-hidden'); dot.style.opacity = '0'; });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('is-hidden'); dot.style.opacity = '1'; });
  });
}

/* =========================================================
   04. MOUSE-FOLLOW AMBIENT GLOW
   ========================================================= */
function initMouseGlow() {
  if (isTouch || prefersReduced) return;
  const glow = $('#mouseGlow');
  if (!glow) return;

  let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
  let tx = gx, ty = gy;

  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

  function render() {
    gx = lerp(gx, tx, 0.08);
    gy = lerp(gy, ty, 0.08);
    glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px) translate(-50%,-50%)';
    requestAnimationFrame(render);
  }
  render();
}

/* =========================================================
   05. NAVBAR
   ========================================================= */
function initNav() {
  const nav    = $('#nav');
  const burger = $('#navBurger');
  const menu   = $('#navMenu');
  const links  = $$('.nav__link');
  if (!nav) return;

  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  };
  onScroll();
  window.addEventListener('scroll', throttle(onScroll, 80), { passive: true });

  const closeMenu = () => {
    menu.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  const openMenu = () => {
    menu.classList.add('is-open');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  if (burger && menu) {
    burger.addEventListener('click', () => {
      menu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    links.forEach(l => l.addEventListener('click', closeMenu));
    document.addEventListener('click', e => {
      if (menu.classList.contains('is-open') &&
          !menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  const sections = links
    .map(l => {
      const id = l.getAttribute('href');
      return id && id.startsWith('#') ? $(id) : null;
    })
    .filter(Boolean);

  const spy = () => {
    const y = window.scrollY + 140;
    let current = null;
    sections.forEach(sec => { if (sec.offsetTop <= y) current = sec.id; });
    links.forEach(l => {
      l.classList.toggle('is-active', l.getAttribute('href') === '#' + current);
    });
  };
  spy();
  window.addEventListener('scroll', throttle(spy, 120), { passive: true });
}

/* =========================================================
   06. SCROLL PROGRESS BAR
   ========================================================= */
function initScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = p + '%';
  };
  update();
  window.addEventListener('scroll', throttle(update, 16), { passive: true });
  window.addEventListener('resize', debounce(update, 150));
}

/* =========================================================
   07. REVEAL ON SCROLL
   ========================================================= */
function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(() => el.classList.add('is-visible'), delay);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => io.observe(el));
}

/* =========================================================
   08. HERO STAGED INTRO
   ========================================================= */
let heroIntroStarted = false;
function startHeroIntro() {
  if (heroIntroStarted) return;
  heroIntroStarted = true;

  const staged = $$('#hero [data-reveal]');
  staged.forEach(el => {
    const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
    setTimeout(() => el.classList.add('is-visible'), 120 + delay);
  });

  $$('#hero [data-count]').forEach(startCounter);

  // Remove the entrance clip once the hero lines have animated in,
  // so letter descenders are no longer cropped at rest.
  const heroEl = document.getElementById('hero');
  if (heroEl) setTimeout(() => heroEl.classList.add('intro-done'), 1400);
}

/* =========================================================
   09. COUNTER ANIMATION
   ========================================================= */
function formatNum(val, target) {
  const t = target !== undefined ? target : val;
  if (Number.isInteger(t)) return Math.round(val).toLocaleString('en-IN');
  return (Math.round(val * 10) / 10).toLocaleString('en-IN');
}

function startCounter(el) {
  if (el.dataset.counted === '1') return;
  el.dataset.counted = '1';

  const target = parseFloat(el.getAttribute('data-count')) || 0;
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const duration = 1800;
  const startTime = performance.now();

  if (prefersReduced) {
    el.textContent = prefix + formatNum(target) + suffix;
    return;
  }

  function step(now) {
    const t = clamp((now - startTime) / duration, 0, 1);
    const val = target * easeOutExpo(t);
    el.textContent = prefix + formatNum(val, target) + suffix;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = prefix + formatNum(target) + suffix;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = $$('[data-count]').filter(el => !el.closest('#hero'));
  if (!counters.length) return;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    counters.forEach(startCounter);
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
}

/* =========================================================
   10. 3D TILT CARDS
   ========================================================= */
function initTilt() {
  if (isTouch || prefersReduced) return;
  const cards = $$('[data-tilt]');
  const MAX = 8;

  cards.forEach(card => {
    let rafId = null;
    let rx = 0, ry = 0, tx = 0, ty = 0;

    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      tx = (px - 0.5) * 2;
      ty = (py - 0.5) * 2;
      if (!rafId) rafId = requestAnimationFrame(apply);
      if (card.classList.contains('post')) {
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      }
    }

    function apply() {
      rafId = null;
      rx = lerp(rx, -ty * MAX, 0.2);
      ry = lerp(ry,  tx * MAX, 0.2);
      card.style.transform =
        'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-6px)';
      if (Math.abs(rx - (-ty * MAX)) > 0.05 || Math.abs(ry - (tx * MAX)) > 0.05) {
        rafId = requestAnimationFrame(apply);
      }
    }

    function reset() {
      tx = 0; ty = 0;
      const settle = () => {
        rx = lerp(rx, 0, 0.15);
        ry = lerp(ry, 0, 0.15);
        card.style.transform =
          'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        if (Math.abs(rx) > 0.05 || Math.abs(ry) > 0.05) requestAnimationFrame(settle);
        else card.style.transform = '';
      };
      requestAnimationFrame(settle);
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', reset);
  });
}

/* =========================================================
   11. MAGNETIC BUTTONS
   ========================================================= */
function initMagnetic() {
  if (isTouch || prefersReduced) return;
  const els = $$('.magnetic');
  const STRENGTH = 0.35;

  els.forEach(el => {
    let rafId = null;
    let cxTarget = 0, cyTarget = 0, cx = 0, cy = 0;

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      cxTarget = (e.clientX - (rect.left + rect.width / 2)) * STRENGTH;
      cyTarget = (e.clientY - (rect.top + rect.height / 2)) * STRENGTH;
      if (!rafId) rafId = requestAnimationFrame(apply);
    }
    function apply() {
      rafId = null;
      cx = lerp(cx, cxTarget, 0.2);
      cy = lerp(cy, cyTarget, 0.2);
      el.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
      if (Math.abs(cx - cxTarget) > 0.1 || Math.abs(cy - cyTarget) > 0.1) {
        rafId = requestAnimationFrame(apply);
      }
    }
    function reset() {
      cxTarget = 0; cyTarget = 0;
      const settle = () => {
        cx = lerp(cx, 0, 0.2);
        cy = lerp(cy, 0, 0.2);
        el.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
        if (Math.abs(cx) > 0.1 || Math.abs(cy) > 0.1) requestAnimationFrame(settle);
        else el.style.transform = '';
      };
      requestAnimationFrame(settle);
    }
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', reset);
  });
}

/* =========================================================
   12. RIPPLE EFFECT
   ========================================================= */
function initRipple() {
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top  = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 680);
    });
  });
}

/* =========================================================
   13. PARALLAX
   ========================================================= */
function initParallax() {
  if (isTouch || prefersReduced) return;
  const blobs = $$('.blob');
  const heroVisual = $('.hero__visual');

  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  });

  function render() {
    cx = lerp(cx, mx, 0.06);
    cy = lerp(cy, my, 0.06);
    blobs.forEach((b, i) => {
      const depth = (i + 1) * 14;
      b.style.transform = 'translate(' + (cx * depth) + 'px,' + (cy * depth) + 'px)';
    });
    requestAnimationFrame(render);
  }
  render();

  if (heroVisual) {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < window.innerHeight) heroVisual.style.transform = 'translateY(' + (y * 0.08) + 'px)';
    };
    window.addEventListener('scroll', throttle(onScroll, 16), { passive: true });
  }
}

/* =========================================================
   14. TESTIMONIALS CAROUSEL
   ========================================================= */
function initTestimonials() {
  const track = $('#testiTrack');
  const prev  = $('#testiPrev');
  const next  = $('#testiNext');
  const dotsWrap = $('#testiDots');
  if (!track) return;

  const cards = $$('.testi__card', track);
  const total = cards.length;

  function perView() {
    const w = window.innerWidth;
    if (w <= 620) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  let index = 0;
  let pv = perView();
  let maxIndex = Math.max(0, total - pv);
  let autoTimer = null;

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const pages = maxIndex + 1;
    for (let i = 0; i < pages; i++) {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Go to testimonial group ' + (i + 1));
      if (i === index) b.classList.add('is-active');
      b.addEventListener('click', () => { index = i; update(); resetAuto(); });
      dotsWrap.appendChild(b);
    }
  }

  function update() {
    const card = cards[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    const cardW = card.getBoundingClientRect().width + gap;
    track.style.transform = 'translateX(' + (-index * cardW) + 'px)';
    if (dotsWrap) {
      $$('button', dotsWrap).forEach((d, i) => d.classList.toggle('is-active', i === index));
    }
  }

  function startAuto() {
    if (prefersReduced) return;
    autoTimer = setInterval(() => {
      if (index >= maxIndex) index = 0; else index++;
      update();
    }, 5000);
  }
  function resetAuto() {
    if (autoTimer) clearInterval(autoTimer);
    startAuto();
  }

  if (next) next.addEventListener('click', () => {
    if (index >= maxIndex) index = 0; else index++;
    update(); resetAuto();
  });
  if (prev) prev.addEventListener('click', () => {
    if (index <= 0) index = maxIndex; else index--;
    update(); resetAuto();
  });

  window.addEventListener('resize', debounce(() => {
    pv = perView();
    maxIndex = Math.max(0, total - pv);
    index = clamp(index, 0, maxIndex);
    buildDots();
    update();
  }, 180));

  const viewport = $('.testi__viewport');
  if (viewport) {
    viewport.addEventListener('mouseenter', () => autoTimer && clearInterval(autoTimer));
    viewport.addEventListener('mouseleave', resetAuto);

    let startX = 0, isDown = false;
    viewport.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDown = true; }, { passive: true });
    viewport.addEventListener('touchend', e => {
      if (!isDown) return;
      isDown = false;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) {
        if (dx < 0) { if (index >= maxIndex) index = 0; else index++; }
        else { if (index <= 0) index = maxIndex; else index--; }
        update(); resetAuto();
      }
    }, { passive: true });
  }

  buildDots();
  update();
  startAuto();
}

/* =========================================================
   15. PRICING BILLING TOGGLE
   ========================================================= */
function initPricing() {
  const sw = $('#billSwitch');
  const monthlyLabel = $('#billMonthly');
  const yearlyLabel  = $('#billYearly');
  const amounts = $$('.plan__amt');
  if (!sw) return;

  let yearly = false;
  const fmt = n => Number(n).toLocaleString('en-IN');

  function animateAmount(el, target) {
    const current = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0;
    if (prefersReduced) { el.textContent = fmt(target); return; }
    const dur = 500;
    const t0 = performance.now();
    function step(now) {
      const t = clamp((now - t0) / dur, 0, 1);
      const v = Math.round(current + (target - current) * easeOutCubic(t));
      el.textContent = fmt(v);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function apply() {
    sw.classList.toggle('is-yearly', yearly);
    monthlyLabel.classList.toggle('is-active', !yearly);
    yearlyLabel.classList.toggle('is-active', yearly);
    amounts.forEach(el => {
      const m = parseInt(el.getAttribute('data-monthly'), 10);
      const y = parseInt(el.getAttribute('data-yearly'), 10);
      animateAmount(el, yearly ? y : m);
    });
  }

  sw.addEventListener('click', () => { yearly = !yearly; apply(); });
}

/* =========================================================
   16. FAQ ACCORDION
   ========================================================= */
function initFaq() {
  const items = $$('.faq__item');
  if (!items.length) return;

  items.forEach(item => {
    const q = $('.faq__q', item);
    const a = $('.faq__a', item);
    if (!q || !a) return;

    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach(other => {
        if (other !== item && other.classList.contains('is-open')) {
          other.classList.remove('is-open');
          $('.faq__q', other).setAttribute('aria-expanded', 'false');
          $('.faq__a', other).style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        q.setAttribute('aria-expanded', 'false');
        a.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  window.addEventListener('resize', debounce(() => {
    items.forEach(item => {
      if (item.classList.contains('is-open')) {
        const a = $('.faq__a', item);
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  }, 180));
}

/* =========================================================
   17. CONTACT FORM VALIDATION
   ========================================================= */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const note = $('#formNote');
  const submitText = $('#submitText');

  const validators = {
    name: v => v.trim().length >= 2 || 'Please enter your name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address.',
    phone: v => /^[0-9+\-\s()]{7,15}$/.test(v.trim()) || 'Enter a valid phone number.',
    service: v => v.trim() !== '' || 'Please pick a service.',
    message: v => v.trim().length >= 10 || 'A little more detail helps us prepare.'
  };

  const fieldWrap = input => input.closest('.field');

  function setError(input, msg) {
    const wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.add('is-error');
    const err = $('.field__err', wrap);
    if (err) err.textContent = msg;
  }
  function clearError(input) {
    const wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.remove('is-error');
    const err = $('.field__err', wrap);
    if (err) err.textContent = '';
  }
  function validateField(input) {
    const fn = validators[input.getAttribute('name')];
    if (!fn) return true;
    const res = fn(input.value);
    if (res === true) { clearError(input); return true; }
    setError(input, res);
    return false;
  }

  $$('input, select, textarea', form).forEach(input => {
    input.addEventListener('input', () => {
      const w = fieldWrap(input);
      if (w && w.classList.contains('is-error')) validateField(input);
    });
    input.addEventListener('blur', () => validateField(input));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = $$('input, select, textarea', form);
    let ok = true;
    inputs.forEach(input => { if (!validateField(input)) ok = false; });
    if (!note) return;

    if (!ok) {
      note.textContent = 'Please fix the highlighted fields.';
      note.className = 'contact__note is-error';
      return;
    }

    note.textContent = '';
    note.className = 'contact__note';
    const original = submitText ? submitText.textContent : 'Send enquiry';
    if (submitText) submitText.textContent = 'Sending...';

    setTimeout(() => {
      if (submitText) submitText.textContent = 'Enquiry sent';
      note.textContent = 'Thanks - a principal will reply within one working day.';
      note.className = 'contact__note is-success';
      form.reset();
      $$('.field', form).forEach(f => f.classList.remove('is-error'));
      setTimeout(() => { if (submitText) submitText.textContent = original; }, 3200);
    }, 1200);
  });
}

/* =========================================================
   18. BACK TO TOP
   ========================================================= */
function initBackToTop() {
  const btn = $('#toTop');
  if (!btn) return;

  const onScroll = () => {
    if (window.scrollY > 600) btn.classList.add('is-visible');
    else btn.classList.remove('is-visible');
  };
  onScroll();
  window.addEventListener('scroll', throttle(onScroll, 100), { passive: true });

  btn.addEventListener('click', () => {
    if (prefersReduced) { window.scrollTo(0, 0); return; }
    smoothScrollTo(0, 700);
  });
}

/* =========================================================
   19. SMOOTH ANCHORS + FOOTER YEAR
   ========================================================= */
function smoothScrollTo(targetY, duration = 700) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  const startTime = performance.now();

  function step(now) {
    const t = clamp((now - startTime) / duration, 0, 1);
    window.scrollTo(0, startY + diff * easeInOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initSmoothAnchors() {
  const navH = 84;
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - navH;
      if (prefersReduced) { window.scrollTo(0, y); }
      else smoothScrollTo(y, 800);
    });
  });
}

function initFooterYear() {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
}

/* =========================================================
   20. BOOT
   ========================================================= */
function boot() {
  initLoader();
  initCursor();
  initMouseGlow();
  initNav();
  initScrollProgress();
  initReveal();
  initCounters();
  initTilt();
  initMagnetic();
  initRipple();
  initParallax();
  initTestimonials();
  initPricing();
  initFaq();
  initContactForm();
  initBackToTop();
  initSmoothAnchors();
  initFooterYear();

  // Fallback: if loader never fires hero intro (e.g. edge case), ensure hero shows
  setTimeout(() => {
    if (!heroIntroStarted) startHeroIntro();
  }, 3500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

/* Safety: reveal everything once fully loaded in case observer missed */
window.addEventListener('load', () => {
  setTimeout(() => {
    $$('.reveal:not(.is-visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('is-visible');
    });
  }, 400);
});

/* =================================================================
   INCOME TAX CALCULATOR — integrated logic (APPENDED)
   Self-contained IIFE. Every identifier is prefixed `tax`.
   Runs on its own DOMContentLoaded; does not touch or depend on
   any existing site JavaScript. Nothing above this line was changed.
   ================================================================= */
/* =================================================================
   VITT-MARG ADVISORS — Income Tax Calculator (isolated module)
   income-tax/income-tax.js
   FULLY SELF-CONTAINED. All identifiers prefixed `tax`.
   No global collisions with the main site's script.js.

   Tax rules — AY 2026-27 (FY 2025-26), verified:
   NEW slabs: 0-4L nil,4-8L 5%,8-12L 10%,12-16L 15%,16-20L 20%,
              20-24L 25%, >24L 30%; std ded 75,000 (salaried);
              87A rebate up to 60,000 (taxable <=12L => nil);
              surcharge 10%>50L,15%>1Cr,25%>2Cr (cap 25%); cess 4%.
   OLD slabs (below 60): 0-2.5L nil,2.5-5L 5%,5-10L 20%,>10L 30%;
              exemption 3L (senior),5L (super); std ded 50,000;
              87A rebate up to 12,500 (taxable <=5L => nil);
              surcharge 10%>50L,15%>1Cr,25%>2Cr,37%>5Cr; cess 4%.
   Marginal relief applied at surcharge thresholds.
   ================================================================= */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  function taxParse(v) {
    if (typeof v === 'number') return v;
    var c = String(v == null ? '' : v).replace(/[^0-9.\-]/g, '');
    var f = parseFloat(c);
    return isNaN(f) ? 0 : f;
  }
  function taxInr(n, dec) {
    if (n == null || isNaN(n)) n = 0;
    var neg = n < 0; n = Math.abs(n);
    var opts = dec ? { minimumFractionDigits: dec, maximumFractionDigits: dec } : { maximumFractionDigits: 0 };
    return (neg ? '-₹' : '₹') + n.toLocaleString('en-IN', opts);
  }
  function taxWords(n) {
    n = Math.round(Math.abs(n));
    if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2).replace(/\.00$/, '') + ' Cr';
    if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2).replace(/\.00$/, '') + ' L';
    if (n >= 1e3) return '₹' + (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return '₹' + n;
  }
  function taxEl(id) { return document.getElementById(id); }
  var taxReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tax engine ---------- */
  var TAX_NEW_SLABS = [
    [400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15],
    [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]
  ];
  function taxOldSlabs(exemption) {
    return [[exemption, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]];
  }
  function taxSlabTax(income, slabs) {
    var tax = 0, lower = 0;
    for (var i = 0; i < slabs.length; i++) {
      var upper = slabs[i][0], rate = slabs[i][1];
      if (income > lower) {
        var band = Math.min(income, upper) - lower;
        if (band > 0) tax += band * rate;
        lower = upper;
      } else break;
    }
    return tax;
  }
  function taxSurchargeRate(income, regime) {
    var rates = regime === 'new'
      ? [[20000000, 0.25], [10000000, 0.15], [5000000, 0.10]]
      : [[50000000, 0.37], [20000000, 0.25], [10000000, 0.15], [5000000, 0.10]];
    for (var i = 0; i < rates.length; i++) {
      if (income > rates[i][0]) return { rate: rates[i][1], threshold: rates[i][0] };
    }
    return { rate: 0, threshold: 0 };
  }

  // compute a full regime result
  function taxCompute(regime, inp) {
    var slabs, exemption = 250000, stdDed = 0, rebateLimit, rebateMax;
    if (regime === 'new') {
      slabs = TAX_NEW_SLABS;
      stdDed = inp.salaried ? 75000 : 0;
      rebateLimit = 1200000; rebateMax = 60000;
    } else {
      if (inp.age === 'senior') exemption = 300000;
      else if (inp.age === 'super') exemption = 500000;
      slabs = taxOldSlabs(exemption);
      stdDed = inp.salaried ? 50000 : 0;
      rebateLimit = 500000; rebateMax = 12500;
    }

    // slab (ordinary) income — capital gains handled separately
    var ordinary = inp.salary + inp.house + inp.business + inp.other;

    var deductions = 0;
    if (regime === 'old') {
      deductions =
        Math.min(inp.d80c, 150000) +
        Math.min(inp.d80ccd, 50000) +
        inp.d80d +
        Math.min(inp.loan, 200000) +
        inp.hra +
        Math.min(inp.ptax, 2500);
    }
    var taxable = Math.max(0, ordinary - stdDed - deductions);

    var baseTax = taxSlabTax(taxable, slabs);

    var rebate = 0;
    if (taxable <= rebateLimit) rebate = Math.min(baseTax, rebateMax);
    var taxAfterRebate = baseTax - rebate;

    // capital gains tax (special rate) — simple LTCG 12.5% treatment as add-on,
    // shown separately; rebate does not apply. (User enters net gain.)
    var cgTax = inp.capital > 0 ? inp.capital * 0.125 : 0;

    var taxForSurcharge = taxAfterRebate + cgTax;

    var sc = 0, scRate = 0;
    var scInfo = taxSurchargeRate(taxable + inp.capital, regime);
    if (scInfo.rate > 0) {
      scRate = scInfo.rate;
      sc = taxForSurcharge * scRate;
      // marginal relief on ordinary income threshold
      var taxAtThresh = taxSlabTax(scInfo.threshold, slabs);
      var cap = taxAtThresh + ((taxable + inp.capital) - scInfo.threshold);
      if (taxForSurcharge + sc > cap) sc = Math.max(0, cap - taxForSurcharge);
    }

    var cess = (taxForSurcharge + sc) * 0.04;
    var total = taxForSurcharge + sc + cess;

    return {
      regime: regime,
      grossIncome: ordinary + inp.capital,
      ordinary: ordinary,
      stdDed: stdDed,
      deductions: deductions,
      taxable: taxable,
      baseTax: baseTax,
      rebate: rebate,
      taxAfterRebate: taxAfterRebate,
      cgTax: cgTax,
      surchargeRate: scRate,
      surcharge: sc,
      cess: cess,
      total: Math.round(total),
      monthly: Math.round(total / 12)
    };
  }

  /* ---------- read inputs ---------- */
  var taxSalaried = true;
  var taxAge = 'below60';

  function taxReadInputs() {
    return {
      salary: taxParse(taxEl('taxSalary').value),
      house: taxParse(taxEl('taxHouse').value),
      business: taxParse(taxEl('taxBusiness').value),
      capital: taxParse(taxEl('taxCapital').value),
      other: taxParse(taxEl('taxOther').value),
      d80c: taxParse(taxEl('tax80C').value),
      d80ccd: taxParse(taxEl('tax80CCD').value),
      d80d: taxParse(taxEl('tax80D').value),
      loan: taxParse(taxEl('taxLoan').value),
      hra: taxParse(taxEl('taxHRA').value),
      ptax: taxParse(taxEl('taxPtax').value),
      salaried: taxSalaried,
      age: taxAge
    };
  }

  var taxLast = null;

  /* ---------- count-up ---------- */
  function taxCountTo(el, target, dec) {
    if (taxReduce) { el.textContent = taxInr(target, dec); return; }
    var from = 0, dur = 650, t0 = performance.now();
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(now) {
      var t = Math.min((now - t0) / dur, 1);
      el.textContent = taxInr(from + (target - from) * ease(t), dec);
      if (t < 1) requestAnimationFrame(step); else el.textContent = taxInr(target, dec);
    }
    requestAnimationFrame(step);
  }

  /* ---------- render main result ---------- */
  function taxRow(label, value, mod) {
    var cls = 'tax-row';
    if (mod === 'total') cls += ' tax-row--total';
    if (mod === 'muted') cls += ' tax-row--muted';
    if (mod === 'credit') cls += ' tax-row--credit';
    return '<div class="' + cls + '"><span class="tax-row__label">' + label +
      '</span><span class="tax-row__value">' + value + '</span></div>';
  }

  function taxRenderMain(chosen, best, other) {
    taxEl('taxRegimePill').textContent = chosen.regime === best.regime
      ? 'Recommended · ' + (chosen.regime === 'new' ? 'New' : 'Old') + ' regime'
      : (chosen.regime === 'new' ? 'New' : 'Old') + ' regime';
    taxCountTo(taxEl('taxTotalTax'), chosen.total, 0);

    var saved = Math.abs(best.total - other.total);
    taxEl('taxTotalSub').innerHTML = chosen.regime === best.regime && saved > 0
      ? 'You save ' + taxInr(saved) + ' vs the ' + (best.regime === 'new' ? 'old' : 'new') + ' regime'
      : (saved === 0 ? 'Both regimes cost the same' : 'Monthly ≈ ' + taxInr(chosen.monthly));

    var c = chosen;
    var rows = [];
    rows.push(taxRow('Gross Income', taxInr(c.grossIncome)));
    rows.push(taxRow('Standard Deduction', c.stdDed ? '− ' + taxInr(c.stdDed) : '—', 'muted'));
    if (c.regime === 'old') rows.push(taxRow('Deductions & Exemptions', c.deductions ? '− ' + taxInr(c.deductions) : '—', 'muted'));
    rows.push(taxRow('Taxable Income', taxInr(c.taxable)));
    rows.push(taxRow('Tax before rebate', taxInr(c.baseTax)));
    if (c.rebate > 0) rows.push(taxRow('Rebate u/s 87A', '− ' + taxInr(c.rebate), 'credit'));
    if (c.cgTax > 0) rows.push(taxRow('Capital Gains tax (12.5%)', '+ ' + taxInr(c.cgTax)));
    if (c.surcharge > 0) rows.push(taxRow('Surcharge (' + Math.round(c.surchargeRate * 100) + '%)', '+ ' + taxInr(c.surcharge)));
    rows.push(taxRow('Health & Education Cess (4%)', '+ ' + taxInr(c.cess)));
    rows.push(taxRow('Total Tax', taxInr(c.total), 'total'));
    rows.push(taxRow('Monthly Tax', taxInr(c.monthly)));

    taxEl('taxBreakdown').innerHTML = rows.join('');
    taxEl('taxNote').style.display = '';
  }

  /* ---------- render comparison ---------- */
  function taxRenderCompare(newR, oldR) {
    var best = newR.total <= oldR.total ? newR : oldR;
    taxEl('taxCompareSection').style.display = '';

    // bars
    var max = Math.max(newR.total, oldR.total, 1);
    taxEl('taxBars').innerHTML =
      '<div class="tax-barcol"><span class="tax-barval">' + taxInr(oldR.total) + '</span>' +
        '<div class="tax-bar tax-bar--old" style="height:0" data-h="' + (oldR.total / max * 100) + '"></div>' +
        '<span class="tax-barlabel">Old Regime</span></div>' +
      '<div class="tax-barcol"><span class="tax-barval">' + taxInr(newR.total) + '</span>' +
        '<div class="tax-bar tax-bar--new" style="height:0" data-h="' + (newR.total / max * 100) + '"></div>' +
        '<span class="tax-barlabel">New Regime</span></div>';
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      document.querySelectorAll('#taxBars .tax-bar').forEach(function (b) {
        b.style.height = Math.max(2, parseFloat(b.getAttribute('data-h'))) + '%';
      });
    }); });

    // cards
    function card(r, label) {
      var win = r.total === best.total;
      var rows = [
        ['Gross income', taxInr(r.grossIncome)],
        ['Standard deduction', r.stdDed ? taxInr(r.stdDed) : '—'],
        ['Other deductions', r.deductions ? taxInr(r.deductions) : '—'],
        ['Taxable income', taxInr(r.taxable)],
        ['Tax + surcharge', taxInr(r.taxAfterRebate + r.cgTax + r.surcharge)],
        ['Cess (4%)', taxInr(r.cess)]
      ];
      var body = rows.map(function (x) { return '<div class="tax-crow"><span>' + x[0] + '</span><strong>' + x[1] + '</strong></div>'; }).join('');
      return '<div class="tax-ccard' + (win ? ' tax-ccard--win' : '') + '">' +
        '<div class="tax-ccard__name">' + label + '</div>' +
        '<div class="tax-ccard__tax' + (win ? ' tax-win' : '') + '">' + taxInr(r.total) + '</div>' +
        '<div class="tax-ccard__meta">Monthly ≈ ' + taxInr(r.monthly) + '</div>' +
        '<div class="tax-ccard__rows">' + body + '</div></div>';
    }
    taxEl('taxCompareCards').innerHTML = card(oldR, 'Old Regime') + card(newR, 'New Regime');

    // verdict
    var saved = Math.abs(newR.total - oldR.total);
    var name = best.regime === 'new' ? 'New Regime' : 'Old Regime';
    taxEl('taxVerdict').innerHTML = saved === 0
      ? '<div>Both regimes result in the same tax of <strong>' + taxInr(best.total) + '</strong>.</div>'
      : '<div>The <strong>' + name + '</strong> saves you</div><div class="tax-verdict__big">' + taxInr(saved) + ' per year</div>';

    return best;
  }

  /* ---------- tax saving suggestions ---------- */
  function taxRenderTips(inp, oldR) {
    taxEl('taxTipsSection').style.display = '';
    var rate = taxMarginalRate(oldR.taxable, inp.age);
    var tips = [];

    var used80c = Math.min(inp.d80c, 150000);
    if (used80c < 150000) {
      var room = 150000 - used80c;
      tips.push({ icon: 'M12 2l2.4 7.3H22l-6 4.4 2.3 7.3L12 16.9 5.7 21l2.3-7.3-6-4.4h7.6z',
        h: 'Increase 80C Investment', p: 'You have ₹' + room.toLocaleString('en-IN') + ' of unused 80C limit — ELSS, PPF, life insurance or principal repayment.',
        save: room * rate });
    }
    if (inp.d80ccd < 50000) {
      var nps = 50000 - Math.min(inp.d80ccd, 50000);
      tips.push({ icon: 'M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5zM4 22v-2a6 6 0 016-6h4a6 6 0 016 6v2z',
        h: 'Invest in NPS 80CCD(1B)', p: 'An extra ₹' + nps.toLocaleString('en-IN') + ' in NPS is deductible over and above 80C, exclusively under the old regime.',
        save: nps * rate });
    }
    if (inp.d80d < 25000) {
      var hd = 25000 - inp.d80d;
      tips.push({ icon: 'M12 2l9 4v6c0 5-3.8 9-9 10-5.2-1-9-5-9-10V6zm-1 13l6-6-1.4-1.4L11 12.2 8.4 9.6 7 11z',
        h: 'Health Insurance u/s 80D', p: 'Premiums up to ₹25,000 (₹50,000 for seniors) are deductible. You can still claim about ₹' + hd.toLocaleString('en-IN') + '.',
        save: hd * rate });
    }
    if (inp.loan < 200000) {
      var li = 200000 - Math.min(inp.loan, 200000);
      tips.push({ icon: 'M12 3l9 8h-3v9h-5v-5h-2v5H6v-9H3zm-1 8h2V9h-2z',
        h: 'Home Loan Benefit', p: 'Interest on a housing loan is deductible up to ₹2 lakh under Section 24(b). Unused headroom ≈ ₹' + li.toLocaleString('en-IN') + '.',
        save: li * rate });
    }
    // always give something
    if (!tips.length) {
      tips.push({ icon: 'M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z', h: "You're well optimised", p: 'Your major deductions are maxed out. Speak to a CA about advanced planning like HUF, capital-gains harvesting or business structuring.', save: 0 });
    }
    tips = tips.slice(0, 6);

    taxEl('taxTips').innerHTML = tips.map(function (t) {
      return '<div class="tax-tip">' +
        '<div class="tax-tip__icon"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="' + t.icon + '"/></svg></div>' +
        '<h4>' + t.h + '</h4><p>' + t.p + '</p>' +
        (t.save > 0 ? '<span class="tax-tip__save">Save up to ' + taxInr(Math.round(t.save)) + '</span>' : '') +
        '</div>';
    }).join('');

    var totalPot = tips.reduce(function (s, t) { return s + (t.save || 0); }, 0);
    taxEl('taxPotential').innerHTML = totalPot > 0
      ? 'Total tax-saving potential: <strong>' + taxInr(Math.round(totalPot)) + '</strong> per year (old regime, at your ' + Math.round(rate * 100) + '% marginal rate)'
      : '';
  }

  function taxMarginalRate(taxable, age) {
    var ex = age === 'senior' ? 300000 : (age === 'super' ? 500000 : 250000);
    var slabs = taxOldSlabs(ex);
    var rate = 0, lower = 0;
    for (var i = 0; i < slabs.length; i++) {
      if (taxable > lower) rate = slabs[i][1];
      lower = slabs[i][0];
    }
    return rate * 1.04; // include cess
  }

  /* ---------- main calculate ---------- */
  function taxCalculate(scrollToCompare) {
    var inp = taxReadInputs();
    var newR = taxCompute('new', inp);
    var oldR = taxCompute('old', inp);
    var chosenRegime = document.querySelector('input[name="taxRegime"]:checked').value;
    var chosen = chosenRegime === 'new' ? newR : oldR;
    var best = newR.total <= oldR.total ? newR : oldR;
    var other = best.regime === 'new' ? oldR : newR;

    taxRenderMain(chosen, best, other);
    taxLast = { chosen: chosen, best: best, other: other, newR: newR, oldR: oldR, inp: inp };

    if (scrollToCompare) {
      taxRenderCompare(newR, oldR);
      taxRenderTips(inp, oldR);
      taxEl('taxCompareSection').scrollIntoView({ behavior: taxReduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  /* ---------- reset ---------- */
  function taxReset() {
    ['taxHouse', 'taxBusiness', 'taxCapital', 'taxOther', 'tax80CCD', 'tax80D', 'taxLoan', 'taxHRA'].forEach(function (id) { taxEl(id).value = '0'; });
    taxEl('taxSalary').value = '12,00,000';
    taxEl('tax80C').value = '1,50,000';
    taxEl('taxPtax').value = '2,500';
    taxSalaried = true; taxAge = 'below60';
    taxEl('taxSal1').checked = true;
    taxEl('taxAge1').checked = true;
    taxEl('taxRegNew').checked = true;
    taxEl('taxCompareSection').style.display = 'none';
    taxEl('taxTipsSection').style.display = 'none';
    taxEl('taxNote').style.display = 'none';
    taxEl('taxRegimePill').textContent = 'Recommended';
    taxEl('taxTotalTax').textContent = '₹0';
    taxEl('taxTotalSub').textContent = 'Enter your details and calculate';
    taxEl('taxBreakdown').innerHTML =
      '<div class="tax-placeholder"><svg viewBox="0 0 24 24" width="46" height="46"><path fill="currentColor" d="M4 3h16v18l-4-2-4 2-4-2-4 2zm3 5h10V6H7zm0 4h10v-2H7zm0 4h7v-2H7z"/></svg>' +
      '<h3>Your tax breakdown appears here</h3><p style="color:var(--tax-mut);font-size:.88rem">Fill in your income and press Calculate Tax.</p></div>';
    taxLast = null;
  }

  /* ---------- PDF ---------- */
  function taxDownloadPDF() {
    if (!taxLast) taxCalculate(false);
    if (!taxLast) return;
    var jsPDFLib = window.jspdf && window.jspdf.jsPDF;
    var c = taxLast.chosen, best = taxLast.best, newR = taxLast.newR, oldR = taxLast.oldR;

    if (!jsPDFLib) { window.print(); return; }
    var doc = new jsPDFLib({ unit: 'pt', format: 'a4' });
    var W = doc.internal.pageSize.getWidth(), M = 48, y = 0;

    doc.setFillColor(7, 17, 31); doc.rect(0, 0, W, 92, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
    doc.text('Vitt-Marg Advisors', M, 44);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(120, 190, 245);
    doc.text('Chartered Accountants  |  Income Tax Calculator', M, 62);
    doc.setTextColor(180, 190, 210);
    doc.text('AY 2026-27 (FY 2025-26)  |  +91 93156 39676', M, 77);
    y = 122;

    doc.setTextColor(20, 30, 50); doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text('Income Tax Computation', M, y); y += 18;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(110, 120, 140);
    doc.text('Recommended: ' + (best.regime === 'new' ? 'New' : 'Old') + ' Regime', M, y); y += 20;

    doc.setDrawColor(37, 99, 235); doc.setFillColor(240, 245, 255);
    doc.roundedRect(M, y, W - M * 2, 58, 8, 8, 'FD');
    doc.setTextColor(90, 100, 120); doc.setFontSize(10);
    doc.text('TOTAL TAX PAYABLE (' + (c.regime === 'new' ? 'NEW' : 'OLD') + ' REGIME)', M + 18, y + 23);
    doc.setTextColor(29, 78, 216); doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
    doc.text(taxInr(c.total), M + 18, y + 47);
    y += 82;

    var rows = [
      ['Gross Income', taxInr(c.grossIncome)],
      ['Standard Deduction', c.stdDed ? '- ' + taxInr(c.stdDed) : '-'],
      ['Deductions & Exemptions', c.deductions ? '- ' + taxInr(c.deductions) : '-'],
      ['Taxable Income', taxInr(c.taxable)],
      ['Tax before rebate', taxInr(c.baseTax)],
      ['Rebate u/s 87A', c.rebate ? '- ' + taxInr(c.rebate) : '-'],
      ['Surcharge', c.surcharge ? '+ ' + taxInr(c.surcharge) : '-'],
      ['Health & Education Cess (4%)', '+ ' + taxInr(c.cess)],
      ['TOTAL TAX', taxInr(c.total)],
      ['Monthly Tax', taxInr(c.monthly)],
      ['— — —', ''],
      ['New Regime tax', taxInr(newR.total)],
      ['Old Regime tax', taxInr(oldR.total)],
      ['You save', taxInr(Math.abs(newR.total - oldR.total)) + ' (' + (best.regime === 'new' ? 'New' : 'Old') + ')']
    ];
    doc.setFontSize(11);
    rows.forEach(function (r) {
      if (y > doc.internal.pageSize.getHeight() - 70) { doc.addPage(); y = M; }
      var bold = r[0] === 'TOTAL TAX';
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(bold ? 20 : 70, bold ? 30 : 80, bold ? 50 : 100);
      doc.text(String(r[0]), M, y);
      if (r[1]) doc.text(String(r[1]), W - M, y, { align: 'right' });
      y += 6; doc.setDrawColor(230, 234, 240); doc.line(M, y, W - M, y); y += 16;
    });

    doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(120, 130, 150);
    var disc = doc.splitTextToSize('Computed under AY 2026-27 slab rates with standard deduction, Section 87A rebate, surcharge (with marginal relief) and 4% cess. Capital gains, where entered, are taxed at special rates and shown separately. This is a planning aid, not a filing document.', W - M * 2);
    disc.forEach(function (l) { if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = M; } doc.text(l, M, y); y += 12; });

    doc.save('vitt-marg-income-tax-ay-2026-27.pdf');
  }

  /* ---------- toast ---------- */
  var taxToastEl = null;
  function taxToast(msg) {
    if (!taxToastEl) { taxToastEl = document.createElement('div'); taxToastEl.className = 'tax-toast'; document.body.appendChild(taxToastEl); }
    taxToastEl.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"/></svg><span>' + msg + '</span>';
    taxToastEl.classList.add('tax-show');
    clearTimeout(taxToastEl._t);
    taxToastEl._t = setTimeout(function () { taxToastEl.classList.remove('tax-show'); }, 2400);
  }

  /* ---------- input formatting ---------- */
  function taxAttachFormat(id) {
    var input = taxEl(id);
    input.addEventListener('input', function () {
      var atEnd = input.selectionStart === input.value.length;
      if (input.value.trim() === '') return;
      var raw = taxParse(input.value);
      input.value = raw ? raw.toLocaleString('en-IN') : '';
      if (atEnd) try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {}
    });
  }

  /* ---------- ripple ---------- */
  function taxRipple(e) {
    var btn = e.currentTarget, r = btn.getBoundingClientRect(), size = Math.max(r.width, r.height);
    var s = document.createElement('span'); s.className = 'tax-btn__ripple';
    s.style.width = s.style.height = size + 'px';
    s.style.left = (e.clientX - r.left - size / 2) + 'px';
    s.style.top = (e.clientY - r.top - size / 2) + 'px';
    btn.appendChild(s); setTimeout(function () { s.remove(); }, 660);
  }

  /* ---------- FAQ ---------- */
  function taxInitFaq() {
    document.querySelectorAll('.tax-faqitem').forEach(function (item) {
      var q = item.querySelector('.tax-faqq'), a = item.querySelector('.tax-faqa');
      q.addEventListener('click', function () {
        var open = item.classList.contains('tax-open');
        document.querySelectorAll('.tax-faqitem.tax-open').forEach(function (o) {
          if (o !== item) { o.classList.remove('tax-open'); o.querySelector('.tax-faqq').setAttribute('aria-expanded', 'false'); o.querySelector('.tax-faqa').style.maxHeight = null; }
        });
        if (open) { item.classList.remove('tax-open'); q.setAttribute('aria-expanded', 'false'); a.style.maxHeight = null; }
        else { item.classList.add('tax-open'); q.setAttribute('aria-expanded', 'true'); a.style.maxHeight = a.scrollHeight + 'px'; }
      });
    });
  }

  /* ---------- reveal ---------- */
  function taxInitReveal() {
    var items = document.querySelectorAll('.tax-reveal');
    if (taxReduce || !('IntersectionObserver' in window)) { items.forEach(function (e) { e.classList.add('tax-vis'); }); return; }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('tax-vis'); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (e) { io.observe(e); });
  }

  /* ---------- boot ---------- */
  function taxBoot() {
    ['taxSalary', 'taxHouse', 'taxBusiness', 'taxCapital', 'taxOther', 'tax80C', 'tax80CCD', 'tax80D', 'taxLoan', 'taxHRA', 'taxPtax'].forEach(taxAttachFormat);

    document.querySelectorAll('input[name="taxSalaried"]').forEach(function (r) { r.addEventListener('change', function () { taxSalaried = this.value === 'yes'; }); });
    document.querySelectorAll('input[name="taxAge"]').forEach(function (r) { r.addEventListener('change', function () { taxAge = this.value; }); });

    taxEl('taxBtnCalc').addEventListener('click', function () { taxCalculate(false); });
    taxEl('taxBtnCompare').addEventListener('click', function () { taxCalculate(true); });
    taxEl('taxBtnReset').addEventListener('click', taxReset);
    taxEl('taxBtnPdf').addEventListener('click', taxDownloadPDF);

    document.querySelectorAll('.tax-btn').forEach(function (b) { b.addEventListener('click', taxRipple); });

    taxInitFaq();
    taxInitReveal();
    var y = taxEl('taxYear'); if (y) y.textContent = new Date().getFullYear();

    // compute once on load so the panel isn't empty
    taxCalculate(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', taxBoot);
  else taxBoot();
})();
