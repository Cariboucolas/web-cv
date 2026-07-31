# Vitrine projets — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire de la grille de projets une vitrine — chaque carte montre une capture dans un châssis de téléphone ou de navigateur, incliné et rogné par le bord de la carte — tout en ramenant le poids des captures de 10 Mo à moins de 200 Ko au premier affichage.

**Architecture:** Deux composants nouveaux et disjoints. `AtomsDeviceFrame` dessine un châssis en CSS pur et ne connaît rien aux projets ; `MoleculesProjectShowcase` le remplit avec la capture courante — ou le logo si le projet n'a pas de capture — et gère le défilement. L'inclinaison n'appartient à ni l'un ni l'autre : elle est portée par le contexte, ce qui permet au même showcase d'être incliné et rogné sur la grille, redressé et entier dans la modale. Les proportions du châssis sont exprimées en unités de conteneur (`cqw`), donc le composant se met à l'échelle sans réglage entre 156 px sur une carte et 458 px dans la modale.

**Tech Stack:** Nuxt 3 (SSR + `generate`), Vue 3 `<script setup>`, Vuetify 3, Tailwind, `@nuxtjs/i18n`, Biome, pnpm. Rééchantillonnage par `cwebp` et ImageMagick. Aucun test dans le projet.

## Global Constraints

- **Aucune dépendance ajoutée au projet.** `cwebp` et `magick` sont des outils de build locaux (Homebrew), rien n'entre dans `package.json`. Vérifier leur présence avant la tâche 1 : `which cwebp magick`.
- **`sips` ne sait pas encoder le WebP dans cet environnement** (macOS 26.5.2). Ne pas reprendre les commandes `sips -s format webp` du plan du lot 1 : elles échouent sans message d'erreur explicite, en produisant un fichier vide.
- **Couleurs inchangées :** fond `#0a0a0a`, cartes `#111`, scène `#1a1a1a`, accent `#42b883`.
- **Échelle d'espacement du lot 1 :** `--space-section` 64/48 · `--space-entry` 32/16 · `--space-title` 16 · `--space-grid` 16 · `--space-inner-md` 8 · `--space-inner-sm` 4 · `--space-column` 48/32/24.
- **Rôles typographiques :** Jost (display), Mona Sans (corps), JetBrains Mono (dates, stack, labels, compteur de tags).
- **Point de rupture mobile :** `max-width: 640px`. Ne pas en introduire d'autre. Le carrousel mobile est piloté par Tailwind (`hidden sm:block` / `sm:hidden`), à ne pas confondre avec les media queries CSS.
- **Le survol n'induit aucun décalage de mise en page.** Règle héritée du lot 1, elle s'applique ici aux cartes de projet.
- **Dette Biome pré-existante :** `pnpm biome check .` n'a jamais passé sur ce dépôt. Vérifier uniquement les fichiers touchés, et ne jamais reformater un fichier entier — le diff deviendrait illisible.
- **Commits :** format `<type>: <description>` en français, sans attribution.
- Spec de référence : `docs/superpowers/specs/2026-07-30-vitrine-projets-design.md`.

---

### Task 1: Rééchantillonner les captures

**Files:**
- Create: `assets/originals/projects/*.png` (copie des onze originaux)
- Create: `public/images/projects/<base>-<width>.webp` (vingt-deux variantes)

**Interfaces:**
- Consumes: rien.
- Produces: les fichiers `\<base\>-380.webp` / `\<base\>-570.webp` pour les captures portrait et `\<base\>-560.webp` / `\<base\>-940.webp` pour les captures landscape. La tâche 4 construit son `srcset` à partir de cette convention de nommage.

Aucun fichier de code n'est touché : les composants continuent de référencer les `.png`, qui restent en place jusqu'à la tâche 4. Le site reste fonctionnel à chaque instant.

- [ ] **Step 1: Vérifier que les outils sont disponibles**

Run:
```bash
which cwebp magick
```
Expected: deux chemins, typiquement sous `/opt/homebrew/bin/`. Si l'un manque : `brew install webp imagemagick`.

- [ ] **Step 2: Sauvegarder les originaux hors du dossier servi**

```bash
mkdir -p assets/originals/projects
cp public/images/projects/*.png assets/originals/projects/
```

`assets/` n'est pas copié tel quel dans le site généré : les originaux restent disponibles pour un recadrage ultérieur sans être téléchargés par les visiteurs. Même convention que `assets/originals/avatar-original.jpg` au lot 1.

- [ ] **Step 3: Recadrer `winky_login` en 16:10**

L'image fait 2142 × 2258 px, un format quasi carré : ce n'est pas une capture plein écran. Dans un châssis 16:10 elle serait rognée sévèrement sur les côtés.

```bash
magick assets/originals/projects/winky_login.png \
  -gravity center -crop 2142x1339+0+0 +repage \
  /tmp/winky_login-16x10.png

magick identify -format "%wx%h\n" /tmp/winky_login-16x10.png
```
Expected: `2142x1339`.

- [ ] **Step 4: Vérifier le cadrage à l'œil**

