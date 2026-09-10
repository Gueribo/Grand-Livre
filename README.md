# Grand Livre

Registre personnel de revenus et dépenses — entièrement hors-ligne, catégories
personnalisables, solde en temps réel, graphique de répartition et export PDF
mensuel. Toutes les données restent dans le navigateur (localStorage) : aucun
serveur, aucun compte.

## Mettre en ligne avec GitHub Pages

1. Créez un nouveau dépôt sur GitHub (public ou privé, peu importe).
2. Déposez-y les fichiers de ce dossier **tous au même niveau, à la racine** :
   ```
   index.html
   manifest.json
   sw.js
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

## Mettre à jour l'appli après une modification

Le service worker sert l'appli **depuis son cache**, pas depuis le réseau —
c'est ce qui la rend utilisable hors-ligne, mais ça veut aussi dire qu'après
avoir remplacé les fichiers sur GitHub, un simple rechargement de page peut
encore afficher l'ancienne version pendant un moment.

- Chaque fois que vous redéployez de nouveaux fichiers, la première ligne de
  `sw.js` (`CACHE_NAME`) doit changer de valeur (ex. `grand-livre-v8` →
  `grand-livre-v9`) — c'est ce qui dit au navigateur « ignore l'ancien cache,
  prends les nouveaux fichiers ». Ce fichier vous est déjà livré avec le
  numéro incrémenté à chaque mise à jour ; si vous éditez vous-même les
  fichiers, pensez à l'incrémenter aussi.
- Sur ordinateur : après avoir remplacé les fichiers sur GitHub, faites un
  rechargement forcé (`Ctrl+Maj+R` / `Cmd+Maj+R`), ou videz le cache du site
  (DevTools → Application → Clear storage) si l'ancienne version persiste.
- Sur mobile (PWA installée sur l'écran d'accueil) : fermez complètement
  l'appli (pas juste mettre en arrière-plan) puis rouvrez-la — il faut parfois
  la rouvrir deux fois de suite pour que la nouvelle version prenne le relais.
  Si ça ne suffit pas, désinstallez l'icône puis réinstallez-la depuis le
  site.
