# Sarah & Jack — site du mariage

Site statique multipage, hébergeable tel quel sur GitHub Pages (dépôt `SarahAndJ`, dossier racine).

```
index.html            accueil compact
programme/            les trois moments, agenda
familles/             avec la bénédiction de nos familles (données : assets/data/familles.js)
direct/               diffusion en direct, trois états (avant / pendant / après)
invites/              RSVP, venir à Bunia, tenues, ma table, cadeaux, FAQ (assets/data/faq.js)
souvenirs/            histoire, galerie, album, livre d'or
assets/js/config.js   ← LE seul fichier de réglages (voir ci-dessous)
rsvp_google_script.gs ← à coller dans Google Apps Script
```

## Réglages (`assets/js/config.js`)
Toute valeur vide masque la fonction correspondante : rien de « vide » n'est affiché aux invités.
- `whatsapp`, `assistanceJourJ` : numéros au format international sans + (243…)
- `appsScript` : URL /exec du script (active RSVP, livre d'or, ma table)
- `youtube` : lien de la diffusion ; `diffusionDebut` : heure de Bunia
- `rediffusions`, `album`, `mobileMoney`, `banque`, `hotels`, `audio` : voir les exemples dans le fichier
- `moments[i].lieu / adresse / carte` : lieux et liens Google Maps

## Mise en ligne sur GitHub Pages
1. Créez le dépôt `SarahAndJ`, poussez ce dossier à la racine.
2. Settings > Pages > Source : branche `main`, dossier `/ (root)`.
3. Dans `config.js`, mettez `base: "/SarahAndJ"` (les liens internes sont relatifs et fonctionnent déjà).
4. L'adresse actuelle est <https://jackmutobu.github.io/SarahAndJ/>.

## Google Sheets (RSVP, livre d'or, plan de table)
Trois onglets : `RSVP`, `Livre d'or`, `Plan de table` (colonnes code, nom, table). Coller `rsvp_google_script.gs` dans Extensions > Apps Script, déployer en application web (exécuter en tant que moi, accès tout le monde), copier l'URL /exec dans `config.js`.
- Livre d'or : les messages arrivent avec « non » en colonne Publié ; écrivez « oui » pour les publier.
- Plan de table : chaque invité ne voit que sa table, via le code inscrit sur son invitation. La liste complète n'est jamais envoyée au navigateur.

## Langues
Français par défaut, swahili via le bouton FR/SW (`assets/data/translations.js`, `familles.js`, `faq.js`). Les traductions swahili sont à faire relire par un locuteur.

## Familles
`assets/data/familles.js` : `side` (sarah/jack), `priority` (ordre, non affiché), `group` (doyens, parents, representants, oncles, fratrie, temoins, comite), `name`, `roleFr/roleSw`, `photo` (chemin relatif, ex. `assets/images/familles/nom.jpg`), `blessingFr/blessingSw`. Les entrées « Nom complet » sont ignorées à l'affichage.