Run: `open /tmp/winky_login-16x10.png`
Expected: le formulaire de connexion est entier et lisible. Si le sujet est coupé, réexécuter l'étape 3 en remplaçant `-gravity center` par `-gravity north` (cadre vers le haut) ou `-gravity south` (vers le bas).

**Ne pas continuer tant que le cadrage n'est pas bon** — les deux variantes en découlent.

- [ ] **Step 5: Générer les variantes des captures portrait**

Les sept captures portrait s'affichent au maximum à ~190 px de large (156 px sur une carte, 185 px dans la modale). Les largeurs 380 et 570 couvrent @2x et @3x.

```bash
for f in mgm_dashboard mgm_debrief mgm_debrieflastweek mgm_topmodel \
         fcs_dashboard stic_dashboard stic_immat; do
  for w in 380 570; do
    cwebp -q 78 -resize $w 0 "assets/originals/projects/$f.png" \
      -o "public/images/projects/$f-$w.webp"
  done
done
```

`-resize <largeur> 0` laisse `cwebp` déduire la hauteur en conservant le ratio.

- [ ] **Step 6: Générer les variantes des captures landscape**

Les captures Winkyverse s'affichent au maximum à ~460 px (264 px sur une carte, 458 px dans la modale). Les largeurs 560 et 940 couvrent @2x et @3x.

```bash
for f in winky_dashboard winky-dashboard_2 winky_paiment; do
  for w in 560 940; do
    cwebp -q 78 -resize $w 0 "assets/originals/projects/$f.png" \
      -o "public/images/projects/$f-$w.webp"
  done
done

for w in 560 940; do
  cwebp -q 78 -resize $w 0 /tmp/winky_login-16x10.png \
    -o "public/images/projects/winky_login-$w.webp"
done
```

- [ ] **Step 7: Vérifier les poids obtenus**

Run:
```bash
ls -la public/images/projects/*.webp
du -ch public/images/projects/*.webp | tail -1
```
Expected: chaque fichier sous 60 Ko — les mesures de référence sont 18 Ko en 380w, 29 Ko en 570w, 12 Ko en 560w et 26 Ko en 940w. Total des vingt-deux variantes : environ 500 Ko. Si un fichier dépasse largement, baisser `-q` à 72 et le régénérer.

- [ ] **Step 8: Vérifier le compte de fichiers**

Run:
```bash
ls public/images/projects/*.webp | wc -l
```
Expected: `22` — onze captures × deux variantes. Un compte inférieur signale une boucle interrompue.

- [ ] **Step 9: Commit**

```bash
git add public/images/projects/*.webp assets/originals/projects
git commit -m "perf: rééchantillonne les captures projets en WebP

Les quatre captures Winkyverse faisaient 4346x2258 pour 2,6 Mo chacune,
affichées dans une modale de 520px. Deux variantes par capture couvrent
@2x et @3x aux tailles réellement affichées.

winky_login était quasi carrée (2142x2258) : recadrée en 16:10 pour
entrer dans un châssis de navigateur sans rognage latéral.

Les originaux sont conservés dans assets/originals/, qui n'est pas servi."
```

---

### Task 2: Le châssis `DeviceFrame`

**Files:**
- Create: `components/atoms/DeviceFrame.vue`

**Interfaces:**
- Consumes: rien.
- Produces: le composant auto-importé `AtomsDeviceFrame`, avec une prop obligatoire `variant: 'phone' | 'browser'` et un slot par défaut rendu dans `.device-screen`. Ce slot est en `position: relative`, `overflow: hidden` : un enfant en `position: absolute; inset: 0` y remplit l'écran. Consommé par la tâche 3.

Ce composant n'est branché nulle part avant la tâche 3 : sa vérification se limite au build et à une relecture. C'est assumé — le brancher prématurément mêlerait deux revues.

- [ ] **Step 1: Créer le composant**

```vue
<template>
  <div class="device-frame" :class="`device-frame--${variant}`">
    <div class="device-body">
      <!-- Encoche ou bandeau : purement décoratifs, jamais annoncés. -->
      <div v-if="variant === 'phone'" class="device-notch" aria-hidden="true"/>
      <div v-else class="device-chrome" aria-hidden="true">
        <span class="device-dot"/>
        <span class="device-dot"/>
        <span class="device-dot"/>
        <span class="device-address"/>
      </div>
      <div class="device-screen">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant: 'phone' | 'browser'
}>()
</script>

<style scoped>
.device-frame {
  /* Les proportions internes sont exprimées en cqw plutôt qu'en pixels : le
     même châssis sert à 156px sur une carte et à 458px dans la modale sans
     qu'aucune taille ait à être passée en prop. */
  container-type: inline-size;
  position: relative;
}

.device-frame--phone {
  aspect-ratio: 9 / 19.5;
}

.device-frame--browser {
  aspect-ratio: 16 / 10;
}

/* Le corps est un enfant plutôt que le conteneur lui-même : un conteneur ne
   peut pas se styler avec ses propres unités de requête. */
.device-body {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #111;
  border: 2px solid rgba(255, 255, 255, 0.12);
}

.device-frame--phone .device-body {
  border-radius: 9cqw;
}

.device-frame--browser .device-body {
  border-radius: 3cqw;
}

/* ── Téléphone ── */
.device-notch {
  position: absolute;
  top: 1.6cqw;
  left: 50%;
  transform: translateX(-50%);
  width: 32%;
  height: 1.6cqw;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  z-index: 1;
}

.device-frame--phone .device-screen {
  margin-top: 5cqw;
}

/* ── Navigateur ── */
.device-chrome {
  display: flex;
  align-items: center;
  gap: 1.2cqw;
  padding: 0 2cqw;
  height: 6cqw;
  flex-shrink: 0;
  background: #1a1a1a;
}

.device-dot {
  width: 1.6cqw;
  height: 1.6cqw;
  border-radius: 50%;
  /* Gris plutôt que rouge/jaune/vert : la charte n'a que deux couleurs. */
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.device-address {
  height: 2cqw;
  width: 40%;
  margin-left: 1.5cqw;
  border-radius: 999px;
  background: #262626;
}

.device-screen {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
```

