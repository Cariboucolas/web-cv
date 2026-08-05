# Lot 3 — en-tête et bloc profil : plan d'implémentation

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE — utiliser `superpowers:subagent-driven-development`
> (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes
> utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** descendre les trois liens sociaux de la barre d'en-tête vers la ligne de contact du
profil, et porter le rythme interne de la colonne droite de 32 à 48 px.

**Architecture :** deux composants seulement sont touchés — `HeaderBar` perd trois entrées de son
tableau d'actions, `ProfileSection` les accueille dans une liste de contact qui passe à
l'horizontale. Les changements sont locaux, sans nouveau composant ni nouvel état. Deux nettoyages
ciblés accompagnent le lot dans la zone travaillée : un atome mort disparaît, une collection
d'icônes passe en local.

**Pile technique :** Nuxt 3.15, Vue 3.5, `@nuxt/icon` 1.10.3, Biome 1.9.4, pnpm 9.15.2.

**Spec de référence :** [`docs/superpowers/specs/2026-08-05-lot3-entete-profil-design.md`](../specs/2026-08-05-lot3-entete-profil-design.md)

## Contraintes globales

- **Branche de travail :** `feat/lot3-entete-profil`, déjà créée et portant la spec. Ne pas
  travailler sur `main`.
- **Aucun test dans ce projet.** Le cycle de vérification est visuel : capture d'écran comparée à
  une référence, plus `pnpm build`. Ne pas créer d'infrastructure de test.
- **Dette Biome pré-existante :** `pnpm biome check .` n'a jamais passé sur ce dépôt. Ne jamais
  lancer `biome check --write` sur un fichier existant — cela reformaterait des centaines de lignes
  hors sujet. Sur un fichier **neuf**, le formatage complet est attendu.
- **`CLAUDE.md` n'est pas versionné** (exclu via `.git/info/exclude`). Il doit être tenu à jour mais
  ne doit **jamais** apparaître dans un `git add`.
- **Couleur d'accent :** `#42b883`, en dur comme partout ailleurs dans les styles scopés.
- **Aucune attribution** dans les messages de commit — convention du dépôt.
- **Format des commits :** `<type>: <description>` en français, types `feat`, `fix`, `refactor`,
  `docs`, `chore`, `perf`.
- **Le serveur de dev doit tourner** (`pnpm dev`, port 3000) pour toute capture. Après un
  `pnpm build`, le redémarrer : le build écrase `.nuxt/` et laisse le serveur de dev en erreur 500.

---

### Tâche 1 : outil de capture à viewport réel

Sans cet outil, aucune vérification en dessous de 485 px n'est possible — donc aucune vérification
mobile. `chrome --headless --screenshot` plafonne son viewport à ~485 px sur macOS quelle que soit
la valeur passée à `--window-size` : l'image fait bien la taille demandée, mais c'est un
**recadrage** d'une page rendue à 485 px. Un rendu correct passe alors pour un débordement.
`--headless=old` a le même plafond.

Le script passe par le protocole CDP et `Emulation.setDeviceMetricsOverride`, qui impose un vrai
viewport. Aucune dépendance : Node 22 expose `WebSocket` en global.

**Fichiers :**
- Créer : `scripts/shot.mjs`

**Interfaces :**
- Produit : `node scripts/shot.mjs <url> <sortie.png> <largeur> [hauteur] [--full]` — écrit le PNG
  et journalise `<sortie>  viewport=<N>px  scrollWidth=<N>px`, en ajoutant ` DEBORDEMENT +<N>px`
  si `scrollWidth > viewport`. Toutes les tâches suivantes l'utilisent.

- [ ] **Étape 1 : créer le script**

```javascript
#!/usr/bin/env node
/**
 * Capture une page à un viewport arbitraire, y compris sous les ~485 px
 * où `chrome --headless --screenshot` plafonne et se contente de recadrer.
 *
 * On passe donc par le protocole CDP et `Emulation.setDeviceMetricsOverride`,
 * qui impose un vrai viewport. Aucune dépendance : Node 22 expose `WebSocket`.
 *
 *   node scripts/shot.mjs <url> <sortie.png> <largeur> [hauteur] [--full]
 */

import { spawn } from 'node:child_process'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const [url, out, widthArg, heightArg] = process.argv.slice(2)
const fullPage = process.argv.includes('--full')

if (!url || !out || !widthArg) {
  console.error(
    'usage: node scripts/shot.mjs <url> <sortie.png> <largeur> [hauteur] [--full]',
  )
  process.exit(1)
}

const width = Number(widthArg)
const height = Number(heightArg) || 800
const port = 9222 + Math.floor(Math.random() * 500)

const profile = await mkdtemp(join(tmpdir(), 'shot-'))
const chrome = spawn(
  CHROME,
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

/** Le port n'écoute pas immédiatement : on réessaie jusqu'à ce qu'il réponde. */
const waitForTarget = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`)
      const targets = await res.json()
      const page = targets.find((t) => t.type === 'page')
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch {
      /* pas encore prêt */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('Chrome n’a pas ouvert son port de débogage')
}

