# Refonte UI — lot 2 : mouvement

**Date :** 2026-08-03
**Statut :** implémenté et fusionné sur `main` le 2026-08-03 (`b8eadf4`)

## Objectif

Poser les deux effets que le lot 1 avait explicitement renvoyés « en toute fin » : un fond
qui se déstructure en cubes au passage du curseur, et l'apparition des sections au
défilement. Ces effets se posent sur une structure stable — le lot 1 est fusionné, la vitrine
projets est en revue — ce qui était la condition posée pour les aborder.

## Périmètre

Deux mécanismes indépendants, sans aucun lien entre eux : ils peuvent être réglés, livrés ou
retirés séparément.

| Fichier | Rôle |
|---|---|
| `components/atoms/CubeField.vue` | le champ de cubes, révélé autour du curseur |
| `plugins/reveal.ts` | la directive `v-reveal`, apparition à l'entrée dans le champ |

## Décisions validées

### 1. C'est le fond qui se déstructure, pas le contenu

Trois lectures de « déstructurer en cubes » étaient possibles : le fond, le contenu survolé,
ou le curseur lui-même. C'est **le fond** qui a été retenu.

Le contenu n'est donc jamais touché : le texte reste net, sélectionnable et indexable.
Fragmenter un titre ou une capture aurait imposé de le dupliquer en fragments — coûteux à
rendre, et délicat à faire sans casser la sélection ni l'accessibilité.

### 2. Les cubes se révèlent, ils ne bougent pas

Le fond est uni au repos. Autour du curseur, les cubes s'éclairent selon leur distance puis
s'estompent quand il s'éloigne. **Aucun cube ne se déplace.**

Le mot « déstructurer » est ainsi pris au pied de la lettre : c'est la surface lisse qui se
décompose en grille, pas la matière qui s'agite. Une dispersion avec rebond avait été écartée
pour la même raison qui a fait écarter le défilement permanent des captures au lot précédent —
sur un CV lu par un recruteur, un fond qui s'agite détourne de la lecture.

**Mise en œuvre.** Un calque `position: fixed` couvrant la fenêtre, en `pointer-events: none`,
portant un quadrillage de 44 px tracé par deux dégradés linéaires — aucun asset, aucune
requête. Le calque est entièrement masqué sauf autour du curseur, par un
`mask-image: radial-gradient()` de 190 px de rayon.

C'est le dégradé du masque qui produit la décroissance avec la distance : **aucun cube n'est
calculé individuellement**, il n'existe aucun élément par cube, et le composite reste sur le
GPU. Le curseur ne pilote que deux variables CSS, `--cube-x` et `--cube-y`, écrites une seule
fois par frame dans un `requestAnimationFrame` — une souris émet bien plus d'événements que
l'écran n'affiche d'images.

### 3. Apparition au défilement, en cascade bornée

Chaque section et chaque élément de liste — entrée d'expérience, ligne de compétence, carte
de projet — se révèle en fondu avec une montée de 12 px à son entrée dans le champ. Cela
prolonge le principe du lot 1 : c'est le vide qui structure la page, et l'apparition lui donne
un rôle temporel en plus de son rôle spatial.

La cascade se règle par un index, `v-reveal="i"`, qui pose un `transition-delay` de
`i × 60 ms`. **Elle est bornée au huitième rang** : sans cette borne, la onzième technologie
d'une liste attendrait plus d'une demi-seconde après la première. Une cascade se lit, elle ne
se subit pas.

**L'apparition ne se rejoue jamais.** L'observateur se désabonne dès qu'un élément est apparu :
remonter la page ne doit rien faire clignoter.

### 4. Le contenu reste visible sans JavaScript

C'est la décision structurante du lot. Le réflexe habituel — masquer en CSS puis révéler en
JavaScript — rend la page **entièrement vide** si le script échoue, n'est pas exécuté, ou si
l'hydratation casse. Sur un CV, c'est le pire échec possible : invisible pour un recruteur
comme pour un robot d'indexation.

Le mécanisme est donc inversé :

1. La directive pose `data-reveal` **dès le rendu serveur**, via `getSSRProps` — et non au
   montage, sinon le contenu s'afficherait puis disparaîtrait.
2. Un script inline dans le `<head>` ajoute la classe `js-reveal` sur `<html>`, **uniquement**
   si `IntersectionObserver` existe et si l'utilisateur n'a pas demandé moins d'animation.
3. Le CSS ne masque `[data-reveal]` que sous `.js-reveal`.

