# Filet de CI minimal — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Doter `web-cv` d'un filet de CI qui échoue vraiment — formatage, lint, types, titre de PR et fumée du site construit — puis rendre ces checks obligatoires sur `main`.

**Architecture:** Deux workflows aux périmètres disjoints. `ci.yml` porte ce qui ne lit que les sources (job `quality` : Biome + `vue-tsc` ; job `pr-title` : validation du titre par script shell testable). `deploy.yml` gagne une étape de fumée après le build, parce qu'elle seule a besoin de l'artefact. La mécanique CDP de `scripts/shot.mjs` est extraite dans `scripts/lib/cdp.mjs` et partagée entre l'outil de capture manuelle et le nouveau `scripts/smoke.mjs`, qui embarque son propre serveur statique.

**Tech Stack:** GitHub Actions, Biome 1.9.4, vue-tsc, Node 22.22.1 (volta + `.nvmrc`), pnpm 9.15.2, protocole CDP via `WebSocket` natif de Node.

**Spec de référence:** `docs/superpowers/specs/2026-08-10-filet-ci-qualite-design.md`

## Global Constraints

- **Messages de commit en anglais**, format `<type>: <description>`. **Jamais de tiret cadratin (`—`) ni demi-cadratin (`–`)**, ni dans les commits, ni dans les titres de PR. Le reste du dépôt (documentation, commentaires de code) reste en français.
- **Ne jamais lancer `biome format --write` ou `biome check --write` sur des fichiers existants**, sauf dans la tâche 1 dont c'est précisément l'objet. Ailleurs, un reformatage noie le changement réel et rend la revue impossible.
- **Node est géré par volta**, pinné dans `.nvmrc` à `22.22.1`. Lancer `node -v` avant tout build. Ne pas utiliser `npx` nu — préférer `volta run npx` ou les scripts du `package.json`.
- **Avant de démarrer un serveur de développement**, vérifier les orphelins : `lsof -ti:3000-3010` et `pgrep -fl nuxt`. Ne jamais laisser plus d'un serveur tourner en fin de tâche.
- **Le dépôt est en HTTPS, `gh` est authentifié en SSH.** Utiliser `gh` pour les opérations de PR, `git push` seulement après avoir confirmé le protocole avec `git remote -v`.
- **`CLAUDE.md` n'est pas versionné** (exclu via `.git/info/exclude`). Le modifier si besoin, ne jamais le committer.
- **Nommage** : jamais de variable d'une lettre ni d'abréviation. Identifiants en anglais, commentaires en français — c'est la convention en vigueur dans `scripts/shot.mjs`.
- **Ordre impératif** : la tâche 1 doit être fusionnée dans `main` avant que la tâche 2 n'active `pnpm lint` en CI, et la tâche 7 ne peut s'exécuter qu'après un premier run vert des tâches 2, 3 et 6.

## Découpage en branches

Deux pull requests, dans cet ordre :

| PR | Branche | Contenu | Pourquoi séparée |
|---|---|---|---|
| A | `chore/biome-formatting` | tâche 1 | Un commit qui ne contient que du reformatage se relit d'un `git log --stat`. Mélangé au reste, il rendrait la PR B illisible. |
| B | `ci/quality-safety-net` | tâches 2 à 6 (+ le spec déjà commité) | Le filet forme un tout cohérent : chaque check y arrive avec sa preuve d'échec. |

La tâche 7 (protection de branche) n'est pas du code : elle s'exécute après la fusion de B.

## Structure des fichiers

| Fichier | Responsabilité | Tâche |
|---|---|---|
| `package.json` | ajoute les scripts `lint` et `typecheck` | 2 |
| `.github/workflows/ci.yml` | jobs `quality` et `pr-title` | 2, 3 |
| `.github/scripts/check-pr-title.sh` | les 4 règles de titre | 3 |
| `.github/scripts/check-pr-title.test.sh` | les 15 cas qui valident les règles, lancé en CI | 3 |
| `scripts/lib/cdp.mjs` | lancement de Chrome, client CDP, attentes de page | 4 |
| `scripts/shot.mjs` | capture PNG à un viewport, depuis une URL | 4 |
| `scripts/smoke.mjs` | serveur statique + invariants + code de sortie | 5 |
| `.github/workflows/deploy.yml` | étape de fumée après le build | 6 |
| `.gitignore` | retrait de la ligne 39 | 4 |

---

### Task 1: Purger la dette de formatage

**Files:**
- Modify: les 13 fichiers signalés par Biome (7 composants Vue, `biome.json`, `firebase.json`, `tsconfig.json`, `tailwind.config.ts`, `i18n/locales/en.json`, `i18n/locales/fr.json`)

**Interfaces:**
- Consumes: rien
- Produces: `pnpm biome ci .` sort en `0` sur `main`. Sans cela, le job `quality` de la tâche 2 naît rouge.

- [ ] **Step 1: Partir de `main` à jour**

```bash
git checkout main && git pull
git checkout -b chore/biome-formatting
node -v   # doit afficher v22.22.1
```

- [ ] **Step 2: Constater l'échec**

Run: `pnpm biome ci .`
Expected: FAIL, `Found 13 errors`, tous de catégorie `format`, aucun de catégorie `lint`.

- [ ] **Step 3: Appliquer le reformatage**

```bash
pnpm biome check --write .
```

`check --write` plutôt que `format --write` : il applique aussi `organizeImports`, actif dans `biome.json`. Sinon `biome ci .` pourrait rester rouge sur un tri d'imports.

