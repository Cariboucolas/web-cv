# Refonte UI lot 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supprimer les conteneurs encadrés des grandes sections, remplacer Orbitron/Inter par le système Jost / Mona Sans / JetBrains Mono, et poser une échelle d'espacement explicite au rapport 4 : 1.

**Architecture:** Le CSS est réparti dans des blocs `<style scoped>` par composant, sans système de design central. On introduit donc d'abord des variables CSS globales dans `assets/css/main.css` (espacement + familles de polices), puis chaque composant consomme ces variables. Le chargement des polices remonte des `@import` d'un `<style scoped>` vers `app.head` de `nuxt.config.ts`, avec `preconnect`. Un motif se répète dans ce projet : la version mobile est souvent déjà conforme à la cible et c'est le desktop qui l'adopte.

**Tech Stack:** Nuxt 3 (SSR + `generate`), Vue 3 `<script setup>`, Vuetify 3, Tailwind, `@nuxtjs/i18n`, Biome, pnpm. Aucun test dans le projet.

## Global Constraints

- **Aucune dépendance nouvelle.** Le rééchantillonnage d'images utilise `sips`, présent nativement sur macOS.
- **Couleurs inchangées :** fond `#0a0a0a`, accent `#42b883`.
- **Échelle d'espacement :** `--space-section` 64 desktop / 48 mobile · `--space-entry` 32 / 16 · `--space-title` 16 · `--space-grid` 16 · `--space-inner` 8 et 4.
- **Rôles typographiques :** Jost (display : hero, titres de section, nom, navigation), Mona Sans (corps), JetBrains Mono (dates, durées, stack, labels).
- **Point de rupture mobile :** `max-width: 640px`, déjà utilisé partout dans le projet. Ne pas en introduire d'autre.
- **Vérification :** le projet n'a pas de tests. Chaque tâche se vérifie par `pnpm build`, `pnpm biome check .` et une inspection visuelle sur `pnpm dev` aux largeurs 375 / 768 / 1280 / 1440.
- **Commits :** format `<type>: <description>` en français, sans attribution.
- Spec de référence : `docs/superpowers/specs/2026-07-30-refonte-ui-lot1-design.md`.

---

### Task 1: Fondations — variables CSS et chargement des polices

**Files:**
- Modify: `assets/css/main.css:1-17`
- Modify: `nuxt.config.ts:37-55`

**Interfaces:**
- Consumes: rien.
- Produces: les variables CSS `--space-section`, `--space-entry`, `--space-title`, `--space-grid`, `--space-inner-md`, `--space-inner-sm`, `--font-display`, `--font-body`, `--font-mono`, consommées par toutes les tâches suivantes. Les familles disponibles au runtime : `Jost`, `Mona Sans`, `JetBrains Mono`.

- [ ] **Step 1: Remplacer le `:root` et le `body` de `assets/css/main.css`**

Remplacer les lignes 1 à 17 par :

```css
:root {
    /* Le fond réel de la page est #0a0a0a (pages/index.vue) ; la variable
       annonçait #1a1a1a, qui n'était appliqué nulle part. */
    --color-background: #0a0a0a;
    --color-primary: #42b883;
    --color-secondary: #35495e;
    --color-text: #ffffff;
    --color-text-muted: #888888;

    /* Trois rôles typographiques : le corps porte le pragmatisme, le mono le
       craftsmanship, la display la touche sci-fi. */
    --font-display: "Jost", sans-serif;
    --font-body: "Mona Sans", -apple-system, system-ui, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, monospace;

    /* Échelle d'espacement. Sans bordure pour rattraper l'approximation, le
       rapport séparation/regroupement doit tenir 4 : 1. */
    --space-section: 64px;
    --space-entry: 32px;
    --space-title: 16px;
    --space-grid: 16px;
    --space-inner-md: 8px;
    --space-inner-sm: 4px;
}

@media (max-width: 640px) {
    :root {
        --space-section: 48px;
        --space-entry: 16px;
    }
}

html {
    scroll-behavior: smooth;
}

body {
    background-color: var(--color-background);
    color: var(--color-text);
    font-family: var(--font-body);
}
```

- [ ] **Step 2: Remplacer le chargement des polices dans `nuxt.config.ts`**

Dans le tableau `app.head.link`, supprimer l'entrée Inter (lignes 51-54) et ajouter à la place :

```ts
                // Les polices étaient importées depuis un <style scoped> de
                // pages/index.vue : chargées en cascade après la feuille de
                // styles, donc en requête série et avec un flash de texte non
                // stylé. Déclarées ici, elles partent dès le parsing du head.
                {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
                {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: ''},
                {rel: 'preconnect', href: 'https://fonts.cdnfonts.com'},
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
                },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.cdnfonts.com/css/mona-sans',
                },
```