Sans JavaScript, la classe n'arrive jamais : l'attribut est présent dans le HTML mais ne
masque rien.

### 5. Ce qui désactive les effets

- `prefers-reduced-motion: reduce` → pas de champ de cubes, pas d'apparition, contenu en place.
- `@media (hover: none)` → pas de champ de cubes. Même discriminant que celui retenu pour les
  cartes d'expérience : c'est le type de pointeur qui compte, pas la largeur d'écran.
- Le composant vérifie en plus `event.pointerType !== 'mouse'` : un doigt n'a pas de position
  au repos, il n'y a rien à révéler avant le contact.

### 6. Les réglages exposés

Dans `assets/css/main.css`, comme `--showcase-tilt` du lot précédent :

| Variable | Valeur | Rôle |
|---|---|---|
| `--cube-size` | 44px | maille du quadrillage |
| `--cube-radius` | 190px | rayon du halo qui le révèle |
| `--cube-line` | `rgba(66, 184, 131, 0.3)` | couleur des lignes |
| `--reveal-shift` | 12px | montée à l'apparition |
| `--reveal-duration` | 0.45s | durée du fondu |
| `--reveal-step` | 60ms | pas de la cascade |

## Deux pièges rencontrés à l'implémentation

Ils sont consignés ici parce qu'ils ne se déduisent d'aucune lecture du code.

**Le quadrillage ne se répétait pas.** Seule une maille apparaissait, en haut à gauche. Le
reset hérité de l'environnement — Vuetify et Tailwind sont tous deux actifs — impose un
`background-repeat` qui neutralisait le pavage. La déclaration doit être explicite.

**Le champ passait par-dessus le texte.** `.page-card` n'était pas positionnée : un élément
non positionné est peint **avant** tout élément positionné, quel que soit le `z-index` de ce
dernier. Lui donner `position: relative` et `z-index: 1` suffit.

Une couche négative (`z-index: -1`) a été essayée puis écartée : la page est enveloppée dans
le `<v-app>` de Vuetify, qui pose son propre fond opaque — le champ y disparaissait
entièrement. Le fond de `.page-layout`, qui doublonnait avec celui du `body`, a été retiré au
passage.

## Ce qui ne change pas

- Les couleurs, la typographie et l'échelle d'espacement du lot 1
- La structure de la page, l'ordre des sections, la navigation par ancres
- La vitrine projets du lot précédent
- Le carrousel mobile et `ProjectModal`

## Vérification

- [x] `pnpm build` passe
- [x] `pnpm biome check` passe sur les quatre fichiers touchés
- [x] Le HTML rendu par le serveur porte 24 `data-reveal` — 1 profil, 4 sections, 7
      expériences, 6 compétences, 6 projets — et tout le contenu textuel
- [x] Le halo de cubes se révèle autour du curseur, avec décroissance en distance
- [x] Le contenu reste net : aucune ligne du quadrillage ne passe par-dessus le texte
- [ ] À vérifier au pointeur réel : la fluidité du suivi et la justesse du rayon
- [ ] À vérifier sur appareil tactile : aucun champ de cubes, apparitions normales

## Points réversibles

- Le rayon du halo, la maille et l'opacité des lignes (variables CSS)
- Le pas de cascade et sa borne au huitième rang
- L'apparition qui ne se rejoue pas : un observateur qui resterait abonné ferait réapparaître
  les éléments à chaque passage

## Hors périmètre

- **La barre d'en-tête** : les trois liens sociaux doivent rejoindre la liste de contact du
  profil, ne laissant en haut que le téléchargement du CV et le changement de langue.
- **L'aération du bloc profil** : borner la mesure de ligne des paragraphes et porter le
  rythme interne de la colonne droite de 32 à 48 px. En attente du déplacement ci-dessus.

> **Amendement du 2026-08-05.** Ces deux points forment le lot 3, spécifié dans
> [2026-08-05-lot3-entete-profil-design.md](./2026-08-05-lot3-entete-profil-design.md).
>
> La borne de mesure prescrite ci-dessus **n'a pas été retenue**. Trois variantes ont été
> montées et mesurées : l'équilibre entre la colonne avatar et la colonne texte est déjà
> atteint sans borne (17 px d'écart entre les bas de colonne), borner n'en gagne que 5 et
> creuse un vide d'environ 250 px à droite qui fait décrocher le profil de la section
> « À propos ». Le rythme porté à 48 px est en revanche conservé. Voir la décision 4 du
> lot 3 pour le tableau des mesures.