**Cette commande peut déclencher une demande d'autorisation** — elle écrit dans des fichiers existants, ce que les règles du dépôt proscrivent partout ailleurs. C'est ici l'objet même de la tâche : approuver.

- [ ] **Step 4: Vérifier que le diff ne contient que du formatage**

```bash
git diff --stat
git diff -- app/components/molecules/ExperienceCard.vue
```

Expected: ~355 lignes sur 13 fichiers. Relire un composant Vue et un fichier JSON pour confirmer qu'aucune valeur, aucun nom, aucune chaîne traduite n'a changé — uniquement indentation, retours à la ligne et regroupement de tableaux.

- [ ] **Step 5: Vérifier que le site construit toujours**

Run: `pnpm build`
Expected: succès. Le reformatage d'un template Vue peut, en théorie, déplacer un espace significatif entre deux balises inline.

- [ ] **Step 6: Vérifier que Biome passe**

Run: `pnpm biome ci .`
Expected: PASS, `Checked 32 files`, aucune erreur.

- [ ] **Step 7: Commit et pull request**

```bash
git add -A
git commit -m "chore: apply Biome formatting across the repo"
git push -u origin chore/biome-formatting
gh pr create --title "chore: apply Biome formatting across the repo" \
  --body "Purge la dette de formatage Biome (13 fichiers, ~355 lignes) pour que le futur job \`quality\` naisse vert. Aucun changement sémantique: uniquement indentation, retours à la ligne et regroupement de tableaux. Vérifié par \`pnpm build\` et \`pnpm biome ci .\`."
```

- [ ] **Step 8: Fusionner après CI verte**

Run: `gh pr checks --watch` puis `gh pr merge --rebase --delete-branch`

Le ruleset du dépôt (13369495) n'autorise que la fusion en rebase — `--squash` échouerait.
Expected: le check `deploy` est vert avant la fusion.

---

### Task 2: Scripts de qualité et job `quality`

**Files:**
- Modify: `package.json` (bloc `scripts`)
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: la tâche 1 fusionnée dans `main`
- Produces: `pnpm lint` et `pnpm typecheck`, consommés par le job `quality`. Le contexte de status check nommé **`quality`** — repris tel quel par la tâche 7.

- [ ] **Step 1: Se placer sur la branche de travail**

```bash
git checkout ci/quality-safety-net
git rebase main   # récupère le reformatage de la tâche 1
node -v
```

- [ ] **Step 2: Constater que rien ne vérifie les types**

Run: `pnpm typecheck`
Expected: FAIL avec `ERR_PNPM_NO_SCRIPT  Missing script: typecheck`. C'est le point de départ : le typecheck n'existe nulle part.

- [ ] **Step 3: Ajouter les deux scripts**

Dans `package.json`, bloc `scripts`, en conservant l'ordre alphabétique existant :

```json
  "scripts": {
    "build": "nuxt build --preset=firebase",
    "deploy": "firebase deploy --only hosting",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "lint": "biome ci .",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "typecheck": "vue-tsc --noEmit"
  },
```

`biome ci` et non `biome check` : la variante destinée à l'intégration continue n'écrit jamais et refuse `--write`. Garantie qu'aucun runner ne reformatera le dépôt.

`typecheck` n'appelle pas `nuxt prepare` : le `postinstall` le lance déjà, ce qui génère le `.nuxt/tsconfig.json` dont `tsconfig.json` hérite via `extends`.

- [ ] **Step 4: Vérifier les deux scripts en local**

```bash
pnpm lint       # Expected: PASS, aucune erreur
pnpm typecheck  # Expected: PASS, aucune sortie, exit 0
```

Si `typecheck` échoue avec `Cannot find module './.nuxt/tsconfig.json'`, lancer `pnpm install` pour déclencher le `postinstall`.

- [ ] **Step 5: Créer `.github/workflows/ci.yml`**

```yaml
name: Quality

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

# Sur une pull request, un nouveau push annule la vérification en cours : seul
# le dernier commit compte. Sur main, les runs restent en file d'attente.
concurrency:
  group: quality-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v7

      - name: Install pnpm
        uses: pnpm/action-setup@v6

      - name: Set up Node.js
        uses: actions/setup-node@v7
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'

      # Le postinstall lance `nuxt prepare`, qui génère le .nuxt/tsconfig.json
      # dont tsconfig.json hérite. Le typecheck n'a donc pas besoin d'un build :
      # c'est ce qui permet à ce workflow de tourner en parallèle du déploiement
      # plutôt qu'après lui.
      - name: Install dependencies
        run: pnpm install

      - name: Lint and check formatting
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck
```

Les versions d'actions reprennent exactement celles de `deploy.yml` (`checkout@v7`, `action-setup@v6`, `setup-node@v7`), pour que Dependabot les fasse monter d'un seul mouvement.

- [ ] **Step 6: Commit**

```bash
git add package.json .github/workflows/ci.yml
git commit -m "ci: add a quality workflow running Biome and vue-tsc"
```

---

### Task 3: Validation du titre de pull request