const wsUrl = await waitForTarget()
const ws = new WebSocket(wsUrl)
await new Promise((resolve, reject) => {
  ws.onopen = resolve
  ws.onerror = () => reject(new Error('connexion CDP impossible'))
})

let nextId = 0
const pending = new Map()
const events = []

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id !== undefined) {
    const resolve = pending.get(msg.id)
    pending.delete(msg.id)
    resolve?.(msg.result)
  } else {
    events.push(msg.method)
  }
}

const send = (method, params = {}) => {
  const id = ++nextId
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve) => pending.set(id, resolve))
}

await send('Page.enable')
// Le viewport imposé ici est celui que voient les media queries, contrairement
// à --window-size qui ne fait que dimensionner l'image finale.
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 768,
})
await send('Page.navigate', { url })

/** On attend le chargement, puis un délai fixe pour les polices et l'hydratation. */
for (let i = 0; i < 80; i++) {
  if (events.includes('Page.loadEventFired')) break
  await new Promise((r) => setTimeout(r, 100))
}
await new Promise((r) => setTimeout(r, 1500))

const { result } = await send('Runtime.evaluate', {
  expression:
    'JSON.stringify({ vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth })',
  returnByValue: true,
})
const metrics = JSON.parse(result.value)

const shot = await send('Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: fullPage,
})
await writeFile(out, Buffer.from(shot.data, 'base64'))

ws.close()
chrome.kill()

const debord =
  metrics.sw > metrics.vw ? ` DEBORDEMENT +${metrics.sw - metrics.vw}px` : ''
console.log(
  `${out}  viewport=${metrics.vw}px  scrollWidth=${metrics.sw}px${debord}`,
)
```

- [ ] **Étape 2 : vérifier que Biome passe**

Fichier neuf, donc le formatage complet est attendu.

```bash
pnpm biome check scripts/shot.mjs
```

Attendu : `Checked 1 file. No fixes applied.` Si Biome signale du formatage, corriger avec
`pnpm biome check --write scripts/shot.mjs` — c'est sans danger, le fichier est neuf.

- [ ] **Étape 3 : lancer le serveur de dev et capturer les références « avant »**

```bash
pnpm dev &
sleep 12
mkdir -p /tmp/lot3
for w in 1440 1000 700 380; do
  node scripts/shot.mjs http://localhost:3000/ /tmp/lot3/avant-$w.png $w 800
