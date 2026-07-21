/* ============================================================
   lang-switcher.js — La Collina dei Lecci
   
   Gestisce il dropdown di selezione lingua nella navbar.
   
   COME FUNZIONA:
   - Rileva la lingua corrente e la pagina corrente dal path URL
   - Usa una mappa statica per trovare la pagina equivalente 
     nella lingua selezionata
   - Le emoji-bandiera sono usate solo come indicatori di lingua,
     non come icone funzionali (la regola "no emoji" del design 
     system si applica alle icone UI come telefono, mappa, email)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ----------------------------------------------------------
     Mappa delle pagine equivalenti tra le 4 lingue.
     
     PER MODIFICARE: aggiungi o modifica le righe qui sotto.
     La chiave è il nome file nella lingua italiana.
     ---------------------------------------------------------- */
  var PAGE_MAP = {
    'index.html':       { it: 'index.html',       en: 'index.html',       de: 'index.html',       fr: 'index.html' },
    'camere.html':      { it: 'camere.html',      en: 'rooms.html',       de: 'zimmer.html',      fr: 'chambres.html' },
    'camera.html':      { it: 'camera.html',      en: 'room.html',        de: 'zimmer-detail.html', fr: 'chambre.html' },
    'esperienze.html':  { it: 'esperienze.html',  en: 'experiences.html',  de: 'erlebnisse.html',  fr: 'experiences.html' },
    'ristorazione.html':{ it: 'ristorazione.html', en: 'dining.html',      de: 'gastronomie.html', fr: 'restauration.html' },
    'chi-siamo.html':   { it: 'chi-siamo.html',   en: 'about.html',       de: 'ueber-uns.html',   fr: 'a-propos.html' },
    'contatti.html':    { it: 'contatti.html',     en: 'contact.html',     de: 'kontakt.html',     fr: 'contact.html' }
  };

  /* Nomi lingue e bandiere */
  var LANG_INFO = {
    it: { flag: '<img src="../img/flags/it.svg" width="20" height="20" alt="Italiano" style="vertical-align: middle; border-radius: 2px;">', name: 'Italiano',  code: 'IT' },
    en: { flag: '<img src="../img/flags/en.svg" width="20" height="20" alt="English" style="vertical-align: middle; border-radius: 2px;">', name: 'English',   code: 'EN' },
    de: { flag: '<img src="../img/flags/de.svg" width="20" height="20" alt="Deutsch" style="vertical-align: middle; border-radius: 2px;">', name: 'Deutsch',   code: 'DE' },
    fr: { flag: '<img src="../img/flags/fr.svg" width="20" height="20" alt="Français" style="vertical-align: middle; border-radius: 2px;">', name: 'Français',  code: 'FR' }
  };

  /* Rileva lingua corrente dal path */
  function detectCurrentLang() {
    var path = window.location.pathname;
    var match = path.match(/\/(it|en|de|fr)\//);
    return match ? match[1] : 'it';
  }

  /* Rileva il nome file della pagina corrente */
  function detectCurrentPage() {
    var path = window.location.pathname;
    var parts = path.split('/');
    var filename = parts[parts.length - 1] || 'index.html';
    if (filename === '' || filename === '/') filename = 'index.html';
    return filename;
  }

  /* Trova la chiave italiana corrispondente alla pagina corrente */
  function findPageKey(currentLang, currentPage) {
    for (var key in PAGE_MAP) {
      if (PAGE_MAP[key][currentLang] === currentPage) {
        return key;
      }
    }
    return 'index.html'; // fallback alla home
  }

  /* Costruisci il percorso verso la pagina equivalente */
  function buildLangUrl(targetLang, pageKey) {
    var targetPage = PAGE_MAP[pageKey] ? PAGE_MAP[pageKey][targetLang] : 'index.html';
    // Le pagine-camera conservano i parametri (?apt=..&n=..) tra le lingue
    var suffix = (pageKey === 'camera.html') ? window.location.search : '';
    return '../' + targetLang + '/' + targetPage + suffix;
  }

  /* --- Inizializzazione --- */
  var trigger = document.getElementById('lang-trigger');
  var dropdown = document.getElementById('lang-dropdown');
  var switcher = document.getElementById('lang-switcher');

  if (!trigger || !dropdown || !switcher) return;

  var currentLang = detectCurrentLang();
  var currentPage = detectCurrentPage();
  var pageKey = findPageKey(currentLang, currentPage);

  /* Popola il bottone trigger con la lingua corrente */
  var currentInfo = LANG_INFO[currentLang];
  trigger.querySelector('.lang-switcher__flag').innerHTML = currentInfo.flag;

  /* Popola il dropdown con le opzioni di lingua */
  var langs = ['it', 'en', 'de', 'fr'];
  dropdown.innerHTML = '';

  langs.forEach(function (lang) {
    var info = LANG_INFO[lang];
    var li = document.createElement('li');
    var a = document.createElement('a');
    
    a.href = buildLangUrl(lang, pageKey);
    a.className = 'lang-switcher__option' + (lang === currentLang ? ' lang-switcher__option--active' : '');
    a.setAttribute('role', 'option');
    a.setAttribute('aria-selected', lang === currentLang ? 'true' : 'false');
    a.setAttribute('hreflang', lang);
    a.innerHTML = info.flag + '<span>' + info.name + '</span>';
    
    li.appendChild(a);
    dropdown.appendChild(li);
  });

  /* Toggle dropdown al click */
  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = switcher.classList.toggle('lang-switcher--open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  /* Chiudi dropdown cliccando fuori */
  document.addEventListener('click', function () {
    switcher.classList.remove('lang-switcher--open');
    trigger.setAttribute('aria-expanded', 'false');
  });

  /* Chiudi dropdown con Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && switcher.classList.contains('lang-switcher--open')) {
      switcher.classList.remove('lang-switcher--open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
  });
});