> **Divergences constatées à l'exécution** (tâche livrée, commits `87b720a` et `787b120`) :
> — la sortie RED de l'étape 2 vaut `12`, pas `6` : le validateur absent renvoie `127` pour
> tous les cas, donc ceux qui attendent `1` échouent aussi ;
> — la règle 3 de l'étape 3 est fausse telle qu'écrite ci-dessous. `grep -qE ': [A-Z][a-z]'`
> cherche partout dans le titre et rejette `fix: update readme: Add screenshot`. La version
> livrée isole d'abord le sujet — `sed -E "s/^($TYPES)(\([a-z-]+\))?: //"` — puis l'ancre
> avec `^[A-Z][a-z]`. Voir le spec pour le raisonnement ;
> — la suite compte 14 cas, pas 12. Les vérifications de tabulations attendent donc `14`, puis
> `15` après l'ajout d'un cas demi-cadratin lors de la revue finale ;
> — le commentaire du job `pr-title` ci-dessous prétendait que le titre devient une ligne de
> l'historique de `main` via `squash_merge_commit_title`. Faux sur ce dépôt : le ruleset
> 13369495 impose `allowed_merge_methods: ["rebase"]`, qui rejoue chaque commit avec son
> propre message — le titre de la PR n'atteint jamais `git log`. Corrigé dans le fichier
> livré : le check reste utile comme surface de revue (`gh pr list`, notifications) et prépare
> un futur changement de politique de fusion ;
> — la règle 4 de l'étape 3, `grep -q '[—–]'`, dépend de la locale : sous `LC_ALL=C` elle
> dégénère en un test sur les octets UTF-8 du cadratin et du demi-cadratin, et rejette à tort
> une apostrophe typographique ou des points de suspension. Corrigé dans le fichier livré par
> `grep -qF -e '—' -e '–'`, qui compare des séquences d'octets exactes quelle que soit la
> locale ;
> — `refuser()` lit `$PR_TITLE` sous `set -u` : si la variable est totalement absente (pas
> seulement vide), la ligne « Titre reçu » plante en variable non liée avant même le message
> d'erreur voulu. Corrigé dans le fichier livré par `${PR_TITLE:-}`.

**Files:**
- Create: `.github/scripts/check-pr-title.sh`
- Create: `.github/scripts/check-pr-title.test.sh`
- Modify: `.github/workflows/ci.yml` (ajout du job `pr-title`)

**Interfaces:**
- Consumes: `ci.yml` créé en tâche 2
- Produces: le contexte de status check nommé **`pr-title`** — repris tel quel par la tâche 7. `check-pr-title.sh` lit le titre dans la variable d'environnement `PR_TITLE` et sort en `0` ou `1`. `check-pr-title.test.sh` exécute les 15 cas et sort en `0` si tous passent, en `N` s'il reste `N` cas en échec.

- [ ] **Step 1: Écrire les cas de test qui doivent échouer**

Le script de validation n'existe pas encore. Créer `.github/scripts/check-pr-title.test.sh` :

```bash
#!/usr/bin/env bash
# Vérifie check-pr-title.sh contre des titres réels du dépôt.
# Chaque ligne : <code de sortie attendu> <TAB> <titre>
set -uo pipefail

VALIDATEUR="$(dirname "$0")/check-pr-title.sh"

CASES=$(cat <<'EOF'
0	feat: add the contact block
0	fix: restore the English locale, broken by the Nuxt 4 migration
0	chore(deps): bump tailwindcss from 3.4.17 to 4.3.3
0	chore(deps-dev): bump typescript from 5.9.3 to 6.0.3
0	feat: UI redesign phase 3 - header and profile components
0	ci: keep the build meaningful on Dependabot pull requests
1	Feat: add ui on mouse mouvement
1	add experiences section
1	feat: Add the contact block
1	feat: refonte UI lot 2 — mouvement (champ de cubes)
1	feat: add a section that is far too long to fit inside the seventy-two characters
1	random text without any prefix at all
EOF
)

failures=0
while IFS=$'\t' read -r expected title; do
  [ -z "$expected" ] && continue
  PR_TITLE="$title" "$VALIDATEUR" >/dev/null 2>&1
  actual=$?
  if [ "$actual" != "$expected" ]; then
    echo "ECHEC (attendu $expected, obtenu $actual) : $title"
    failures=$((failures + 1))
  fi
done <<< "$CASES"

if [ "$failures" -eq 0 ]; then
  echo "Les 12 cas passent."
else
  echo "$failures cas en échec."
fi
exit "$failures"
```

Deux pièges à l'écriture de ce fichier :

