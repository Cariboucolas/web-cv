# Publier le CV depuis Google Docs, pas depuis le dépôt

Le CV téléchargeable s'écrit dans Google Docs et se publie sur Firebase Storage par un script
attaché au document lui-même, déclenché depuis son menu. Le dépôt ne contient ni le PDF, ni le
document source : il ne contient que le lien de téléchargement, et le code du script de publication.

La raison est que le CV et le site ont des rythmes et des gestes différents. Le CV se corrige dans un
traitement de texte, parfois pour une virgule, et n'a rien à gagner à traverser une pull request, une
revue et un déploiement complet du site. Publier depuis l'endroit où le document s'écrit supprime
l'export manuel, le dépôt de fichier et toute clé d'identification à conserver sur un poste.

## Options écartées

- **Le PDF dans `public/`, déployé avec le site.** Écarté parce qu'un binaire opaque dans un dépôt de
  code n'a pas d'historique lisible, et qu'un déploiement complet pour remplacer un fichier est
  disproportionné.
- **Un script local (`pnpm cv:publish`) et un compte de service dédié.** Écarté parce qu'il impose
  deux gestes préalables — exporter le PDF à la main, puis ouvrir un terminal — et une clé privée à
  protéger sur le poste, pour un résultat identique.
- **Le dépôt manuel via la console Firebase.** Écarté parce qu'il ne laisse aucune trace : c'est
  précisément l'absence de geste consigné qui a laissé un CV périmé en ligne pendant six mois.

## Conséquences

Le code de publication s'exécute chez Google mais **vit dans ce dépôt**, sous `scripts/apps-script/`.
Cette décision découle d'une panne réelle : la première version de ce script n'existait que dans le
Drive, et son existence même avait été oubliée. Deux copies d'un même code divergent si on les
synchronise à la main — l'outil `clasp` est le remède prévu.

Ce dépôt étant public, le script versionné ne doit contenir **aucun identifiant de document Google**.
Ces identifiants vivent dans les Script Properties, côté Google.

La panne d'origine mérite d'être connue : le script tournait sur Rhino, l'ancien moteur d'Apps
Script. Son retrait par Google l'a rendu inexécutable sans qu'aucun signal n'apparaisse sur le site.
Un mécanisme de publication qui échoue en silence est indiscernable d'un mécanisme qu'on a oublié
d'utiliser.
