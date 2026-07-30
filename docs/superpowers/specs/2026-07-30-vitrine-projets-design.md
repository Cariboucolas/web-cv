# Vitrine projets — châssis d'appareils et allègement des captures

**Date :** 2026-07-30
**Statut :** validé, prêt pour le plan d'implémentation

## Objectif

Transformer la grille de projets en vitrine : chaque carte montre le produit au lieu de le
désigner par un badge. Les captures d'écran, jusqu'ici enfermées dans une modale que peu
d'utilisateurs ouvrent, remontent à la surface — habillées d'un châssis de téléphone ou de
navigateur, inclinées et rognées par le bord de la carte.

Ce chantier absorbe au passage la dette signalée en hors périmètre du lot 1 : les captures
de projets pèsent 10 Mo, dont 9,7 Mo pour les seules captures Winkyverse.

## Périmètre

Ce document couvre la **vitrine projets** : châssis, mise en scène, troncature des tags,
défilement au survol et rééchantillonnage des captures.

Le **lot 2** — transitions entre sections et effet de curseur qui déstructure en petits
cubes — reste hors périmètre et fera l'objet d'une spec distincte.

## Problème

Trois défauts se cumulent sur la section Projets.

**La grille ne montre rien.** Chaque carte affiche un `AtomsProjectBadge` — un logo ou une
icône `material-symbols` dans un bandeau uni au ratio 5:3. Les onze captures d'écran
existantes ne sont visibles qu'après un clic, dans `ProjectModal`. Un visiteur qui parcourt
la page sans cliquer ne voit aucun produit.

**Les captures sont hors d'échelle.** Les quatre captures Winkyverse font 4346 × 2258 px
pour 2,6 Mo chacune, affichées dans une modale de 520 px de large — même défaut que
l'avatar avant le lot 1, avec un facteur 8 en largeur et 64 en surface. Les captures
mobiles (858 × 1760) sont plus raisonnables mais restent des PNG non optimisés.

**Le desktop déverse tous les tags.** Le carrousel mobile tronque déjà à trois technologies
(`ProjectsSection.vue:57`, `slice(0, 3)`), le desktop en affiche jusqu'à onze. Sur les
cartes les plus chargées, la bande de tags occupe plus de place que la description.

## Décisions validées

### 1. Deux composants, deux mises en scène

Le châssis et sa mise en scène sont séparés parce qu'ils changent pour des raisons
différentes : un châssis évolue quand on veut un autre appareil, une mise en scène quand on
veut un autre cadrage.

| Composant | Rôle | Ce qu'il ignore |
|---|---|---|
| `atoms/DeviceFrame.vue` | dessine le châssis (`variant: 'phone' \| 'browser'`) et expose un slot pour son écran | tout ce qui touche aux projets |
| `molecules/ProjectShowcase.vue` | remplit le châssis : capture courante, défilement, ou logo à défaut | l'inclinaison et le rognage |

L'inclinaison n'appartient à aucun des deux : elle est portée par le contexte qui les
affiche. Le même `ProjectShowcase` est donc **incliné et rogné** sur la grille desktop, et
**redressé, entier** dans la modale.

Les châssis sont dessinés en CSS, sans aucun asset :

- **Téléphone** — rectangle au ratio 9:19.5, `border-radius` 18px, bordure de 2px en
  `rgba(255, 255, 255, 0.12)`, fond `#111`, barre d'encoche centrée en haut (32 % de
  largeur, 4px de haut, `rgba(255, 255, 255, 0.25)`).
- **Navigateur** — rectangle au ratio 16:10, `border-radius` 10px, bandeau supérieur de
  `#1a1a1a` portant trois pastilles de 5px en `rgba(255, 255, 255, 0.2)` et une barre
  d'adresse muette (40 % de largeur, fond `#262626`).

Un châssis photoréaliste a été écarté : un modèle d'appareil reconnaissable vieillit, et
c'est l'argument même qui a fait écarter Orbitron au lot 1. Les pastilles restent grises
plutôt que rouge/jaune/vert, la charte n'ayant que deux couleurs.

### 2. Quel châssis pour quel projet

Le champ `orientation` du modèle `Project` décide seul — aucun champ nouveau :

| `orientation` | Projets | Châssis |
|---|---|---|
| `portrait` | mgm, fcs, stic | téléphone |
| `landscape` | mc, winky, mechachain | navigateur |

Les projets sans capture (`images: []` — mc et mechachain) reçoivent **le même châssis**,
dont l'écran affiche le logo du projet centré sur fond sombre, à la manière d'un écran de
démarrage. La grille reste homogène : l'inclinaison et le rognage se comportent partout
pareil, et aucune règle particulière n'est à prévoir.

### 3. La mise en scène desktop

Le châssis est ancré **en haut à droite** de la zone visuelle, incliné, et déborde vers le
bas et vers la droite. C'est le bord de la carte qui le rogne.

```css
--showcase-tilt: -8deg;
--showcase-interval: 2500ms;
```