- **Les séparateurs sont des tabulations littérales**, exigées par `IFS=$'\t'`. Un éditeur qui les convertit en espaces fera lire le code attendu et le titre comme un seul champ. Vérifier avec `grep -cP '^\d\t' .github/scripts/check-pr-title.test.sh`, qui doit renvoyer `12`.
- **Le cas `feat: UI redesign phase 3` est attendu valide** : un acronyme en tête de sujet est légitime. La règle n'est donc pas « pas de majuscule » mais « pas de mot capitalisé ». C'est un vrai titre du dépôt (PR #30) : une règle plus stricte l'aurait rejeté.

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
chmod +x .github/scripts/check-pr-title.test.sh
.github/scripts/check-pr-title.test.sh; echo "EXIT=$?"
```

Expected: FAIL — les 6 cas attendus à `0` échouent, parce que `.github/scripts/check-pr-title.sh` n'existe pas encore (code `127`). `EXIT=6`.

- [ ] **Step 3: Écrire le script de validation**

Créer `.github/scripts/check-pr-title.sh` :

```bash
#!/usr/bin/env bash
# Valide le titre d'une pull request contre la convention du dépôt.
#
# Le titre arrive par la variable d'environnement PR_TITLE, jamais par
# interpolation directe dans le workflow : un titre est une chaîne contrôlée
# par l'auteur de la pull request, et `${{ github.event.pull_request.title }}`
# collé dans un `run:` serait exécuté par le shell.
set -uo pipefail

TYPES='feat|fix|docs|chore|refactor|perf|ci|build|test'
LONGUEUR_MAX=72

refuser() {
  echo "::error::$1"
  echo "Titre reçu : $PR_TITLE"
  exit 1
}

if [ -z "${PR_TITLE:-}" ]; then
  refuser "Titre vide."
fi

# 1. Longueur — au-delà, GitHub tronque le titre par des points de suspension.
longueur=${#PR_TITLE}
if [ "$longueur" -gt "$LONGUEUR_MAX" ]; then
  refuser "Titre trop long : $longueur caractères pour $LONGUEUR_MAX au maximum."
fi

# 2. Préfixe conventionnel, scope facultatif. Aucun des 98 commits de main n'en
#    porte, alors que Dependabot en met systématiquement : l'exiger casserait
#    l'un ou l'autre.
if ! printf '%s' "$PR_TITLE" | grep -qE "^($TYPES)(\([a-z-]+\))?: .+"; then
  refuser "Préfixe absent ou inconnu. Attendu « type: sujet » ou « type(scope): sujet », avec type parmi : $TYPES"
fi

# 3. Le sujet ne commence pas par un mot capitalisé. On vise « Add something »,
#    pas les acronymes : « feat: UI redesign » reste valide.
if printf '%s' "$PR_TITLE" | grep -qE ': [A-Z][a-z]'; then
  refuser "Le sujet ne doit pas commencer par un mot capitalisé. Les acronymes (UI, API, CI) restent acceptés."
fi

# 4. Ni cadratin ni demi-cadratin : la convention du dépôt les proscrit dans les
#    commits comme dans les titres de pull request.
if printf '%s' "$PR_TITLE" | grep -q '[—–]'; then
  refuser "Tiret cadratin (—) ou demi-cadratin (–) interdit. Utiliser un tiret simple ou deux-points."
fi

echo "Titre conforme : $PR_TITLE"
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

```bash
chmod +x .github/scripts/check-pr-title.sh
.github/scripts/check-pr-title.test.sh; echo "EXIT=$?"
```

Expected: PASS, `Les 12 cas passent.`, `EXIT=0`.

Si le cas `feat: refonte UI lot 2 — mouvement` passe alors qu'il devrait échouer, le terminal a probablement remplacé le cadratin. Vérifier avec `grep -c '—' .github/scripts/check-pr-title.test.sh`, qui doit renvoyer `1`.

- [ ] **Step 5: Ajouter le job au workflow**

Dans `.github/workflows/ci.yml`, après le job `quality` :

```yaml
  # Le titre d'une pull request peut devenir une ligne de l'historique de main :
  # squash_merge_commit_title vaut COMMIT_OR_PR_TITLE sur ce dépôt. Le valider,
  # c'est valider `git log`.
  pr-title:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v7

      # Le validateur est vérifié avant de servir : changer un type accepté ou
      # la limite de longueur casse alors un cas connu, plutôt que la CI d'une
      # pull request sans rapport, trois semaines plus tard.
      - name: Vérifier le validateur de titre
        run: .github/scripts/check-pr-title.test.sh

      - name: Vérifier le titre de la pull request
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
        run: .github/scripts/check-pr-title.sh
```

Le titre passe par `env:` et non par interpolation dans `run:`. Interpolé directement, un titre contenant des métacaractères de shell serait exécuté par le runner.

- [ ] **Step 6: Commit**

```bash
git add .github/scripts/check-pr-title.sh .github/scripts/check-pr-title.test.sh .github/workflows/ci.yml
git commit -m "ci: check pull request titles against the repo convention"
```

Vérifier que les deux scripts partent bien exécutables :

```bash
git ls-files -s .github/scripts/   # Expected: mode 100755 sur les deux lignes
```

---

### Task 4: Extraire la mécanique CDP et rendre `shot.mjs` portable

> **Divergences constatées à l'exécution** (tâche livrée, commit `8e60a63`, puis revue finale) :
> — `close()` n'est plus un simple `chrome.kill()`. Une fonction `cleanup()` attend la sortie
> réelle du processus avant de supprimer le profil temporaire — `kill()` ne fait qu'envoyer le
> signal, Chrome continue d'écrire dans son répertoire de profil le temps de terminer ses
> sous-processus — et sert aussi de filet de sécurité sur le chemin d'erreur d'`openPage` : si
> une erreur survient avant que la `Page` ne soit renvoyée, l'appelant n'a encore aucune
> référence sur laquelle appeler `close()`, et Chrome resterait orphelin sans elle ;
> — la revue finale a ajouté un gestionnaire `socket.onclose` dans `send()` : si Chrome meurt
> en cours de route, la fermeture du socket ne rejetait rien par elle-même et un appel encore
> en attente restait indéfiniment pendant, sans jamais produire d'erreur. Voir le fichier
> livré pour le raisonnement complet ;
> — la ligne 39 retirée de `.gitignore` (étape 5) laissait un commentaire de section orphelin
> au-dessus d'elle ; la revue finale l'a retiré aussi.

**Files:**
- Create: `scripts/lib/cdp.mjs`
- Modify: `scripts/shot.mjs` (réécrit autour de la bibliothèque)
- Modify: `.gitignore:39` (retrait de `scripts/shot.mjs`)

**Interfaces:**
- Consumes: rien
- Produces: `scripts/lib/cdp.mjs` exporte exactement :
  - `resolveChromePath(): string` — chemin du binaire, lève si aucun candidat n'existe
  - `openPage({ width, height, still }): Promise<Page>` avec
    `Page = { send(method, params): Promise<object>, goto(url): Promise<void>, evaluate(expression, { awaitPromise }): Promise<unknown>, screenshot(outputPath, { fullPage }): Promise<void>, metrics(): Promise<{ clientWidth, scrollWidth }>, consoleErrors: string[], close(): void }`
  - `goto()` inclut les trois attentes (événement de chargement, images `complete`, `decode()`).
  - `evaluate()` renvoie la valeur déjà désérialisée (`returnByValue: true`).

- [ ] **Step 1: Constater que le script n'est pas versionné et pas portable**

```bash
git ls-files scripts/          # Expected: vide
grep -n 'scripts/shot.mjs' .gitignore   # Expected: 39:scripts/shot.mjs
grep -n 'Applications/Google Chrome' scripts/shot.mjs   # Expected: ligne 17
```

- [ ] **Step 2: Créer `scripts/lib/cdp.mjs`**

```js
/**
 * Mécanique commune aux outils qui pilotent Chrome : résolution du binaire,
 * client CDP, et les trois attentes sans lesquelles une page paraît prête
 * alors qu'elle ne l'est pas.
 *
 * Aucune dépendance : Node 22 expose `WebSocket` et `fetch`.
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** Testés dans l'ordre : la variable d'environnement gagne toujours. */
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
]

export const resolveChromePath = () => {
  const found = CHROME_CANDIDATES.find(
    (candidate) => candidate && existsSync(candidate),
  )
  if (!found) {
    throw new Error(
      'Aucun binaire Chrome trouvé. Renseignez CHROME_PATH avec son chemin.',
    )
  }
  return found
}

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

/** Le port n'écoute pas immédiatement : on réessaie jusqu'à ce qu'il réponde. */
const waitForTarget = async (port) => {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`)
      const targets = await response.json()
      const pageTarget = targets.find((target) => target.type === 'page')
      if (pageTarget?.webSocketDebuggerUrl) return pageTarget.webSocketDebuggerUrl
    } catch {
      /* pas encore prêt */
    }
    await wait(250)
  }
  throw new Error('Chrome n’a pas ouvert son port de débogage')
}

