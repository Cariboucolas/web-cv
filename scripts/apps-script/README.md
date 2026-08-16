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

## Les identifiants des deux Doc CV

Le script vise les deux Doc CV **par identifiant**, et non le document actif : le menu publie les
deux langues quel que soit le document depuis lequel il est déclenché.

Ces identifiants ne sont pas dans le code, ce dépôt étant public. Ils vivent dans les **Script
Properties** du projet, sous ces deux noms exacts :

| Propriété | Contenu |
|---|---|
| `CV_DOC_ID_FR` | Identifiant du Doc CV français |
| `CV_DOC_ID_EN` | Identifiant du Doc CV anglais |

**Les renseigner : Extensions → Apps Script → Paramètres du projet → Propriétés du script.**
L'identifiant d'un Doc se lit dans son URL, entre `/d/` et `/edit`.

Une propriété absente arrête l'export **avant tout envoi**, avec un message qui nomme la langue et la
propriété manquante. C'est voulu : un script qui publierait la seule langue qu'il sait trouver
laisserait l'autre décrocher sans bruit.

## Ce que le script publie

L'objet part en `uploadType=multipart` : c'est le seul mode qui pose des métadonnées en même temps
que le contenu, `uploadType=media` ne transmettant que des octets nus. Le chemin de l'objet s'y
déclare dans les métadonnées, et non plus en paramètre d'URL.

Un export publie **deux objets**, un par langue :

| Langue | `name` | `contentDisposition` |
|---|---|---|
| Français | `cv/cv-colas-durcy-fr.pdf` | `attachment; filename="CV Colas Durcy (FR).pdf"` |
| Anglais | `cv/cv-colas-durcy-en.pdf` | `attachment; filename="CV Colas Durcy (EN).pdf"` |

Les deux portent `contentType: application/pdf`. `contentDisposition` est le seul levier qui fasse
d'un clic un téléchargement : l'attribut HTML `download` est ignoré d'une origine à l'autre.

**Le suffixe de langue est ce qui permet aux deux CV PDF de coexister.** Un chemin unique ferait
viser le même objet aux deux Doc CV, et le dernier envoi écraserait l'autre sans que rien ne le
signale. Ne jamais réintroduire de chemin unique ici.

Ces chemins sont **lus par le Site CV**, dans `app/components/molecules/HeaderBar.vue`. Les deux
vivent dans des runtimes distincts et rien ne peut vérifier automatiquement qu'ils concordent :
déplacer un objet sans toucher au composant laisse le bouton de téléchargement sur un 404.

## Publication atomique

Les deux langues partent ensemble ou pas du tout. Le script lit les **deux** Doc CV et produit les
**deux** PDF avant d'envoyer le premier octet : identifiant manquant, Doc CV introuvable ou vide,
tout cela est constaté alors que rien n'a encore été publié.

Cloud Storage n'offrant aucun commit à deux phases, un cas reste irréductible : un second envoi
refusé après un premier accepté laisse une langue en ligne. Il n'est pas masqué — aucun succès n'est
annoncé et le message nomme la langue fautive. Relancer l'export republie les deux, l'envoi étant
idempotent.

Le vide se constate sur le **Doc CV**, pas sur son export : un document vide s'exporte en une page
blanche, soit un PDF de plusieurs kilo-octets qu'un contrôle de taille laisserait passer.

### Déplacer l'objet, dans cet ordre

Un changement de chemin traverse deux systèmes qui ne se déploient pas ensemble. L'ordre n'est pas
indifférent : publier d'abord ne coûte rien, déployer d'abord ouvre une fenêtre pendant laquelle le
bouton de téléchargement renvoie un 404.

1. Pousser le script — `volta run npx @google/clasp push`.
2. Ouvrir le Doc CV, menu **CV Export → Exporter les deux CV PDF vers Firebase Storage**. C'est ce
   geste, et lui seul, qui crée les objets au nouveau chemin.