done
```

Attendu : quatre lignes, chacune avec `viewport=<w>px scrollWidth=<w>px` et **aucun**
`DEBORDEMENT`. En particulier `viewport=380px` — c'est la preuve que l'émulation fonctionne, là
où `--window-size=380` aurait rendu 485.

- [ ] **Étape 4 : regarder les quatre captures**

Ouvrir les quatre PNG. Servent de référence pour toutes les comparaisons suivantes. Sur
`avant-1440.png`, relever deux repères pour la tâche 5 :
- le bas de la colonne gauche (sous « fullstack ») : **~405 px**
- le bas de la colonne droite (sous le bouton « Embauchez-moi ») : **~390 px**

- [ ] **Étape 5 : commit**

```bash
git add scripts/shot.mjs
git commit -m "chore: ajoute un outil de capture à viewport réel"
```

---

### Tâche 2 : la collection simple-icons passe en local

`@iconify-json/simple-icons` est absent de `package.json`, où seul `material-symbols` figure. Les
trois icônes de réseaux retombent donc sur `fallbackToApi` et sont résolues au rendu via
`api.iconify.design`. C'est le **serveur** qui émet cet appel, pas le navigateur du visiteur — en
SSR, `@nuxt/icon` livre le SVG déjà inliné dans le HTML. Le gain est une dépendance externe de
moins au rendu en production.

Faire cette tâche **avant** de déplacer les icônes dans le profil : ainsi la ligne de journal qui
sert de critère est vérifiée sur un état stable.

**Fichiers :**
- Modifier : `package.json` (bloc `devDependencies`), `pnpm-lock.yaml`

**Interfaces :**
- Produit : les préfixes `simple-icons:github`, `simple-icons:linkedin` et `simple-icons:malt`
  résolus localement. La tâche 3 les consomme.

- [ ] **Étape 1 : relever la ligne de journal actuelle**

```bash
pnpm build 2>&1 | grep -i "local-installed"
```

Attendu, **avant** l'installation :
```
✔ Nuxt Icon discovered local-installed 1 collections: material-symbols
```

C'est la ligne qui doit changer. Si elle affiche déjà `2 collections`, la tâche est sans objet.

- [ ] **Étape 2 : installer la collection**

`material-symbols` est en `devDependencies` — la nouvelle collection y va aussi.

```bash
pnpm add -D @iconify-json/simple-icons@1.2.93
```

- [ ] **Étape 3 : rebuild et vérifier la ligne de journal**

```bash
pnpm build 2>&1 | grep -i "local-installed"
```

Attendu :
```
✔ Nuxt Icon discovered local-installed 2 collections: material-symbols, simple-icons
```

Si la ligne annonce toujours `1 collections`, l'installation n'a pas été détectée — vérifier que le
paquet est bien sous `devDependencies` dans `package.json` et relancer.

> Ne pas chercher les données SVG dans `.output/server/node_modules` : les collections locales sont
> compilées dans les chunks, pas copiées comme paquets. Le journal est la source de vérité.

- [ ] **Étape 4 : redémarrer le serveur de dev**

Le build vient d'écraser `.nuxt/` ; le serveur de dev qui tournait renvoie désormais des 500.

```bash
kill $(lsof -ti:3000) 2>/dev/null
rm -rf .nuxt
pnpm dev &
sleep 12
node scripts/shot.mjs http://localhost:3000/ /tmp/lot3/t2-1440.png 1440 800
```

Attendu : la page se rend normalement, l'en-tête montre toujours ses cinq carrés (GitHub, LinkedIn,
Malt, téléchargement, FR) — rien ne change visuellement à cette étape.

- [ ] **Étape 5 : commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: sert les icônes simple-icons en local"
```

---

### Tâche 3 : la ligne de contact accueille les trois réseaux

`.contact-list` passe de la colonne à la ligne et gagne trois entrées bâties sur la même règle que
Toulouse et le téléphone : une puce de 18 px suivie d'un libellé.

Le libellé n'est pas décoratif. `simple-icons:malt` a bien un viewBox carré de 24×24, mais son
dessin n'occupe qu'une bande centrale d'environ 8 unités sur 24 — c'est un logotype couché, pas un
pictogramme. À 18 px de rendu, le trait fait 6 px de haut. Adossée à son libellé, l'icône devient
décorative et n'a plus à porter le sens seule.