export const openPage = async ({ width, height = 800, still = false }) => {
  const port = 9222 + Math.floor(Math.random() * 500)
  const profile = await mkdtemp(join(tmpdir(), 'cdp-'))

  const chrome = spawn(
    resolveChromePath(),
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  const socket = new WebSocket(await waitForTarget(port))
  await new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onerror = () => reject(new Error('connexion CDP impossible'))
  })

  let nextId = 0
  const pending = new Map()
  const events = []
  const consoleErrors = []

  socket.onmessage = (message) => {
    const payload = JSON.parse(message.data)
    if (payload.id !== undefined) {
      const resolve = pending.get(payload.id)
      pending.delete(payload.id)
      resolve?.(payload.result)
      return
    }
    events.push(payload.method)
    if (
      payload.method === 'Runtime.consoleAPICalled' &&
      payload.params.type === 'error'
    ) {
      const text = payload.params.args
        .map((argument) => argument.value ?? argument.description ?? '')
        .join(' ')
      consoleErrors.push(`console.error: ${text}`)
    }
    if (payload.method === 'Runtime.exceptionThrown') {
      const details = payload.params.exceptionDetails
      consoleErrors.push(
        `exception: ${details.exception?.description ?? details.text}`,
      )
    }
  }

  const send = (method, params = {}) => {
    const id = ++nextId
    socket.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve) => pending.set(id, resolve))
  }

  await send('Page.enable')
  await send('Runtime.enable')

  // Sans cela, une capture ne voit que ce que la directive `v-reveal` a déjà
  // révélé : tout ce qui est resté hors du champ garde `opacity: 0` et laisse
  // un aplat de fond à la place du contenu. Le site prévoit déjà la sortie —
  // sous `prefers-reduced-motion: reduce`, la directive s'abstient et le CSS
  // force l'affichage — il suffit de le demander avant la navigation, pour que
  // le `matchMedia` du montage voie la bonne valeur.
  if (still) {
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })
  }

  // Le viewport imposé ici est celui que voient les media queries, contrairement
  // à --window-size qui ne fait que dimensionner l'image finale.
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  })

  const evaluate = async (expression, { awaitPromise = false } = {}) => {
    const { result } = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise,
    })
    return result.value
  }

  const goto = async (url) => {
    await send('Page.navigate', { url })

    for (let attempt = 0; attempt < 80; attempt++) {
      if (events.includes('Page.loadEventFired')) break
      await wait(100)
    }
    await wait(1500)

    /**
     * Les captures de projets dimensionnent leur carte : tant qu'elles n'ont pas
     * abouti, le bas de la page est plus court qu'il ne le sera.
     */
    for (let attempt = 0; attempt < 40; attempt++) {
      const settled = await evaluate(
        '[...document.images].every((image) => image.complete && image.naturalWidth > 0)',
      )
      if (settled) break
      await wait(250)
    }

    /**
     * `complete` dit que les octets sont arrivés, pas que l'image est peignable.
     * Le showcase pose `decoding="async"` : hors du viewport initial, le décodage
     * n'a pas lieu avant que `captureBeyondViewport` ne peigne, et la capture rend
     * un aplat de fond à la place de l'écran du téléphone. On croit alors tenir un
     * bug d'affichage qui n'existe que dans l'image.
     */
    await evaluate(
      'Promise.all([...document.images].map((image) => image.decode().catch(() => {})))',
      { awaitPromise: true },
    )
  }

  const metrics = async () =>
    JSON.parse(
      await evaluate(
        'JSON.stringify({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth })',
      ),
    )

  const screenshot = async (outputPath, { fullPage = false } = {}) => {
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: fullPage,
    })
    await writeFile(outputPath, Buffer.from(shot.data, 'base64'))
  }

  const close = () => {
    socket.close()
    chrome.kill()
  }

  return { send, evaluate, goto, metrics, screenshot, consoleErrors, close }
}
```

- [ ] **Step 3: Réécrire `scripts/shot.mjs` autour de la bibliothèque**

```js
#!/usr/bin/env node
/**
 * Capture une page à un viewport arbitraire, y compris sous les ~485 px
 * où `chrome --headless --screenshot` plafonne et se contente de recadrer.
 *
 * On passe par le protocole CDP et `Emulation.setDeviceMetricsOverride`,
 * qui impose un vrai viewport. La mécanique vit dans lib/cdp.mjs, partagée
 * avec le test de fumée.
 *
 *   node scripts/shot.mjs <url> <sortie.png> <largeur> [hauteur] [--full] [--still]
 */

