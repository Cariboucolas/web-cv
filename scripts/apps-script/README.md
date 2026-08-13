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

L'identifiant du script se lit dans l'éditeur Apps Script, sous **Paramètres du projet → ID du
script**. `clone` écrit un `.clasp.json` qui le contient : ce fichier est **ignoré par git**, comme
tout identifiant, puisque ce dépôt est public.

> **Commencer par récupérer, jamais par pousser.** Le `appsscript.json` de ce répertoire a été écrit
> à partir de ce que le script utilise réellement — `DocumentApp`, `DriveApp`, `UrlFetchApp` et
> l'écriture sur Cloud Storage — mais sans avoir vu le manifeste du projet en ligne. Un `clasp pull`
> le remplace par le vrai. Compare le diff avant de committer : si les scopes ou le fuseau horaire
> diffèrent, **c'est la version en ligne qui a raison**, puisque c'est elle qui tourne.

### Ensuite

```bash
volta run npx @google/clasp pull   # récupérer ce qui a changé en ligne
volta run npx @google/clasp push   # publier ce que contient ce répertoire
```

Un `push` remplace le contenu du projet en ligne. Faire un `pull` d'abord, et vérifier qu'il ne
ramène rien d'inattendu, évite d'écraser une correction faite dans l'éditeur.

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

## Ce que ce script ne fait pas encore

L'issue [#64](https://github.com/Cariboucolas/web-cv/issues/64) et ses tickets portent la suite :
en-têtes de vrai téléchargement, **publication atomique** des deux langues, relecture après envoi.
En l'état, le script publie **un seul fichier**, en français, sous un chemin sans suffixe de langue,
et annonce son succès sur la foi d'un code retour.

Ce code retour est d'ailleurs le seul filet actuel, et il est troué : faute de
`muteHttpExceptions: true`, une réponse non-2xx lève avant d'atteindre la branche d'erreur, qui ne
peut donc pas rapporter le corps de la réponse. Le défaut est conservé ici — versionner ne doit rien
changer au comportement — et relève de la relecture après envoi.
