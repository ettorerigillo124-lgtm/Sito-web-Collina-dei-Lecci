/* ============================================================
   contact-form.js — La Collina dei Lecci
   
   Intercetta il submit del form di contatto e mostra un
   messaggio informativo. NON invia dati a nessun backend.
   
   Il form funziona visivamente (validazione client-side nativa)
   ma il submit è bloccato da JavaScript. In futuro, collegare
   un servizio come Formspree o Netlify Forms.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  var messageEl = document.getElementById('form-message');

  if (!form || !messageEl) return;

  /* Messaggi localizzati per lingua */
  var MESSAGES = {
    it: 'Funzionalità in arrivo — contattaci nel frattempo via telefono o email.',
    en: 'This feature is coming soon — in the meantime, please reach us by phone or email.',
    de: 'Diese Funktion wird bald verfügbar sein — kontaktieren Sie uns in der Zwischenzeit per Telefon oder E-Mail.',
    fr: 'Cette fonctionnalité sera bientôt disponible — contactez-nous en attendant par téléphone ou email.'
  };

  /* Rileva la lingua corrente dal path */
  function detectLang() {
    var match = window.location.pathname.match(/\/(it|en|de|fr)\//);
    return match ? match[1] : 'it';
  }

  form.addEventListener('submit', function (e) {
    /* Blocca il comportamento di default del form
       (che farebbe una richiesta GET con i dati nell'URL) */
    e.preventDefault();

    var lang = detectLang();
    var message = MESSAGES[lang] || MESSAGES['it'];

    /* Mostra il messaggio informativo */
    messageEl.textContent = message;
    messageEl.className = 'form-message form-message--visible form-message--info';

    /* Scroll al messaggio per assicurarsi che sia visibile */
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});