import { openPage } from './lib/cdp.mjs'

const [url, outputPath, widthArgument, heightArgument] = process.argv.slice(2)
const fullPage = process.argv.includes('--full')
const still = process.argv.includes('--still')

if (!url || !outputPath || !widthArgument) {
  console.error(
    'usage: node scripts/shot.mjs <url> <sortie.png> <largeur> [hauteur] [--full] [--still]',
  )
  process.exit(1)
}

const page = await openPage({
  width: Number(widthArgument),
  height: Number(heightArgument) || 800,
  still,
})

await page.goto(url)
const { clientWidth, scrollWidth } = await page.metrics()
await page.screenshot(outputPath, { fullPage })
page.close()

const overflow =
  scrollWidth > clientWidth ? ` DEBORDEMENT +${scrollWidth - clientWidth}px` : ''
console.log(
  `${outputPath}  viewport=${clientWidth}px  scrollWidth=${scrollWidth}px${overflow}`,
)
```

- [ ] **Step 4: Vérifier que la capture fonctionne toujours**

```bash
node scripts/shot.mjs https://example.com /tmp/shot-check.png 390 --still
```

Expected: une ligne `/tmp/shot-check.png  viewport=390px  scrollWidth=390px`, et un PNG non vide :

```bash
ls -la /tmp/shot-check.png   # taille > 0
```

`example.com` plutôt que le site local : cette étape vérifie la résolution de Chrome, le client CDP et la capture, sans dépendre d'un serveur de développement.

- [ ] **Step 5: Remettre le script sous suivi git**

Retirer la ligne 39 de `.gitignore` :

```diff
-scripts/shot.mjs
```

Puis vérifier :

```bash
git check-ignore -v scripts/shot.mjs   # Expected: aucune sortie, exit 1
```

- [ ] **Step 6: Vérifier le formatage des nouveaux fichiers**

```bash
pnpm biome ci scripts/
```

Expected: PASS. Ne pas lancer `--write` sur le reste du dépôt.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/cdp.mjs scripts/shot.mjs .gitignore
git commit -m "refactor: extract the CDP plumbing from the screenshot tool"
```

---

### Task 5: Le test de fumée

> **Divergences constatées à l'exécution** (tâche livrée, commit `6120cea`, puis revue finale) :
> — `checkBreakpoint` gagne un `try/catch` autour de tout son corps, pas seulement le
> `try/finally` qui ferme la page : un échec de lancement de Chrome ou de prise de contact CDP
> devient une violation comme les autres, message d'origine conservé, plutôt qu'une exception
> qui remonterait hors de la boucle du breakpoint suivant ;
> — la boucle sur `BREAKPOINTS` passe elle aussi sous un `try/finally` : `server.close()` doit
> tourner même si une violation imprévue s'échappe de la boucle, sans quoi le port resterait
> ouvert derrière un processus qui a pourtant déjà rendu la main ;
> — `MIME_TYPES` gagne l'entrée `.jpeg` à côté de `.jpg` ;
> — la revue finale a ajouté un `try/catch` dans le gestionnaire de requêtes du serveur, autour
> de `decodeURIComponent` : une séquence d'échappement mal formée dans l'URL levait une
> exception que le callback async ne rattrapait pas, ce qui devenait un rejet non géré et
> tuait le processus avant que `finally { server.close() }` n'ait sa chance de tourner. Répond
> désormais `400`.

**Files:**
- Create: `scripts/smoke.mjs`

**Interfaces:**
- Consumes: `openPage()` de `scripts/lib/cdp.mjs` (tâche 4)
- Produces: `node scripts/smoke.mjs <racine>` — sort en `0` si tous les invariants tiennent aux deux breakpoints, en `1` sinon, en listant les violations.

- [ ] **Step 1: Construire le site pour avoir une cible**

