/* ============================================================
   fresh.js — La Collina dei Lecci
   Layer di dinamicità: reveal allo scroll, navbar reattiva,
   contatori animati. Nessuna dipendenza esterna.
   Rispetta prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 1. NAVBAR reattiva allo scroll ---------- */
    var navbar = document.querySelector('.navbar');
    if (navbar) {
      var onScroll = function () {
        navbar.classList.toggle('navbar--scrolled', window.scrollY > 40);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (reduce) return; // niente animazioni oltre a quelle base

    /* ---------- 2. Auto-tag degli elementi da rivelare ---------- */
    var selectors = [
      '.section h2',
      '.section .container > p',
      '.section .container--narrow > p',
      '.section .container--narrow > blockquote',
      '.room-card',
      '.apt-overview__card',
      '.experience-block',
      '.review-card',
      '.page-header__content',
      '.stat',
      'blockquote'
    ];
    var nodes = [];
    selectors.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        if (!el.classList.contains('reveal') && !el.dataset.noReveal) {
          el.classList.add('reveal');
          nodes.push(el);
        }
      });
    });

    /* Stagger: ritardo progressivo tra fratelli nello stesso contenitore */
    var groups = {};
    nodes.forEach(function (el) {
      var key = el.parentNode ? (el.parentNode.className || 'root') : 'root';
      groups[key] = groups[key] || 0;
      var idx = groups[key]++;
      el.style.transitionDelay = Math.min(idx * 90, 450) + 'ms';
    });

    /* Le linee decorative hanno una transizione propria (scaleX) */
    var lines = Array.prototype.slice.call(document.querySelectorAll('.decorative-line'));

    /* ---------- 3. IntersectionObserver ---------- */
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (el) { el.classList.add('is-visible'); });
      lines.forEach(function (el) { el.classList.add('is-visible'); });
      runCounters();
      return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (entry.target.classList.contains('stats-band') ||
              entry.target.querySelector && entry.target.querySelector('.stat__num')) {
            runCounters();
          }
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    nodes.forEach(function (el) { io.observe(el); });
    lines.forEach(function (el) { io.observe(el); });

    var band = document.querySelector('.stats-band');
    if (band) io.observe(band);

    /* ---------- 4. Contatori animati ---------- */
    var countersDone = false;
    function runCounters() {
      if (countersDone) return;
      countersDone = true;
      var lang = (document.documentElement.getAttribute('lang') || 'it').toLowerCase();
      var useComma = lang.indexOf('en') !== 0; // it/de/fr → virgola decimale
      function fmt(n, decimals) {
        var s = decimals ? n.toFixed(decimals) : String(Math.round(n));
        return useComma ? s.replace('.', ',') : s;
      }
      Array.prototype.forEach.call(document.querySelectorAll('.stat__num[data-target]'), function (el) {
        var target = parseFloat(el.getAttribute('data-target'));
        var suffix = el.getAttribute('data-suffix') || '';
        var decimals = (String(target).split('.')[1] || '').length;
        var dur = 1400, start = null;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = fmt(val, decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = fmt(target, decimals) + suffix;
        }
        requestAnimationFrame(tick);
      });
    }
  });
})();
