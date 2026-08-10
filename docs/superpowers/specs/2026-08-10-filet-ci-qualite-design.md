# Filet de CI minimal — qualité, types et fumée

**Date :** 2026-08-10
**Statut :** design validé, prêt pour plan d'implémentation

## Problème

Le dépôt est passé en trunk-based : les PRs Dependabot arrivent isolées, une par montée
majeure, et fusionnent vite. Or la CI ne vérifie qu'une seule chose, le build, et `main`
n'est protégée par rien. Trois conséquences constatées :

- **Le typecheck ne tourne nulle part.** `nuxt build` transpile le TypeScript via Vite sans
  jamais appeler `tsc` : les types sont effacés, pas vérifiés. Une régression de types passe
  donc sans bruit — y compris celle qu'introduiraient les PRs #40 (TypeScript 6) ou #39
  (Vuetify 4, dont les types de props changent).
- **Rien ne bloque une fusion au rouge.** `main` n'a aucune protection de branche. Le check
  `deploy` était rouge sur six PRs depuis le 7 août sans arrêter personne.
- **Aucune vérification du rendu.** La procédure de capture aux deux breakpoints existe mais
  reste entièrement manuelle, donc facultative.

## État des lieux mesuré (2026-08-10, sur `main` au commit `3c7fa1f`)

