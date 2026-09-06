/* pages.js — scripts propres à chaque page, activés selon data-page */
(function () {
  var S = window.SITE, page = document.body.getAttribute("data-page"), R = window.RACINE;
  function el(id) { return document.getElementById(id); }
  function initiales(n) { return n.split(/\s+/).filter(Boolean).slice(0, 2).map(function (x) { return x[0]; }).join("").toUpperCase() || "·"; }
  function esc(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ================= FAMILLES ================= */
  if (page === "familles") {
    var GROUPES = [["doyens", "Doyens et chefs de famille", "Wazee na viongozi wa familia", "large"], ["parents", "Parents", "Wazazi", "large"], ["representants", "Porte-parole et représentants", "Wasemaji na wawakilishi", ""], ["oncles", "Oncles et tantes", "Wajomba na shangazi", ""], ["fratrie", "Frères, sœurs et proches", "Kaka, dada na wapendwa", "compact"], ["temoins", "Témoins", "Mashahidi", ""], ["comite", "Comité d'organisation", "Kamati ya maandalizi", "compact"]];
    var data = [];
    function rendre(side) {
      var sw = window.langue() === "sw", cont = el("membres"); cont.innerHTML = "";
      var liste = data.filter(function (p) { return p.side === side && p.name && p.name !== "Nom complet"; }).sort(function (a, b) { return a.priority - b.priority; });
      if (!liste.length) { cont.innerHTML = "<p class='centre' style='color:var(--gris);font-style:italic'>" + (sw ? "Majina yataongezwa hivi karibuni." : "Les noms seront ajoutés prochainement.") + "</p>"; return; }
      GROUPES.forEach(function (g) {
        var m = liste.filter(function (p) { return p.group === g[0]; }); if (!m.length) return;
        var d = document.createElement("div"); d.className = "groupe";
        d.innerHTML = "<h3>" + (sw ? g[2] : g[1]) + "</h3><div class='membres " + g[3] + "'>" + m.map(function (p) {
          var b = sw ? p.blessingSw : p.blessingFr;
          return "<div class='fiche'><div class='visage'>" + (p.photo ? "<img src='" + R + "/" + esc(p.photo) + "' alt=''>" : initiales(p.name)) + "</div><b>" + esc(p.name) + "</b><small>" + esc(sw ? p.roleSw || p.roleFr : p.roleFr) + "</small>" + (b ? "<q>" + esc(b) + "</q>" : "") + "</div>";
        }).join("") + "</div>";
        cont.appendChild(d);
      });
    }
    var side = "sarah";
    data = window.FAMILLES || []; rendre(side);
    document.querySelectorAll(".onglets button").forEach(function (b) { b.addEventListener("click", function () {
      document.querySelectorAll(".onglets button").forEach(function (x) { x.setAttribute("aria-selected", "false"); }); b.setAttribute("aria-selected", "true"); side = b.getAttribute("data-side"); rendre(side); }); });
    document.addEventListener("langue", function () { rendre(side); });
    ["sarah", "jack"].forEach(function (k) { var a = el("audio-" + k); if (a && S.audio[k]) { a.querySelector("audio").src = R + "/" + S.audio[k]; a.classList.remove("cache"); } });
  }

  /* ================= DIRECT ================= */
  if (page === "direct") {
    var etat = el("direct-etat"), ecran = el("ecran"), titre = el("direct-titre"), lastState;
    var id = (S.youtube || '').match(/(?:v=|youtu\.be\/|embed\/|live\/)([\w-]{6,})/);
    function renderDirect() {
      var now = Date.now(), begin = window.bunia(S.diffusionDebut).getTime(), end = window.bunia(S.moments[1].fin).getTime() + 36e5;
      var state = window.momentActuel() === 'apres' ? 'apres' : now < begin ? 'avant' : now <= end && id ? 'live' : 'attente';
      var key = state + window.langue();
      if (key !== lastState) {
        lastState = key; ecran.classList.remove('cache'); el('rediff').classList.add('cache');
        etat.classList.toggle('live', state === 'live');
        titre.textContent = window.t(state === 'apres' ? 'direct.apres' : 'direct.titre');
        titre.setAttribute('data-i18n', state === 'apres' ? 'direct.apres' : 'direct.titre');
        if (state === 'avant') {
          etat.textContent = window.t('direct.avant') + ' ' + S.diffusionDebut.replace(':', ' h ') + ', ' + window.t('direct.bunia');
          ecran.innerHTML = '<div class="compte" id="compte-direct"></div>';
        } else if (state === 'live') {
          etat.textContent = window.t('direct.encours');
          ecran.innerHTML = '<button class="bouton" id="lancer">' + window.t('direct.lancer') + '</button>';
          el('lancer').onclick = function () { ecran.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id[1] + '?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen title="' + window.t('direct.titre') + '"></iframe>'; };
        } else if (state === 'apres' && S.rediffusions.length) {
          etat.textContent = ''; ecran.classList.add('cache');
          el('rediff').innerHTML = S.rediffusions.map(function (r) { return '<a href="' + esc(r[1]) + '" target="_blank" rel="noopener">' + esc(r[0]) + '<span>↗</span></a>'; }).join('');
          el('rediff').classList.remove('cache');
        } else { etat.textContent = ''; ecran.innerHTML = '<p class="attente">' + window.t(state === 'apres' ? 'direct.videos.pending' : 'direct.link.pending') + '</p>'; }
      }
      if (state === 'avant') window.afficherCompte(el('compte-direct'), begin, false);
    }
    renderDirect(); setInterval(renderDirect, 1000); document.addEventListener('langue', renderDirect);
    if (S.youtube) el('ouvrir-yt').href = S.youtube;
  }

  /* ================= ESPACE INVITÉS ================= */
  if (page === "invites") {
    /* cartes → panneaux */
    var boutons = document.querySelectorAll(".cartes button");
    function ouvrir(id) {
      if (!["rsvp","venir","tenues","table","cadeaux","faq"].includes(id)) id = "rsvp";
      boutons.forEach(function (b) { b.setAttribute("aria-expanded", b.getAttribute("data-panneau") === id); });
      document.querySelectorAll(".panneaux .panneau").forEach(function (p) { p.classList.toggle("on", p.id === "p-" + id); });
      history.replaceState(null, "", "#" + id);
    }
    boutons.forEach(function (b) { b.addEventListener("click", function () { ouvrir(b.getAttribute("data-panneau")); document.getElementById("p-" + b.getAttribute("data-panneau")).scrollIntoView({ behavior: "smooth", block: "start" }); }); });
    ouvrir((location.hash || "#rsvp").slice(1));
    window.addEventListener("hashchange", function () { ouvrir(location.hash.slice(1)); });

    /* RSVP */
    var form = el('rsvpForm'), etatR = el('rsvpEtat'), saved = window.memoire.lire('rsvp');
    if (saved) {
      form.elements.nom.value = saved.nom || ''; form.elements.tel.value = saved.tel || '';
      etatR.textContent = window.t(saved.envoye === true ? 'rsvp.previous' : 'rsvp.draft');
    }
    var sending = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault(); if (form.elements.site.value || sending || !form.reportValidity()) return;
      var values = new FormData(form), moments = values.getAll('moments'), nombre = Number(values.get('nombre')), children = Number(values.get('enfants'));
      if (!moments.length || (moments.includes('Aucun') && moments.length > 1)) { etatR.textContent = window.t('rsvp.choose'); return; }
      if (!Number.isInteger(nombre) || !Number.isInteger(children) || children < 0 || children > nombre || (moments[0] === 'Aucun' ? nombre !== 0 : nombre < 1)) { etatR.textContent = window.t('rsvp.count.error'); return; }
      var previous = window.memoire.lire('rsvp');
      var o = { type:'rsvp', id: previous && previous.id || 'R' + (window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString(36)), date:new Date().toISOString() };
      values.forEach(function (v,k) { if (k !== 'site' && k !== 'moments') o[k] = v; }); o.moments = moments.join(', ');
      var record = { id:o.id,nom:o.nom,tel:o.tel,date:o.date,envoye:false };
      var wa = el('rsvpWa');
      if (wa && S.whatsapp) { wa.href = 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent('RSVP ' + o.id + ' — ' + o.nom + ', ' + o.nombre + ' personne(s), ' + o.moments + (o.message ? ' — ' + o.message : '')); }
      // Preserve an acknowledged response while a proposed update is still pending.
      if (!previous || previous.envoye !== true) window.memoire.ecrire('rsvp', record);
      if (!S.appsScript) { etatR.textContent = window.t(S.whatsapp ? 'rsvp.whatsapp.ready' : 'rsvp.pending'); if (S.whatsapp) wa.classList.remove('cache'); return; }
      sending = true; var button = form.querySelector('[type="submit"]'); button.disabled = true; etatR.textContent = window.t('sending');
      window.envoyerScript(o).then(function (r) {
        if (!r || !r.ok) throw new Error('not acknowledged');
        record.envoye = true; window.memoire.ecrire('rsvp',record); etatR.textContent = window.t('rsvp.success') + ' ' + o.id;
        wa.classList.add('cache');
      }).catch(function () { etatR.textContent = window.t(S.whatsapp ? 'rsvp.failed.wa' : 'rsvp.failed'); if (S.whatsapp) wa.classList.remove('cache'); }).finally(function () { sending = false; button.disabled = false; });
    });

    /* ma table : par code d'invitation, via le script (jamais de liste complète dans le navigateur) */
    var ft = el("tableForm");
    ft.addEventListener("submit", function (e) {
      e.preventDefault(); var code = ft.elements.code.value.trim().toUpperCase(), r = el("resPlan");
      if (code.length < 4) { r.textContent = window.t("table.code.prompt"); return; }
      r.textContent = window.t("table.searching");
      window.lireScript({ type: "table", code: code }).then(function (j) { r.innerHTML = j && j.table ? esc(j.nom) + " — <b>" + esc(j.table) + "</b>" : window.t("table.notfound"); })
        .catch(function () { r.textContent = window.t("table.pending"); });
    });

    /* FAQ */
    (function (j) {
      function rendreFaq() { var sw = window.langue() === "sw"; el("faq").innerHTML = j.map(function (q) { return "<details><summary>" + esc(sw ? q.qSw : q.qFr) + "</summary><p>" + esc(sw ? q.aSw : q.aFr) + "</p></details>"; }).join(""); }
      rendreFaq(); document.addEventListener("langue", rendreFaq);
    })(window.FAQ || []);

    /* cadeaux et hôtels depuis la configuration */
    if (S.mobileMoney.length) el("canaux").innerHTML = S.mobileMoney.map(function (m) { return "<span>" + esc(m[0]) + " — " + esc(m[1]) + "</span>"; }).join("") + (S.banque ? "<span>Banque — " + esc(S.banque) + "</span>" : "");
    if (S.hotels.length) el("hotels").innerHTML = S.hotels.map(function (h) { return "<p><b>" + esc(h[0]) + "</b> — " + esc(h[1]) + (h[2] ? " · " + esc(h[2]) : "") + "</p>"; }).join("");
  }

  /* ================= SOUVENIRS ================= */
  if (page === "souvenirs") {
    var lf = el("livreForm"), le = el("livreEtat"), boite = el("messages");
    if (S.album) { el("album").href = S.album; }
    function afficher(list) { boite.innerHTML = list.map(function (m) { return "<div class='msg'><b>" + esc(m.nom) + "</b><p>" + esc(m.message) + "</p></div>"; }).join(""); }
    window.lireScript({ type: "livre" }).then(function (j) { if (j && j.length) afficher(j); }).catch(function () { });
    lf.addEventListener("submit", function (e) {
      e.preventDefault(); if (lf.elements.site.value || !lf.reportValidity()) return;
      var o = { type: "livre", nom: lf.elements.nom.value.trim(), message: lf.elements.message.value.trim(), date: new Date().toISOString() };
      if (!o.nom || !o.message) { le.textContent = "Votre nom et votre message nous manquent."; return; }
      le.textContent = window.t("sending");
      window.envoyerScript(o).then(function (r) { if (r && r.ok) { le.textContent = window.t("livre.attente"); lf.reset(); } else throw new Error(); })
        .catch(function () { le.textContent = window.t(S.appsScript ? "rsvp.failed" : "livre.pending"); });
    });
  }
  window.appliquerLangue();
})();
