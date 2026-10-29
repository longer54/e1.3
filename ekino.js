// Ekino TV: blokada pop-upów i reklam (ES5, dla starego Chromium ~56)
(function () {
  'use strict';
  try {
    // 1. Pop-upy i przekierowania w nowe okna
    window.open = function () { return null; };
    // 2. Linki target=_blank otwieraj w tym samym oknie tylko dla domeny serwisu
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[target="_blank"]') : null;
      if (a && a.hostname && a.hostname.indexOf(location.hostname.replace(/^www\./, '')) === -1) {
        e.preventDefault(); e.stopPropagation();
      }
    }, true);
  } catch (err) {}

  // 3. Ukrywanie typowych elementów reklamowych
  var css = [
    'iframe[src*="ads"]', 'iframe[src*="adserv"]', 'iframe[src*="doubleclick"]',
    'ins.adsbygoogle', '[id^="google_ads"]', '[id*="banner" i]:not(video)',
    '[class*="adsbox" i]', '[class*="ad-banner" i]', '[class*="popup" i]:not(video)',
    '[id^="div-gpt-ad"]', 'a[href*="bet"][target="_blank"]'
  ].join(',') + '{display:none!important;visibility:hidden!important;}';
  function addStyle() {
    var s = document.createElement('style');
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }
  addStyle();

  // 4. Usuwaj nakładki pełnoekranowe (overlay) pojawiające się po czasie
  setInterval(function () {
    var els = document.querySelectorAll('body > div, body > iframe');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], st = getComputedStyle(el);
      if ((st.position === 'fixed' || st.position === 'absolute') &&
          parseInt(st.zIndex, 10) > 9000 &&
          el.offsetWidth > window.innerWidth * 0.6 &&
          !el.querySelector('video')) {
        el.parentNode.removeChild(el);
      }
    }
  }, 1500);
})();
