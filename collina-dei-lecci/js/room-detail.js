/* room-detail.js — pagina prodotto della singola camera
   Legge ?apt=sasso|spigo&n=1|2|3, monta la galleria centrata
   (frecce, tastiera, swipe, contatore) e i dettagli condivisi. */
(function () {
  'use strict';

  function qs(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : '';
  }

  var apt = (qs('apt') || '').toLowerCase();
  var n = parseInt(qs('n') || '1', 10);
  if (!(n >= 1)) n = 1;
  var key = apt + '-' + n;

  var photos  = (window.ROOMS_PHOTOS || {})[key];
  var content = (window.ROOM_CONTENT || {})[apt];
  var i18n    = window.ROOM_I18N || {};
  var listHref = i18n.listHref || 'index.html';

  // Dati mancanti → torna alla lista camere
  if (!photos || !photos.length || !content) {
    window.location.replace(listHref);
    return;
  }

  var aptName = (i18n.aptNames && i18n.aptNames[apt]) ? i18n.aptNames[apt] : apt;
  var roomWord = i18n.roomWord || 'Camera';
  var roomTitle = aptName + ' — ' + roomWord + ' ' + n;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    document.title = roomTitle + ' — La Collina dei Lecci';

    var titleEl   = document.getElementById('rp-title');
    var metaEl    = document.getElementById('rp-meta');
    var amenEl    = document.getElementById('rp-amenities');
    var bookEl    = document.getElementById('rp-booking');
    var backEl    = document.getElementById('rp-back');
    var mainImg   = document.getElementById('rp-main-img');
    var counter   = document.getElementById('rp-counter');
    var thumbsWrap = document.getElementById('rp-thumbs');
    var stage     = document.getElementById('rp-stage');
    var prevBtn   = document.getElementById('rp-prev');
    var nextBtn   = document.getElementById('rp-next');

    if (titleEl) titleEl.textContent = roomTitle;
    if (metaEl)  metaEl.innerHTML = content.meta || '';
    if (amenEl)  amenEl.innerHTML = content.amenities || '';
    if (bookEl) {
      var B = window.ROOM_BOOKING;
      if (B && B[apt]) {
        var ap = B[apt];
        bookEl.innerHTML =
          '<div class="booking-dd">' +
          '<button type="button" class="btn btn--primary booking-dd__trigger" aria-haspopup="true" aria-expanded="false">' + B.trigger + '</button>' +
          '<div class="booking-dd__menu" hidden role="menu">' +
          '<a class="booking-dd__opt" role="menuitem" target="_blank" rel="noopener noreferrer" href="' + ap.ext + '">' + ap.extLabel + '</a>' +
          '<a class="booking-dd__opt" role="menuitem" href="' + B.site.href + '">' + B.site.label + '</a>' +
          '</div></div>';
      } else {
        bookEl.innerHTML = content.booking || '';
      }
    }
    if (backEl)  backEl.href = listHref;

    var idx = 0;
    var photoWord = i18n.photoWord || 'Foto';

    function render() {
      if (mainImg) {
        mainImg.src = photos[idx];
        mainImg.alt = roomTitle + ' — ' + photoWord + ' ' + (idx + 1);
      }
      if (counter) counter.textContent = (idx + 1) + ' / ' + photos.length;
      if (thumbsWrap) {
        Array.prototype.forEach.call(thumbsWrap.children, function (b, bi) {
          var active = bi === idx;
          b.setAttribute('aria-current', active ? 'true' : 'false');
          b.classList.toggle('rp-thumb--active', active);
          if (active && b.scrollIntoView) {
            try { b.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { b.scrollIntoView(); }
          }
        });
      }
    }

    function go(d) {
      idx = (idx + d + photos.length) % photos.length;
      render();
    }

    // Costruisci le miniature
    if (thumbsWrap) {
      photos.forEach(function (src, pi) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'rp-thumb';
        b.setAttribute('role', 'listitem');
        b.setAttribute('aria-label', photoWord + ' ' + (pi + 1));
        var im = document.createElement('img');
        im.src = src; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
        b.appendChild(im);
        b.addEventListener('click', function () { idx = pi; render(); });
        thumbsWrap.appendChild(b);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { go(-1); }
      if (e.key === 'ArrowRight') { go(1); }
    });

    // Swipe / trascinamento
    if (stage) {
      var sx = 0, sy = 0, tracking = false;
      stage.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
      }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        if (!tracking) return; tracking = false;
        var t = e.changedTouches[0];
        var dx = t.clientX - sx, dy = t.clientY - sy;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
      }, { passive: true });

      var mDown = false, mx = 0;
      stage.addEventListener('mousedown', function (e) { mDown = true; mx = e.clientX; });
      stage.addEventListener('mouseup', function (e) {
        if (!mDown) return; mDown = false;
        var dx = e.clientX - mx;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      });
    }

    render();
  });
})();