| Vérification | Résultat | Conséquence |
|---|---|---|
| `vue-tsc --noEmit` | `EXIT=0` | activable en bloquant, immédiatement |
| `biome check .` — règles de lint | 0 violation | activable en bloquant, immédiatement |
| `biome check .` — formatage | 13 fichiers, ~355 lignes | dette à purger avant de bloquer |
| Titres de PR | 6 hors convention sur 98 commits (`add`, `work`, `update`, `second`, `refacto`), 1 majuscule (`Feat:` en #28) | règle à formaliser |

La dette Biome est donc **intégralement du formatage**, sans aucune violation de linter. La
mémoire projet parlait de « 18 erreurs sur 13 fichiers » sans distinguer les deux moitiés de
Biome : c'est la distinction qui débloque tout le reste.

## Décisions

### 1. Purger la dette de formatage avant de bloquer

Un commit isolé sur `main`, ne contenant que du reformatage :

```
chore: apply Biome formatting across the repo
```

13 fichiers, ~355 lignes. La règle de mémoire projet qui proscrit `biome format --write`
vise le reformatage **noyé dans** un changement sémantique, parce qu'il rend la revue
impossible. Un commit qui ne contient que du formatage se relit d'un `git log --stat` et
purge le problème une fois pour toutes. C'est ce qui permet ensuite d'énoncer la règle de
CI en une phrase : « `biome ci .` passe ».

### 2. Un workflow `ci.yml` séparé, en parallèle de `deploy.yml`

`ci.yml` regroupe ce qui n'a besoin que des **sources**. `deploy.yml` garde ce qui a besoin
du **site construit**. Les deux tournent en parallèle sur chaque PR.

Retenu contre deux autres options : ajouter un job `quality` à `deploy.yml` avec
`needs: quality` sérialisait le retour et retardait de 40 s le signal le plus important pour
Dependabot, le build ; insérer des étapes dans le job existant empêchait d'exiger le
typecheck sans exiger le déploiement en protection de branche.

Le dépôt est public, donc les minutes Actions sont gratuites : les ~35 s d'installation
dupliquées entre les deux workflows ne coûtent rien.

#### Job `quality`

Checkout, pnpm, Node depuis `.nvmrc`, `pnpm install`, puis :

```yaml
- run: pnpm lint        # biome ci .
- run: pnpm typecheck   # vue-tsc --noEmit
```

`biome ci` plutôt que `biome check` : c'est la variante destinée à l'intégration continue,
qui n'écrit jamais et refuse `--write`. Garantie qu'aucun runner ne reformatera le dépôt.

Le typecheck n'appelle pas `nuxt prepare` : le `postinstall` du `package.json` le lance
déjà, ce qui génère le `.nuxt/tsconfig.json` dont `tsconfig.json` hérite via `extends`.
Un `pnpm install` suffit donc, sans build préalable — c'est ce qui autorise ce job à tourner
en parallèle du déploiement plutôt qu'après lui.

#### Job `pr-title`

Indépendant, sans checkout ni installation (~5 s), déclenché sur `pull_request` uniquement.

Quatre contrôles successifs, chacun avec son propre message d'erreur en français — un seul
motif monolithique dirait « titre invalide » sans dire pourquoi :

1. **Longueur ≤ 72 caractères.** Au-delà, GitHub tronque ; quatre titres de l'historique se
   terminent par `…` pour cette raison.
2. **Préfixe conventionnel** : `^(feat|fix|docs|chore|refactor|perf|ci|build|test)(\([a-z-]+\))?: `
   Types tirés de `~/.claude/rules/git-workflow.md`, plus `build`, utilisé par Dependabot
   jusqu'à la PR #19. **Le scope est facultatif** : aucun des 98 commits de `main` n'en
   porte, alors que Dependabot en met systématiquement (`chore(deps-dev)`).
3. **Sujet ne commençant pas par un mot capitalisé.** Le sujet est d'abord isolé en retirant
   le préfixe — type plus scope facultatif — puis testé avec un motif ancré, `^[A-Z][a-z]`.
   Formulée en « sujet en minuscule », la règle serait à la fois redondante — le contrôle 2
   rejette déjà `Feat:` par sa regex de type — et fausse : elle condamnerait
   `feat: UI redesign phase 3` (PR #30), où l'acronyme est légitime.

   L'ancrage n'est pas un détail. Une première version cherchait `: [A-Z][a-z]` n'importe où
   dans le titre, ce qui rejetait `fix: update readme: Add screenshot` : tout second
   deux-points suivi d'un mot capitalisé déclenchait la règle. Le motif exprimait
   « un deux-points suivi d'une majuscule » là où la règle dit « le sujet commence par ».
   Deux cas de test verrouillent la correction — un titre à deux points multiples, et
   `fix(ci): Bump the runner image`, qui n'échoue que si le scope est bien retiré avant le
   test de capitalisation.
4. **Aucun tiret cadratin ni demi-cadratin** (`—`, `–`) — la mémoire projet les proscrit dans
   les commits et titres de PR. Quatre titres de l'historique en contiennent (#24, #26, #27,
   #29), tous antérieurs à la règle.

Implémenté en `grep -E` dans le workflow, sans action tierce. Deux raisons propres à ce
dépôt : l'écosystème `github-actions` vient d'être ajouté à Dependabot, donc chaque action
tierce devient une PR mensuelle à relire pour un service que trois lignes de shell rendent ;
et le message d'erreur peut être rédigé en français comme le reste des commentaires de
workflow.

**Risque résiduel :** Dependabot peut produire un titre de plus de 72 caractères sur une
montée groupée. Les deux cas de l'historique (114 et 81 caractères) datent d'avant la
reconfiguration de la PR #36 ; les sept PRs ouvertes plafonnent à 52. Parade si le cas
revient : `gh pr edit <n> --title "…"`.

### 3. Smoke test assertif dans `deploy.yml`

`scripts/shot.mjs` est repris comme harnais de test, pour trois raisons : il a déjà résolu
la partie difficile d'un test e2e, qui n'est pas l'assertion mais l'attente. Trois attentes
durement acquises y sont écrites et commentées — la neutralisation de `v-reveal` via
`prefers-reduced-motion` (l. 100), l'attente que toutes les images soient `complete`
(l. 128), et le `image.decode()` de la ligne 146 sans lequel la capture montre « un bug
d'affichage qui n'existe que dans l'image ».

#### Découpage en trois fichiers

Le mode `--assert` greffé sur `shot.mjs` a été écarté : le smoke test doit servir un dossier
statique, et un serveur HTTP n'a rien à faire dans un outil de capture qui, en local, vise le
serveur de développement. Les deux usages divergent par leurs entrées — une URL d'un côté, un
répertoire de l'autre — mais partagent toute la mécanique CDP.

```
scripts/
  lib/cdp.mjs   # lancement de Chrome, client CDP, les trois attentes  (~80 lignes)
  shot.mjs      # capture PNG à un viewport donné, depuis une URL
  smoke.mjs     # sert .output/public, vérifie les invariants, sort en 0 ou 1
```

L'extraction est justifiée par un second consommateur réel, pas anticipée : les trois attentes
représentent la moitié du script actuel et sont sa partie subtile. Les dupliquer serait
exactement le défaut reproché à l'option « script CI distinct » écartée plus haut. Le
découpage suit la règle de `CLAUDE.md` — beaucoup de petits fichiers cohésifs.

Trois modifications par ailleurs :

- **Remettre `shot.mjs` sous suivi git.** Il est actuellement exclu (`.gitignore:39`, PR #31).
  Un runner ne peut pas exécuter un fichier absent du dépôt.
- **Rendre le chemin de Chrome portable.** `scripts/shot.mjs:17` code en dur
  `/Applications/Google Chrome.app/…`. Remplacer par `process.env.CHROME_PATH` avec repli sur
  le chemin macOS en local ; les runners `ubuntu-latest` embarquent Chrome stable.
- **Sortir en `1` sur invariant violé.** Aujourd'hui le script journalise jusqu'à ses propres
  détections — `DEBORDEMENT +Npx` est affiché puis oublié, exit `0` systématique.

Invariants vérifiés à **390 px** et **1440 px**, sans aucune image de référence :

| Invariant | Motivation |
|---|---|
| La page répond, aucune erreur console | régression d'hydratation ou d'import |
| `scrollWidth <= clientWidth` | débordement horizontal — déjà mesuré, jamais assert |
| `#about`, `#experiences`, `#skills`, `#projects` présents | les ancres de `HeaderBar` |
| Toutes les images `decode()` sans erreur | variantes WebP manquantes (404 silencieux) |

Placé dans `deploy.yml` après `Build the project`, parce que ce test a besoin de l'artefact
buildé : l'y mettre évite un second `pnpm generate`, et teste exactement l'artefact déployé.

#### Servir `.output/public`

`smoke.mjs` embarque son propre serveur statique, en `node:http`, sur une vingtaine de lignes.
Écarté au passage : `pnpm dlx serve`, qui télécharge un paquet tiers non épinglé à chaque run,
et `python3 -m http.server`, préinstallé mais étranger à la chaîne d'outils du dépôt.

Trois propriétés que ni l'un ni l'autre n'offre, et qui décident :

- **Écoute sur le port `0`**, attribué par le système. Aucun conflit possible avec un serveur
  de développement déjà lancé en local, ni entre deux jobs concurrents en CI. Le port réel se
  lit sur le handle après `listen`.
- **Aucune attente arbitraire.** Le rappel de `listen` dit exactement quand le serveur écoute,
  là où un serveur externe impose un `sleep` ou une boucle de sondage — le genre de délai
  approximatif qui rend un test intermittent.
- **Rien à installer, rien à auditer.** Démarrage immédiat, aucun paquet à faire monter de
  version par Dependabot, même raisonnement que le `grep` du titre de PR.

Le serveur reste dans `smoke.mjs` plutôt que dans `lib/` : un seul consommateur, aucune raison
de l'extraire avant qu'un second n'existe.

`cleanUrls: true` côté Firebase n'a pas d'incidence : le site est mono-page et le smoke test
ne visite que `/`, servi par `index.html`.

### 4. Protection de `main`

```
required_status_checks:
  strict: false
  contexts: ["quality", "pr-title", "deploy"]
required_pull_request_reviews: null
enforce_admins: false
```

`strict: false` est délibéré : avec `strict: true`, chaque fusion périmerait les autres PRs
ouvertes et relancerait leur CI. Écouler les sept PRs en cours coûterait une vingtaine de
runs supplémentaires, pour une garantie — « aucune combinaison de dépendances non testée
n'atteint `main` » — que le déploiement sur `main` vérifie de toute façon juste après.

Pas de revue exigée : dépôt à un seul mainteneur. `enforce_admins: false` laisse la porte de
sortie manuelle.

## Hors périmètre, délibérément

- **Tests unitaires.** Il n'y en a aucun. En écrire pour atteindre un seuil de couverture sur
  un CV statique serait du théâtre.
- **Régression visuelle par comparaison de captures.** Le rendu des polices diffère entre
  macOS et Ubuntu : toute référence produite en local serait fausse en CI. Et sur un site
  redessiné activement (lots 1, 2 et 3 en trois semaines), chaque changement voulu ferait
  rougir la CI — le mécanisme apprendrait surtout à être ignoré.
- **Régression esthétique** (couleur, espacement, typographie). Le smoke test ne la voit pas.
  Elle reste couverte par la procédure manuelle `scripts/shot.mjs --still` aux deux
  breakpoints, décrite dans `CLAUDE.md`. Le filet CI ne la remplace pas.

## Critères de réussite

1. `quality`, `pr-title` et `deploy` sont verts sur `main` après le commit de reformatage.
2. Une PR au titre `Feat: quelque chose` échoue sur `pr-title` avec un message qui nomme la
   règle enfreinte.
3. Une régression de types introduite volontairement fait échouer `quality`.
4. Un débordement horizontal introduit volontairement fait échouer le smoke test à 390 px.
5. Les sept PRs de montée en cours passent les trois checks ou désignent précisément ce qui
   casse.

## Ordre d'exécution

Le nettoyage de formatage doit précéder l'activation, et la protection de branche doit
suivre le premier run vert — sinon les contextes requis n'existent pas encore côté GitHub et
toute PR devient inmergeable.

1. Commit de reformatage sur `main`
2. Scripts `lint` et `typecheck` dans `package.json`
3. `ci.yml` (jobs `quality` et `pr-title`)
4. `scripts/lib/cdp.mjs` extrait de `shot.mjs`, qui est re-versionné et rendu portable
5. `scripts/smoke.mjs` : serveur statique, invariants, code de sortie
6. Étape smoke dans `deploy.yml`
7. Protection de branche, une fois les trois contextes vus au moins une fois par GitHub
