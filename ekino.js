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

// Nawigacja pilotem (strzałki/OK/Wstecz), ES5
(function () {
  'use strict';
  var SEL = 'a[href],button,input,select,textarea,[onclick],[role="button"],[tabindex]:not([tabindex="-1"]),.play,.btn';
  var cur = null;
  var st = document.createElement('style');
  st.textContent = '.tvfocus{outline:4px solid #C9A84C!important;outline-offset:2px!important;box-shadow:0 0 14px #C9A84C!important;}';
  (document.head || document.documentElement).appendChild(st);

  function visible(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return false;
    if (r.bottom < 0 || r.top > window.innerHeight * 3) return false;
    var s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none';
  }
  function list() {
    var all = document.querySelectorAll(SEL), out = [];
    for (var i = 0; i < all.length; i++) if (visible(all[i])) out.push(all[i]);
    return out;
  }
  function center(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r };
  }
  function setCur(el) {
    if (cur) cur.classList.remove('tvfocus');
    cur = el;
    if (!el) return;
    el.classList.add('tvfocus');
    if (el.focus) try { el.focus({ preventScroll: true }); } catch (e) {}
    var r = el.getBoundingClientRect();
    if (r.top < 60 || r.bottom > window.innerHeight - 60) {
      window.scrollTo(0, window.pageYOffset + r.top - window.innerHeight / 2);
    }
  }
  function move(dir) {
    var els = list();
    if (!els.length) return;
    if (!cur || els.indexOf(cur) < 0) {
      for (var k = 0; k < els.length; k++) {
        var rr = els[k].getBoundingClientRect();
        if (rr.top >= 0 && rr.top < window.innerHeight) { setCur(els[k]); return; }
      }
      setCur(els[0]); return;
    }
    var c = center(cur), best = null, bs = 1e12;
    for (var i = 0; i < els.length; i++) {
      var e = els[i]; if (e === cur) continue;
      var p = center(e), dx = p.x - c.x, dy = p.y - c.y;
      var ok = (dir === 'L' && dx < -4) || (dir === 'R' && dx > 4) || (dir === 'U' && dy < -4) || (dir === 'D' && dy > 4);
      if (!ok) continue;
      var main = (dir === 'L' || dir === 'R') ? Math.abs(dx) : Math.abs(dy);
      var side = (dir === 'L' || dir === 'R') ? Math.abs(dy) : Math.abs(dx);
      var score = main + side * 2.5;
      if (score < bs) { bs = score; best = e; }
    }
    if (best) setCur(best);
    else if (dir === 'D') window.scrollBy(0, 200);
    else if (dir === 'U') window.scrollBy(0, -200);
  }
  window.addEventListener('keydown', function (e) {
    var k = e.keyCode, tag = document.activeElement && document.activeElement.tagName;
    var typing = tag === 'INPUT' || tag === 'TEXTAREA';
    if (k === 37 || k === 38 || k === 39 || k === 40) {
      if (typing && (k === 37 || k === 39)) return;
      e.preventDefault(); e.stopPropagation();
      move(k === 37 ? 'L' : k === 39 ? 'R' : k === 38 ? 'U' : 'D');
    } else if (k === 13) {
      if (cur && !typing) {
        e.preventDefault(); e.stopPropagation();
        if (cur.click) cur.click();
        if (cur.tagName === 'INPUT' || cur.tagName === 'TEXTAREA') cur.focus();
      }
    } else if (k === 10009 || k === 8) {
      if (!typing) { e.preventDefault(); history.back(); }
    }
  }, true);
  setTimeout(function () { move('D'); }, 1500);
})();

// Plakietka diagnostyczna (stała): wersja, ostatni klawisz, liczba elementów
(function () {
  var b, last = '-';
  function upd() {
    if (!b) return;
    var n = document.querySelectorAll('a[href],button,input').length;
    b.textContent = 'Ekino mod v1.2 | klawisz: ' + last + ' | elem: ' + n + ' | fokus: ' + (document.querySelector('.tvfocus') ? 'tak' : 'nie');
  }
  function make() {
    b = document.createElement('div');
    b.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:2147483647;background:#151728;color:#C9A84C;padding:6px 12px;font:bold 20px sans-serif;border:2px solid #C9A84C;border-radius:6px;pointer-events:none;';
    document.documentElement.appendChild(b); upd();
  }
  window.addEventListener('keydown', function (e) { last = e.keyCode; setTimeout(upd, 50); }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', make); else make();
  setInterval(upd, 1000);
})();