Un téléphone de 190 px de large mesure 412 px de haut, pour une zone visuelle de ~180 px :
seul le haut de l'appareil est visible, ce qui met la partie haute de la capture — celle
qui porte l'identité de l'écran — exactement dans le champ. Un navigateur de 280 px de
large mesure 175 px de haut et tient presque entièrement : son rognage est surtout latéral.

L'angle et la cadence sont des variables CSS, réglables sans toucher aux composants — même
principe que l'échelle d'espacement du lot 1, où le rapport 4:1 s'ajuste en un point unique.

### 4. Tags tronqués, déployés au survol

Au repos, la carte desktop affiche **trois technologies suivies d'un compteur** (`+8`) en
JetBrains Mono. Le desktop adopte ainsi ce que le carrousel mobile fait déjà.

Au survol ou au focus clavier, la carte passe au premier plan et un panneau contenant la
liste complète se déploie **par-dessus les cartes voisines**, qui ne bougent pas d'un pixel.
Le panneau reprend le fond, la bordure et le rayon inférieur de la carte, de sorte que
celle-ci paraisse s'allonger.

Faire grandir réellement la cellule aurait réagencé la grille sous le curseur — outre le
tressautement, la carte peut fuir la souris et provoquer un clignotement survol/sortie sans
fin. La règle du lot 1 tient donc ici aussi : **le survol n'induit aucun décalage de mise en
page**.

### 5. Défilement des captures au survol uniquement

Au repos, chaque carte fige sa première capture. Le survol déclenche le défilement des
suivantes toutes les 2,5 s, en fondu croisé de 400 ms ; la sortie du survol arrête le
défilement et **revient à la première capture**, pour que l'état de repos soit déterministe.

Un défilement permanent sur quatre cartes a été écarté pour deux raisons. Il produit du
mouvement continu en vision périphérique, que l'œil lit comme une bannière publicitaire. Et
il force le chargement des onze captures dès l'affichage de la page, alors que le
déclenchement au survol permet de n'en charger que quatre.

Le survol devient ainsi un geste unique et cohérent : il déploie les tags *et* lance les
captures — « montre-moi ce projet ».

### 6. La modale reçoit les châssis, redressés

`ProjectModal` remplace son `<img>` nue par le même `ProjectShowcase`, sans inclinaison ni
rognage. Le slider, ses flèches et ses pastilles de navigation sont conservés : la modale
reste l'endroit où l'on regarde les captures en détail, pas où on les met en scène.

Le `modal-placeholder` disparaît : un projet sans capture affiche désormais son châssis avec
le logo, comme sur la carte.

### 7. Le carrousel mobile ne change pas

À 280 px de large, un châssis réduirait la capture au point de la rendre illisible. Les
cartes du carrousel gardent donc leur badge actuel. C'est la modale — commune aux deux
tailles d'écran — qui apporte les châssis en mobile.

## Contrainte technique à traiter en premier

`.project-card` porte aujourd'hui `overflow: hidden` (`ProjectsSection.vue:179`). Cette
seule ligne met les décisions 3 et 4 en collision : elle rognera correctement le châssis
incliné, mais empêchera le panneau de tags de sortir de la carte, un élément en
`position: absolute` ne pouvant jamais franchir un ancêtre en `overflow: hidden`.

`overflow: hidden` descend donc de `.project-card` vers la seule zone visuelle. La carte
cesse de rogner — son rayon reste porté par la scène en haut et par le corps en bas — et le
panneau peut déborder librement. La carte reçoit `position: relative`, et un `z-index`
élevé au survol pour passer devant ses voisines.

## Chantier de performance

Les tailles cibles découlent des châssis, pas des fichiers sources :

| Type | Affichage maximum | Variantes WebP | Poids visé |
|---|---|---|---|
| Captures mobiles (858 × 1760) | ~190 px carte, ~300 px modale | 380w, 570w | < 40 Ko |
| Captures desktop (4346 × 2258) | ~280 px carte, ~470 px modale | 560w, 940w | < 60 Ko |

Les deux variantes couvrent @1x à @3x.

**Pas de repli JPEG, contrairement à l'avatar.** Les captures sont servies en WebP
directement via `srcset`, sans élément `<picture>` : cela évite onze fichiers de repli et un
template à deux branches. WebP est reconnu par Safari depuis la version 14 (2020) et par
tous les navigateurs actuels. L'avatar garde le sien parce qu'il porte l'identité de la
page — une image cassée y serait grave, alors qu'une capture décorative absente dégrade sans
casser.

**Chargement différé.** Seule la première capture de chaque projet est chargée d'emblée ;
les suivantes portent `loading="lazy"` et n'arrivent qu'au survol. Le poids initial de la
section passe d'environ 11 Mo — ce que coûterait la vitrine sans précaution — à moins de
200 Ko.

**Cas particulier.** `winky_login.png` fait 2142 × 2258 px, un format quasi carré : ce n'est
pas une capture plein écran. Dans un châssis 16:10, elle serait rognée sévèrement sur les
côtés. Elle est recadrée en 16:10 au moment du rééchantillonnage.