3. Vérifier que **les deux** objets répondent et portent bien leurs en-têtes **au nouveau chemin**.
   Ce contrôle ne double pas la [relecture après envoi](#relecture-après-envoi) : celle-ci constate
   ce que Cloud Storage a *stocké*, celui-ci constate ce que l'URL du Site CV *sert* — deux services
   distincts, et c'est la seconde que verra le visiteur. La relecture ne peut d'ailleurs rien dire
   d'un chemin dont le composant d'en-tête n'a pas encore été averti. Le contrôle **se prononce
   toujours** : un `grep` seul reste muet quand l'en-tête manque, et un silence se lit trop
   facilement comme un succès.
   ```bash
   verifier_cv() {
     curl -sI "https://firebasestorage.googleapis.com/v0/b/cv-portfolio-b023a.appspot.com/o/cv%2Fcv-colas-durcy-$1.pdf?alt=media" \
       | tr -d '\r' \
       | grep -qiF "content-disposition: attachment; filename=\"$2\"" \
       && echo "OK    $1 — le clic déposera « $2 »" \
       || echo "ÉCHEC $1 — objet absent, sans métadonnées, ou écrasé par l'autre langue"
   }
   verifier_cv fr 'CV Colas Durcy (FR).pdf'
   verifier_cv en 'CV Colas Durcy (EN).pdf'
   ```
   Le nom de fichier attendu est vérifié, et pas seulement la présence de l'en-tête : c'est ce qui
   distingue deux objets distincts d'un même objet servi sous deux chemins. Si l'anglais avait
   écrasé le français, le chemin `-fr` répondrait avec le nom de fichier anglais.

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

## Relecture après envoi

**Le script ne peut pas annoncer un succès qu'il n'a pas constaté.** Une fois les deux objets
envoyés, il relit leurs métadonnées et ne se prononce qu'ensuite. Un code retour 200 ne dit que « la
requête a été acceptée » : c'est cette confiance-là qui a laissé un CV périmé en ligne six mois.

La relecture interroge l'**API JSON de Cloud Storage** (`storage/v1/b/…/o/…`) et non l'URL de
téléchargement du Site CV. La distinction compte : l'URL de téléchargement passe par
`firebasestorage.googleapis.com`, qui remappe les en-têtes au passage, alors que l'API rend les
métadonnées telles qu'elles sont **stockées**. C'est l'objet écrit qu'on veut constater, pas la façon
dont un intermédiaire le sert. Ces lectures sont fortement cohérentes après écriture : rien à
attendre entre l'envoi et le contrôle.

Cinq façons d'échouer, sur chacun des deux objets. Une seule suffit à ce qu'aucun succès ne soit
annoncé :

| Contrôle | Ce qu'un échec signifie |
|---|---|
| L'objet répond | Rien n'a été publié à ce chemin, ou le script n'a pas le droit de l'y lire |
| Ses métadonnées sont du JSON lisible | Cloud Storage a répondu autre chose que ce qu'il annonce — cas improbable, jamais silencieux |
| `contentType` vaut `application/pdf` | L'objet est parti en octets nus — le navigateur ne saura pas quoi en faire |
| `contentDisposition` vaut exactement l'en-tête attendu | En-tête absent : le clic ouvre un onglet. En-tête d'une autre langue : une langue en a écrasé une autre |
| `size` est non nulle | Un objet vide est en ligne à la place du CV PDF |

**La valeur exacte du `contentDisposition` est vérifiée, pas seulement sa présence.** C'est ce qui
distingue deux objets distincts d'un même objet servi sous deux chemins : si l'anglais avait écrasé
le français, le chemin `-fr` répondrait avec le nom de fichier anglais, et un test de présence
laisserait passer.

Chaque message d'échec **nomme la langue** — les deux suivent le même chemin de code, c'est le seul
indice disponible.

### Avertissement de poids, jamais de blocage

Un CV PDF dépassant **500 Ko** est signalé dans le message de succès, et publié quand même. Un seuil
qui bloque doit protéger d'une faute, pas d'un choix : un CV PDF lourd reste parfaitement valide, et
refuser de le publier interdirait la mise à jour d'un soir de presse pour une raison esthétique.

Le seuil passe **juste sous** le poids du CV PDF actuel — 516 Ko pour deux pages, l'export Google
Docs embarquant les polices. L'avertissement se déclenchera donc à chaque publication tant que ce
fichier n'aura pas été allégé, et c'est voulu : l'allègement est un travail éditorial séparé, ce
rappel est ce qui l'empêche de se faire oublier. Remonter le seuil au-dessus de 516 Ko ferait taire
l'avertissement sans rien alléger.

### Rappel de repasser le Site CV

Tout succès se termine par un rappel : repasser le Site CV au regard du nouveau Doc CV. Le Site CV
est le reflet du Doc CV, et **aucun contrôle automatisé ne peut constater une divergence de faits
entre les deux**. Le seul moment où ce rappel a une chance d'être suivi est celui-là — le nouveau CV
PDF vient d'être publié, et son Doc CV est encore sous les yeux de son auteur.

### Éprouver la relecture

Un filet qu'on n'a jamais vu se déclencher n'est pas un filet.

**Dégrader l'objet dans le bucket ne prouve rien** : l'export repose les métadonnées avant de relire,
et le contrôle passerait. Il faut faire publier au script quelque chose d'incorrect — ce qui est
justement le mode de panne visé : un envoi accepté dont le résultat n'est pas celui qu'on croit.

1. Dans `Export_to_cloud_storage.js`, fonction `uploadCvPdf`, remplacer temporairement le
   `contentType` des métadonnées :
   ```js
   contentType: 'application/octet-stream',   // TEMPORAIRE
   ```
2. `volta run npx @google/clasp push`, puis lancer l'export depuis le menu du Doc.
3. Le message attendu est un échec nommant la langue, **pas** un succès :
   `Erreur: CV PDF français publié avec le type « application/octet-stream » au lieu de application/pdf`
4. Rétablir `application/pdf`, `clasp push`, relancer l'export. Le succès revient, et les deux objets
   sont republiés avec les bonnes métadonnées.

L'essai **laisse deux objets dégradés en ligne** entre les étapes 3 et 4 : c'est précisément ce que
la relecture sert à ne pas ignorer. Enchaîner l'étape 4 sans attendre.

Le même essai avec `contentDisposition` supprimé des métadonnées produit
`CV PDF français publié sans contentDisposition…`, et avec le `downloadFileName` d'une langue recopié
sur l'autre, le message de divergence.
