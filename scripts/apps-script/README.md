# Script de publication du CV

Ce répertoire contient le code du script **Apps Script** qui publie le CV PDF sur Firebase Storage.
Il ne s'exécute pas depuis ce dépôt : il tourne chez Google, lié au Doc CV, et se déclenche depuis le
menu « CV Export » du document.

Pourquoi la publication ne passe pas par ce dépôt :
[`docs/adr/0001-publication-du-cv-depuis-google-docs.md`](../../docs/adr/0001-publication-du-cv-depuis-google-docs.md).

## Le dépôt est la source

Le code a longtemps vécu **uniquement** dans le Drive. Il y a été oublié : au moment du cadrage, son
existence même n'était plus certaine, et la panne qui l'avait arrêté — le retrait du moteur Rhino par
Google — était passée inaperçue pendant six mois.

D'où la règle : **ce répertoire fait foi**. Une modification se fait ici, puis se pousse vers Google.
Modifier le script dans l'éditeur en ligne sans le répercuter ici rouvre exactement la faille que ce
versionnement ferme.

## Synchronisation avec `clasp`

[`clasp`](https://github.com/google/clasp) est l'outil officiel de synchronisation d'un projet Apps
Script. Il n'est pas installé en dépendance du projet : c'est un outil ponctuel, appelé à la main.

### Première fois

```bash
volta run npx @google/clasp login
volta run npx @google/clasp clone <SCRIPT_ID> --rootDir scripts/apps-script
```

`clone` écrit un `.clasp.json` qui contient l'identifiant : ce fichier est **ignoré par git**, comme
tout identifiant, puisque ce dépôt est public.

En clasp 3, la commande s'appelle en réalité `clone-script`, `clone` n'en étant qu'un alias. Les
tutoriels écrits pour la v2 continuent donc de fonctionner.

### L'identifiant se lit depuis le Doc, jamais ailleurs

**Ouvrir le Doc CV → Extensions → Apps Script → Paramètres du projet → ID du script.** Ce chemin est
le seul qui garantisse le bon projet, et le détour coûte dix secondes.

Un identifiant récupéré autrement — le tableau de bord Apps Script, le Drive, un onglet resté
ouvert — peut désigner une **copie autonome** du projet. Rien ne la distingue à l'écran : même nom
de fichier, même code, même menu. Seul l'ID diffère, et `clasp` n'a aucun moyen de s'en apercevoir
puisque `.clasp.json` ne porte pas de `parentId`.

Ce que produit l'erreur mérite d'être connu, parce qu'aucun signal ne l'accompagne :

- `clasp push` réussit, et pousse vers la copie ;
- `clasp pull` rapatrie la copie, dont le code paraît légitime — il l'est, à une génération près ;
- le menu du Doc continue d'exécuter l'ancien code, et **annonce un succès**, puisqu'il en a un ;
- seul l'objet publié trahit la chose, en restant à son ancien chemin.

C'est le mode de panne de ce chantier — un mécanisme qui échoue en silence — réinstallé un cran plus
loin. En cas de doute, `volta run npx @google/clasp open-script` ouvre le projet réellement visé :
il doit être celui qu'ouvre le Doc.

> Le `appsscript.json` de ce répertoire vient d'un `clasp pull` et a été **comparé au projet lié au
> Doc** : ses scopes sont bien ceux qui autorisent le script qui s'exécute. Un manifeste ne vaut
> jamais plus que l'identifiant visé au moment du pull, d'où la comparaison.

### Ensuite

```bash
volta run npx @google/clasp status   # ce qu'un push enverrait, avant de l'envoyer
volta run npx @google/clasp push     # publier ce que contient ce répertoire
volta run npx @google/clasp pull     # récupérer ce qui a changé en ligne
```

**`pull` sert à vérifier, pas à faire autorité.** Il écrase les fichiers locaux par ceux du projet en
ligne — y compris la mise en forme et les commentaires, que l'éditeur Google ne connaît pas. Utilise-le
pour constater un écart, puis rétablis la version du dépôt et pousse-la : c'est le dépôt qui fait foi.
Traiter `pull` comme le régime normal revient à faire de Google la source, ce que l'ADR écarte.

`push` ne touche pas au manifeste distant sans `--force`. En revanche il remplace le code, donc un
`status` préalable dit exactement ce qui partira.

## Contenu

| Fichier | Rôle |
|---|---|
| `Export_to_cloud_storage.js` | Le script. `clasp` le pousse en `.gs`. |
| `appsscript.json` | Le manifeste : moteur d'exécution et scopes OAuth. |

Le manifeste porte deux choses dont dépend le fonctionnement :

- **`runtimeVersion: V8`.** Le script tournait sur Rhino, que Google a retiré. Il a alors cessé de
  s'exécuter sans qu'aucun signal n'apparaisse sur le site.
- **`devstorage.read_write` dans `oauthScopes`.** Apps Script ne déduit pas ce scope tout seul :
  `UrlFetchApp` ne lui fait inférer que `script.external_request`. Sans lui, Cloud Storage rejette
  l'écriture.

Changer les scopes force une nouvelle autorisation au prochain lancement du script.

## Ce que le script publie

L'objet part en `uploadType=multipart` : c'est le seul mode qui pose des métadonnées en même temps
que le contenu, `uploadType=media` ne transmettant que des octets nus. Le chemin de l'objet s'y
déclare dans les métadonnées, et non plus en paramètre d'URL.

| Métadonnée | Valeur | Pourquoi |
|---|---|---|
| `name` | `cv/cv-colas-durcy-fr.pdf` | Le suffixe de langue précède l'anglais, pour n'avoir pas à renommer un objet dont l'URL sera diffusée d'ici là. |
| `contentType` | `application/pdf` | |
| `contentDisposition` | `attachment; filename="CV Colas Durcy (FR).pdf"` | Le seul levier qui fasse d'un clic un téléchargement : l'attribut HTML `download` est ignoré d'une origine à l'autre. |

Ce chemin est **lu par le Site CV**, dans `app/components/molecules/HeaderBar.vue`. Les deux vivent
dans des runtimes distincts et rien ne peut vérifier automatiquement qu'ils concordent : déplacer
l'objet sans toucher au composant laisse le bouton de téléchargement sur un 404.

### Déplacer l'objet, dans cet ordre

Un changement de chemin traverse deux systèmes qui ne se déploient pas ensemble. L'ordre n'est pas
indifférent : publier d'abord ne coûte rien, déployer d'abord ouvre une fenêtre pendant laquelle le
bouton de téléchargement renvoie un 404.

1. Pousser le script — `volta run npx @google/clasp push`.
2. Ouvrir le Doc CV, menu **CV Export → Exporter vers Firebase Storage**. C'est ce geste, et lui
   seul, qui crée l'objet au nouveau chemin.
3. Vérifier que l'objet répond et porte bien ses en-têtes. Le contrôle **se prononce toujours** :
   un `grep` seul reste muet quand l'en-tête manque, et un silence se lit trop facilement comme un
   succès.
   ```bash
   curl -sI "https://firebasestorage.googleapis.com/v0/b/cv-portfolio-b023a.appspot.com/o/cv%2Fcv-colas-durcy-fr.pdf?alt=media" \
     | grep -qi '^content-disposition: attachment' \
     && echo 'OK — le clic déposera un fichier' \
     || echo 'ÉCHEC — objet absent, ou publié sans ses métadonnées'
   ```
   Un échec juste après un `push` signale le plus souvent un export lancé **avant** que le push ne
   prenne effet : le Doc a alors rejoué l'ancien code. Relancer l'export suffit.
4. Déployer le Site CV.
5. Supprimer l'objet resté à l'ancien chemin. Laissé en place, il continue d'être servi à quiconque
   possède son URL, en se figeant au jour de sa dernière publication — c'est le mode de panne que ce
   chantier répare, réinstallé un cran plus loin.
   ```bash
   gcloud storage rm gs://cv-portfolio-b023a.appspot.com/cv/cv-colas-durcy.pdf
   ```
   La console Firebase (**Storage → `cv/`**) fait la même chose sans outillage local.

## Ce que ce script ne fait pas encore

L'issue [#64](https://github.com/Cariboucolas/web-cv/issues/64) et ses tickets portent la suite :
**publication atomique** des deux langues, relecture après envoi. En l'état, le script publie **un
seul fichier**, en français, et annonce son succès sur la foi d'un code retour.

Ce code retour est d'ailleurs le seul filet actuel, et il est troué : faute de
`muteHttpExceptions: true`, une réponse non-2xx lève avant d'atteindre la branche d'erreur, qui ne
peut donc pas rapporter le corps de la réponse. Le défaut est conservé ici — versionner ne doit rien
changer au comportement — et relève de la relecture après envoi.
