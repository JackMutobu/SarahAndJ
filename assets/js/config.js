/* ============================================================
   RÉGLAGES DU SITE — seul fichier à modifier pour activer les fonctions.
   Une valeur vide = la fonction correspondante est masquée sur le site.
   ============================================================ */
window.SITE = {
  base: "/SarahAndJ",                       // chemin du projet sur GitHub Pages
  mariage: "2026-12-19",                     // date du mariage
  fuseau: "Africa/Lubumbashi",               // Bunia = UTC+2
  moments: [
    { id: "civil",     debut: "10:00", fin: "11:30", lieu: "Mairie de Bunia",   adresse: "", carte: "" },
    { id: "eglise",    debut: "14:30", fin: "16:30", lieu: "",                  adresse: "", carte: "" },
    { id: "reception", debut: "19:00", fin: "23:59", lieu: "",                  adresse: "", carte: "" }
  ],
  whatsapp: "",            // ex. "243812345678" — numéro qui reçoit les RSVP de secours
  assistanceJourJ: "",     // numéro WhatsApp d'assistance pendant le direct
  appsScript: "",          // URL /exec du script Google (RSVP, livre d'or, ma table)
  youtube: "",             // ex. "https://www.youtube.com/watch?v=XXXXXXXX"
  diffusionDebut: "14:15", // heure de Bunia à laquelle le direct commence
  rediffusions: [          // après le mariage : [titre, lien YouTube]
    // ["Cérémonie religieuse", "https://youtu.be/..."],
  ],
  album: "",               // lien Google Photos partagé
  mobileMoney: [           // ex. ["Airtel Money", "+243 ..."], ["M-Pesa", "+243 ..."]
  ],
  banque: "",              // "sur demande" ou coordonnées
  hotels: [                // ex. ["Hôtel ...", "tarif négocié ...", "lien ou téléphone"]
  ],
  audio: { sarah: "", jack: "" },   // ex. "assets/audio/sarah.m4a"
  rsvpLimite: "2026-11-20"
};