Cette tâche vient **avant** la tâche 4 : à aucun commit les liens ne disparaissent de la page.

**Fichiers :**
- Modifier : `components/organisms/ProfileSection.vue` — template (`<ul class="contact-list">`),
  script (ajout de `socialLinks`), styles (`.contact-list`, plus deux règles neuves)

**Interfaces :**
- Consomme : les préfixes `simple-icons:*` résolus localement par la tâche 2.
- Produit : les trois liens présents dans le profil. La tâche 4 s'appuie dessus pour les retirer de
  l'en-tête sans les faire disparaître du site.

- [ ] **Étape 1 : ajouter les trois entrées au template**

Dans `components/organisms/ProfileSection.vue`, remplacer le bloc `<ul class="contact-list">`
(lignes 16-22) par :

```vue
      <ul class="contact-list">
        <li v-for="item in contactItems" :key="item.key" class="contact-item">
          <!-- L'icône tient lieu de puce : décorative, le texte porte déjà l'information. -->
          <img :src="item.icon" alt="" aria-hidden="true" class="contact-bullet"/>
          <span>{{ item.label }}</span>
        </li>
        <!-- Même grammaire que ci-dessus : puce puis libellé. Le libellé porte le
             sens, ce qui dispense l'icône Malt — un logotype couché dans son
             viewBox — d'être lisible seule. -->
        <li v-for="link in socialLinks" :key="link.key" class="contact-item">
          <a :href="link.url" target="_blank" rel="noopener noreferrer" class="contact-link">
            <Icon :name="link.icon" class="contact-bullet-icon" aria-hidden="true"/>
            <span>{{ link.label }}</span>
          </a>
        </li>
      </ul>
```

- [ ] **Étape 2 : déclarer les trois liens dans le script**

Toujours dans `ProfileSection.vue`, juste après la constante `contactItems` (qui se termine par
`])`), ajouter :

```ts
const socialLinks = [
  {
    key: 'github',
    label: 'GitHub',
    icon: 'simple-icons:github',
    url: 'https://github.com/Cariboucolas',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: 'simple-icons:linkedin',
    url: 'https://www.linkedin.com/in/colas-durcy-5b5bbba5/',
  },
  {
    key: 'malt',
    label: 'Malt',
    icon: 'simple-icons:malt',
    url: 'https://www.malt.fr/profile/colasdurcy',
  },
]
```

Les libellés ne passent pas par l'i18n : ce sont des noms propres, identiques en français et en
anglais. Les URL sont reprises telles quelles de `HeaderBar.vue:40-61`.

- [ ] **Étape 3 : passer la liste à l'horizontale**

Remplacer la règle `.contact-list` (lignes 112-119) par :

```css
.contact-list {
  list-style: none;
  margin: var(--space-entry) 0 0 0;
  padding: 0;
  /* En ligne, pas en colonne : les cinq entrées tiennent sur un rang de 554 px
     jusqu'à 700 px de viewport, et se replient d'elles-mêmes en dessous. */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 28px;
}
```

La marge reste à `--space-entry` pour l'instant : la tâche 5 la portera à 48 px, séparément.

- [ ] **Étape 4 : styler les entrées cliquables**

Juste après la règle `.contact-item`, ajouter :

```css
.contact-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: #42b883;
}

.contact-bullet-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  /* Le vert des puces SVG voisines : la ligne se lit comme un ensemble,
     pas comme deux moitiés. */
  color: #42b883;
}
```

- [ ] **Étape 5 : capturer aux quatre largeurs**

```bash
for w in 1440 1000 700 380; do
  node scripts/shot.mjs http://localhost:3000/ /tmp/lot3/t3-$w.png $w 800
done
```

Attendu sur les quatre lignes : `viewport=<w>px scrollWidth=<w>px`, **aucun** `DEBORDEMENT`.

- [ ] **Étape 6 : contrôler les captures**

Comparer à `/tmp/lot3/avant-*.png` :

