/* ============================================================
   navbar.js — La Collina dei Lecci
   
   Gestisce:
   1. Toggle del menu mobile (hamburger)
   2. Chiusura menu mobile con tasto Escape
   3. Chiusura menu quando si clicca un link (navigazione)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  var hamburger = document.getElementById('navbar-hamburger');
  var menu = document.getElementById('navbar-menu');

  if (!hamburger || !menu) return;

  // Toggle menu mobile
  hamburger.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('navbar__menu--open');
    hamburger.classList.toggle('navbar__hamburger--open');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    // Blocca scroll del body quando il menu è aperto
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Chiudi menu con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('navbar__menu--open')) {
      menu.classList.remove('navbar__menu--open');
      hamburger.classList.remove('navbar__hamburger--open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });

  // Chiudi menu quando si clicca un link di navigazione (mobile)
  var navLinks = menu.querySelectorAll('.navbar__link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (menu.classList.contains('navbar__menu--open')) {
        menu.classList.remove('navbar__menu--open');
        hamburger.classList.remove('navbar__hamburger--open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });
});
