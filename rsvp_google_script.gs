/**
 * Mariage Sarah & Jack — RSVP, livre d'or (modéré) et recherche de table par code.
 * Feuille Google Sheets avec trois onglets :
 *   "RSVP"          : rempli automatiquement
 *   "Livre d'or"    : colonne D "Publié" = non par défaut ; écrivez oui pour publier
 *   "Plan de table" : colonnes A code, B nom, C table   (ex. KAT-0412 | Famille Kasereka | Table Sagesse 04)
 * Déployer > Application web > Exécuter en tant que Moi, accès Tout le monde. Copiez l'URL /exec dans config.js.
 */
var MAX = 500;
function nettoyer(v) { v = String(v == null ? "" : v).slice(0, MAX); return /^[=+\-@]/.test(v) ? "'" + v : v; }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e) {
  var lock = LockService.getScriptLock(); lock.tryLock(5000);
  try {
    var d = JSON.parse(e.postData.contents || "{}"), ss = SpreadsheetApp.getActiveSpreadsheet();
    if (d.site) return json({ ok: true });                      // robot pris au piège : on ignore en silence
    var cache = CacheService.getScriptCache(), cle = "r_" + (d.tel || d.nom || "").toString().toLowerCase();
    if (cache.get(cle)) return json({ ok: false, erreur: "trop de requêtes, réessayez dans une minute" });
    cache.put(cle, "1", 60);
    if (d.type === "livre") {
      var l = ss.getSheetByName("Livre d'or");
      if (l.getLastRow() === 0) l.appendRow(["Date", "Nom", "Message", "Publié"]);
      l.appendRow([new Date(), nettoyer(d.nom), nettoyer(d.message), "non"]);
      return json({ ok: true });
    }
    var r = ss.getSheetByName("RSVP"), entetes = ["Date", "Référence", "Nom", "Téléphone", "Moments", "Personnes", "Enfants", "Accompagnants", "Régime", "Ville", "Hébergement", "Transport", "Message"];
    if (r.getLastRow() === 0) r.appendRow(entetes);
    var ligne = [new Date(), nettoyer(d.id), nettoyer(d.nom), nettoyer(d.tel), nettoyer(d.moments), nettoyer(d.nombre), nettoyer(d.enfants), nettoyer(d.accompagnants), nettoyer(d.regime), nettoyer(d.ville), nettoyer(d.hebergement), nettoyer(d.transport), nettoyer(d.message)];
    // doublon : même référence → on met à jour la ligne existante
    var refs = r.getLastRow() > 1 ? r.getRange(2, 2, r.getLastRow() - 1, 1).getValues().map(function (x) { return x[0]; }) : [];
    var i = refs.indexOf(d.id);
    if (i > -1) { r.getRange(i + 2, 1, 1, ligne.length).setValues([ligne]); return json({ ok: true, doublon: true }); }
    r.appendRow(ligne); return json({ ok: true });
  } catch (err) { return json({ ok: false, erreur: String(err) }); } finally { lock.releaseLock(); }
}

function doGet(e) {
  var p = e.parameter || {}, ss = SpreadsheetApp.getActiveSpreadsheet();
  if (p.type === "table") {
    var code = String(p.code || "").trim().toUpperCase(), t = ss.getSheetByName("Plan de table");
    var rows = t && t.getLastRow() > 1 ? t.getRange(2, 1, t.getLastRow() - 1, 3).getValues() : [];
    for (var i = 0; i < rows.length; i++) if (String(rows[i][0]).trim().toUpperCase() === code) return json({ nom: rows[i][1], table: rows[i][2] });
    return json({});                                              // jamais la liste complète
  }
  var l = ss.getSheetByName("Livre d'or"), rows2 = l && l.getLastRow() > 1 ? l.getRange(2, 1, l.getLastRow() - 1, 4).getValues() : [];
  return json(rows2.filter(function (r) { return String(r[3]).toLowerCase() === "oui"; }).map(function (r) { return { nom: r[1], message: r[2] }; }).reverse());
}

// Totaux confirmés par moment (Exécuter > resume, puis Affichage > Journaux).
function resume() {
  var r = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVP"), rows = r.getLastRow() > 1 ? r.getRange(2, 1, r.getLastRow() - 1, 13).getValues() : [];
  var t = { Mairie: 0, "Église": 0, "Réception": 0, familles: rows.length };
  rows.forEach(function (x) { var n = parseInt(x[5], 10) || 0; String(x[4]).split(",").forEach(function (m) { m = m.trim(); if (t[m] !== undefined) t[m] += n; }); });
  Logger.log(t); return t;
}
