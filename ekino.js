// Ekino TV v1.3 (ES5). TizenBrew wykonuje skrypt, zanim istnieje DOM - wszystko czeka na dokument.
(function () {
  'use strict';
  var VER = '1.3', last = '-', cur = null, bar = null;

  // blokada pop-upów (nie potrzebuje DOM)
  try { window.open = function () { return null; }; } catch (e) {}

  var SEL = 'a[href],button,input,select,textarea,[onclick],[role="button"],[tabindex]:not([tabindex="-1"])';

  function visible(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return false;
    var s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none';
  }
  function list() {
    var all = document.querySelectorAll(SEL), out = [], i;
    for (i = 0; i < all.length; i++) if (visible(all[i])) out.push(all[i]);
    return out;
  }
  function center(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function setCur(el) {
    if (cur) cur.classList.remove('tvfocus');
    cur = el;
    if (!el) return;
    el.classList.add('tvfocus');
    try { el.focus({ preventScroll: true }); } catch (e) {}
    var r = el.getBoundingClientRect();
    if (r.top < 80 || r.bottom > window.innerHeight - 80) {
      window.scrollTo(0, window.pageYOffset + r.top - window.innerHeight / 2);
    }
  }
  function move(dir) {
    var els = list(), i, k;
    if (!els.length) return;
    if (!cur || els.indexOf(cur) < 0) {
      for (k = 0; k < els.length; k++) {
        var rr = els[k].getBoundingClientRect();
        if (rr.top >= 0 && rr.top < window.innerHeight) { setCur(els[k]); return; }
      }
      setCur(els[0]); return;
    }
    var c = center(cur), best = null, bs = 1e12;
    for (i = 0; i < els.length; i++) {
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

  function upd() {
    if (!bar) return;
    bar.textContent = 'Ekino mod v' + VER + ' | klawisz: ' + last + ' | elem: ' + list().length + ' | fokus: ' + (cur ? 'tak' : 'nie');
  }

  function onKey(e) {
    var k = e.keyCode;
    last = k;
    var tag = document.activeElement && document.activeElement.tagName;
    var typing = tag === 'INPUT' || tag === 'TEXTAREA';
    try {
      if (k === 37 || k === 38 || k === 39 || k === 40) {
        if (typing && (k === 37 || k === 39)) return;
        e.preventDefault(); e.stopPropagation();
        move(k === 37 ? 'L' : k === 39 ? 'R' : k === 38 ? 'U' : 'D');
      } else if (k === 13) {
        if (cur && !typing) {
          e.preventDefault(); e.stopPropagation();
          cur.click();
          if (cur.tagName === 'INPUT' || cur.tagName === 'TEXTAREA') cur.focus();
        }
      } else if (k === 10009 || k === 8) {
        if (!typing) { e.preventDefault(); history.back(); }
      }
    } catch (err) { last = 'ERR ' + err.message; }
    setTimeout(upd, 30);
  }

  function init() {
    try {
      var st = document.createElement('style');
      st.textContent =
        '.tvfocus{outline:4px solid #C9A84C!important;outline-offset:2px!important;box-shadow:0 0 14px #C9A84C!important;}' +
        'iframe[src*="ads"],iframe[src*="doubleclick"],ins.adsbygoogle,[id^="google_ads"],[id^="div-gpt-ad"]{display:none!important;}';
      document.documentElement.appendChild(st);
      bar = document.createElement('div');
      bar.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:2147483647;background:#151728;color:#C9A84C;padding:6px 12px;font:bold 20px sans-serif;border:2px solid #C9A84C;border-radius:6px;pointer-events:none;';
      document.documentElement.appendChild(bar);
      upd();
      setInterval(upd, 1000);
      setTimeout(function () { move('D'); }, 1500);
    } catch (e) {}
  }

  // klawisze łapiemy od razu (window istnieje zawsze), reszta po pojawieniu się dokumentu
  try { window.addEventListener('keydown', onKey, true); } catch (e) {}
  var tries = 0, t = setInterval(function () {
    tries++;
    if (document.documentElement && document.body) { clearInterval(t); init(); }
    else if (tries > 200) clearInterval(t);
  }, 50);
})();