- [ ] **Step 2: Vérifier le build et le formatage**

Run: `pnpm build && pnpm biome check components/atoms/DeviceFrame.vue`
Expected: les deux passent.

- [ ] **Step 3: Commit**

```bash
git add components/atoms/DeviceFrame.vue
git commit -m "feat: ajoute le châssis DeviceFrame en CSS

Téléphone et navigateur dessinés sans aucun asset : un modèle d'appareil
photoréaliste vieillit, c'est l'argument qui avait écarté Orbitron.

Les proportions sont en unités de conteneur, donc le composant se met à
l'échelle entre une carte et la modale sans prop de taille."
```

---

### Task 3: Le composant `ProjectShowcase`

**Files:**
- Create: `components/molecules/ProjectShowcase.vue`

**Interfaces:**
- Consumes: `AtomsDeviceFrame` de la tâche 2.
- Produces: le composant auto-importé `MoleculesProjectShowcase`. Props : `images: string[]` (chemins **sans suffixe ni extension**, ex. `/images/projects/mgm_dashboard`), `orientation: 'portrait' | 'landscape'`, `alt: string`, `sizes: string`, `logo?: string`, `logoBg?: string`, `icon?: string`, `active?: boolean` (défaut `false`), `interval?: number` (défaut `2500`). Consommé par les tâches 4 et 5.

La cadence est portée par la prop `interval` et non par une variable CSS : elle pilote un `setInterval`, et lire une variable CSS depuis JavaScript imposerait un `getComputedStyle` sans bénéfice.

- [ ] **Step 1: Créer le composant**

```vue
<template>
  <AtomsDeviceFrame :variant="variant">
    <!-- Projet sans capture : le logo tient lieu d'écran de démarrage, ce qui
         garde la grille homogène plutôt que d'y laisser un trou. -->
    <div v-if="images.length === 0" class="showcase-fallback">
      <img
          v-if="logo"
          :src="logo"
          :alt="alt"
          class="showcase-logo"
          :style="logoBg ? { background: logoBg } : undefined"
      />
      <Icon v-else-if="icon" :name="icon" class="showcase-icon" size="32"/>
    </div>

    <!-- Les captures sont montées au fur et à mesure du défilement : au repos,
         seule la première est dans le DOM, donc seule elle est téléchargée.
         Le filtrage passe par visibleImages plutôt que par un v-if posé sur le
         v-for : sur un même élément, Vue 3 évalue v-if avant v-for, donc la
         condition n'aurait pas accès à l'index. -->
    <template v-else>
      <img
          v-for="(image, i) in visibleImages"
          :key="image"
          :src="`${image}-${widths[0]}.webp`"
          :srcset="`${image}-${widths[0]}.webp ${widths[0]}w, ${image}-${widths[1]}.webp ${widths[1]}w`"
          :sizes="sizes"
          :alt="i === 0 ? alt : ''"
          class="showcase-img"
          :class="{ 'showcase-img--active': i === index }"
          decoding="async"
      />
    </template>
  </AtomsDeviceFrame>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
    defineProps<{
      /** Chemins sans suffixe ni extension : `/images/projects/mgm_dashboard`. */
      images: string[]
      orientation: 'portrait' | 'landscape'
      alt: string
      sizes: string
      logo?: string
      logoBg?: string
      icon?: string
      active?: boolean
      interval?: number
    }>(),
    {
      active: false,
      interval: 2500,
    },
)

const variant = computed(() => (props.orientation === 'portrait' ? 'phone' : 'browser'))

/** Largeurs des variantes générées en tâche 1, par orientation. */
const widths = computed<[number, number]>(() =>
    props.orientation === 'portrait' ? [380, 570] : [560, 940],
)

const index = ref(0)

/** Nombre de captures montées. Le défilement avance d'un cran à la fois, donc
 *  un compteur suffit : les suivantes ne sont jamais téléchargées tant que le
 *  survol n'a pas atteint leur rang. */
const mountedCount = ref(1)

const visibleImages = computed(() => props.images.slice(0, mountedCount.value))

const reduceMotion = ref(false)

onMounted(() => {
  // matchMedia n'existe pas au rendu serveur : la détection attend le montage.
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

let timer: ReturnType<typeof setInterval> | null = null

const stop = () => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

watch(
    () => props.active,
    (active) => {
      stop()
      if (!active || reduceMotion.value || props.images.length < 2) {
        // L'état de repos est déterministe : on revient toujours à la première.
        index.value = 0
        return
      }
      timer = setInterval(() => {
        index.value = (index.value + 1) % props.images.length
        mountedCount.value = Math.max(mountedCount.value, index.value + 1)
      }, props.interval)
    },
)

onBeforeUnmount(stop)
</script>

<style scoped>
.showcase-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Cadrage par le haut : c'est la partie de la capture qui porte l'identité
     de l'écran, et la seule visible une fois le châssis rogné par la carte. */
  object-position: top center;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.showcase-img--active {
  opacity: 1;
}

.showcase-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #141414;
}

.showcase-logo {
  width: 44%;
  max-height: 44%;
  object-fit: contain;
  border-radius: 6px;
  padding: 4px;
}

.showcase-icon {
  color: #42b883;
  opacity: 0.6;
}

@media (prefers-reduced-motion: reduce) {
  .showcase-img {
    transition: none;
  }
}
</style>
```

