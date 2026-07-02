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
