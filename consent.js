(function () {
  var GA_ID = 'G-357C5D90KK';
  var KEY = 'cn_consent';

  function loadGA() {
    if (window.gaLoaded) return;
    window.gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  var TEXT = {
    es: { text: 'Usamos cookies para analizar el tráfico de la web.', accept: 'Aceptar', reject: 'Rechazar', link: 'Más información' },
    ca: { text: 'Utilitzem cookies per analitzar el trànsit del lloc web.', accept: 'Accepta', reject: 'Rebutja', link: 'Més informació' },
    en: { text: 'We use cookies to analyze site traffic.', accept: 'Accept', reject: 'Reject', link: 'More info' },
    fr: { text: 'Nous utilisons des cookies pour analyser le trafic du site.', accept: 'Accepter', reject: 'Refuser', link: 'En savoir plus' },
  };

  function showBanner() {
    var locale = (document.documentElement.lang || 'es').slice(0, 2);
    var t = TEXT[locale] || TEXT.es;
    var prefix = locale === 'es' ? '' : '/' + locale;

    var el = document.createElement('div');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookies');
    el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:999;background:#1E1414;color:#EFE7C7;padding:18px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.5;';
    el.innerHTML =
      '<span style="flex:1 1 280px;max-width:640px;">' + t.text + ' <a href="' + prefix + '/cookies" style="color:#EFE7C7;">' + t.link + '</a></span>' +
      '<span style="display:flex;gap:10px;flex-shrink:0;">' +
        '<button type="button" data-act="reject" style="min-height:40px;padding:0 16px;background:none;border:2px solid #EFE7C7;color:#EFE7C7;border-radius:2px;font:inherit;font-weight:700;cursor:pointer;">' + t.reject + '</button>' +
        '<button type="button" data-act="accept" style="min-height:40px;padding:0 16px;background:#EFE7C7;border:2px solid #EFE7C7;color:#1E1414;border-radius:2px;font:inherit;font-weight:700;cursor:pointer;">' + t.accept + '</button>' +
      '</span>';
    document.body.appendChild(el);

    el.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('button[data-act]');
      if (!btn) return;
      var v = btn.getAttribute('data-act');
      setConsent(v);
      el.remove();
      if (v === 'accept') loadGA();
    });
  }

  var consent = getConsent();
  if (consent === 'accept') {
    loadGA();
  } else if (consent !== 'reject') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
    else showBanner();
  }
})();