- [ ] **Step 2: Vérifier le build et le formatage**

Run: `pnpm build && pnpm biome check components/molecules/ProjectShowcase.vue`
Expected: les deux passent.

- [ ] **Step 3: Commit**

```bash
git add components/molecules/ProjectShowcase.vue
git commit -m "feat: ajoute ProjectShowcase, capture ou logo dans un châssis

Le défilement est piloté de l'extérieur par la prop active : la carte le
déclenche au survol, la modale ne s'en sert pas.

Les captures sont montées au fur et à mesure : au repos une seule est dans
le DOM, donc une seule est téléchargée."
```

---

### Task 4: La modale adopte les châssis

**Files:**
- Modify: `components/organisms/ProjectsSection.vue` (tableau `projects`, chemins d'images)
- Modify: `components/molecules/ProjectModal.vue:9-51` et ses styles de slider
- Delete: `public/images/projects/*.png`

**Interfaces:**
- Consumes: `MoleculesProjectShowcase` de la tâche 3, les variantes de la tâche 1.
- Produces: le champ `images` du modèle `Project` contient désormais des chemins **sans suffixe ni extension**. Les tâches 5 et 6 s'appuient sur cette forme.

La modale est traitée avant la grille pour deux raisons : elle est le seul consommateur d'`images` à ce stade, donc la bascule des chemins ne casse rien ; et son cas est le plus simple — châssis redressé, sans inclinaison ni rognage — ce qui valide les tâches 2 et 3 avant d'y ajouter la mise en scène.

- [ ] **Step 1: Basculer les chemins vers les basenames**

Dans `ProjectsSection.vue`, retirer le suffixe `.png` des onze entrées `images`. Le tableau devient :

```ts
    images: [
      '/images/projects/mgm_dashboard',
      '/images/projects/mgm_debrief',
      '/images/projects/mgm_debrieflastweek',
      '/images/projects/mgm_topmodel',
    ],
```

```ts
    images: ['/images/projects/fcs_dashboard'],
```

```ts
    images: [
      '/images/projects/winky_dashboard',
      '/images/projects/winky-dashboard_2',
      '/images/projects/winky_paiment',
      '/images/projects/winky_login',
    ],
```

```ts
    images: [
      '/images/projects/stic_dashboard',
      '/images/projects/stic_immat',
    ],
```

Mettre à jour le commentaire de la propriété dans l'interface `Project` :

```ts
  /** Chemins sans suffixe ni extension : ProjectShowcase construit le srcset. */
  images: string[]
```

- [ ] **Step 2: Remplacer le visuel de la modale**

Dans `ProjectModal.vue`, remplacer les lignes 9 à 51 (le bloc `<template v-if>` du slider **et** le `<div v-else class="modal-placeholder">`) par :

```vue
      <div
          class="modal-slider"
          :class="project.orientation === 'portrait' ? 'slider-portrait' : 'slider-landscape'"
      >
        <!-- Une seule capture est passée à la fois : c'est le slider de la
             modale qui pilote, le showcase ne défile pas ici. -->
        <MoleculesProjectShowcase
            :images="project.images.length > 0 ? [project.images[sliderIndex]] : []"
            :orientation="project.orientation"
            :logo="project.logo"
            :logo-bg="project.logoBg"
            :icon="project.icon"
            :alt="t(`projects.projects.${project.key}.title`)"
            :sizes="project.orientation === 'portrait' ? '190px' : '458px'"
            class="modal-showcase"
        />

        <template v-if="project.images.length > 1">
          <button class="slider-btn slider-btn-prev"
                  @click="sliderIndex = (sliderIndex - 1 + project.images.length) % project.images.length">
            <Icon name="material-symbols:chevron-left" size="28"/>
          </button>
          <button class="slider-btn slider-btn-next"
                  @click="sliderIndex = (sliderIndex + 1) % project.images.length">
            <Icon name="material-symbols:chevron-right" size="28"/>
          </button>
          <div class="slider-dots">
            <span
                v-for="(_, i) in project.images"
                :key="i"
                class="slider-dot"
                :class="{ active: i === sliderIndex }"
                @click="sliderIndex = i"
            />
          </div>
        </template>
      </div>
```

Le `modal-placeholder` disparaît : un projet sans capture affiche désormais son logo dans le châssis, comme sur la carte.

- [ ] **Step 3: Adapter les styles du slider**

Remplacer les règles `.modal-slider`, `.slider-portrait`, `.slider-landscape`, `.slider-img`, `.img-contain` et `.img-cover` par :

```css
.modal-slider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 24px 0;
  background: #0f0f0f;
}

/* Le portrait se dimensionne par la hauteur : un téléphone entier à 88% de
   la largeur de la modale mesurerait 700px de haut et déborderait l'écran. */
.slider-portrait .modal-showcase {
  height: 400px;
}

.slider-landscape .modal-showcase {
  width: 88%;
}
```

Supprimer également la règle `.modal-placeholder` devenue orpheline.

- [ ] **Step 4: Vérifier qu'aucun `.png` de projet n'est plus référencé**

Run:
```bash
grep -rn "images/projects/.*\.png" components pages --include="*.vue"
```
Expected: aucun résultat.

- [ ] **Step 5: Supprimer les PNG du dossier servi**

```bash
git rm public/images/projects/*.png
```

Les originaux restent dans `assets/originals/projects/`. Les fichiers `cover_*.svg` ne sont pas concernés : ils font moins d'un kilo-octet chacun.

- [ ] **Step 6: Vérifier visuellement**

Run: `pnpm dev`, ouvrir chaque projet dans la modale, en 375 px et en 1280 px.
Expected: les captures mobiles apparaissent dans un châssis de téléphone haut de 400 px, les captures Winkyverse dans un châssis de navigateur occupant 88 % de la largeur. Les flèches et les pastilles fonctionnent toujours. Le Ministère de la Culture et MechaChain affichent leur logo dans un châssis de navigateur, sans zone vide.

- [ ] **Step 7: Vérifier le build et le formatage**

Run: `pnpm build && pnpm biome check components/molecules/ProjectModal.vue components/organisms/ProjectsSection.vue`
Expected: les deux passent.

- [ ] **Step 8: Commit**

```bash
git add components/molecules/ProjectModal.vue components/organisms/ProjectsSection.vue public/images/projects
git commit -m "feat: la modale affiche les captures dans un châssis

Le champ images ne porte plus l'extension : ProjectShowcase construit le
srcset à partir du chemin de base et de l'orientation.

Le modal-placeholder disparaît, un projet sans capture affichant désormais
son logo dans le même châssis que les autres."
```

---

### Task 5: La scène inclinée sur les cartes desktop

**Files:**
- Modify: `assets/css/main.css` (bloc `:root`)
- Modify: `components/organisms/ProjectsSection.vue:13-21` et ses styles de carte

**Interfaces:**
- Consumes: `MoleculesProjectShowcase` de la tâche 3, les chemins basculés en tâche 4.
- Produces: la classe `.project-card-stage`, qui porte désormais `overflow: hidden` à la place de `.project-card`. La tâche 6 s'appuie sur le fait que `.project-card` ne rogne plus.

- [ ] **Step 1: Ajouter la variable d'inclinaison**

Dans `assets/css/main.css`, à la fin du bloc `:root`, après `--space-inner-sm` :

```css

  /* Vitrine projets : l'inclinaison se règle ici, comme le rapport 4:1 de
     l'échelle d'espacement — sans toucher au moindre composant. */
  --showcase-tilt: -8deg;
```

- [ ] **Step 2: Remplacer le visuel de la carte desktop**

Dans `ProjectsSection.vue`, remplacer les lignes 13 à 21 (le `<div class="project-card-visual">` et son `AtomsProjectBadge`) par :

```vue
          <div class="project-card-stage">
            <MoleculesProjectShowcase
                :images="project.images"
                :orientation="project.orientation"
                :logo="project.logo"
                :logo-bg="project.logoBg"
                :icon="project.icon"
                alt=""
                :sizes="project.orientation === 'portrait' ? '156px' : '264px'"
                :active="activeKey === project.key"
                class="project-card-showcase"
                :class="project.orientation === 'portrait'
                  ? 'project-card-showcase--phone'
                  : 'project-card-showcase--browser'"
            />
          </div>
```

L'`alt` est vide : sur la carte, la capture est décorative, le titre du projet porte déjà l'information.

- [ ] **Step 3: Piloter le défilement depuis la carte**

Toujours dans le template, ajouter les deux gestionnaires sur `.project-card` :

```vue
        <div
            v-for="project in projects"
            :key="project.key"
            class="project-card"
            @click="openModal(project)"
            @mouseenter="activeKey = project.key"
            @mouseleave="activeKey = null"
        >
```

Et dans le `<script setup>`, après `const selectedProject = ref<Project | null>(null)` :

```ts
/** Projet dont les captures défilent. Une seule carte à la fois. */
const activeKey = ref<string | null>(null)
```

Le passage de `<div>` à `<button>` et la prise en charge du focus clavier sont traités en tâche 6, avec le reste de l'accessibilité.

- [ ] **Step 4: Remplacer les styles de la carte et de la scène**

Remplacer la règle `.project-card` et le bloc `.project-card-visual` par :

```css
.project-card {
  position: relative;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 0 20px rgba(66, 184, 131, 0.04);
}

/* overflow: hidden descend de la carte vers la scène : la carte doit laisser
   sortir le panneau de tags de la tâche 6, la scène doit rogner le châssis. */
.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 24px rgba(66, 184, 131, 0.15);
  z-index: 5;
}

.project-card-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 3;
  overflow: hidden;
  background: #1a1a1a;
  border-radius: 12px 12px 0 0;
}

.project-card-showcase {
  position: absolute;
  /* Ancré en haut à droite et débordant : le bas de l'appareil est rogné,
     ce qui laisse dans le champ la partie haute de la capture. */
  top: 12%;
  right: -8%;
  transform: rotate(var(--showcase-tilt));
  transform-origin: top right;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
  transition: transform 0.3s ease;
}

.project-card-showcase--phone {
  width: 52%;
}

.project-card-showcase--browser {
  width: 88%;
}

.project-card:hover .project-card-showcase {
  transform: rotate(var(--showcase-tilt)) translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .project-card,
  .project-card-showcase {
    transition: none;
  }

  .project-card:hover .project-card-showcase {
    transform: rotate(var(--showcase-tilt));
  }
}
```

- [ ] **Step 5: Vérifier visuellement**

Run: `pnpm dev`, largeur 1280 px.
Expected: chaque carte montre un châssis incliné vers la gauche, rogné en bas et à droite par le bord de la carte. Aucune barre de défilement horizontale n'apparaît sur la page. Au survol, les captures des projets qui en ont plusieurs défilent toutes les 2,5 s, et le châssis remonte légèrement. À la sortie, le défilement s'arrête et la première capture revient.

Vérifier aussi que le survol ne déplace **aucune** autre carte.

- [ ] **Step 6: Vérifier le chargement différé**

Run: `pnpm dev`, onglet Réseau, filtre `webp`, rechargement forcé sans survoler aucune carte.
Expected: **quatre** requêtes seulement — une par projet illustré — pour un total inférieur à 200 Ko. En survolant une carte à plusieurs captures, les suivantes apparaissent une à une dans l'onglet.

- [ ] **Step 7: Vérifier le build et le formatage**

Run: `pnpm build && pnpm biome check components/organisms/ProjectsSection.vue assets/css/main.css`
Expected: les deux passent.

- [ ] **Step 8: Commit**

```bash
git add components/organisms/ProjectsSection.vue assets/css/main.css
git commit -m "feat: met les captures en vitrine sur les cartes desktop

Le châssis est ancré en haut à droite et rogné par le bord de la carte :
la partie haute de la capture, celle qui porte l'identité de l'écran,
reste dans le champ.

overflow: hidden descend de la carte vers la scène — la carte devra
laisser sortir le panneau de tags."
```

---

### Task 6: Tags tronqués, panneau déployé, accès clavier

**Files:**
- Modify: `components/organisms/ProjectsSection.vue` (élément de carte, bloc des tags, styles associés)

**Interfaces:**
- Consumes: `.project-card` sans `overflow: hidden` (tâche 5).
- Produces: rien pour les tâches suivantes.

- [ ] **Step 1: Passer la carte en élément focusable**

Remplacer la balise ouvrante et fermante de `.project-card` par un `<button>` :

```vue
        <button
            v-for="project in projects"
            :key="project.key"
            type="button"
            class="project-card"
            @click="openModal(project)"
            @mouseenter="activeKey = project.key"
            @mouseleave="activeKey = null"
            @focus="activeKey = project.key"
            @blur="activeKey = null"
        >
```

Ne pas oublier de refermer par `</button>` au lieu de `</div>`.

Un `<div @click>` n'est ni atteignable ni activable au clavier. L'élément natif apporte les deux, plus la sémantique correcte pour les technologies d'assistance.

- [ ] **Step 2: Remplacer le bloc des tags**

Remplacer le `<div class="project-card-tags">` et son contenu par :

```vue
            <div class="project-card-tagzone">
              <!-- Liste tronquée : décorative, c'est le panneau complet qui
                   porte l'information pour les lecteurs d'écran. -->
              <div class="project-card-tags" aria-hidden="true">
                <span v-for="tech in project.technologies.slice(0, 3)" :key="tech" class="project-tag">
                  {{ tech }}
                </span>
                <span v-if="project.technologies.length > 3" class="project-tag project-tag--count">
                  +{{ project.technologies.length - 3 }}
                </span>
              </div>

              <!-- Opacité nulle plutôt que display ou visibility : le panneau
                   reste annoncé, donc la liste complète est accessible. -->
              <div class="project-card-tags-full">
                <span v-for="tech in project.technologies" :key="tech" class="project-tag">
                  {{ tech }}
                </span>
              </div>
            </div>
```

- [ ] **Step 3: Ajouter les styles du bouton, de la zone de tags et du panneau**

Compléter la règle `.project-card` de la tâche 5 avec la réinitialisation du bouton — en gardant les propriétés déjà présentes :

```css
.project-card {
  /* Réinitialisation du bouton natif : l'apparence reste celle d'une carte. */
  appearance: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  width: 100%;
  display: block;
}

.project-card:focus-visible {
  outline: 2px solid #42b883;
  outline-offset: 2px;
}

.project-card:focus-within {
  z-index: 5;
}
```

Puis remplacer la règle `.project-card-tags` par :

```css
.project-card-tagzone {
  position: relative;
  margin-top: var(--space-inner-md);
}

.project-card-tags,
.project-card-tags-full {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.project-card-tags-full {
  position: absolute;
  /* Déborde jusqu'au bord extérieur de la carte — 14px de padding du corps
     plus 1px de bordure — pour recouvrir son bas et paraître la prolonger. */
  top: 0;
  left: -15px;
  right: -15px;
  padding: 0 15px 14px;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: none;
  border-radius: 0 0 12px 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.project-card:hover .project-card-tags-full,
.project-card:focus-within .project-card-tags-full {
  opacity: 1;
}

.project-tag--count {
  color: #6f6f6f;
}

@media (prefers-reduced-motion: reduce) {
  .project-card-tags-full {
    transition: none;
  }
}
```

- [ ] **Step 4: Vérifier visuellement**

Run: `pnpm dev`, largeur 1280 px.
Expected: au repos, chaque carte montre trois technologies suivies d'un compteur gris (`+8` sur MyGoodMoment). Au survol, la liste complète se déploie **par-dessus** la carte du dessous, avec le même fond et le même rayon, sans qu'aucune carte ne bouge. Le panneau n'est jamais coupé.

Vérifier une carte de la dernière ligne : le panneau doit déborder sous la grille sans provoquer de barre de défilement.

- [ ] **Step 5: Vérifier l'accès clavier**

Run: `pnpm dev`, puis parcourir la page à la touche Tab.
Expected: chaque carte reçoit le focus avec un liseré vert visible, le déploiement des tags s'y produit comme au survol, les captures défilent, et la touche Entrée ouvre la modale.

- [ ] **Step 6: Vérifier le respect de `prefers-reduced-motion`**

Run: activer « Réduire les animations » dans les Réglages système de macOS (Accessibilité → Écran), puis recharger.
Expected: aucun défilement automatique des captures, aucune transition ; le panneau de tags apparaît toujours au survol, instantanément.

- [ ] **Step 7: Vérifier le build et le formatage**

Run: `pnpm build && pnpm biome check components/organisms/ProjectsSection.vue`
Expected: les deux passent.

- [ ] **Step 8: Commit**

```bash
git add components/organisms/ProjectsSection.vue
git commit -m "feat: tronque les tags des cartes et les déploie au survol

Le carrousel mobile tronquait déjà à trois technologies, le desktop en
déversait onze : le desktop adopte le traitement mobile.

Le panneau se déploie par-dessus les cartes voisines, qui ne bougent pas —
faire grandir la cellule aurait réagencé la grille sous le curseur.

Les cartes deviennent des boutons : elles n'étaient ni atteignables ni
activables au clavier."
```

---

### Task 7: Vérification d'ensemble et pull request

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: l'état final des tâches 1 à 6.
- Produces: rien.

- [ ] **Step 1: Passer la liste de vérification de la spec**

Run: `pnpm dev`, puis contrôler aux largeurs 375, 768, 1280 et 1440 :

- Les châssis sont inclinés et rognés sans déborder de la carte ni provoquer de barre de défilement horizontale
- Le survol d'une carte ne déplace aucune autre carte
- Le panneau de tags déployé passe au-dessus des voisines sans être coupé
- Une carte s'atteint et s'active au clavier, et le focus déclenche le même déploiement
- Le défilement démarre au survol, s'arrête à la sortie, revient à la première capture
- Les deux projets sans capture affichent leur logo dans un châssis, sans trou visuel
- La modale affiche les captures dans un châssis redressé, le slider fonctionne
- En 375 px, le carrousel mobile est inchangé — badges, pas de châssis

- [ ] **Step 2: Vérifier le poids de la section**

Run: onglet Réseau, rechargement forcé, filtre `Img`.
Expected: au plus quatre captures téléchargées au premier affichage, moins de 200 Ko au total. Avant ce chantier, les mêmes captures pesaient 10 Mo à l'ouverture de la modale.

- [ ] **Step 3: Vérifier l'absence de références mortes**

Run:
```bash
grep -rn "modal-placeholder\|project-card-visual\|images/projects/.*\.png" components pages --include="*.vue"
```
Expected: aucun résultat.

Vérifier également qu'`AtomsProjectBadge` est toujours utilisé — il reste le visuel du carrousel mobile et ne doit pas être supprimé :

```bash
grep -rn "AtomsProjectBadge" components --include="*.vue"
```
Expected: une occurrence, dans le carrousel mobile de `ProjectsSection.vue`.

- [ ] **Step 4: Documenter le nouveau composant dans `CLAUDE.md`**

Dans la section « Component structure », ajouter `DeviceFrame` aux atomes et `ProjectShowcase` aux molécules :

```
components/
  atoms/       # DeviceFrame, IconButton, LanguageIndicator, ProjectBadge, SocialSquare
  molecules/   # AboutSection, ExperienceCard, HeaderBar, NavigationIcon, ProjectModal, ProjectShowcase
  organisms/   # CharacterPanel, ExperiencesSection, ProfileSection, ProjectsSection, SkillsSection
```

Ajouter à la fin de la section « Design system » :

```markdown
La vitrine projets habille les captures d'un châssis d'appareil (`DeviceFrame`), choisi
d'après le champ `orientation` du modèle `Project` : téléphone pour `portrait`, navigateur
pour `landscape`. Sur la grille desktop le châssis est incliné de `--showcase-tilt` et rogné
par la carte ; dans `ProjectModal` il est redressé. Les captures sont servies en WebP à deux
largeurs, nommées `<base>-<largeur>.webp` — le champ `images` ne porte donc ni suffixe ni
extension.

See `docs/superpowers/specs/2026-07-30-vitrine-projets-design.md` for the full rationale.
```

`CLAUDE.md` est exclu du versionnement via `.git/info/exclude` : le modifier, **ne pas le commiter**.

- [ ] **Step 5: Ouvrir la pull request**

```bash
git push -u origin feat/vitrine-projets
gh pr create --title "feat: vitrine projets — châssis d'appareils et allègement des captures" --body "$(cat <<'EOF'
## Objectif

Faire de la grille de projets une vitrine et absorber la dette d'images signalée en hors
périmètre du lot 1. Voir la spec :
`docs/superpowers/specs/2026-07-30-vitrine-projets-design.md`.

## Changements

- `DeviceFrame` : châssis de téléphone et de navigateur dessinés en CSS, sans aucun asset
- `ProjectShowcase` : capture courante, défilement piloté de l'extérieur, repli sur le logo
- Cartes desktop : châssis incliné et rogné par le bord de la carte
- Tags tronqués à trois, liste complète déployée au survol par-dessus les cartes voisines
- Cartes rendues activables au clavier, avec le même déploiement au focus
- Captures rééchantillonnées en WebP : 10 Mo → moins de 200 Ko au premier affichage
- `winky_login` réintégré au slider Winkyverse et recadré en 16:10

## Test plan

- [ ] Rendu conforme aux largeurs 375 / 768 / 1280 / 1440
- [ ] Le survol d'une carte ne déplace aucune autre carte
- [ ] Le panneau de tags passe au-dessus des voisines sans être coupé
- [ ] Une carte s'atteint et s'active au clavier
- [ ] Sous prefers-reduced-motion, aucun défilement automatique
- [ ] Au plus quatre captures chargées au premier affichage, moins de 200 Ko
- [ ] Le carrousel mobile est inchangé

## Hors périmètre

Le lot 2 (transitions entre sections, curseur qui déstructure en cubes) aura sa propre spec.
Les trois liens sociaux de `HeaderBar` doivent rejoindre la liste de contact du profil ;
l'aération du bloc profil attend ce déplacement.
EOF
)"
```

---

## Notes d'exécution

**Ordre des tâches.** La tâche 1 ne touche aucun code et peut être menée en parallèle des tâches 2 et 3. La tâche 4 dépend des trois premières. Les tâches 5 et 6 sont séquentielles : la tâche 6 s'appuie sur le déplacement de `overflow: hidden` opéré en tâche 5.

**Le site reste fonctionnel à chaque commit.** Les `.png` ne sont supprimés qu'en tâche 4, au moment exact où plus aucun composant ne les référence.

**Points où s'arrêter et demander.** Trois valeurs ont été déduites de la maquette d'exemple plutôt que mesurées, et méritent un avis une fois vues à l'écran :

1. L'inclinaison de −8° et l'ancrage `top: 12% / right: -8%` (tâche 5)
2. Les largeurs de châssis, 52 % pour le téléphone et 88 % pour le navigateur (tâche 5)
3. Le seuil de trois tags avant troncature (tâche 6)

**Si le rendu déçoit.** L'inclinaison s'ajuste dans `assets/css/main.css` sans toucher à aucun composant. Les largeurs et l'ancrage se règlent dans les seules trois règles `.project-card-showcase*`. La cadence de défilement se change en passant `:interval="4000"` depuis la carte, sans modifier `ProjectShowcase`.
