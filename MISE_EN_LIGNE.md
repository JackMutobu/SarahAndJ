# Site Sarah & Jack — mise en ligne et réglages

## 1. Ce qu'il y a dans `index.html`

Un seul fichier, aucune installation. Il contient, dans l'ordre : accueil et compte à rebours, les mariés, familles et témoins, messages vocaux, programme (3 cartes + bouton agenda), notre histoire, souvenirs, direct de Bunia (avec les heures dans 8 villes), partage de photos, plan de table, dress code, RSVP, cadeaux, venir à Bunia, livre d'or.

Le jour J, un bandeau doré apparaît en haut ("C'est aujourd'hui — maintenant : église…"). Après le mariage, le compte à rebours devient "Mariés" puis "Mariés depuis 1 an".

## 2. Les réglages à faire (en haut du `<script>`, bloc `CONFIG`)

| Clé | Quoi mettre |
|---|---|
| `appsScript` | l'URL `/exec` du script Google (voir §3) — active le formulaire RSVP et le livre d'or |
| `youtube` | le lien *embed* de votre direct YouTube (`https://www.youtube.com/embed/ID`) |
| `album` | le lien de partage de l'album Google Photos |
| `planCSV` | lien CSV publié de la feuille "Plan de table" (Fichier > Partager > Publier sur le web > CSV) — colonnes `nom,table` |
| `plan` | ou la liste directement dans le fichier : `["Nom Prénom","Table 3"], ...` |

Remplacez aussi partout `243000000000` par le numéro WhatsApp qui recevra les réponses (3 endroits).

## 3. RSVP et livre d'or dans Google Sheets (10 minutes)

1. Créez un Google Sheets, deux onglets nommés exactement `RSVP` et `Livre d'or`.
2. Extensions > Apps Script. Collez `rsvp_google_script.gs`. Enregistrez.
3. Déployer > Nouveau déploiement > Application web. Exécuter en tant que **Moi**, accès **Tout le monde**. Autorisez.
4. Copiez l'URL `/exec` dans `CONFIG.appsScript`.
5. Test : envoyez un RSVP depuis le site, la ligne apparaît dans l'onglet RSVP.

Pour masquer un message du livre d'or, écrivez `non` dans la colonne "Publié".

## 4. Site en ligne gratuitement avec GitHub Pages

- Le site est publié à l'adresse <https://jackmutobu.github.io/SarahAndJ/> depuis la branche `main` de ce dépôt.
- Chaque mise à jour poussée sur `main` est automatiquement republiée par GitHub Pages.
- Un nom de domaine personnalisé, comme `sarahetjack.com` ou `pamojadaima.com`, pourra être relié à GitHub Pages plus tard.

Le QR code des invitations pointera vers cette adresse : ne la changez plus une fois les invitations imprimées.

## 5. Messages vocaux

Enregistrez 30 secondes sur WhatsApp, exportez en `.mp3` ou `.m4a`, hébergez le fichier (Google Drive en partage public, ou dans ce dépôt) et mettez son adresse dans `src=""` des deux balises `<audio>`.

## 6. Photos de la galerie

Les six photos actuelles sont intégrées dans le fichier. Pour en changer, envoyez-moi les nouvelles ; ou, après le mariage, remplacez-les par un lien vers l'album.
