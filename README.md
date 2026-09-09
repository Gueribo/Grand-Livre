# Grand Livre

Registre personnel de revenus et dépenses — entièrement hors-ligne, catégories
personnalisables, solde en temps réel, graphique de répartition et export PDF
mensuel. Toutes les données restent dans le navigateur (localStorage) : aucun
serveur, aucun compte.

## Mettre en ligne avec GitHub Pages

1. Créez un nouveau dépôt sur GitHub (public ou privé, peu importe).
2. Déposez-y les fichiers de ce dossier **en gardant la structure telle quelle** :
   ```
   index.html
   manifest.json
   sw.js
   icons/
     icon-192.png
     icon-512.png
     icon-512-maskable.png
     apple-touch-icon.png
   ```
3. Dans le dépôt : **Settings → Pages** → Source : `Deploy from a branch` →
   choisissez la branche `main` et le dossier `/ (root)` → **Save**.
4. Au bout d'une minute ou deux, GitHub affiche l'URL de votre site
   (`https://<votre-nom>.github.io/<nom-du-depot>/`). C'est là que l'appli vit.
5. Ouvrez cette URL sur votre téléphone ou ordinateur, puis utilisez
   « Ajouter à l'écran d'accueil » (mobile) ou l'icône d'installation dans la
   barre d'adresse (Chrome/Edge desktop) pour l'installer comme une vraie
   application.

## Notes techniques

- **`manifest.json`** décrit l'appli (nom, icônes, couleurs) pour qu'elle soit
  installable.
- **`sw.js`** est le service worker : il met en cache l'appli au premier
  chargement pour qu'elle continue de fonctionner sans connexion ensuite, y
  compris les polices Google Fonts et la bibliothèque PDF (jsPDF) une fois
  qu'elles ont été chargées une première fois en ligne.
- Le service worker ne fonctionne **que** servi en HTTPS (GitHub Pages en
  fournit automatiquement) ou en local via un petit serveur de dev — pas en
  ouvrant `index.html` directement depuis le disque (`file://`). Dans ce
  dernier cas, l'appli fonctionne toujours très bien, seule l'installation en
  PWA et le cache hors-ligne « natif » ne s'activent pas.
- Vos données sont propres à **ce site précis** dans **ce navigateur précis** :
  changer d'appareil ou de navigateur veut dire repartir de zéro, sauf à
  restaurer une sauvegarde JSON exportée depuis l'appli.
- Pour retester le service worker après une modification, videz le cache du
  site (DevTools → Application → Clear storage) : sinon il continuera de
  servir l'ancienne version pendant un moment.
