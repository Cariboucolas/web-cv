# Refonte UI — lot 1 : structure, typographie, rythme

**Date :** 2026-07-30
**Statut :** validé, prêt pour le plan d'implémentation

## Objectif

Moderniser l'interface du CV sans en changer l'organisation ni la charte. Trois leviers ont
été identifiés avec l'utilisateur : les conteneurs encadrés, la typographie et le rythme
vertical. Le fond sombre et le vert `#42b883` — couleurs de l'entreprise — restent intacts.

## Périmètre

Ce document couvre le **lot 1** uniquement : structure, typographie, espacement.

Le **lot 2** — transitions entre sections et effet de curseur qui déstructure en petits
cubes au survol — fera l'objet d'une spec distincte. L'utilisateur l'a explicitement situé
« en toute fin » : ces effets se posent sur une structure stable, l'ordre inverse oblige à
les refaire.

## Problème

La page empile deux niveaux de conteneurs encadrés : une carte de section
(`.content-section`) qui contient des cartes de contenu (`ExperienceCard`, cartes projet).
Ce « carte dans une carte » multiplie les bordures concurrentes au lieu de laisser
l'espacement structurer la page — c'est le principal marqueur d'ancienneté de l'interface.

S'y ajoutent une display très typée (Orbitron) répétée sur quatre titres de section, et des
espacements choisis au jugé (50, 30, 25, 20 px) sans échelle explicite.

## Décisions validées

### 1. Suppression des cartes de section

`.content-section` perd son fond, sa bordure et son padding, en **desktop comme en mobile**.
Plus aucun filet séparateur : c'est le vide qui sépare. Le positionnement des sections et
leur ordre ne changent pas.

Le mobile appliquait déjà un traitement sans fond ni bordure (avec un `border-top`) ; ce
filet disparaît aussi, ce qui aligne enfin les deux tailles d'écran sur le même principe.

### 2. Traitement des cartes de contenu

| Bloc | Desktop | Mobile |
|---|---|---|
| Expériences | aucun encadrement au repos, **révélé au survol** | **cartes conservées** (état actuel) |
| Projets | **cartes conservées** (état actuel) | **cartes conservées** (état actuel) |

L'arbitrage est fonctionnel, pas esthétique : une carte d'expérience est décorative — rien
n'y est cliquable — alors qu'une carte de projet signale l'ouverture de `ProjectModal`. Le
minimalisme s'applique donc là où il ne coûte aucune clarté.

L'état de survol des expériences (desktop) :

```css
background: rgba(255, 255, 255, 0.03);
box-shadow: inset 0 0 0 1px rgba(66, 184, 131, 0.2);
border-radius: 12px;
```

Le `box-shadow: inset` plutôt qu'une `border` évite tout décalage de mise en page à
l'apparition. Le mobile conserve ses cartes parce que le survol n'existe pas au doigt.

### 3. Système typographique à trois rôles

Chaque intention de l'utilisateur reçoit un rôle typographique dédié :

| Rôle | Police | Porte | Usage |
|---|---|---|---|
| Display | **Jost** | le space opera | hero, titres de section |
| Corps | **Mona Sans** (conservée) | le pragmatisme du CV | texte courant, noms, rôles |
| Mono | **JetBrains Mono** | le craftsmanship | dates, durées, stack technique, labels |

**Orbitron et Inter sont supprimées.**

Jost est l'hommage libre à Futura, seule police à avoir atteint la surface lunaire — la
plaque d'Apollo 11 — et police officielle de la NASA dans les années 60. La référence
science-fiction passe par l'histoire plutôt que par la forme, ce qui évite le registre
« UI de jeu vidéo » qu'Orbitron impose. Une police de 1927 encore actuelle ne datera pas.

Le monospace est nouveau dans le projet. C'est lui qui exprime le craftsmanship sans avoir
à l'écrire, appliqué aux métadonnées : `2025 — AUJ. · 1 an 6 mois`.

Réglages :

- Hero : Jost 600, `letter-spacing: -0.8px`, **casse normale** (« Développeur web »)
- Titres de section : Jost 500, `letter-spacing: -0.2px`, casse normale
- L'interlettrage négatif remplace le `letter-spacing: 2px` positif actuel, qui accentuait
  l'impression datée davantage que le choix de police lui-même.

### 4. Échelle d'espacement

Sans bordure pour rattraper l'approximation, les valeurs doivent devenir explicites. Ce qui
compte est le **rapport** entre l'écart qui sépare et l'écart qui regroupe : l'état actuel
tient à 2,5 : 1 parce que la bordure fait le travail de séparation. En la retirant, ce
rapport doit monter à **4 : 1**.

| Token | Desktop | Mobile | Usage | Aujourd'hui |
|---|---|---|---|---|
| `--space-section` | **64** | **48** | entre deux grandes sections | 50 / 25 |
| `--space-entry` | **32** | 16 | entre deux entrées d'expérience | 24 / 16 |
| `--space-title` | **16** | 16 | titre de section → son contenu | 20 |
| `--space-grid` | 16 | 16 | grille projets, cartes empilées | 16 / 12 |
| `--space-inner` | 8 / 4 | 8 / 4 | interne à un bloc | varié |