| Capture | Attendu |
|---|---|
| `t3-1440.png` | Les cinq entrées sur un seul rang : Toulouse, 06 68 51 07 78, GitHub, LinkedIn, Malt. Ligne large de ~554 px, se terminant vers x=1002. Puces et icônes toutes vertes. |
| `t3-1000.png` | Toujours un seul rang. |
| `t3-700.png` | Toujours un seul rang — c'est la limite basse. |
| `t3-380.png` | Repli sur deux rangs, **aucune entrée tronquée ni sortie de l'écran**. |

Si une entrée est coupée à 380 px, vérifier que `flex-wrap: wrap` est bien présent sur
`.contact-list`.

- [ ] **Étape 7 : commit**

```bash
git add components/organisms/ProfileSection.vue
git commit -m "feat: les liens sociaux rejoignent la ligne de contact du profil"
```

---

### Tâche 4 : l'en-tête se déleste

Ne restent en haut de page que deux actions portant sur le document lui-même : le téléchargement du
CV et le changement de langue. Le tableau est renommé `headerActions` — `socialLinks` ment déjà
aujourd'hui, puisqu'il contient le téléchargement du CV, et ne contiendrait plus que le mensonge une
fois les réseaux partis.

La règle `.header-social` et son carré de 40 px ne bougent pas.

**Fichiers :**
- Modifier : `components/molecules/HeaderBar.vue` — template (`v-for`), script (tableau renommé et
  réduit)

**Interfaces :**
- Consomme : les trois liens désormais présents dans le profil (tâche 3).
- Produit : un en-tête à deux éléments. Aucune tâche suivante n'en dépend.

- [ ] **Étape 1 : réduire et renommer le tableau**

Dans `components/molecules/HeaderBar.vue`, remplacer le tableau `socialLinks` (lignes 40-61) par :

```ts
/** Deux actions seulement, portant sur le document et non sur la personne :
    les liens vers les profils vivent dans ProfileSection. */
const headerActions = [
  {
    key: 'download',
    icon: 'material-symbols:download',
    url: `https://firebasestorage.googleapis.com/v0/b/cv-portfolio-b023a.appspot.com/o/${encodeURIComponent('cv/cv-colas-durcy.pdf')}?alt=media`,
  },
]
```

- [ ] **Étape 2 : mettre le template en accord**

Toujours dans `HeaderBar.vue`, à la ligne 14, remplacer :

```vue
          v-for="link in socialLinks"
```

par :

```vue
          v-for="link in headerActions"
```

C'est la seule occurrence. Vérifier qu'il n'en reste aucune autre :

```bash
grep -n "socialLinks" components/molecules/HeaderBar.vue
```

Attendu : aucune sortie.

- [ ] **Étape 3 : capturer**

```bash
for w in 1440 700 380; do
  node scripts/shot.mjs http://localhost:3000/ /tmp/lot3/t4-$w.png $w 800
done
```

- [ ] **Étape 4 : contrôler les captures**

Attendu sur les trois : l'en-tête ne montre plus que **deux** éléments à droite — le carré de
téléchargement et l'indicateur `FR`. Les liens de navigation (« À propos de moi », « Expériences »,
« Compétences », « Projets ») sont inchangés. La ligne de contact du profil montre toujours ses
cinq entrées.

- [ ] **Étape 5 : commit**

```bash
git add components/molecules/HeaderBar.vue
git commit -m "feat: l'en-tête ne garde que le CV et la langue"
```

---

### Tâche 5 : le rythme interne passe à 48 px

Les deux marges de la colonne droite passent de `--space-entry` (32 px) à `--space-column` (48 px).

Le token réutilisé désigne une gouttière horizontale et sert ici en vertical : c'est assumé plutôt
que corrigé par un token neuf. Il vaut exactement la valeur voulue en desktop, et sa dégression à
32 px puis 24 px sur petits écrans va dans le bon sens — on veut moins d'air quand la place manque,
pas plus.

**Aucune borne de mesure n'est posée sur `.profile-line`.** C'est un écart assumé par rapport aux
specs des lots précédents, amendées en conséquence. Ne pas ajouter de `max-width` sur les
paragraphes.

**Fichiers :**
- Modifier : `components/organisms/ProfileSection.vue` — deux déclarations de marge

**Interfaces :**
- Consomme : `.contact-list` déjà passée à l'horizontale (tâche 3).
- Produit : rien dont une tâche suivante dépende.

- [ ] **Étape 1 : ouvrir la marge au-dessus de la liste de contact**

Dans la règle `.contact-list`, remplacer :

```css
  margin: var(--space-entry) 0 0 0;
