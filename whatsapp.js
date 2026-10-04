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
    wrap.className = 'vm-wa';
    wrap.innerHTML =
      '<div class="vm-wa__pop" role="dialog" aria-label="Chat on WhatsApp">' +
        '<button class="vm-wa__close" type="button" aria-label="Close">&times;</button>' +
        '<div class="vm-wa__head"><span class="vm-wa__dot"></span><span class="vm-wa__title">Vitt-Marg Advisors</span></div>' +
        '<p class="vm-wa__text">Have a question on GST, income tax, TDS or company registration? Message us on WhatsApp.</p>' +
        '<a class="vm-wa__cta" href="' + href + '" target="_blank" rel="noopener">Chat on WhatsApp</a>' +
      '</div>' +
      '<a class="vm-wa__btn" href="' + href + '" target="_blank" rel="noopener" aria-label="Chat with Vitt-Marg Advisors on WhatsApp">' + icon + '</a>';
    document.body.appendChild(wrap);

    var pop = wrap.querySelector('.vm-wa__pop');
    var close = wrap.querySelector('.vm-wa__close');

    close.addEventListener('click', function () { pop.classList.remove('is-open'); markSeen(); });
    wrap.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', markSeen); });

    if (!seen()) {
      setTimeout(function () { if (!seen()) pop.classList.add('is-open'); }, POPUP_DELAY_MS);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
