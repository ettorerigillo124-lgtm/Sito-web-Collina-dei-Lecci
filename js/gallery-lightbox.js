/**
 * gallery-lightbox.js
 * v3 — viewer principale + miniature + lightbox NAVIGABILE
 *
 * 1. GALLERY VIEWER (viewer principale + miniature)
 *    Ogni miniatura (.gallery-viewer__thumb) ha data-src / data-alt / data-caption.
 *
 * 2. LIGHTBOX (<dialog> nativo) — ora scorribile:
 *    - Cliccando sulla foto principale si apre il lightbox sulla foto corrente.
 *    - Si può navigare tra TUTTE le foto di quella camera con:
 *        · frecce ‹ › a schermo
 *        · tastiera ← →
 *        · swipe (trascinamento) su touch
 *    - Chiusura: Esc (nativo), click backdrop, pulsante ×
 *
 * Zero dipendenze esterne.
 */

(function () {
  'use strict';

  /* ─── GALLERY VIEWER ─────────────────────────────── */

  function initViewer(viewerEl) {
    if (!viewerEl) return;

    const mainBtn     = viewerEl.querySelector('.gallery-viewer__main');
    const mainPh      = viewerEl.querySelector('.gallery-viewer__main-ph');
    const mainImg     = viewerEl.querySelector('.gallery-viewer__main-img');
    const mainCaption = viewerEl.querySelector('.gallery-viewer__main-caption');
    const thumbs      = viewerEl.querySelectorAll('.gallery-viewer__thumb');

    if (!thumbs.length) return;

    function activate(thumb) {
      const src     = thumb.getAttribute('data-src')     || '';
      const alt     = thumb.getAttribute('data-alt')     || '';
      const caption = thumb.getAttribute('data-caption') || '';

      if (mainImg) {
        mainImg.alt = alt;
        if (src) {
          mainImg.src = src;
          mainImg.style.display = 'block';
          if (mainPh) mainPh.style.display = 'none';
        } else {
          if (mainPh) {
            const txt = mainPh.querySelector('.gallery-viewer__ph-text');
            if (txt) txt.textContent = caption ? 'Foto in arrivo: ' + caption : 'Foto in arrivo';
            mainPh.style.display = 'flex';
          }
          mainImg.style.display = 'none';
        }
      }

      if (mainCaption) mainCaption.textContent = caption;

      if (mainBtn) {
        mainBtn.setAttribute('data-src',     src);
        mainBtn.setAttribute('data-alt',     alt);
        mainBtn.setAttribute('data-caption', caption);
      }

      thumbs.forEach(function (t) {
        t.setAttribute('aria-pressed', 'false');
        t.classList.remove('gallery-viewer__thumb--active');
      });
      thumb.setAttribute('aria-pressed', 'true');
      thumb.classList.add('gallery-viewer__thumb--active');
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        activate(thumb);
      });
    });

    activate(thumbs[0]);
  }

  /* ─── LIGHTBOX NAVIGABILE ────────────────────────── */

  // Stato del lightbox attivo
  const state = {
    dialogEl: null,
    imgEl: null,
    captionEl: null,
    counterEl: null,
    items: [],   // [{ src, alt, caption }]
    index: 0
  };

  function render() {
    if (!state.items.length) return;
    const item = state.items[state.index];
    if (state.imgEl)     { state.imgEl.src = item.src; state.imgEl.alt = item.alt || ''; }
    if (state.captionEl) { state.captionEl.textContent = item.caption || ''; }
    if (state.counterEl) {
      state.counterEl.textContent = (state.index + 1) + ' / ' + state.items.length;
    }
  }

  function go(delta) {
    if (state.items.length < 2) return;
    state.index = (state.index + delta + state.items.length) % state.items.length;
    render();
  }

  function ensureNav(dialogEl) {
    const inner = dialogEl.querySelector('.gallery-lightbox__inner');
    if (!inner) return;

    // Frecce (create una sola volta)
    if (!inner.querySelector('.gallery-lightbox__nav--prev')) {
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'gallery-lightbox__nav gallery-lightbox__nav--prev';
      prev.setAttribute('aria-label', 'Foto precedente');
      prev.innerHTML = '‹'; // ‹
      prev.addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
      inner.appendChild(prev);

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'gallery-lightbox__nav gallery-lightbox__nav--next';
      next.setAttribute('aria-label', 'Foto successiva');
      next.innerHTML = '›'; // ›
      next.addEventListener('click', function (e) { e.stopPropagation(); go(1); });
      inner.appendChild(next);
    }

    // Contatore nel footer (create una sola volta)
    const footer = dialogEl.querySelector('.gallery-lightbox__footer');
    if (footer && !footer.querySelector('.gallery-lightbox__counter')) {
      const counter = document.createElement('span');
      counter.className = 'gallery-lightbox__counter';
      const closeBtn = footer.querySelector('.gallery-lightbox__close');
      if (closeBtn) footer.insertBefore(counter, closeBtn);
      else footer.appendChild(counter);
    }
  }

  function initLightbox(dialogEl) {
    if (!dialogEl) return;

    ensureNav(dialogEl);

    const closeBtn = dialogEl.querySelector('.gallery-lightbox__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () { dialogEl.close(); });
    }

    // Click sul backdrop (fuori dall'inner) chiude
    dialogEl.addEventListener('click', function (e) {
      if (e.target === dialogEl) dialogEl.close();
    });

    // Tastiera: frecce sinistra/destra
    dialogEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });

    // Swipe / trascinamento
    const inner = dialogEl.querySelector('.gallery-lightbox__inner');
    if (inner) {
      let startX = 0, startY = 0, tracking = false;

      inner.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      }, { passive: true });

      inner.addEventListener('touchend', function (e) {
        if (!tracking) return;
        tracking = false;
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          go(dx < 0 ? 1 : -1); // swipe verso sinistra → foto successiva
        }
      }, { passive: true });

      // Trascinamento con mouse (desktop)
      let mDown = false, mStartX = 0;
      inner.addEventListener('mousedown', function (e) {
        mDown = true; mStartX = e.clientX;
      });
      inner.addEventListener('mouseup', function (e) {
        if (!mDown) return;
        mDown = false;
        const dx = e.clientX - mStartX;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      });
    }

    dialogEl.addEventListener('close', function () {
      document.body.style.overflow = '';
      if (state.imgEl && state.dialogEl === dialogEl) {
        state.imgEl.src = '';
        state.imgEl.alt = '';
      }
    });
  }

  function collectItems(trigger) {
    // Trova tutte le foto della camera a cui appartiene il trigger
    const viewer = trigger.closest('.gallery-viewer');
    const items = [];
    if (viewer) {
      viewer.querySelectorAll('.gallery-viewer__thumb').forEach(function (thumb) {
        const src = thumb.getAttribute('data-src') || '';
        if (!src) return; // salta placeholder senza foto reale
        items.push({
          src: src,
          alt: thumb.getAttribute('data-alt') || '',
          caption: thumb.getAttribute('data-caption') || ''
        });
      });
    }
    // Fallback: se non troviamo miniature, usa la sola foto del trigger
    if (!items.length) {
      const src = trigger.getAttribute('data-src') || '';
      if (src) {
        items.push({
          src: src,
          alt: trigger.getAttribute('data-alt') || '',
          caption: trigger.getAttribute('data-caption') || ''
        });
      }
    }
    return items;
  }

  function bindLightboxTriggers() {
    document.querySelectorAll('[data-lightbox]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();

        const dialogId = trigger.getAttribute('data-lightbox');
        const currentSrc = trigger.getAttribute('data-src') || '';
        if (!currentSrc) return;

        const dialogEl = document.getElementById(dialogId);
        if (!dialogEl) return;

        const items = collectItems(trigger);
        if (!items.length) return;

        // Indice di partenza = foto attualmente mostrata
        let startIndex = items.findIndex(function (it) { return it.src === currentSrc; });
        if (startIndex < 0) startIndex = 0;

        state.dialogEl  = dialogEl;
        state.imgEl     = dialogEl.querySelector('.gallery-lightbox__img');
        state.captionEl = dialogEl.querySelector('.gallery-lightbox__caption');
        state.counterEl = dialogEl.querySelector('.gallery-lightbox__counter');
        state.items     = items;
        state.index     = startIndex;

        // Nascondi frecce se c'è una sola foto
        const navs = dialogEl.querySelectorAll('.gallery-lightbox__nav');
        navs.forEach(function (n) { n.style.display = items.length > 1 ? '' : 'none'; });

        render();

        document.body.style.overflow = 'hidden';
        dialogEl.showModal();
        dialogEl.focus();
      });
    });
  }

  /* ─── INIT ────────────────────────────────────────── */

  function init() {
    document.querySelectorAll('.gallery-viewer').forEach(initViewer);
    document.querySelectorAll('dialog.gallery-lightbox').forEach(initLightbox);
    bindLightboxTriggers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