```

par :

```css
  /* 48 px et non 32 : --space-column nomme une gouttière horizontale mais porte
     ici le rythme vertical. Sa dégression à 32 puis 24 px sur petits écrans est
     voulue — moins d'air quand la place manque. */
  margin: var(--space-column) 0 0 0;
```

- [ ] **Étape 2 : ouvrir la marge au-dessus de l'appel à l'action**

Dans la règle `.profile-cta`, remplacer :

```css
  margin-top: var(--space-entry);
```

par :

```css
  margin-top: var(--space-column);
```

- [ ] **Étape 3 : capturer et mesurer l'équilibre**

```bash
for w in 1440 1000 700 380; do
  node scripts/shot.mjs http://localhost:3000/ /tmp/lot3/t5-$w.png $w 800
done
```

- [ ] **Étape 4 : contrôler l'équilibre des deux colonnes**

Sur `t5-1440.png`, relever les deux repères notés à la tâche 1, étape 4 :
- bas de la colonne gauche, sous « fullstack »
- bas de la colonne droite, sous le bouton « Embauchez-moi »

Attendu : **moins de 20 px d'écart** entre les deux. Sur maquette la mesure donnait 17 px, la
colonne gauche finissant un peu plus bas que la droite.

Sur `t5-380.png` : les marges se resserrent (`--space-column` vaut 24 px sous 640 px), la page reste
compacte, aucun débordement.

- [ ] **Étape 5 : commit**

```bash
git add components/organisms/ProfileSection.vue
git commit -m "feat: ouvre le rythme interne du bloc profil à 48px"
```

---

### Tâche 6 : suppression de l'atome mort

`components/atoms/SocialSquare.vue` n'est référencé nulle part. `HeaderBar` a réimplémenté son
propre carré de 40 px au lieu de réutiliser l'atome, qui en fait 60. Le lot 3 ne le ressuscite pas —
les réseaux sont devenus des entrées icône + libellé, pas des carrés.

**Fichiers :**
- Supprimer : `components/atoms/SocialSquare.vue`
- Modifier : `CLAUDE.md` ligne 43 — **à ne pas commiter**, le fichier est exclu du versionnement

- [ ] **Étape 1 : confirmer qu'aucune référence ne subsiste**

```bash
grep -rn "SocialSquare" components pages app.vue plugins locales 2>/dev/null
```

Attendu : aucune sortie. Les composants Nuxt étant auto-importés par chemin, une référence
prendrait la forme `AtomsSocialSquare` — la recherche ci-dessus la capterait aussi.

> `docs/superpowers/plans/` contient d'anciennes mentions dans les plans des lots 1 et 2. Ce sont
> des documents historiques : **ne pas les modifier**.

- [ ] **Étape 2 : supprimer le fichier**

```bash
git rm components/atoms/SocialSquare.vue
```

- [ ] **Étape 3 : vérifier que le build passe**

```bash
pnpm build 2>&1 | tail -5
```

Attendu : le build se termine sans erreur, sur la ligne
`You can deploy this build using npx firebase-tools deploy`. Aucune erreur de résolution de
composant.

- [ ] **Étape 4 : mettre CLAUDE.md à jour sans le commiter**

Dans `CLAUDE.md`, à la ligne 43, retirer `SocialSquare` de la liste des atomes :

```
  atoms/       # DeviceFrame, IconButton, LanguageIndicator, ProjectBadge