```bash
node -v
pnpm generate
ls .output/public/index.html   # Expected: le fichier existe
```

- [ ] **Step 2: Écrire `scripts/smoke.mjs`**

```js
#!/usr/bin/env node
/**
 * Test de fumée du site construit. Sert `.output/public` puis vérifie, à deux
 * breakpoints, quatre invariants qui ne demandent aucune image de référence.
 *
 *   node scripts/smoke.mjs [racine]
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { openPage } from './lib/cdp.mjs'

const root = resolve(process.argv[2] ?? '.output/public')
const BREAKPOINTS = [390, 1440]
const SECTIONS = ['about', 'experiences', 'skills', 'projects']

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

/**
 * Écoute sur le port 0 : le système en attribue un libre, ce qui évite toute
 * collision avec un serveur de développement déjà lancé ou un autre job. Le
 * rappel de `listen` dit exactement quand le serveur est prêt, là où un serveur
 * externe imposerait une attente arbitraire.
 */
const startServer = () =>
  new Promise((ready) => {
    const server = createServer(async (request, response) => {
      const requestedPath = decodeURIComponent(request.url.split('?')[0])
      const relativePath =
        requestedPath.endsWith('/') ? `${requestedPath}index.html` : requestedPath
      const filePath = join(root, normalize(relativePath))

      // Un `..` dans l'URL ne doit pas sortir de la racine servie.
      if (!filePath.startsWith(root + sep) && filePath !== root) {
        response.writeHead(403).end()
        return
      }

      try {
        const contents = await readFile(filePath)
        response.writeHead(200, {
          'content-type': MIME_TYPES[extname(filePath)] ?? 'application/octet-stream',
        })
        response.end(contents)
      } catch {
        response.writeHead(404).end()
      }
    })

    server.listen(0, '127.0.0.1', () =>
      ready({ server, port: server.address().port }),
    )
  })

/** Renvoie la liste des violations relevées à ce breakpoint. */
const checkBreakpoint = async (baseUrl, width) => {
  const violations = []
  const page = await openPage({ width, height: 900, still: true })

  try {
    await page.goto(`${baseUrl}/`)

    const { clientWidth, scrollWidth } = await page.metrics()
    if (scrollWidth > clientWidth) {
      violations.push(
        `débordement horizontal de ${scrollWidth - clientWidth}px (scrollWidth ${scrollWidth} > viewport ${clientWidth})`,
      )
    }

    const missingSections = await page.evaluate(
      `JSON.stringify(${JSON.stringify(SECTIONS)}.filter((id) => !document.getElementById(id)))`,
    )
    for (const sectionId of JSON.parse(missingSections)) {
      violations.push(`section #${sectionId} absente de la page`)
    }

    const undecodable = await page.evaluate(
      'Promise.all([...document.images].map((image) => image.decode().then(() => null, () => image.currentSrc || image.src))).then((results) => JSON.stringify(results.filter(Boolean)))',
      { awaitPromise: true },
    )
    for (const source of JSON.parse(undecodable)) {
      violations.push(`image non décodable : ${source}`)
    }

    for (const consoleError of page.consoleErrors) {
      violations.push(consoleError)
    }
  } finally {
    page.close()
  }

  return violations
}

const { server, port } = await startServer()
const baseUrl = `http://127.0.0.1:${port}`
let totalViolations = 0

for (const width of BREAKPOINTS) {
  const violations = await checkBreakpoint(baseUrl, width)
  if (violations.length === 0) {
    console.log(`${width}px : conforme`)
    continue
  }
  totalViolations += violations.length
  for (const violation of violations) {
    console.error(`${width}px : ${violation}`)
  }
}

server.close()
process.exit(totalViolations === 0 ? 0 : 1)
```

- [ ] **Step 3: Vérifier que le test passe sur le site sain**

```bash
node scripts/smoke.mjs .output/public; echo "EXIT=$?"
```

Expected: `390px : conforme`, `1440px : conforme`, `EXIT=0`.

Si des erreurs de console apparaissent sur un site pourtant sain, les lire avant de conclure : une erreur réelle doit être corrigée, pas filtrée. N'ajouter une liste d'exceptions qu'après avoir constaté que le bruit vient d'une extension ou du runner.

- [ ] **Step 4: Vérifier que le test échoue sur un débordement**

Introduire temporairement un débordement dans `app/assets/css/main.css`, tout en bas du fichier :

```css
/* TEMPORAIRE — valide le test de fumée, à retirer */
body::after {
  content: '';
  display: block;
  width: 120vw;
  height: 1px;
}
```

Puis :

```bash
pnpm generate
node scripts/smoke.mjs .output/public; echo "EXIT=$?"
```

Expected: FAIL, `390px : débordement horizontal de 78px…`, `1440px : débordement horizontal de 288px…`, `EXIT=1`.

C'est la vérification qui compte : un test qui n'a jamais échoué n'a jamais rien prouvé.

- [ ] **Step 5: Retirer le débordement et reconstruire**

```bash
git checkout app/assets/css/main.css
pnpm generate
node scripts/smoke.mjs .output/public; echo "EXIT=$?"   # Expected: EXIT=0
git status --short   # Expected: aucune modification de main.css
```

- [ ] **Step 6: Commit**

```bash
pnpm biome ci scripts/
git add scripts/smoke.mjs
git commit -m "test: add a smoke test asserting the built site at both breakpoints"
```

---

### Task 6: Brancher le test de fumée dans `deploy.yml`

**Files:**
- Modify: `.github/workflows/deploy.yml` (étape insérée entre `Build the project` et `Deploy to Firebase`)

**Interfaces:**
- Consumes: `scripts/smoke.mjs` (tâche 5)
- Produces: le contexte de status check `deploy` couvre désormais aussi la fumée.

- [ ] **Step 1: Insérer l'étape**

Dans `.github/workflows/deploy.yml`, juste après l'étape `Build the project` :

```yaml
      # Le test a besoin de l'artefact construit : il vit donc ici plutôt que
      # dans ci.yml, ce qui évite un second `pnpm generate`. Il teste exactement
      # ce qui sera déployé. Chrome est préinstallé sur les runners ubuntu.
      - name: Smoke test the built site
        run: node scripts/smoke.mjs .output/public
