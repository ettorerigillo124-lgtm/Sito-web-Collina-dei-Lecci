/* photo-gallery.js — lightbox a schermo intero per "Le nostre foto"
   Click su una foto → apertura grande, con avanti/indietro (frecce, tastiera, swipe). */
(function () {
  'use strict';
  var grid = document.querySelector('.photo-grid');
  if (!grid) return;
  var imgs = Array.prototype.slice.call(grid.querySelectorAll('img'));
  if (!imgs.length) return;
  var srcs = imgs.map(function (im) { return im.getAttribute('src'); });

  var ov = document.createElement('div');
  ov.className = 'pg-lightbox';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.hidden = true;
  ov.innerHTML =
    '<button class="pg-close" type="button" aria-label="Chiudi">&times;</button>' +
    '<button class="pg-nav pg-prev" type="button" aria-label="Precedente">&#8249;</button>' +
    '<img class="pg-img" alt="">' +
    '<button class="pg-nav pg-next" type="button" aria-label="Successiva">&#8250;</button>' +
    '<div class="pg-counter"></div>';
  document.body.appendChild(ov);

  var big = ov.querySelector('.pg-img');
  var counter = ov.querySelector('.pg-counter');
  var idx = 0;

  function show() {
    big.src = srcs[idx];
    counter.textContent = (idx + 1) + ' / ' + srcs.length;
  }
  function open(i) {
    idx = i; show(); ov.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    ov.hidden = true; document.body.style.overflow = ''; big.src = '';
  }
  function go(d) { idx = (idx + d + srcs.length) % srcs.length; show(); }

  imgs.forEach(function (im, i) {
    im.style.cursor = 'zoom-in';
    im.addEventListener('click', function () { open(i); });
  });
  ov.querySelector('.pg-close').addEventListener('click', close);
  ov.querySelector('.pg-prev').addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
  ov.querySelector('.pg-next').addEventListener('click', function (e) { e.stopPropagation(); go(1); });
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  document.addEventListener('keydown', function (e) {
    if (ov.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });

  var sx = 0, sy = 0, tr = false;
  ov.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; tr = true;
  }, { passive: true });
  ov.addEventListener('touchend', function (e) {
    if (!tr) return; tr = false;
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