```

Puis vérifier qu'il n'est pas mis en index :

```bash
git status --short
```

Attendu : `CLAUDE.md` **n'apparaît pas** dans la sortie — il est exclu via `.git/info/exclude`. S'il
apparaît, ne pas le stager.

- [ ] **Étape 5 : commit**

`git rm` a déjà mis la suppression en index — rien à ajouter.

```bash
git commit -m "refactor: supprime l'atome SocialSquare inutilisé"
```

---

### Tâche 7 : vérification d'ensemble

Repasser toute la liste de la spec avant de proposer la fusion.

**Fichiers :** aucun. Vérification seule.

- [ ] **Étape 1 : redémarrer proprement après le build de la tâche 6**

```bash
kill $(lsof -ti:3000) 2>/dev/null
rm -rf .nuxt
pnpm dev &
sleep 12
```

- [ ] **Étape 2 : jeu de captures final**

```bash
for w in 1440 1200 1000 700 480 380; do
  node scripts/shot.mjs http://localhost:3000/ /tmp/lot3/final-$w.png $w 900
done
```

Attendu : six lignes, toutes avec `scrollWidth` égal au `viewport`, aucun `DEBORDEMENT`.

- [ ] **Étape 3 : passer la liste de vérifications de la spec**

- [ ] Desktop ≥ 1200 px : la ligne de contact tient d'un seul tenant, les deux colonnes se
      terminent à moins de 20 px l'une de l'autre
- [ ] Entre 700 et 1100 px : la ligne tient toujours sur un rang
- [ ] En dessous de 700 px : la ligne se replie proprement, aucune entrée tronquée
- [ ] L'en-tête ne montre plus que le téléchargement du CV et l'indicateur de langue
- [ ] Les trois liens externes ouvrent bien leur profil dans un nouvel onglet — contrôler dans le
      HTML rendu que chacun porte `target="_blank"` et `rel="noopener noreferrer"` :
      `curl -s http://localhost:3000/ | grep -o 'href="https://[^"]*malt[^"]*"[^>]*'`
- [ ] `pnpm build` passe, et son journal annonce
      `discovered local-installed 2 collections: material-symbols, simple-icons`

- [ ] **Étape 4 : contrôler que la dette Biome n'a pas bougé**

```bash
pnpm biome check components/organisms/ProfileSection.vue components/molecules/HeaderBar.vue 2>&1 | tail -3
```

Le dépôt porte une dette pré-existante : cette commande **peut** signaler des erreurs. Ce qui
compte, c'est qu'elle n'en signale pas **davantage** qu'avant le lot. Comparer si besoin avec
`git stash` puis la même commande. Ne rien reformater.

- [ ] **Étape 5 : relire le diff complet**

```bash
git diff main...HEAD --stat
git diff main...HEAD
```

Attendu, neuf entrées : la spec du lot 3, les deux specs amendées, ce plan, `scripts/shot.mjs`,
`package.json`, `pnpm-lock.yaml`, `ProfileSection.vue`, `HeaderBar.vue`, et la suppression de
`SocialSquare.vue`. Aucune trace de `CLAUDE.md`.

- [ ] **Étape 6 : arrêter le serveur de dev**

```bash
kill $(lsof -ti:3000) 2>/dev/null
```

---

## Ce que ce plan ne fait pas

- **Aucune borne de mesure sur les paragraphes du profil.** Décision prise sur maquette, les specs
  des lots précédents ont été amendées. Ne pas la réintroduire.
- **Aucun état de survol sur les cartes d'expérience.** Interdit de longue date (voir `CLAUDE.md`).
- **La mesure de ligne de `AboutSection`**, la navigation de l'en-tête, le carrousel projets : hors
  périmètre.
- **Aucun push, aucune PR.** Le dépôt a un remote HTTPS et `gh` en SSH ; si un push est demandé plus
  tard, passer par le credential helper de `gh`.
