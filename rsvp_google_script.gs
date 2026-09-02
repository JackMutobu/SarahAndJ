/**
 * Mariage Sarah & Jack — réception des RSVP et du livre d'or.
 * 1. Créez une feuille Google Sheets avec deux onglets : "RSVP" et "Livre d'or".
 * 2. Extensions > Apps Script, collez ce code, enregistrez.
 * 3. Déployer > Nouveau déploiement > Application web :
 *      Exécuter en tant que : Moi  |  Qui a accès : Tout le monde
 * 4. Copiez l'URL "/exec" dans CONFIG.appsScript du site.
 */
var FEUILLE_RSVP = "RSVP";
var FEUILLE_LIVRE = "Livre d'or";

// Garde les réponses comme texte dans Sheets et limite les saisies abusivement longues.
function cellule(value, maxLength) {
  var text = String(value || "").slice(0, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function doPost(e) {
  var d = JSON.parse(e.postData.contents || "{}");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (d.type === "livre") {
    var l = ss.getSheetByName(FEUILLE_LIVRE);
    if (l.getLastRow() === 0) l.appendRow(["Date", "Nom", "Message", "Publié"]);
    l.appendRow([new Date(), cellule(d.nom, 150), cellule(d.message, 2000), "oui"]);   // mettez "non" en colonne D pour masquer un message
  } else {
    var r = ss.getSheetByName(FEUILLE_RSVP);
    if (r.getLastRow() === 0) r.appendRow(["Date", "Nom", "Téléphone", "Personnes", "Moments", "Message"]);
    r.appendRow([new Date(), cellule(d.nom, 150), cellule(d.tel, 50), cellule(d.nombre, 20), cellule(d.moments, 150), cellule(d.message, 2000)]);
  }
  return ContentService.createTextOutput("ok");
}

// Le site lit les messages du livre d'or (colonne "Publié" = oui), les plus récents d'abord.
function doGet(e) {
  var l = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FEUILLE_LIVRE);
  var rows = l.getLastRow() > 1 ? l.getRange(2, 1, l.getLastRow() - 1, 4).getValues() : [];
  var out = rows.filter(function (r) { return String(r[3]).toLowerCase() !== "non"; })
                .map(function (r) { return { nom: r[1], message: r[2] }; }).reverse();
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// Bonus : total des invités confirmés par moment (menu Apps Script > exécuter "resume").
function resume() {
  var r = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FEUILLE_RSVP);
  var rows = r.getLastRow() > 1 ? r.getRange(2, 1, r.getLastRow() - 1, 6).getValues() : [];
  var t = { Mairie: 0, "Église": 0, "Réception": 0 };
  rows.forEach(function (x) {
    var n = parseInt(x[3], 10) || 1;
    String(x[4]).split(",").forEach(function (m) { m = m.trim(); if (t[m] !== undefined) t[m] += n; });
  });
  Logger.log(t);
  return t;
}
