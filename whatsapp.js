/* E-mail links are written as data-mail="user|domain" so the address is not plain text in the HTML */
(function () {
  function fill() {
    document.querySelectorAll('[data-mail]').forEach(function (a) {
      var p = a.getAttribute('data-mail').split('|'), m = p[0] + '@' + p[1];
      a.setAttribute('href', 'mailto:' + m);
      var t = a.querySelector('[data-mail-text]'); if (t) t.textContent = m;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
})();
/* Google Analytics (G-QH4NV2QME2): loaded on every page that includes this file, unless the page already has gtag */
(function () {
  if (window.gtag) return;
  var s = document.createElement('script'); s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-QH4NV2QME2';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date()); window.gtag('config', 'G-QH4NV2QME2');
})();
/* =================================================================
   VITT-MARG ADVISORS — WhatsApp chat button + greeting pop-up
   Self-contained: adds its own styles and markup. Does not touch
   script.js or styles.css. To change the number or message, edit
   WA_NUMBER / WA_TEXT below.
   ================================================================= */
(function () {
  'use strict';

  var WA_NUMBER = '919315639676';
  var WA_TEXT   = 'Hi Vitt-Marg Advisors, I would like to discuss a requirement.';
  var POPUP_DELAY_MS = 5000;
  var SEEN_KEY = 'vm_wa_popup_seen';

  var href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(WA_TEXT);
  /* Laptop/desktop visitors often are not logged in to WhatsApp Web, so on desktop the button opens a box
     with a QR code (scan with phone), a WhatsApp Web link, and a call-back form that saves the lead. */
  var DESK = !(/Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)));
  var QR = '<svg viewBox="-2 -2 29 29" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="-2" y="-2" width="29" height="29" fill="#fff"/><path d="M0 0h1v1h-1zM1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM10 0h1v1h-1zM11 0h1v1h-1zM14 0h1v1h-1zM18 0h1v1h-1zM19 0h1v1h-1zM20 0h1v1h-1zM21 0h1v1h-1zM22 0h1v1h-1zM23 0h1v1h-1zM24 0h1v1h-1zM0 1h1v1h-1zM6 1h1v1h-1zM10 1h1v1h-1zM12 1h1v1h-1zM13 1h1v1h-1zM14 1h1v1h-1zM15 1h1v1h-1zM18 1h1v1h-1zM24 1h1v1h-1zM0 2h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM4 2h1v1h-1zM6 2h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM10 2h1v1h-1zM11 2h1v1h-1zM12 2h1v1h-1zM14 2h1v1h-1zM15 2h1v1h-1zM18 2h1v1h-1zM20 2h1v1h-1zM21 2h1v1h-1zM22 2h1v1h-1zM24 2h1v1h-1zM0 3h1v1h-1zM2 3h1v1h-1zM3 3h1v1h-1zM4 3h1v1h-1zM6 3h1v1h-1zM8 3h1v1h-1zM9 3h1v1h-1zM10 3h1v1h-1zM13 3h1v1h-1zM16 3h1v1h-1zM18 3h1v1h-1zM20 3h1v1h-1zM21 3h1v1h-1zM22 3h1v1h-1zM24 3h1v1h-1zM0 4h1v1h-1zM2 4h1v1h-1zM3 4h1v1h-1zM4 4h1v1h-1zM6 4h1v1h-1zM8 4h1v1h-1zM9 4h1v1h-1zM12 4h1v1h-1zM13 4h1v1h-1zM14 4h1v1h-1zM18 4h1v1h-1zM20 4h1v1h-1zM21 4h1v1h-1zM22 4h1v1h-1zM24 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM8 5h1v1h-1zM11 5h1v1h-1zM12 5h1v1h-1zM15 5h1v1h-1zM16 5h1v1h-1zM18 5h1v1h-1zM24 5h1v1h-1zM0 6h1v1h-1zM1 6h1v1h-1zM2 6h1v1h-1zM3 6h1v1h-1zM4 6h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM19 6h1v1h-1zM20 6h1v1h-1zM21 6h1v1h-1zM22 6h1v1h-1zM23 6h1v1h-1zM24 6h1v1h-1zM8 7h1v1h-1zM10 7h1v1h-1zM14 7h1v1h-1zM15 7h1v1h-1zM0 8h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM4 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM9 8h1v1h-1zM10 8h1v1h-1zM11 8h1v1h-1zM13 8h1v1h-1zM15 8h1v1h-1zM16 8h1v1h-1zM18 8h1v1h-1zM19 8h1v1h-1zM20 8h1v1h-1zM21 8h1v1h-1zM22 8h1v1h-1zM1 9h1v1h-1zM2 9h1v1h-1zM3 9h1v1h-1zM4 9h1v1h-1zM5 9h1v1h-1zM8 9h1v1h-1zM12 9h1v1h-1zM14 9h1v1h-1zM19 9h1v1h-1zM23 9h1v1h-1zM1 10h1v1h-1zM4 10h1v1h-1zM5 10h1v1h-1zM6 10h1v1h-1zM8 10h1v1h-1zM11 10h1v1h-1zM12 10h1v1h-1zM13 10h1v1h-1zM14 10h1v1h-1zM15 10h1v1h-1zM16 10h1v1h-1zM18 10h1v1h-1zM19 10h1v1h-1zM20 10h1v1h-1zM21 10h1v1h-1zM23 10h1v1h-1zM24 10h1v1h-1zM3 11h1v1h-1zM4 11h1v1h-1zM8 11h1v1h-1zM10 11h1v1h-1zM12 11h1v1h-1zM15 11h1v1h-1zM17 11h1v1h-1zM18 11h1v1h-1zM19 11h1v1h-1zM24 11h1v1h-1zM2 12h1v1h-1zM3 12h1v1h-1zM6 12h1v1h-1zM7 12h1v1h-1zM10 12h1v1h-1zM12 12h1v1h-1zM13 12h1v1h-1zM16 12h1v1h-1zM18 12h1v1h-1zM19 12h1v1h-1zM20 12h1v1h-1zM22 12h1v1h-1zM23 12h1v1h-1zM24 12h1v1h-1zM0 13h1v1h-1zM2 13h1v1h-1zM5 13h1v1h-1zM8 13h1v1h-1zM10 13h1v1h-1zM12 13h1v1h-1zM14 13h1v1h-1zM19 13h1v1h-1zM21 13h1v1h-1zM23 13h1v1h-1zM0 14h1v1h-1zM2 14h1v1h-1zM3 14h1v1h-1zM4 14h1v1h-1zM5 14h1v1h-1zM6 14h1v1h-1zM7 14h1v1h-1zM8 14h1v1h-1zM10 14h1v1h-1zM15 14h1v1h-1zM16 14h1v1h-1zM17 14h1v1h-1zM19 14h1v1h-1zM20 14h1v1h-1zM21 14h1v1h-1zM23 14h1v1h-1zM24 14h1v1h-1zM0 15h1v1h-1zM2 15h1v1h-1zM4 15h1v1h-1zM7 15h1v1h-1zM9 15h1v1h-1zM11 15h1v1h-1zM16 15h1v1h-1zM19 15h1v1h-1zM20 15h1v1h-1zM24 15h1v1h-1zM0 16h1v1h-1zM3 16h1v1h-1zM6 16h1v1h-1zM7 16h1v1h-1zM13 16h1v1h-1zM16 16h1v1h-1zM17 16h1v1h-1zM18 16h1v1h-1zM19 16h1v1h-1zM20 16h1v1h-1zM22 16h1v1h-1zM8 17h1v1h-1zM9 17h1v1h-1zM11 17h1v1h-1zM12 17h1v1h-1zM14 17h1v1h-1zM15 17h1v1h-1zM16 17h1v1h-1zM20 17h1v1h-1zM21 17h1v1h-1zM0 18h1v1h-1zM1 18h1v1h-1zM2 18h1v1h-1zM3 18h1v1h-1zM4 18h1v1h-1zM5 18h1v1h-1zM6 18h1v1h-1zM12 18h1v1h-1zM13 18h1v1h-1zM16 18h1v1h-1zM18 18h1v1h-1zM20 18h1v1h-1zM22 18h1v1h-1zM23 18h1v1h-1zM24 18h1v1h-1zM0 19h1v1h-1zM6 19h1v1h-1zM8 19h1v1h-1zM12 19h1v1h-1zM15 19h1v1h-1zM16 19h1v1h-1zM20 19h1v1h-1zM21 19h1v1h-1zM0 20h1v1h-1zM2 20h1v1h-1zM3 20h1v1h-1zM4 20h1v1h-1zM6 20h1v1h-1zM8 20h1v1h-1zM10 20h1v1h-1zM11 20h1v1h-1zM13 20h1v1h-1zM15 20h1v1h-1zM16 20h1v1h-1zM17 20h1v1h-1zM18 20h1v1h-1zM19 20h1v1h-1zM20 20h1v1h-1zM22 20h1v1h-1zM0 21h1v1h-1zM2 21h1v1h-1zM3 21h1v1h-1zM4 21h1v1h-1zM6 21h1v1h-1zM8 21h1v1h-1zM11 21h1v1h-1zM12 21h1v1h-1zM14 21h1v1h-1zM17 21h1v1h-1zM18 21h1v1h-1zM20 21h1v1h-1zM21 21h1v1h-1zM22 21h1v1h-1zM23 21h1v1h-1zM24 21h1v1h-1zM0 22h1v1h-1zM2 22h1v1h-1zM3 22h1v1h-1zM4 22h1v1h-1zM6 22h1v1h-1zM8 22h1v1h-1zM10 22h1v1h-1zM21 22h1v1h-1zM22 22h1v1h-1zM24 22h1v1h-1zM0 23h1v1h-1zM6 23h1v1h-1zM9 23h1v1h-1zM10 23h1v1h-1zM12 23h1v1h-1zM14 23h1v1h-1zM15 23h1v1h-1zM16 23h1v1h-1zM17 23h1v1h-1zM19 23h1v1h-1zM20 23h1v1h-1zM21 23h1v1h-1zM24 23h1v1h-1zM0 24h1v1h-1zM1 24h1v1h-1zM2 24h1v1h-1zM3 24h1v1h-1zM4 24h1v1h-1zM5 24h1v1h-1zM6 24h1v1h-1zM8 24h1v1h-1zM10 24h1v1h-1zM13 24h1v1h-1zM17 24h1v1h-1zM18 24h1v1h-1zM19 24h1v1h-1zM20 24h1v1h-1zM21 24h1v1h-1zM22 24h1v1h-1zM23 24h1v1h-1zM24 24h1v1h-1z" fill="#0B1F44"/></svg>';

  var css = '' +
    '.vm-wa{position:fixed;right:2rem;bottom:2rem;z-index:850;font-family:inherit}' +
    '.vm-wa__btn{width:58px;height:58px;border-radius:50%;background:#25D366;color:#fff;display:grid;place-items:center;' +
      'box-shadow:0 10px 30px -8px rgba(0,0,0,.35);transition:transform .2s ease,box-shadow .2s ease;text-decoration:none}' +
    '.vm-wa__btn:hover{transform:translateY(-3px);box-shadow:0 14px 36px -8px rgba(0,0,0,.4);color:#fff}' +
    '.vm-wa__btn svg{width:30px;height:30px}' +
    '.vm-wa__pop{position:absolute;right:0;bottom:74px;width:280px;background:#fff;color:#0B1F44;border-radius:14px;' +
      'box-shadow:0 18px 50px -12px rgba(15,40,90,.35);border:1px solid rgba(30,64,175,.12);padding:16px 16px 14px;' +
      'opacity:0;transform:translateY(10px);pointer-events:none;transition:opacity .3s ease,transform .3s ease}' +
    '.vm-wa__pop.is-open{opacity:1;transform:none;pointer-events:auto}' +
    '.vm-wa__pop::after{content:"";position:absolute;right:22px;bottom:-7px;width:14px;height:14px;background:#fff;' +
      'border-right:1px solid rgba(30,64,175,.12);border-bottom:1px solid rgba(30,64,175,.12);transform:rotate(45deg)}' +
    '.vm-wa__head{display:flex;align-items:center;gap:10px;margin-bottom:8px}' +
    '.vm-wa__dot{width:9px;height:9px;border-radius:50%;background:#25D366;flex-shrink:0}' +
    '.vm-wa__title{font-weight:600;font-size:15px}' +
    '.vm-wa__text{font-size:14px;line-height:1.5;color:#33476B;margin:0 0 12px}' +
    '.vm-wa__cta{display:block;text-align:center;background:#25D366;color:#fff;font-weight:600;font-size:14px;' +
      'padding:10px 12px;border-radius:10px;text-decoration:none}' +
    '.vm-wa__cta:hover{background:#1EBE5A;color:#fff}' +
    '.vm-wa__close{position:absolute;top:8px;right:8px;width:26px;height:26px;border:0;background:none;cursor:pointer;' +
      'color:#556684;font-size:18px;line-height:1;border-radius:50%}' +
    '.vm-wa__close:hover{background:#F3F7FE}' +
    /* keep the existing back-to-top button above the WhatsApp button */
    '.to-top{bottom:calc(2rem + 72px) !important}' +
    '@media (max-width:640px){.vm-wa{right:1rem;bottom:1rem}.vm-wa__btn{width:54px;height:54px}' +
      '.vm-wa__pop{width:calc(100vw - 2rem);max-width:300px;bottom:68px}' +
      '.to-top{bottom:calc(1rem + 66px) !important;right:1rem !important}}' +
    '.vm-wa--desk .vm-wa__pop{width:330px}' +
    '.vm-wa__qr{display:flex;gap:12px;align-items:center;background:#F3FBF6;border:1px solid #CDEFD9;border-radius:12px;padding:10px;margin:0 0 10px}' +
    '.vm-wa__qr svg{width:96px;height:96px;flex-shrink:0;border-radius:6px}' +
    '.vm-wa__qr p{font-size:13px;line-height:1.45;color:#33476B;margin:0}.vm-wa__qr b{color:#0B1F44}' +
    '.vm-wa__or{font-size:12px;font-weight:700;color:#556684;text-transform:uppercase;letter-spacing:1px;margin:14px 0 8px;display:flex;gap:8px;align-items:center}' +
    '.vm-wa__or:before,.vm-wa__or:after{content:"";flex:1;height:1px;background:#E2E8F0}' +
    '.vm-wa__cb{display:grid;grid-template-columns:1fr 1fr;gap:7px}' +
    '.vm-wa__cb input{font:inherit;font-size:13.5px;border:1px solid rgba(30,64,175,.22);border-radius:9px;padding:9px 10px;background:#F8FAFF;color:#0B1F44;min-width:0;width:100%}' +
    '.vm-wa__cb button{grid-column:1/-1;border:0;border-radius:10px;padding:10px;font:inherit;font-weight:700;font-size:14px;color:#fff;background:#1D4ED8;cursor:pointer}' +
    '.vm-wa__cb button:hover{background:#1E40AF}.vm-wa__cb .hp{display:none}' +
    '.vm-wa__msg{grid-column:1/-1;font-size:12.5px;margin:0;color:#B91C1C}.vm-wa__msg.ok{color:#047857;font-weight:600}' +
    '@media print{.vm-wa{display:none}}';

  var icon = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 3C9.4 3 4 8.33 4 14.9c0 2.1.56 4.15 1.62 5.95L4 29l8.37-1.58a12.2 12.2 0 0 0 3.67.56C22.67 27.98 28 22.65 28 16.08 28 9.5 22.67 3 16.04 3zm0 22.8c-1.2 0-2.38-.2-3.5-.6l-.5-.18-4.97.94.97-4.75-.33-.53a9.73 9.73 0 0 1-1.5-5.2c0-5.4 4.42-9.8 9.85-9.8 5.43 0 9.84 5.06 9.84 10.4 0 5.4-4.41 9.72-9.86 9.72zm5.4-7.3c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.57-.48-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.45 1.06 2.86 1.21 3.06.15.2 2.09 3.18 5.06 4.46.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35z"/></svg>';

  function seen() { try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return false; } }
  function markSeen() { try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {} }

  function init() {
    if (document.querySelector('.vm-wa')) return;

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'vm-wa' + (DESK ? ' vm-wa--desk' : '');
    wrap.innerHTML =
      '<div class="vm-wa__pop" role="dialog" aria-label="Chat on WhatsApp">' +
        '<button class="vm-wa__close" type="button" aria-label="Close">&times;</button>' +
        '<div class="vm-wa__head"><span class="vm-wa__dot"></span><span class="vm-wa__title">Vitt-Marg Advisors</span></div>' +
        '<p class="vm-wa__text">Have a question on GST, income tax, TDS or company registration? Message us on WhatsApp.</p>' +
        (DESK ? '<div class="vm-wa__qr">' + QR + '<p><b>Scan with your phone</b> to chat with us on WhatsApp.</p></div>' : '') +
        '<a class="vm-wa__cta" href="' + href + '" target="_blank" rel="noopener">' + (DESK ? 'Open WhatsApp Web' : 'Chat on WhatsApp') + '</a>' +
        (DESK ? '<div class="vm-wa__or">or get a call back</div>' +
          '<form class="vm-wa__cb" novalidate><input name="name" placeholder="Name (optional)" autocomplete="name"><input name="phone" type="tel" placeholder="Mobile number" autocomplete="tel" inputmode="tel"><input class="hp" name="website" tabindex="-1" autocomplete="off"><p class="vm-wa__msg" hidden></p><button type="submit">Call me back</button></form>' : '') +
      '</div>' +
      '<a class="vm-wa__btn" href="' + href + '" target="_blank" rel="noopener" aria-label="Chat with Vitt-Marg Advisors on WhatsApp">' + icon + '</a>';
    document.body.appendChild(wrap);

    var pop = wrap.querySelector('.vm-wa__pop');
    var close = wrap.querySelector('.vm-wa__close');

    close.addEventListener('click', function () { pop.classList.remove('is-open'); markSeen(); });
    wrap.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', markSeen); });

    if (DESK) {
      /* on desktop the round button opens the box instead of jumping straight to WhatsApp Web */
      wrap.querySelector('.vm-wa__btn').addEventListener('click', function (e) { e.preventDefault(); pop.classList.toggle('is-open'); markSeen(); });
      var form = wrap.querySelector('.vm-wa__cb'), msg = form.querySelector('.vm-wa__msg');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = function (n) { return form.querySelector('[name="' + n + '"]').value.trim(); };
        if (v('phone').replace(/\D/g, '').length < 10) { msg.className = 'vm-wa__msg'; msg.textContent = 'Please enter a 10-digit mobile number.'; msg.hidden = false; return; }
        var btn = form.querySelector('button'); btn.disabled = true; btn.textContent = 'Sending...';
        fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: v('name'), phone: v('phone'), service: 'Call back request', message: 'Asked for a call back from the WhatsApp box', source: location.href, website: v('website') }) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'failed'); }); })
          .then(function () { form.innerHTML = '<p class="vm-wa__msg ok">Thank you. We have your number and will call you within 30 minutes during office hours.</p>'; })
          .catch(function (er) { btn.disabled = false; btn.textContent = 'Call me back'; msg.className = 'vm-wa__msg'; msg.textContent = (er && er.message && er.message !== 'failed') ? er.message : 'Could not send right now. Please try again in a moment.'; msg.hidden = false; });
      });
    }

    if (!seen()) {
      setTimeout(function () { if (!seen()) pop.classList.add('is-open'); }, POPUP_DELAY_MS);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* On-Call Accountant popup (photo launcher + booking panel), served by the Cloudflare Worker.
   Company pages already include it; this adds it to every other page of the site. */
(function () {
  if (document.querySelector('script[src*="/companies/_oc.js"]')) return;
  var s = document.createElement('script');
  s.src = '/companies/_oc.js?v=5'; s.defer = true;
  (document.body || document.head).appendChild(s);
})();
