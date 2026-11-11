/* Efecte: scenă 3D în hero, înclinare carduri, numărătoare cifre, bară de progres */
(function () {
  'use strict';
  var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  var bar = document.createElement('div'); bar.className = 'fx-progress'; document.body.appendChild(bar);
  addEventListener('scroll', function () {
    var h = document.documentElement;
    bar.style.transform = 'scaleX(' + (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)) + ')';
  }, { passive: true });

  function scene() {
    var hero = $('.hero');
    if (!hero || $('.fx-scene', hero)) return;
    var el = document.createElement('div'); el.className = 'fx-scene'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="fx-world"><div class="fx-cube">' +
      ['f', 'b', 'r', 'l', 't', 'd'].map(function (s) { return '<i class="' + s + '"></i>'; }).join('') +
      '</div><div class="fx-ring r1"></div><div class="fx-ring r2"></div><div class="fx-orb o1"></div><div class="fx-orb o2"></div><div class="fx-orb o3"></div></div>';
    hero.appendChild(el);
    if (rm || !fine) return;
    var w = $('.fx-world', el);
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      w.style.transform = 'rotateY(' + (x * 30) + 'deg) rotateX(' + (-y * 24) + 'deg)';
    });
    hero.addEventListener('mouseleave', function () { w.style.transform = ''; });
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); count(e.target); } });
  }, { threshold: .4 }) : null;
  function count(b) {
    var m = /^(\D*)(\d[\d.,]*)(.*)$/.exec(b.textContent.trim());
    if (!m || rm) return;
    var end = parseInt(m[2].replace(/\D/g, ''), 10), t0 = performance.now();
    (function step(t) {
      var p = Math.min(1, (t - t0) / 1400), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      b.textContent = m[1] + v + m[3];
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function counts() {
    if (!io) return;
    document.querySelectorAll('b[data-count]:not([data-fx])').forEach(function (b) { b.setAttribute('data-fx', '1'); io.observe(b); });
  }

  if (fine && !rm) {
    var last = null;
    document.addEventListener('mousemove', function (e) {
      var t = e.target.closest ? e.target.closest('.card,.tcard,.feat,.stat') : null;
      if (last && last !== t) { last.style.transform = ''; last = null; }
      if (!t || (t.classList.contains('rv') && !t.classList.contains('in'))) return;
      var r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      t.style.transform = 'perspective(800px) rotateX(' + ((.5 - py) * 8) + 'deg) rotateY(' + ((px - .5) * 10) + 'deg) translateY(-6px)';
      last = t;
    });
  }

  var queued = false;
  function run() { queued = false; scene(); counts(); }
  var app = $('#app');
  if (app) new MutationObserver(function () { if (!queued) { queued = true; requestAnimationFrame(run); } }).observe(app, { childList: true, subtree: true });
  run();
})();