```

L'étape n'est pas conditionnée par `HAS_FIREBASE_CREDENTIALS` : c'est justement sur les pull requests de Dependabot, qui n'ont pas de preview, qu'elle apporte le plus.

- [ ] **Step 2: Vérifier que le workflow reste valide**

```bash
gh workflow view deploy.yml 2>&1 | head -5
```

Expected: aucune erreur de syntaxe YAML signalée.

- [ ] **Step 3: Commit et pull request**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: smoke test the built site before deploying"
git push -u origin ci/quality-safety-net
gh pr create --title "ci: add a minimal quality safety net" --body "$(cat <<'CORPS'
Ajoute un filet de CI qui échoue vraiment, en trunk-based.

## Contenu

- `ci.yml` : job `quality` (Biome + vue-tsc) et job `pr-title` (4 règles, script testable)
- `scripts/lib/cdp.mjs` : mécanique CDP extraite de l'outil de capture
- `scripts/smoke.mjs` : sert le site construit et vérifie 4 invariants à 390px et 1440px
- `shot.mjs` remis sous suivi git et rendu portable via CHROME_PATH

## Plan de test

- [x] `pnpm lint` et `pnpm typecheck` verts en local
- [x] 15 cas de titre vérifiés, dont 8 refus attendus
- [x] Test de fumée vert sur le site sain
- [x] Test de fumée rouge sur un débordement introduit volontairement
- [ ] Les trois checks verts sur cette pull request

Spec : `docs/superpowers/specs/2026-08-10-filet-ci-qualite-design.md`
CORPS
)"
```

- [ ] **Step 4: Vérifier les trois checks**

Run: `gh pr checks --watch`
Expected: `quality`, `pr-title` et `deploy` verts. Le titre de la PR (`ci: add a minimal quality safety net`, 38 caractères) valide ses propres règles.

- [ ] **Step 5: Fusionner**

```bash
gh pr merge --rebase --delete-branch
```

Le ruleset du dépôt (13369495) n'autorise que la fusion en rebase — `--squash` échouerait.

---

### Task 7: Protéger `main`

**Files:** aucun — configuration GitHub

**Interfaces:**
- Consumes: les contextes `quality`, `pr-title` et `deploy`, qui doivent avoir tourné au moins une fois pour que GitHub les connaisse (tâche 6 fusionnée)

- [ ] **Step 1: Confirmer que les trois contextes existent**

```bash
gh api repos/Cariboucolas/web-cv/commits/main/check-runs --jq '.check_runs[].name' | sort -u
```

Expected: `deploy`, `pr-title`, `quality`. Si l'un manque, ne pas continuer : GitHub refuserait toute fusion en attendant un check qui n'arrive jamais.

- [ ] **Step 2: Demander confirmation à l'utilisateur**

Cette étape modifie la configuration du dépôt et affecte toutes les pull requests ouvertes, dont les sept montées de version en cours. Ne pas l'exécuter sans accord explicite.

- [ ] **Step 3: Appliquer la protection**

```bash
gh api -X PUT repos/Cariboucolas/web-cv/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": {
    "strict": false,
    "contexts": ["quality", "pr-title", "deploy"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON
```

`strict: false` est délibéré : avec `strict: true`, chaque fusion périmerait les autres pull requests ouvertes et relancerait leur CI — une vingtaine de runs supplémentaires pour écouler les sept montées en cours.

- [ ] **Step 4: Vérifier**

```bash
gh api repos/Cariboucolas/web-cv/branches/main/protection \
  --jq '{checks: .required_status_checks.contexts, strict: .required_status_checks.strict, admins: .enforce_admins.enabled}'
```

Expected: `{"checks":["quality","pr-title","deploy"],"strict":false,"admins":false}`

- [ ] **Step 5: Relancer les sept pull requests de montée**

```bash
for pr in 37 38 39 40 41 42 43; do gh pr comment "$pr" --body "@dependabot rebase"; done
```

`#42` n'est pas de Dependabot : la mettre à jour avec `gh pr update-branch 42`.

Expected: chaque PR repasse par les trois checks. Le résultat désigne alors précisément ce qui casse, montée par montée.

---

## Vérification finale

1. `pnpm lint`, `pnpm typecheck` et `node scripts/smoke.mjs .output/public` sortent en `0` sur `main`.
2. `gh api repos/Cariboucolas/web-cv/branches/main/protection` renvoie les trois contextes.
3. Une pull request d'essai intitulée `Feat: something` échoue sur `pr-title` avec un message nommant la règle enfreinte.
4. Aucun serveur de développement orphelin : `lsof -ti:3000-3010` et `pgrep -fl nuxt` ne renvoient rien.
