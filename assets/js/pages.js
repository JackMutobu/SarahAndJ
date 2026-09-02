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
    var etat = el("direct-etat"), ecran = el("ecran"), titre = el("direct-titre");
    var deb = window.bunia(S.diffusionDebut), fin = window.bunia(S.moments[1].fin), now = Date.now();
    function idYT(u) { var m = (u || "").match(/(?:v=|youtu\.be\/|embed\/|live\/)([\w-]{6,})/); return m ? m[1] : ""; }
    var id = idYT(S.youtube), apres = window.momentActuel() === "apres";
    if (apres) {
      etat.textContent = ""; titre.setAttribute("data-i18n", "direct.apres"); titre.textContent = window.t("direct.apres");
      if (S.rediffusions.length) { ecran.innerHTML = ""; ecran.classList.add("cache"); el("rediff").innerHTML = S.rediffusions.map(function (r) { return "<a href='" + esc(r[1]) + "' target='_blank' rel='noopener'><span>" + esc(r[0]) + "</span><span>▶</span></a>"; }).join(""); el("rediff").classList.remove("cache"); }
      else ecran.innerHTML = "<p class='attente'>Les vidéos seront publiées ici après le mariage.</p>";
    } else if (now >= deb.getTime() && now <= fin.getTime() + 36e5 && id) {
      etat.classList.add("live"); etat.textContent = window.t("direct.encours");
      ecran.innerHTML = "<p class='attente'>Cérémonie religieuse · " + S.moments[1].debut + " – " + S.moments[1].fin + "</p><button class='bouton' id='lancer'>" + window.t("direct.lancer") + "</button>";
      el("lancer").addEventListener("click", function () { ecran.innerHTML = "<iframe src='https://www.youtube.com/embed/" + id + "?autoplay=1' allow='autoplay; encrypted-media' allowfullscreen title='Diffusion en direct'></iframe>"; });
    } else {
      etat.textContent = window.t("direct.avant") + " " + S.diffusionDebut.replace(":", " h ") + ", " + window.t("direct.bunia");
      var dc = document.createElement("div"); dc.className = "compte"; dc.id = "compte-direct"; ecran.innerHTML = ""; ecran.appendChild(dc);
      (function tic() { var d = deb - Date.now(); if (d <= 0) { location.reload(); return; }
        function pad(n) { return n < 10 ? "0" + n : n; }
        dc.innerHTML = [["compte.jours", Math.floor(d / 864e5)], ["compte.heures", pad(Math.floor(d / 36e5) % 24)], ["compte.minutes", pad(Math.floor(d / 6e4) % 60)]].map(function (x) { return "<div><b>" + x[1] + "</b><span>" + window.t(x[0]) + "</span></div>"; }).join(""); setTimeout(tic, 1000); })();
    }
    if (S.youtube) { el("ouvrir-yt").href = S.youtube; }
  }

  /* ================= ESPACE INVITÉS ================= */
  if (page === "invites") {
    /* cartes → panneaux */
    var boutons = document.querySelectorAll(".cartes button");
    function ouvrir(id) {
      boutons.forEach(function (b) { b.setAttribute("aria-expanded", b.getAttribute("data-panneau") === id); });
      document.querySelectorAll(".panneau").forEach(function (p) { p.classList.toggle("on", p.id === "p-" + id); });
      history.replaceState(null, "", "#" + id);
    }
    boutons.forEach(function (b) { b.addEventListener("click", function () { ouvrir(b.getAttribute("data-panneau")); document.getElementById("p-" + b.getAttribute("data-panneau")).scrollIntoView({ behavior: "smooth", block: "start" }); }); });
    ouvrir((location.hash || "#rsvp").slice(1));

    /* RSVP */
    var form = el("rsvpForm"), etatR = el("rsvpEtat");
    var deja = localStorage.getItem("rsvp"); if (deja) { try { var o = JSON.parse(deja); etatR.textContent = "Réponse déjà envoyée pour " + o.nom + " (" + o.id + "). Vous pouvez la modifier ci-dessous."; form.nom.value = o.nom || ""; form.tel.value = o.tel || ""; } catch (e) { } }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.site.value) return; /* piège anti-robot */
      var d = new FormData(form), o = { type: "rsvp", id: (deja && JSON.parse(deja).id) || ("R" + Date.now().toString(36).toUpperCase()), date: new Date().toISOString() };
      d.forEach(function (v, k) { if (k === "site") return; o[k] = o[k] ? o[k] + ", " + v : v; });
      if (!o.nom || !o.nombre) { etatR.textContent = "Votre nom et le nombre de personnes nous manquent."; return; }
      if (!o.moments) { etatR.textContent = "Cochez au moins un moment de la journée (ou « aucun » si vous ne pouvez pas venir)."; return; }
      localStorage.setItem("rsvp", JSON.stringify({ id: o.id, nom: o.nom, tel: o.tel, date: o.date, envoye: false }));
      etatR.textContent = "Envoi…";
      window.envoyerScript(o).then(function (r) {
        if (r && r.ok) { localStorage.setItem("rsvp", JSON.stringify({ id: o.id, nom: o.nom, tel: o.tel, date: o.date, envoye: true })); etatR.textContent = "C'est noté, merci " + o.nom + " ! Référence " + o.id + "." + (r.doublon ? " (mise à jour de votre réponse précédente)" : ""); }
        else throw new Error(r && r.erreur || "réponse inattendue");
      }).catch(function (err) {
        var wa = el("rsvpWa");
        etatR.textContent = S.appsScript ? "L'envoi n'a pas abouti (" + err.message + "). Votre réponse est gardée sur ce téléphone : réessayez, ou envoyez-la sur WhatsApp." : "Le formulaire n'est pas encore activé : envoyez votre réponse sur WhatsApp.";
        if (wa && S.whatsapp) { wa.href = "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent("RSVP " + o.id + " — " + o.nom + ", " + o.nombre + " personne(s), " + o.moments + (o.message ? " — " + o.message : "")); wa.classList.remove("cache"); }
      });
    });

    /* ma table : par code d'invitation, via le script (jamais de liste complète dans le navigateur) */
    var ft = el("tableForm");
    ft.addEventListener("submit", function (e) {
      e.preventDefault(); var code = ft.code.value.trim().toUpperCase(), r = el("resPlan");
      if (code.length < 4) { r.textContent = "Entrez le code inscrit sur votre invitation."; return; }
      r.textContent = "Recherche…";
      window.lireScript({ type: "table", code: code }).then(function (j) { r.innerHTML = j && j.table ? esc(j.nom) + " — <b>" + esc(j.table) + "</b>" : "Code introuvable : présentez-vous à l'accueil, on vous attend."; })
        .catch(function () { r.textContent = S.appsScript ? "Le plan de table n'est pas encore publié." : "Le plan de table sera publié la semaine du mariage."; });
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
      e.preventDefault(); if (lf.site.value) return;
      var o = { type: "livre", nom: lf.nom.value.trim(), message: lf.message.value.trim(), date: new Date().toISOString() };
      if (!o.nom || !o.message) { le.textContent = "Votre nom et votre message nous manquent."; return; }
      le.textContent = "Envoi…";
      window.envoyerScript(o).then(function (r) { if (r && r.ok) { le.textContent = window.t("livre.attente"); lf.reset(); } else throw new Error(); })
        .catch(function () { le.textContent = S.appsScript ? "L'envoi n'a pas abouti : réessayez dans un instant." : "Le livre d'or sera ouvert très bientôt."; });
    });
  }
})();