Le couple 64 / 16 a été retenu contre 96 / 24 : à hiérarchie égale (même rapport 4 : 1), il
remonte la section « À propos » au-dessus de la ligne de flottaison sur un écran de
portable — un lecteur voit le hero *et* le pitch sans défiler.

Les valeurs mobiles sont proposées, non validées en maquette ; à ajuster à
l'implémentation.

### 5. Métadonnées et compétences

Les badges encadrés de la stack technique **des expériences** deviennent du texte en
JetBrains Mono séparé par des espaces. La section Compétences passe de badges à des colonnes
de texte avec un label de catégorie en mono. Même logique que le reste : ces pastilles
formaient une troisième famille de petites boîtes.

Les badges **internes aux cartes de projet** (`ProjectBadge`, `.tag` de `ProjectsSection`)
ne changent pas : les cartes de projet étant conservées, leur contenu garde sa cohérence
propre. Seule leur police passe en JetBrains Mono pour rester dans le système.

**Compromis assumé :** on perd la lecture « en un coup d'œil » que donnaient les pastilles.
Décision réversible sans toucher au reste du design.

## Dette technique corrigée au passage

Le changement de polices oblige à toucher leur chargement — l'occasion de réparer trois
défauts constatés :

1. **Inter est chargée pour rien.** `nuxt.config.ts:53` la télécharge et `main.css:16`
   l'applique au `body`, mais `.page-layout` (`index.vue:55`) réapplique Mona Sans sur toute
   la page. Elle est donc payée à chaque visite sans être rendue.
2. **Les polices sont importées depuis un `<style scoped>`** (`index.vue:41-42`). Un
   `@import` CSS y est chargé en cascade après la feuille de styles, donc en requête série :
   le navigateur les découvre tard, d'où un flash de texte non stylé.
3. **Trois origines réseau** : `fonts.googleapis.com`, `fonts.cdnfonts.com` et le domaine du
   site.

Cible : déclarer Jost, Mona Sans et JetBrains Mono dans `app.head` de `nuxt.config.ts` avec
`preconnect`, et supprimer les `@import` du composant. Si Mona Sans reste sur
`fonts.cdnfonts.com`, on conserve deux origines ; l'auto-hébergement des trois familles est
une option à évaluer au moment du plan, pas une décision de ce document.

À corriger aussi : `main.css:2` déclare `--color-background: #1a1a1a` alors que la page
utilise `#0a0a0a`. La variable ment sur l'état réel.

## Fichiers impactés

| Fichier | Nature du changement |
|---|---|
| `pages/index.vue` | suppression de `.content-section`, échelle d'espacement, retrait des `@import` |
| `nuxt.config.ts` | déclaration des polices avec `preconnect`, retrait d'Inter |
| `assets/css/main.css` | variables d'espacement, correction de `--color-background`, retrait d'Inter |
| `components/organisms/ProfileSection.vue` | hero en Jost, casse normale, interlettrage |
| `components/molecules/ExperienceCard.vue` | desktop nu + état de survol ; mobile inchangé |
| `components/organisms/ExperiencesSection.vue` | espacements, métadonnées en mono |
| `components/organisms/SkillsSection.vue`, `molecules/SkillCategory.vue`, `atoms/SkillBadge.vue` | passage en colonnes de texte |
| `components/organisms/ProjectsSection.vue` | cartes conservées, espacements alignés sur l'échelle |

## Ce qui ne change pas

- L'ordre et le découpage des sections
- Les couleurs : fond sombre, `#42b883`
- La timeline verticale verte des expériences (desktop), absente en mobile comme aujourd'hui
- `ProjectModal`, `HeaderBar`, la navigation, l'i18n
- Les cartes de projet

## Vérification

Le projet n'a pas de tests et le changement est purement visuel. La vérification se fait par
comparaison avant/après :

- [ ] `pnpm build` passe
- [ ] `pnpm biome check .` passe
- [ ] Aucune requête vers `fonts.googleapis.com/css2?family=Inter` ni vers Orbitron dans
      l'onglet réseau
- [ ] Rendu conforme à la maquette validée, aux largeurs 375 / 768 / 1280 / 1440
- [ ] Le survol des expériences n'induit aucun décalage de mise en page
- [ ] Au doigt (iOS et Android), les expériences restent en cartes et rien ne dépend du
      survol
- [ ] Le titre de section à 16 px ne paraît pas collé à la timeline verte dans
      « Expériences » — seul endroit où le resserrement peut mal tomber

## Points réversibles

Ces décisions ont été prises pour la cohérence d'ensemble et peuvent être annulées seules :

- La casse normale du hero et des titres (retour possible aux capitales)
- Le remplacement des badges de stack par du texte mono
- Les colonnes de texte de la section Compétences
- Les valeurs d'espacement mobiles, non validées en maquette

## Hors périmètre

- **Lot 2** : transitions entre sections, effet de curseur en cubes
- `CLAUDE.md` décrit une architecture obsolète (`TopBar`, `BottomBar`, `TextPanel`,
  `ContactSection`, navigation par `activeSection`) qui ne correspond plus au code. À
  corriger dans un commit séparé pour ne pas mêler documentation et refonte visuelle.
