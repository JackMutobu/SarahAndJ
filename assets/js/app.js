/* Shared behaviour. All event locations come from config.js. */
(function () {
  'use strict';
  var S = window.SITE, R = document.documentElement.getAttribute('data-racine') || '.';
  window.RACINE = R;
  window.memoire = {
    lire: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; } },
    ecrire: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };
  var lang = 'fr';
  try { lang = localStorage.getItem('lang') === 'sw' ? 'sw' : 'fr'; } catch (_) {}
  window.langue = function () { return lang; };
  window.t = function (key, fallback) { var v = (window.TRADUCTIONS || {})[key]; return v ? v[lang === 'sw' ? 1 : 0] : (fallback == null ? key : fallback); };
  window.bunia = function (hm) { return new Date(S.mariage + 'T' + (hm || '00:00') + ':00+02:00'); };
  window.momentActuel = function () {
    var now = Date.now();
    if (now < window.bunia()) return 'avant';
    if (now >= window.bunia().getTime() + 30 * 36e5) return 'apres';
    for (var i = S.moments.length - 1; i >= 0; i--) if (now >= window.bunia(S.moments[i].debut)) return S.moments[i].id;
    return 'jourj';
  };
  function configured(key) { var value = key.split('.').reduce(function (o, k) { return o && o[k]; }, S); return Array.isArray(value) ? value.length > 0 : !!value; }
  window.appliquerLangue = function () {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = window.t(el.dataset.i18n, el.textContent); });
    document.querySelectorAll('[data-i18n-fr]').forEach(function (el) { el.textContent = el.getAttribute('data-i18n-' + lang) || el.dataset.i18nFr; });
    document.querySelectorAll('[data-placeholder-fr]').forEach(function (el) { el.placeholder = el.getAttribute('data-placeholder-' + lang); });
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang); });
    document.querySelectorAll('[data-lieu]').forEach(function (el) { var m = S.moments[+el.dataset.lieu]; el.textContent = m.lieu || window.t('programme.lieu.attente'); });
    document.querySelectorAll('[data-horaire]').forEach(function (el) { el.textContent = S.moments[+el.dataset.horaire].debut.replace(':', ' H '); });
    var fl = document.getElementById('flottant'), saved = window.memoire.lire('rsvp');
    if (fl && saved && saved.envoye === true) { fl.classList.add('fait'); fl.textContent = window.t('rsvp.fait') + ' · ' + window.t('rsvp.modifier'); }
    document.dispatchEvent(new CustomEvent('langue'));
  };
  document.addEventListener('click', function (e) { var b = e.target.closest('.lang button'); if (!b) return; lang = b.dataset.lang; try { localStorage.setItem('lang', lang); } catch (_) {} window.appliquerLangue(); });
  document.querySelectorAll('[data-requiert]').forEach(function (el) { if (!el.dataset.requiert.split(',').every(configured)) el.classList.add('cache'); });
  document.querySelectorAll('[data-requiert-aucun]').forEach(function (el) { if (el.dataset.requiertAucun.split(',').some(configured)) el.classList.add('cache'); });
  document.querySelectorAll('[data-service="rsvp"]').forEach(function (el) { if (!S.appsScript && !S.whatsapp) el.classList.add('cache'); });
  document.querySelectorAll('[data-wa]').forEach(function (a) { var number = S[a.dataset.waNumber || 'whatsapp']; if (!number) { a.classList.add('cache'); return; } a.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(a.dataset.wa); });
  document.querySelectorAll('[data-nav]').forEach(function (a) { if (a.dataset.nav === document.body.dataset.page) a.setAttribute('aria-current', 'page'); });
  var sheet = document.getElementById('feuille'), opener;
  function closeSheet() { if (!sheet) return; sheet.classList.remove('on'); sheet.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; document.querySelectorAll('[data-ouvre-feuille]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); }); if (opener) opener.focus(); }
  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-ouvre-feuille]');
    if (open && sheet) { opener = open; sheet.classList.add('on'); sheet.setAttribute('aria-hidden', 'false'); open.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; sheet.querySelector('button').focus(); }
    if (sheet && (e.target === sheet || e.target.closest('[data-ferme-feuille]') || e.target.closest('.feuille a'))) closeSheet();
  });
  document.addEventListener('keydown', function (e) {
    if (!sheet || !sheet.classList.contains('on')) return;
    if (e.key === 'Escape') closeSheet();
    if (e.key === 'Tab') { var items = Array.from(sheet.querySelectorAll('a[href],button')).filter(function (n) { return !n.classList.contains('cache'); }); var first = items[0], last = items[items.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  window.afficherCompte = function (el, target, seconds) {
    if (!el) return; var remaining = Math.max(0, target - Date.now());
    var values = [['compte.jours', Math.floor(remaining / 864e5)], ['compte.heures', String(Math.floor(remaining / 36e5) % 24).padStart(2, '0')], ['compte.minutes', String(Math.floor(remaining / 6e4) % 60).padStart(2, '0')]];
    if (seconds) values.push(['compte.secondes', String(Math.floor(remaining / 1e3) % 60).padStart(2, '0')]);
    el.innerHTML = values.map(function (v) { return '<div><b>' + v[1] + '</b><span>' + window.t(v[0]) + '</span></div>'; }).join('');
  };
  function updateHome() {
    var c = document.getElementById('compte'), current = window.momentActuel();
    if (c) { if (current === 'apres') c.textContent = window.t('home.married'); else if (current !== 'avant') c.textContent = window.t('home.today'); else window.afficherCompte(c, window.bunia(S.moments[0].debut), true); }
    var live = document.getElementById('etat-direct-accueil');
    if (live) live.textContent = current === 'apres' ? window.t('direct.apres') : window.t('direct.avant') + ' ' + S.diffusionDebut.replace(':', ' h ') + ' · ' + window.t('direct.bunia');
  }
  var countdown = document.getElementById('compte'); if (countdown) setInterval(updateHome, 1000);
  document.addEventListener('langue', updateHome);
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ics]'); if (!a) return; e.preventDefault();
    function escapeICS(v) { return String(v).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
    function utc(hm) { return window.bunia(hm).toISOString().replace(/[-:]/g, '').replace('.000', ''); }
    var entries = a.dataset.ics === 'direct' ? [{ id: 'direct', debut: S.diffusionDebut, fin: S.moments[1].fin, lieu: window.t('direct.titre') }] : S.moments;
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sarah et Jack//Wedding//FR', 'CALSCALE:GREGORIAN'];
    entries.forEach(function (m) { lines.push('BEGIN:VEVENT', 'UID:' + m.id + '-' + S.mariage + '@sarahetjack', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''), 'DTSTART:' + utc(m.debut), 'DTEND:' + utc(m.fin), 'SUMMARY:' + escapeICS('Sarah & Jack - ' + window.t(m.id === 'direct' ? 'direct.titre' : 'moment.' + m.id)), 'LOCATION:' + escapeICS(m.lieu || 'Bunia - ' + window.t('programme.lieu.attente')), 'DESCRIPTION:' + escapeICS(window.t('calendar.provisional')), 'END:VEVENT'); });
    lines.push('END:VCALENDAR'); var url = URL.createObjectURL(new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar' })); var link = document.createElement('a'); link.href = url; link.download = 'mariage-sarah-jack.ics'; link.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
  function timezones() {
    var fz = document.getElementById('fuseaux'); if (!fz) return;
    var cities = [['Bunia','Africa/Lubumbashi'],['Kinshasa','Africa/Kinshasa'],['Bruxelles','Europe/Brussels'],['Paris','Europe/Paris'],['Londres','Europe/London'],['Toronto','America/Toronto'],['Johannesburg','Africa/Johannesburg'],['Dubaï','Asia/Dubai']];
    fz.innerHTML = ''; cities.forEach(function (v) { var d = document.createElement('div'), b = document.createElement('b'), label = document.createElement('span'); b.textContent = new Intl.DateTimeFormat(lang === 'sw' ? 'sw-TZ' : 'fr-FR', { hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:v[1] }).format(window.bunia(S.moments[1].debut)); label.textContent = v[0]; d.append(b,label); fz.appendChild(d); });
  }
  document.addEventListener('langue', timezones);
  function request(url, options) { var abort = new AbortController(), timer = setTimeout(function () { abort.abort(); }, 20000); return fetch(url, Object.assign({}, options, { signal: abort.signal })).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).finally(function () { clearTimeout(timer); }); }
  window.envoyerScript = function (obj) { if (!S.appsScript) return Promise.reject(new Error('not configured')); return request(S.appsScript, { method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(obj) }); };
  window.lireScript = function (params) { if (!S.appsScript) return Promise.reject(new Error('not configured')); return request(S.appsScript + '?' + new URLSearchParams(params).toString()); };
  window.appliquerLangue();
})();