- [ ] **Step 3: Vérifier que le build passe**

Run: `pnpm build`
Expected: succès, aucune erreur.

- [ ] **Step 4: Vérifier le chargement réseau**

Run: `pnpm dev`, puis dans l'onglet Réseau du navigateur, filtrer sur `font`.
Expected: Jost, JetBrains Mono et Mona Sans sont demandées. **Aucune requête `family=Inter`.** Orbitron est encore chargée à ce stade (l'`@import` de `index.vue` est retiré en tâche 2) — c'est attendu.

- [ ] **Step 5: Vérifier le formatage**

Run: `pnpm biome check .`
Expected: aucune erreur.

- [ ] **Step 6: Commit**

```bash
git add assets/css/main.css nuxt.config.ts
git commit -m "feat: pose l'échelle d'espacement et déplace le chargement des polices

Les polices étaient importées depuis un <style scoped>, donc chargées en
requête série après la feuille de styles. Inter était téléchargée à chaque
visite alors que .page-layout la remplaçait par Mona Sans sur toute la page.

--color-background annonçait #1a1a1a alors que la page utilise #0a0a0a."
```

---

### Task 2: Supprimer les cartes de section et appliquer le rythme

**Files:**
- Modify: `pages/index.vue:40-108` (bloc `<style scoped>` entier)

**Interfaces:**
- Consumes: les variables CSS de la tâche 1.
- Produces: `.content-section` sans fond ni bordure, `.section-title` en `var(--font-display)`. Aucune classe supprimée — le template reste inchangé, seules les règles CSS changent.

- [ ] **Step 1: Remplacer le bloc `<style scoped>` de `pages/index.vue`**

Remplacer intégralement les lignes 40 à 108 par :

```vue
<style scoped>
* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.page-layout {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  justify-content: center;
  font-family: var(--font-body);
  color: #e0e0e0;
}

.page-card {
  width: min(100%, 1100px);
  padding: 0 50px 60px;
  display: flex;
  flex-direction: column;
  /* C'est ce vide qui sépare les sections : la carte encadrée a disparu. */
  gap: var(--space-section);
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-title);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: #fff;
}

@media (max-width: 640px) {
  .page-card {
    padding: 8px 16px 40px;
  }

  .section-title {
    font-size: 19px;
  }
}
</style>
```

Trois choses disparaissent : les deux `@import` de polices (remontés dans `nuxt.config.ts` en tâche 1), le fond `rgba(15, 15, 15, 0.9)` et la bordure de `.content-section`, et le `border-top` que le mobile utilisait comme séparateur. Le `background: rgba(10, 10, 10, 0.9)` de `.page-card` part aussi : il était posé sur un `.page-layout` déjà en `#0a0a0a`.

- [ ] **Step 2: Vérifier visuellement**

Run: `pnpm dev`
Expected: plus aucun encadré autour des sections, ni en desktop ni en mobile. Les titres s'affichent en Jost, casse normale, taille 24 px. L'écart entre sections est visiblement plus grand qu'entre un titre et son contenu.

Vérifier en particulier que le titre « Expériences » ne paraît pas collé à la timeline verte : c'est le seul endroit où l'écart resserré à 16 px peut mal tomber.

- [ ] **Step 3: Vérifier le build et le formatage**

Run: `pnpm build && pnpm biome check .`
Expected: les deux passent.

- [ ] **Step 4: Commit**

```bash
git add pages/index.vue
git commit -m "feat: retire les cartes conteneur des sections

Le fond, la bordure et le padding de .content-section disparaissent en
desktop comme en mobile, ainsi que le border-top qui servait de séparateur
mobile. C'est désormais l'espacement qui structure la page."
```

---

### Task 3: Migrer les usages restants d'Orbitron

**Files:**
- Modify: `components/molecules/HeaderBar.vue:86-95`
- Modify: `components/atoms/LanguageIndicator.vue:43`
- Delete: `components/atoms/TitleBlock.vue`

**Interfaces:**
- Consumes: `--font-display` de la tâche 1.
- Produces: plus aucune référence à Orbitron dans `pages/` et `components/`.

`CharacterPanel.vue` contient aussi Orbitron mais est traité en tâche 4, où il est refondu en profondeur — le toucher ici créerait un conflit.

- [ ] **Step 1: Migrer `.header-link` dans `HeaderBar.vue`**

Remplacer les lignes 86 à 95 par :

```css
.header-link {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-transform: none;
  text-decoration: none;
  transition: color 0.2s ease;
}
```

Le `text-transform: uppercase` et le `letter-spacing: 2px` disparaissent : ils accentuaient l'impression datée davantage que la police elle-même. Les tailles passent de 12 à 13 px, l'abandon des capitales réduisant la présence visuelle à taille égale.

- [ ] **Step 2: Ajuster les tailles responsives de `HeaderBar.vue`**

Dans le bloc `@media (max-width: 900px)`, remplacer `font-size: 10px` par `font-size: 12px`.

Dans le bloc `@media (max-width: 640px)`, remplacer la règle `.header-link` par :

```css
  .header-link {
    font-size: 11px;
    letter-spacing: 0;
  }
```

À 8 px avec `letter-spacing: 1px`, les liens étaient sous le seuil de lisibilité confortable ; sans capitales, 11 px occupe une largeur comparable.

- [ ] **Step 3: Migrer `LanguageIndicator.vue`**

Ligne 43, remplacer :

```css
  font-family: "Orbitron", sans-serif;
```

par :

```css
  font-family: var(--font-mono);
```

Le mono plutôt que la display : « FR » / « EN » est un indicateur d'état, pas un titre — même registre que les dates et la stack technique.

- [ ] **Step 4: Supprimer le composant orphelin**

Run:
```bash
grep -rn "TitleBlock\|AtomsTitle" --include="*.vue" --include="*.ts" . | grep -v node_modules | grep -v "components/atoms/TitleBlock.vue"
```
Expected: aucun résultat, ce qui confirme que le composant n'est importé nulle part.

Puis :
```bash
git rm components/atoms/TitleBlock.vue
```

- [ ] **Step 5: Vérifier qu'Orbitron ne subsiste que dans CharacterPanel**

Run: `grep -rn "Orbitron" pages components`
Expected: une seule ligne, `components/organisms/CharacterPanel.vue:55`. Elle disparaîtra en tâche 4.

- [ ] **Step 6: Vérifier le build et le formatage**

Run: `pnpm build && pnpm biome check .`
Expected: les deux passent.

- [ ] **Step 7: Commit**

```bash
git add components/molecules/HeaderBar.vue components/atoms/LanguageIndicator.vue
git commit -m "feat: migre la navigation hors d'Orbitron et supprime TitleBlock

Les liens de navigation passent en Jost sans capitales ni interlettrage
élargi. L'indicateur de langue passe en mono, registre des métadonnées.

TitleBlock.vue n'était importé nulle part : supprimé plutôt que migré."
```

---

### Task 4: Hero et avatar allégé

**Files:**
- Modify: `components/organisms/CharacterPanel.vue` (fichier entier)

**Interfaces:**
- Consumes: `--font-display` de la tâche 1 ; les clés i18n `profile.title` et `profile.subtitle`, présentes dans `locales/fr.json` et `locales/en.json` mais rendues nulle part jusqu'ici.
- Produces: `.character-name`, `.character-role`, `.character-role-accent` — classes consommées par aucune autre tâche.

- [ ] **Step 1: Vérifier que les clés i18n existent dans les deux langues**

Run:
```bash
grep -n '"title"\|"subtitle"' locales/fr.json locales/en.json | head
```
Expected: `profile.title` et `profile.subtitle` présentes dans les deux fichiers. Si l'une manque en anglais, l'ajouter avant de continuer — le site est bilingue et une clé absente s'affiche en clair.

- [ ] **Step 2: Remplacer le template de `CharacterPanel.vue`**

Remplacer les lignes 1 à 16 par :

```vue
<template>
  <div class="character-panel">
    <div class="character-avatar">
      <div class="large-avatar">
        <img src="/images/avatar.jpg" alt="Colas Durcy" class="avatar-img"/>
      </div>
    </div>
    <div class="character-info">
      <h1 class="character-name">Colas Durcy</h1>
      <p class="character-role">
        {{ t('profile.title') }}
        <span class="character-role-accent">{{ t('profile.subtitle') }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error - useI18n est auto-importé par @nuxtjs/i18n
const {t} = useI18n()
</script>
```

Le `srcset` est ajouté en tâche 5, une fois les variantes générées.

- [ ] **Step 3: Remplacer les règles de l'avatar et du nom**

Dans le `<style scoped>`, remplacer les règles `.large-avatar`, `.character-info` et `.character-name` par :

```css
.large-avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  /* Halo et bordure atténués : l'avatar ne doit plus concurrencer le titre
     de poste qu'on ajoute sous le nom. */
  box-shadow: 0 0 24px rgba(66, 184, 131, 0.12);
  border: 2px solid rgba(66, 184, 131, 0.2);
}

.character-info {
  text-align: center;
}

.character-name {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.8px;
  color: #fff;
  margin: 0;
}

.character-role {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: #fff;
  margin: var(--space-inner-md) 0 0;
  line-height: 1.2;
}

.character-role-accent {
  display: block;
  color: #42b883;
}
```

Le nom passe du vert au blanc : le vert est transféré au sous-titre « fullstack », ce qui crée la hiérarchie nom → poste au lieu de deux éléments qui se disputent l'accent.

- [ ] **Step 4: Ajuster les tailles responsives**

Remplacer les trois blocs `@media` par :

```css
@media (max-width: 1200px) {
  .large-avatar {
    width: 140px;
    height: 140px;
  }
}

@media (max-width: 1024px) {
  .character-panel {
    flex-direction: row;
    gap: 24px;
    align-items: center;
  }

  .character-info {
    text-align: left;
  }

  .large-avatar {
    width: 110px;
    height: 110px;
  }

  .character-name {
    font-size: 26px;
  }

  .character-role {
    font-size: 17px;
  }
}

@media (max-width: 640px) {
  /* En dessous de 640px, on repasse en colonne centrée : l'alignement à
     gauche de la tablette laissait le titre de poste orphelin sous un
     avatar plus large que lui. */
  .character-panel {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    width: 100%;
  }

  .character-info {
    flex: none;
    text-align: center;
  }

  .large-avatar {
    width: 110px;
    height: 110px;
  }

  .character-name {
    font-size: 24px;
    letter-spacing: -0.5px;
  }

  .character-role {
    font-size: 16px;
  }
}
```

L'ancienne version mettait `text-align: right` et `justify-content: space-between` en mobile, ce qui plaquait le nom à droite d'un avatar à gauche. Avec un titre de poste sur deux lignes, cette disposition déséquilibre le bloc — d'où le retour à une colonne centrée.

- [ ] **Step 5: Vérifier visuellement le centrage**

Run: `pnpm dev`
Expected: aux largeurs 375, 768, 1280 et 1440, l'avatar, le nom et le titre de poste partagent le même axe. Le titre de poste est lisible et le mot « fullstack » apparaît en vert sur sa propre ligne. En 768 px (tablette), le bloc est en ligne avec le texte aligné à gauche ; en 375 px il repasse en colonne centrée.

- [ ] **Step 6: Vérifier le build et l'absence d'Orbitron**

Run: `pnpm build && pnpm biome check . && grep -rn "Orbitron" pages components`
Expected: le build et Biome passent, et le `grep` ne retourne **rien**.

- [ ] **Step 7: Commit**

```bash
git add components/organisms/CharacterPanel.vue
git commit -m "feat: ajoute le titre de poste et allège l'avatar

profile.title et profile.subtitle existaient dans les locales sans être
rendus nulle part. L'avatar passe de 225 à 160px avec un halo atténué : il
ne concurrence plus le titre qu'on ajoute sous le nom.

Le mobile repasse en colonne centrée, l'alignement à droite déséquilibrant
le bloc une fois le titre de poste ajouté."
```

---

### Task 5: Rééchantillonner l'avatar

**Files:**
- Create: `public/images/avatar-224.webp`, `avatar-336.webp`, `avatar-448.webp`, `avatar-448.jpg`
- Modify: `components/organisms/CharacterPanel.vue` (balise `<img>` du template)

**Interfaces:**
- Consumes: le template de la tâche 4.
- Produces: rien pour les tâches suivantes.

Le fichier source fait 4472 × 6708 px pour 2,0 Mo, affiché dans un cercle de 160 px au maximum. Le navigateur réduit en une seule passe, sans filtrage progressif, d'où l'aliasing sur les cheveux et la peau.

- [ ] **Step 1: Sauvegarder l'original hors du dossier servi**

```bash
mkdir -p assets/originals
cp public/images/avatar.jpg assets/originals/avatar-original.jpg
```

`assets/` n'est pas copié tel quel dans le site généré : l'original reste disponible pour un recadrage ultérieur sans être téléchargé par les visiteurs.

- [ ] **Step 2: Recadrer au carré**

L'image est en portrait 2:3 et le CSS actuel utilise `object-position: center -10%`, ce qui indique un sujet placé haut. On recadre donc un carré décalé vers le haut plutôt qu'au centre.

```bash
sips -c 4472 4472 --cropOffset 447 0 assets/originals/avatar-original.jpg \
  --out /tmp/avatar-square.jpg
```

`-c` prend `hauteur largeur`, `--cropOffset` prend `y x`. Le décalage de 447 px correspond à 10 % de la hauteur du carré.

- [ ] **Step 3: Vérifier le cadrage à l'œil**

Run: `open /tmp/avatar-square.jpg`
Expected: le visage est centré et aucune partie de la tête n'est coupée. Si le cadrage est mauvais, réexécuter l'étape 2 en ajustant `--cropOffset` : augmenter la première valeur descend le cadre, la diminuer le remonte.

**Ne pas continuer tant que le cadrage n'est pas bon** — toutes les variantes en découlent.

- [ ] **Step 4: Générer les variantes**

```bash
for size in 224 336 448; do
  sips -s format webp -s formatOptions 80 -Z $size /tmp/avatar-square.jpg \
    --out public/images/avatar-$size.webp
done

sips -s format jpeg -s formatOptions 82 -Z 448 /tmp/avatar-square.jpg \
  --out public/images/avatar-448.jpg
```

Les trois tailles couvrent un affichage de 110 à 160 px en @1x, @2x et @3x. Le JPEG sert de repli pour les navigateurs sans WebP.

- [ ] **Step 5: Vérifier les poids obtenus**

Run: `ls -la public/images/avatar-*`
Expected: chaque WebP fait moins de 60 Ko, le JPEG moins de 120 Ko. Si un fichier dépasse largement, baisser `formatOptions` à 75 et régénérer.

- [ ] **Step 6: Brancher le `srcset` dans `CharacterPanel.vue`**

Remplacer la balise `<img>` par :

```vue
        <picture>
          <source
              type="image/webp"
              srcset="/images/avatar-224.webp 224w, /images/avatar-336.webp 336w, /images/avatar-448.webp 448w"
              sizes="(max-width: 1024px) 110px, 160px"
          />
          <img
              src="/images/avatar-448.jpg"
              alt="Colas Durcy"
              class="avatar-img"
              width="160"
              height="160"
              decoding="async"
          />
        </picture>
```

`sizes` reprend exactement les largeurs CSS de la tâche 4 : le navigateur choisit ainsi la variante adaptée à la densité de l'écran. Les attributs `width` et `height` réservent la place et évitent un décalage de mise en page au chargement.

- [ ] **Step 7: Supprimer l'ancien fichier du dossier servi**

```bash
git rm public/images/avatar.jpg
```

L'original reste dans `assets/originals/`.

- [ ] **Step 8: Vérifier le rendu et le poids transféré**

Run: `pnpm dev`, onglet Réseau, filtrer sur `avatar`.
Expected: une seule variante est téléchargée, sous 60 Ko. L'avatar est net, sans le scintillement de contraste sur les cheveux. Comparer sur un écran @2x si possible.

- [ ] **Step 9: Vérifier le build**

Run: `pnpm build && pnpm biome check .`
Expected: les deux passent. Vérifier qu'aucune référence à `/images/avatar.jpg` ne subsiste :

```bash
grep -rn "avatar.jpg" pages components --include="*.vue"
```
Expected: aucun résultat.

- [ ] **Step 10: Commit**

```bash
git add public/images/avatar-*.webp public/images/avatar-448.jpg assets/originals/avatar-original.jpg components/organisms/CharacterPanel.vue
git commit -m "perf: rééchantillonne l'avatar et sert des variantes WebP

L'original faisait 4472x6708 pour 2 Mo, affiché dans un cercle de 160px.
Le navigateur réduisait en une passe sans filtrage progressif, d'où
l'aliasing sur les cheveux et la peau.

Trois variantes WebP couvrent @1x à @3x, avec un JPEG en repli. Le poids
transféré passe de 2 Mo à moins de 60 Ko. L'original est conservé dans
assets/originals/, qui n'est pas servi."
```

---

### Task 6: Expériences — desktop nu, révélé au survol

**Files:**
- Modify: `components/molecules/ExperienceCard.vue:245-255` et les règles de métadonnées
- Modify: `components/organisms/ExperiencesSection.vue:82-100`

**Interfaces:**
- Consumes: `--font-mono`, `--space-entry` de la tâche 1.
- Produces: rien pour les tâches suivantes.

Le mobile garde ses cartes : le survol n'existe pas au doigt. Seul le desktop change.

- [ ] **Step 1: Rendre `.xp-card` transparente au repos**

Dans `ExperienceCard.vue`, remplacer la règle `.xp-card` (lignes 245-255) par :

```css
.xp-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  gap: 14px;
  border-radius: 12px;
  /* Rien au repos : la carte n'entourait qu'un contenu non cliquable. Le
     survol la révèle. box-shadow inset plutôt que border, pour qu'aucun
     décalage de mise en page n'accompagne l'apparition. */
  background: transparent;
  box-shadow: inset 0 0 0 1px transparent;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.xp-card:hover {
  background: rgba(255, 255, 255, 0.03);
  box-shadow: inset 0 0 0 1px rgba(66, 184, 131, 0.2);
}
```

Le `box-shadow: 0 0 30px rgba(66, 184, 131, 0.06)` disparaît : c'était un halo permanent sur chaque carte.

- [ ] **Step 2: Passer les métadonnées desktop en mono**

Toujours dans `ExperienceCard.vue`, remplacer la règle `.xp-period` (lignes 304-311) par :

```css
.xp-period {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  color: #42b883;
  white-space: nowrap;
  letter-spacing: 0;
  flex-shrink: 0;
}
```

La graisse passe de 700 à 400 et la taille de 13 à 11 px : un monospace occupe plus de largeur à taille égale, et le gras y est nettement plus lourd qu'en Mona Sans.

Puis remplacer `.xp-tags` (lignes 327-331) et `.desktop-tag` (lignes 333-339) par :

```css
.xp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
}

.desktop-tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #8a8a8a;
}
```

Les pastilles deviennent du texte nu — fond `#1e1e1e`, `padding` et `border-radius` supprimés — séparées par un `gap` porté de 6 à 13 px, l'espacement remplaçant l'encadrement pour distinguer les items.

- [ ] **Step 3: Passer les métadonnées mobiles en mono, sans retirer les pastilles**

Dans `.xp-mobile-period` (ligne 169) et `.xp-mobile-tag` (ligne 195), ajouter :

```css
  font-family: var(--font-mono);
```

Les pastilles mobiles gardent leur fond `#1e1e1e` : le mobile conserve ses cartes, donc leur contenu garde sa cohérence propre.

- [ ] **Step 4: Aligner les espacements sur l'échelle**

Dans `ExperiencesSection.vue`, remplacer `gap: 24px` de `.xp-timeline` (ligne 93) et `gap: 16px` de `.xp-mobile-list` (ligne 85) par `gap: var(--space-entry);`.

Dans `.timeline-col::before` (ligne 118), remplacer `bottom: -24px` par `bottom: calc(var(--space-entry) * -1);` pour que la ligne verticale continue de rejoindre l'entrée suivante.

- [ ] **Step 5: Vérifier visuellement**

Run: `pnpm dev`
Expected: en desktop, aucune carte n'est visible au repos ; le survol fait apparaître un fond très léger et un liseré vert, **sans que rien ne bouge**. Les dates et la stack s'affichent en JetBrains Mono. La ligne verticale verte relie toujours les pastilles sans interruption.

En mobile, les cartes sont inchangées, seules les dates et pastilles ont changé de police.

- [ ] **Step 6: Vérifier le build et le formatage**

Run: `pnpm build && pnpm biome check .`
Expected: les deux passent.

- [ ] **Step 7: Commit**

```bash
git add components/molecules/ExperienceCard.vue components/organisms/ExperiencesSection.vue
git commit -m "feat: expériences nues au repos, révélées au survol en desktop

Une carte d'expérience est décorative : rien n'y est cliquable, donc
l'encadrement ne communiquait rien. Le mobile garde ses cartes, le survol
n'existant pas au doigt.

Dates et stack technique passent en JetBrains Mono : le registre du
terminal porte le propos craftsmanship."
```

---

### Task 7: Compétences — le desktop adopte le traitement mobile

**Files:**
- Modify: `components/organisms/SkillsSection.vue:1-29` (template)
- Delete: `components/molecules/SkillCategory.vue`
- Delete: `components/atoms/SkillBadge.vue`

**Interfaces:**
- Consumes: `--font-mono`, `--space-grid` de la tâche 1.
- Produces: rien pour les tâches suivantes.

La version mobile (lignes 4-16) fait déjà exactement ce que la cible demande : un label de catégorie en petites capitales suivi des compétences séparées par des `·`. Le desktop l'adopte, ce qui rend `SkillCategory` et `SkillBadge` inutiles.

- [ ] **Step 1: Unifier le template**

Remplacer les lignes 1 à 29 par :

```vue
<template>
  <div class="skills-grid">
    <div v-for="category in skillCategories" :key="category.label" class="skills-row">
      <span class="skills-label">{{ category.label }}</span>
      <span class="skills-list">
        <template v-for="(skill, i) in category.skills" :key="skill.name">{{ skill.name }}<template
            v-if="i < category.skills.length - 1"> · </template></template>
      </span>
    </div>
  </div>
</template>
```

Les `<template>` sont collés sans retour à la ligne pour éviter qu'un espace parasite ne s'insère avant le séparateur `·`.

- [ ] **Step 2: Supprimer le tableau `desktopCategories`**

Dans le `<script setup>`, supprimer l'interface `DesktopCategory` et la constante `desktopCategories` (lignes 32-99). Le tableau `mobileCategories` devient la source unique : le renommer en `skillCategories` et renommer l'interface `MobileSkill` en `Skill`, ces deux noms étant ceux qu'attend le template de l'étape 1.

Les deux listes de compétences étaient dupliquées entre desktop et mobile, avec un risque de divergence à chaque ajout — c'est cette duplication que la fusion élimine.

- [ ] **Step 3: Ajouter les styles**

Ajouter en fin de fichier :

```vue
<style scoped>
.skills-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-grid);
}

.skills-row {
  display: flex;
  gap: 16px;
  align-items: baseline;
}

.skills-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #5f5f5f;
  width: 140px;
  flex-shrink: 0;
}

.skills-list {
  font-size: 14px;
  color: #c4c4c4;
  line-height: 1.7;
}

@media (max-width: 640px) {
  .skills-row {
    flex-direction: column;
    gap: var(--space-inner-sm);
  }

  .skills-label {
    width: auto;
  }

  .skills-list {
    font-size: 13px;
  }
}
</style>
```

En dessous de 640 px, le label passe au-dessus de sa liste : une colonne fixe de 140 px ne laisse pas assez de place au texte.

- [ ] **Step 4: Supprimer les composants devenus inutiles**

```bash
grep -rn "SkillCategory\|SkillBadge" --include="*.vue" . | grep -v node_modules
```
Expected: aucun résultat en dehors des deux fichiers eux-mêmes. Puis :

```bash
git rm components/molecules/SkillCategory.vue components/atoms/SkillBadge.vue
```

- [ ] **Step 5: Vérifier visuellement**

Run: `pnpm dev`
Expected: en desktop, six lignes « label + compétences » remplacent la grille de tuiles à icônes. En mobile, le rendu est celui d'avant, avec le label passé en JetBrains Mono. Les icônes `@nuxt/icon` des compétences ont disparu — c'est voulu.

- [ ] **Step 6: Vérifier le build et le formatage**

Run: `pnpm build && pnpm biome check .`
Expected: les deux passent. Un échec ici signale une référence oubliée à `SkillCategory` ou `SkillBadge`.

- [ ] **Step 7: Commit**

```bash
git add components/organisms/SkillsSection.vue
git commit -m "feat: unifie les compétences sur le traitement en colonnes

La version mobile faisait déjà ce que la cible demande. Le desktop
l'adopte, ce qui supprime la grille de tuiles à icônes et rend
SkillCategory et SkillBadge inutiles.

Les deux listes de compétences, jusqu'ici dupliquées entre desktop et
mobile, deviennent une source unique."
```

---

### Task 8: Projets — échelle d'espacement et badges en mono

**Files:**
- Modify: `components/organisms/ProjectsSection.vue:168-238`

**Interfaces:**
- Consumes: `--font-mono`, `--space-grid` de la tâche 1.
- Produces: rien pour les tâches suivantes.

Les cartes de projet sont **conservées** : elles ouvrent `ProjectModal`, l'encadrement signale donc une action possible. Seuls l'espacement et la police des badges changent.

- [ ] **Step 1: Aligner la grille sur l'échelle**

Ligne 171, remplacer `gap: 20px;` par `gap: var(--space-grid);`.

- [ ] **Step 2: Passer les badges en mono**

Remplacer la règle `.project-tag` (lignes 232-238) par :

```css
.project-tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 3px 8px;
  background: #1e1e1e;
  border-radius: 4px;
  color: #42b883;
}
```

Le fond et le rayon restent : la carte étant conservée, son contenu garde sa cohérence propre.

- [ ] **Step 3: Aligner les espacements internes**

Ligne 205, remplacer `gap: 4px;` de `.project-card-body` par `gap: var(--space-inner-sm);`.
Ligne 229, remplacer `margin-top: 4px;` de `.project-card-tags` par `margin-top: var(--space-inner-md);`.

- [ ] **Step 4: Vérifier visuellement**

Run: `pnpm dev`
Expected: les cartes de projet sont inchangées en apparence, hormis les badges de technologies passés en JetBrains Mono. La grille et le carrousel mobile fonctionnent toujours, et un clic ouvre bien `ProjectModal`.

- [ ] **Step 5: Vérifier le build et le formatage**

Run: `pnpm build && pnpm biome check .`
Expected: les deux passent.

- [ ] **Step 6: Commit**

```bash
git add components/organisms/ProjectsSection.vue
git commit -m "feat: aligne les projets sur l'échelle d'espacement

Les cartes sont conservées : elles ouvrent une modale, donc l'encadrement
signale une action. Seuls les badges passent en mono et les espacements
adoptent les variables partagées."
```

---

### Task 9: Vérification d'ensemble et mise à jour de la documentation

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: l'état final des tâches 1 à 8.
- Produces: rien.

- [ ] **Step 1: Passer la liste de vérification de la spec**

Run: `pnpm dev`, puis contrôler aux largeurs 375, 768, 1280 et 1440 :

- Aucun encadré de section, en desktop comme en mobile
- Le survol d'une expérience n'induit aucun décalage
- Avatar, nom et titre de poste centrés sur le même axe en mobile
- Le titre « Expériences » n'est pas collé à la timeline verte
- L'avatar ne scintille plus sur les cheveux

- [ ] **Step 2: Vérifier l'absence des anciennes polices**

Run:
```bash
grep -rn "Orbitron\|family=Inter" pages components nuxt.config.ts assets
```
Expected: aucun résultat.

Puis, dans l'onglet Réseau : aucune requête vers Orbitron ni Inter.

- [ ] **Step 3: Vérifier le poids de la page**

Run: onglet Réseau, rechargement forcé, filtre « Tout ».
Expected: le poids total a chuté d'environ 2 Mo par rapport à avant la refonte, l'avatar en étant la cause principale.

- [ ] **Step 4: Corriger `CLAUDE.md`**

La section « Component structure » décrit une architecture qui n'existe plus : `IconButton`, `SocialSquare`, `StarBackground`, `TitleBlock`, `NavigationIcon`, `TopBar`, `BottomBar`, `CharacterPanel`, `TextPanel`, `AboutSection`, `SkillsSection`, `ProjectsSection`, `ContactSection`, `SkillBadge`, `WorkInProgress`.

La remplacer par l'arborescence réelle après refonte :

```
components/
  atoms/       # IconButton, LanguageIndicator, ProjectBadge, SocialSquare
  molecules/   # AboutSection, ExperienceCard, HeaderBar, NavigationIcon, ProjectModal
  organisms/   # CharacterPanel, ExperiencesSection, ProfileSection, ProjectsSection, SkillsSection
```

Corriger également la section « Page structure », qui décrit une navigation par état `activeSection` avec des événements `section-change` et `toggle-language` remontés depuis `TopBar` : `pages/index.vue` empile en réalité les sections avec des ancres `#about`, `#experiences`, `#skills`, `#projects`, et `HeaderBar` gère la langue lui-même.

Ajouter enfin une section « Design system » documentant les trois rôles typographiques et l'échelle d'espacement, en renvoyant à la spec.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: aligne CLAUDE.md sur l'architecture réelle

La liste des composants et la description de la navigation dataient d'une
version antérieure du projet. Ajoute le système typographique et l'échelle
d'espacement issus de la refonte."
```

- [ ] **Step 6: Ouvrir la pull request**

```bash
git push -u origin feat/refonte-ui-lot1
gh pr create --title "feat: refonte UI lot 1 — structure, typographie, rythme" --body "$(cat <<'EOF'
## Objectif

Moderniser l'interface sans changer son organisation ni sa charte. Voir la spec :
`docs/superpowers/specs/2026-07-30-refonte-ui-lot1-design.md`.

## Changements

- Suppression des cartes conteneur des grandes sections, en desktop comme en mobile
- Système typographique à trois rôles : Jost (display) / Mona Sans (corps) / JetBrains Mono (métadonnées)
- Orbitron et Inter supprimées ; les polices remontent dans `app.head` avec `preconnect`
- Échelle d'espacement explicite au rapport 4 : 1 (64 / 16 en desktop, 48 / 16 en mobile)
- Titre de poste ajouté sous le nom, à partir de clés i18n jusqu'ici inutilisées
- Avatar rééchantillonné : 2 Mo → moins de 60 Ko
- `TitleBlock`, `SkillCategory` et `SkillBadge` supprimés

## Test plan

- [ ] Rendu conforme aux largeurs 375 / 768 / 1280 / 1440
- [ ] Le survol des expériences n'induit aucun décalage de mise en page
- [ ] Au doigt, les expériences restent en cartes et rien ne dépend du survol
- [ ] Aucune requête vers Orbitron ni Inter
- [ ] L'avatar ne présente plus d'aliasing, en @1x comme en @2x
- [ ] Le basculement FR/EN affiche bien le titre de poste dans les deux langues

## Hors périmètre

Le lot 2 (transitions entre sections, curseur qui déstructure en cubes) aura sa propre spec.
Les captures de projets `winky_*.png` pèsent 9,7 Mo et souffrent du même défaut que l'avatar :
à traiter dans un chantier de performance dédié.
EOF
)"
```

---

## Notes d'exécution

**Ordre des tâches.** La tâche 1 est bloquante : toutes les autres consomment ses variables CSS. Les tâches 6, 7 et 8 sont indépendantes entre elles et peuvent être menées dans n'importe quel ordre. La tâche 5 dépend de la 4 (elle modifie le template qu'elle produit).

**Points où s'arrêter et demander.** Trois décisions du plan ont été déduites plutôt que validées en maquette, et méritent un avis avant d'être figées :

1. Le retrait des pastilles de stack technique en desktop (tâche 6, étape 2)
2. La suppression de la grille de tuiles à icônes des compétences (tâche 7)
3. Les valeurs d'espacement mobiles, jamais montrées en maquette (tâche 1)

**Si le rendu déçoit.** Le rapport 4 : 1 entre `--space-section` et `--space-title` est le paramètre le plus sensible. Il s'ajuste dans `assets/css/main.css` sans toucher à aucun composant — c'est tout l'intérêt d'être passé par des variables.
