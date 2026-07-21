/* booking.js — menu a tendina "Prenota": Booking/Agriturismo.net oppure dal sito.
   Funziona anche con bottoni iniettati dinamicamente (event delegation). */
(function () {
  'use strict';
  function closeAll() {
    document.querySelectorAll('.booking-dd__menu').forEach(function (m) { m.setAttribute('hidden', ''); });
    document.querySelectorAll('.booking-dd__trigger').forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
  }
  document.addEventListener('click', function (e) {
    var trig = e.target.closest && e.target.closest('.booking-dd__trigger');
    if (trig) {
      e.preventDefault();
      var menu = trig.parentNode.querySelector('.booking-dd__menu');
      var isHidden = menu.hasAttribute('hidden');
      closeAll();
      if (isHidden) { menu.removeAttribute('hidden'); trig.setAttribute('aria-expanded', 'true'); }
      return;
    }
    if (!(e.target.closest && e.target.closest('.booking-dd__menu'))) closeAll();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
})();