Les originaux sont conservés dans `assets/originals/projects/`, qui n'est pas servi — même
convention que `assets/originals/avatar-original.jpg`.

`winky_login.png` est par ailleurs **réintégré** à la liste des captures Winkyverse, en
dernière position : le tableau de bord reste la vitrine d'ouverture, l'écran de connexion
illustre le parcours.

## Accessibilité et mouvement

- Les cartes sont aujourd'hui des `<div @click>` : elles ne reçoivent pas le focus clavier,
  donc un utilisateur au clavier ne peut ni les activer, ni déclencher le déploiement. Elles
  deviennent des éléments focusables, et `:focus-within` déclenche le même état que `:hover`.
- Sous `prefers-reduced-motion: reduce`, le défilement automatique ne démarre pas et les
  transitions d'inclinaison sont neutralisées. Le déploiement des tags reste — c'est un
  changement d'état utile, pas une animation d'agrément — mais sans transition.
- Sur les cartes, les captures sont décoratives (`alt=""`) : le titre du projet porte déjà
  l'information. Dans la modale, elles reçoivent un `alt` descriptif.
- La détection de `prefers-reduced-motion` en JavaScript passe par `matchMedia`, absent au
  rendu serveur : elle doit être différée au montage côté client.

## Fichiers impactés

| Fichier | Nature du changement |
|---|---|
| `components/atoms/DeviceFrame.vue` | **créé** — châssis téléphone et navigateur en CSS |
| `components/molecules/ProjectShowcase.vue` | **créé** — capture, défilement, repli sur le logo |
| `components/organisms/ProjectsSection.vue` | scène inclinée sur les cartes desktop, tags tronqués, panneau déployé, déplacement de `overflow: hidden` |
| `components/molecules/ProjectModal.vue` | châssis redressés dans le slider, suppression du `modal-placeholder` |
| `public/images/projects/*.webp` / `.jpg` | variantes rééchantillonnées à créer |
| `assets/originals/projects/` | **créé** — originaux conservés hors du dossier servi |
| `assets/css/main.css` | variables `--showcase-tilt` et `--showcase-interval` |

## Ce qui ne change pas

- L'ordre des projets et le contenu des cartes (titre, description, technologies)
- Les couleurs : fond sombre, `#42b883`
- Le carrousel mobile et ses cartes
- `ProjectModal` : son slider, ses flèches, ses pastilles, sa largeur de 520 px
- Le modèle `Project` : aucun champ ajouté, `orientation` suffit
- `AtomsProjectBadge` : il perd deux de ses trois usages — la grille desktop et le
  `modal-placeholder` — mais reste le visuel du carrousel mobile. **À ne pas supprimer.**

## Vérification

Le projet n'a pas de tests et le changement est visuel. La vérification se fait par
comparaison avant/après :

- [ ] `pnpm build` passe
- [ ] Aucune régression Biome sur les fichiers touchés
- [ ] Aux largeurs 375 / 768 / 1280 / 1440, les châssis sont inclinés et rognés sans
      déborder de la carte ni provoquer de barre de défilement horizontale
- [ ] Le survol d'une carte ne déplace **aucune** autre carte
- [ ] Le panneau de tags déployé passe bien au-dessus des cartes voisines, sans être coupé
- [ ] Une carte peut être atteinte et activée au clavier, et le focus déclenche le même
      déploiement que le survol
- [ ] Le défilement des captures démarre au survol, s'arrête à la sortie et revient à la
      première capture
- [ ] Sous `prefers-reduced-motion`, aucun défilement automatique ne se produit
- [ ] Les deux projets sans capture affichent leur logo dans un châssis, sans trou visuel
- [ ] Onglet réseau au premier affichage : au plus quatre captures téléchargées, moins de
      200 Ko au total
- [ ] Chaque variante WebP pèse moins de 60 Ko
- [ ] La modale affiche les captures dans un châssis redressé, le slider fonctionne toujours

## Points réversibles

Ces décisions ont été prises pour la cohérence d'ensemble et peuvent être annulées seules :

- L'angle d'inclinaison et la cadence de défilement (variables CSS)
- Le seuil de trois tags avant troncature
- Les pastilles grises du châssis navigateur, qui pourraient reprendre les couleurs macOS
- Le retour à la première capture en sortie de survol

## Hors périmètre

- **Lot 2** : transitions entre sections, effet de curseur en cubes
- **La barre d'en-tête.** Les trois liens sociaux de `HeaderBar` doivent rejoindre la liste
  de contact du profil, sous la même forme que la ville et le téléphone, ne laissant en haut
  que le téléchargement du CV et le changement de langue. Décidé mais non planifié : le
  signaler ici évite de l'oublier.
- **L'aération du bloc profil.** Deux leviers ont été identifiés sans être appliqués —
  borner la mesure de ligne des paragraphes courants à ~68 caractères, et porter le rythme
  interne de la colonne de droite de 32 à 48 px. En attente, le contenu de cette section
  devant changer avec le déplacement des liens sociaux.
