/* app.js — commun à toutes les pages */
(function () {
  var S = window.SITE, R = document.documentElement.getAttribute("data-racine") || ".";
  window.RACINE = R;

  /* ---- outils date (heure de Bunia, UTC+2) ---- */
  function bunia(hm) { return new Date(S.mariage + "T" + (hm || "00:00") + ":00+02:00"); }
  window.bunia = bunia;
  window.momentActuel = function () {
    var t = Date.now();
    if (t < bunia("00:00")) return "avant";
    if (t > bunia("23:59").getTime() + 6 * 36e5) return "apres";
    for (var i = S.moments.length - 1; i >= 0; i--) if (t >= bunia(S.moments[i].debut)) return S.moments[i].id;
    return "jourj";
  };

  /* ---- i18n ---- */
  var lang = localStorage.getItem("lang") || "fr", T = window.TRADUCTIONS || {};
  window.t = function (k, defaut) { var v = T[k]; return v ? v[lang === "sw" ? 1 : 0] : (defaut != null ? defaut : k); };
  window.langue = function () { return lang; };
  function appliquer() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { if (!el.hasAttribute("data-orig")) el.setAttribute("data-orig", el.textContent); el.textContent = window.t(el.getAttribute("data-i18n"), el.getAttribute("data-orig")); });
    document.querySelectorAll("[data-i18n-fr]").forEach(function (el) { el.textContent = el.getAttribute(lang === "sw" ? "data-i18n-sw" : "data-i18n-fr") || el.getAttribute("data-i18n-fr"); });
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang); });
    document.dispatchEvent(new CustomEvent("langue", { detail: lang }));
  }
  appliquer();
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".lang button"); if (!b) return;
    lang = b.getAttribute("data-lang"); localStorage.setItem("lang", lang); appliquer();
  });

  /* ---- navigation : page courante, feuille "Plus" ---- */
  var page = document.body.getAttribute("data-page");
  document.querySelectorAll("[data-nav]").forEach(function (a) { if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page"); });
  var feuille = document.getElementById("feuille");
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-ouvre-feuille]")) feuille.classList.add("on");
    if (e.target.closest("[data-ferme-feuille]") || e.target === feuille) feuille.classList.remove("on");
  });

  /* ---- fonctions masquées tant qu'elles ne sont pas configurées ---- */
  function actif(cle) {
    var v = cle.split(".").reduce(function (o, k) { return o && o[k]; }, S);
    return Array.isArray(v) ? v.length > 0 : !!v;
  }
  document.querySelectorAll("[data-requiert]").forEach(function (el) {
    if (!el.getAttribute("data-requiert").split(",").every(actif)) el.classList.add("cache");
  });
  document.querySelectorAll("[data-requiert-aucun]").forEach(function (el) {
    if (el.getAttribute("data-requiert-aucun").split(",").some(actif)) el.classList.add("cache");
  });

  /* ---- liens WhatsApp ---- */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    if (!S.whatsapp) { a.classList.add("cache"); return; }
    a.href = "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(a.getAttribute("data-wa"));
  });

  /* ---- compte à rebours ---- */
  var c = document.getElementById("compte");
  if (c) {
    var cible = bunia(S.moments[0].debut).getTime();
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    (function tic() {
      var d = cible - Date.now(), now = Date.now();
      if (window.momentActuel() === "apres") {
        var ans = Math.floor((now - bunia("00:00")) / (365.25 * 864e5));
        c.innerHTML = "<p class='script' style='font-size:44px;color:var(--or)'>" + (ans >= 1 ? "Mariés depuis " + ans + " an" + (ans > 1 ? "s" : "") : "Mariés") + "</p>"; return;
      }
      if (d <= 0) { c.innerHTML = "<p class='script' style='font-size:44px;color:var(--or)'>C'est aujourd'hui</p>"; return; }
      c.innerHTML = [["compte.jours", Math.floor(d / 864e5)], ["compte.heures", pad(Math.floor(d / 36e5) % 24)], ["compte.minutes", pad(Math.floor(d / 6e4) % 60)], ["compte.secondes", pad(Math.floor(d / 1e3) % 60)]]
        .map(function (x) { return "<div><b>" + x[1] + "</b><span data-i18n='" + x[0] + "'>" + window.t(x[0]) + "</span></div>"; }).join("");
      setTimeout(tic, 1000);
    })();
  }

  /* ---- bandeau du jour J ---- */
  var m = window.momentActuel();
  if (["jourj", "civil", "eglise", "reception"].indexOf(m) > -1) {
    var textes = { jourj: "C'est aujourd'hui — mariage civil à " + S.moments[0].debut, civil: "Maintenant : mairie. Ensuite : église à " + S.moments[1].debut, eglise: "Maintenant : église. Ensuite : réception à " + S.moments[2].debut, reception: "Maintenant : réception — dress code noir et or" };
    var b = document.createElement("div"); b.className = "bandeau-jour"; b.textContent = textes[m].toUpperCase();
    document.body.insertBefore(b, document.body.firstChild.nextSibling);
  }

  /* ---- bouton RSVP flottant : état confirmé ---- */
  var fl = document.getElementById("flottant");
  if (fl && localStorage.getItem("rsvp")) { fl.classList.add("fait"); fl.innerHTML = "<span data-i18n='rsvp.fait'>Présence confirmée</span> · <span data-i18n='rsvp.modifier'>Modifier</span>"; }

  /* ---- agenda (.ics) ---- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-ics]"); if (!a) return; e.preventDefault();
    var d = S.mariage.replace(/-/g, "");
    function ev(t, deb, fin, lieu) { return ["BEGIN:VEVENT", "UID:" + t.replace(/\W/g, "") + "@sarahetjack", "DTSTAMP:" + d + "T000000Z", "DTSTART;TZID=" + S.fuseau + ":" + d + "T" + deb.replace(":", "") + "00", "DTEND;TZID=" + S.fuseau + ":" + d + "T" + fin.replace(":", "") + "00", "SUMMARY:Mariage de Sarah & Jack — " + t, "LOCATION:" + (lieu || "Bunia"), "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:" + t, "END:VALARM", "END:VEVENT"].join("\r\n"); }
    var seul = a.getAttribute("data-ics"), evs;
    if (seul === "direct") evs = [ev("Diffusion en direct", S.diffusionDebut, S.moments[1].fin, "En ligne")];
    else evs = [ev("Mariage civil", S.moments[0].debut, S.moments[0].fin, S.moments[0].lieu), ev("Mariage religieux", S.moments[1].debut, S.moments[1].fin, S.moments[1].lieu), ev("Réception", S.moments[2].debut, S.moments[2].fin, S.moments[2].lieu)];
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sarah & Jack//FR"].concat(evs, ["END:VCALENDAR"]).join("\r\n");
    var l = document.createElement("a"); l.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); l.download = "mariage-sarah-jack.ics"; l.click();
  });

  /* ---- fuseaux horaires ---- */
  var fz = document.getElementById("fuseaux");
  if (fz) {
    var messe = bunia(S.moments[1].debut), villes = [["Bunia", "Africa/Lubumbashi"], ["Kinshasa", "Africa/Kinshasa"], ["Bruxelles", "Europe/Brussels"], ["Paris", "Europe/Paris"], ["Londres", "Europe/London"], ["Toronto", "America/Toronto"], ["Johannesburg", "Africa/Johannesburg"], ["Dubaï", "Asia/Dubai"]];
    try { var local = Intl.DateTimeFormat().resolvedOptions().timeZone; if (local && !villes.some(function (v) { return v[1] === local; })) villes.splice(1, 0, [window.t("direct.chezvous"), local]); } catch (e) { }
    fz.innerHTML = villes.map(function (v) { try { var h = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: v[1] }).format(messe); return "<div><b>" + h.replace(":", "h") + "</b><span>" + v[0].toUpperCase() + "</span></div>"; } catch (e) { return ""; } }).join("");
  }

  /* ---- envoi vers Google Apps Script ---- */
  window.envoyerScript = function (obj) {
    if (!S.appsScript) return Promise.reject(new Error("non configuré"));
    return fetch(S.appsScript, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(obj) })
      .then(function (r) { return r.json(); });
  };
  window.lireScript = function (params) {
    if (!S.appsScript) return Promise.reject(new Error("non configuré"));
    return fetch(S.appsScript + "?" + new URLSearchParams(params).toString()).then(function (r) { return r.json(); });
  };
})();
