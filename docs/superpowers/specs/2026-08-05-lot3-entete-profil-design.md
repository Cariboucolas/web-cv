# Refonte UI — lot 3 : en-tête et bloc profil

**Date :** 2026-08-05
**Statut :** validé, non implémenté

## Objectif

Solder les deux chantiers que la spec du lot 2 avait explicitement renvoyés hors périmètre :
descendre les trois liens sociaux de la barre d'en-tête vers la liste de contact du profil, et
aérer le bloc profil. Le second attendait le premier — la liste de contact ne pouvait pas être
retouchée tant qu'on ignorait ce qui allait la rejoindre.

## Périmètre

| Fichier | Rôle |
|---|---|
| `components/molecules/HeaderBar.vue` | l'en-tête perd ses trois réseaux |
| `components/organisms/ProfileSection.vue` | la ligne de contact les accueille, le rythme s'ouvre |
| `components/atoms/SocialSquare.vue` | supprimé, plus aucun référent |
| `package.json` | `@iconify-json/simple-icons` passe en dépendance locale |

## Décisions validées

### 1. L'en-tête ne garde que ce qui n'appartient à personne d'autre

Les entrées `github`, `linkedin` et `malt` quittent `HeaderBar`. Ne restent en haut de page que
le téléchargement du CV et le changement de langue — deux actions qui portent sur le document
lui-même, pas sur la personne. Tout ce qui décrit la personne descend dans le profil, qui est
son lieu.

Le tableau `socialLinks` est renommé **`headerActions`**. Le nom actuel ment déjà aujourd'hui :
il contient le téléchargement du CV, qui n'a jamais été un réseau social. Une fois les trois
réseaux partis, il ne resterait que le mensonge.

La règle `.header-social` et son carré de 40 px ne bougent pas. Un seul carré subsiste à côté de
`LanguageIndicator` ; la mise en page de l'en-tête est inchangée.

### 2. La liste de contact passe à l'horizontale

`.contact-list` quitte `flex-direction: column` pour `row`, avec `flex-wrap: wrap` et
`gap: 12px 28px`. Les cinq entrées se suivent sur une même ligne et se replient d'elles-mêmes
quand la largeur manque.

Mesuré sur maquette : la ligne complète fait **554 px** et tient d'un seul tenant jusqu'à 700 px
de viewport. Elle se replie sur deux lignes en dessous, ce qui est le comportement recherché.

Trois autres dispositions avaient été envisagées puis écartées — les réseaux en lignes de liste
supplémentaires, en rangée de carrés sous la liste, ou alignés sur la ligne du bouton
« Embauchez-moi ». Aucune ne les mettait dans le même flux que les coordonnées, ce qui était le
point : un profil ne se lit pas en deux inventaires séparés.

### 3. Une seule grammaire pour les cinq entrées

Chaque entrée est bâtie sur la même règle : une puce de 18 px, puis un libellé. Toulouse et le
téléphone gardent leurs SVG de `public/icons/cv/` ; GitHub, LinkedIn et Malt reçoivent leur
pictogramme suivi de leur nom, le tout enveloppé dans un `<a>` externe. Les icônes de réseaux
prennent le vert `#42b883` des puces existantes, pour que la ligne se lise comme un ensemble et
non comme deux moitiés. Le survol vire au vert sur le libellé entier.

Le libellé n'est pas décoratif : il résout un défaut mesuré. L'icône `simple-icons:malt` a bien
un viewBox carré de 24×24, comme GitHub et LinkedIn, mais son dessin n'occupe qu'une bande
centrale d'environ 8 unités sur 24 — c'est un logotype couché, pas un pictogramme. À 18 px de
rendu, le trait fait 6 px de haut et rend un pâté illisible à côté des deux autres marques. Il
faudrait le rendre à ~48 px de large pour l'amener à leur hauteur optique, ce qui déséquilibrerait
la ligne autrement.

**Adossée à son libellé, l'icône devient décorative et n'a plus à porter le sens seule.** Le
défaut cesse d'en être un sans qu'on ait à produire un asset de substitution ni à s'écarter de la
charte de marque.

### 4. Le rythme s'ouvre, la mesure de ligne reste libre

Les deux marges internes de la colonne droite — `.contact-list` et `.profile-cta` — passent de
`--space-entry` (32 px) à **`--space-column`** (48 px).

Le token réutilisé désigne une gouttière horizontale et sert ici en vertical. C'est assumé
plutôt que corrigé par un token neuf : il vaut exactement la valeur voulue en desktop, et sa
dégression à 32 px puis 24 px sur petits écrans va dans le bon sens — on veut moins d'air quand
la place manque, pas plus. Un commentaire l'explicitera, comme le fait déjà `.profile-section`
pour son `gap`.

**Aucune borne de mesure n'est posée sur `.profile-line`.** C'est un écart assumé par rapport à
la spec du lot 2, qui prescrivait de « borner la mesure de ligne des paragraphes ». Trois
variantes ont été montées et capturées avant de trancher :

| Variante | Bas colonne gauche | Bas colonne droite | Écart | Bloc de texte |
|---|---|---|---|---|
| Liste horizontale, sans borne | 405 px | 388 px | **17 px** | 655 px — rapport 3,6:1 |
| + borne ~72 caractères (505 px) | 405 px | 417 px | **12 px** | 505 px — rapport 2,8:1 |
| + borne ~60 caractères (420 px) | 405 px | 474 px | **69 px** | 420 px — rapport 2,3:1 |

L'équilibre vertical est donc **déjà atteint sans borne**, à 17 px près. Borner ne gagne que
5 px d'alignement, et coûte un vide d'environ 250 px à droite du profil : le texte s'arrêterait à
x≈950 quand la section « À propos de moi » juste en dessous court jusqu'à x=1203. Le profil
décrocherait visuellement du reste de la page pour un bénéfice invisible.

Le critère retenu était l'équilibre entre la colonne avatar et la colonne texte, pas le confort
de lecture dans l'absolu. Sur ce critère, la borne ne paie pas.

### 5. Deux nettoyages dans la zone touchée

**`components/atoms/SocialSquare.vue` est supprimé.** Il n'est référencé nulle part :
`HeaderBar` a réimplémenté son propre carré de 40 px au lieu de réutiliser l'atome, qui en fait
60. Le lot 3 ne le ressuscite pas — les réseaux deviennent des entrées icône + libellé, pas des
carrés.

**`@iconify-json/simple-icons` passe en dépendance locale.** Le paquet est absent de
`package.json`, où seul `material-symbols` figure. Le journal de `pnpm build` le dit sans
ambiguïté :

```
ℹ Nuxt Icon server bundle mode is set to `local`
✔ Nuxt Icon discovered local-installed 1 collections: material-symbols
```

Le mode est bien `local` — le preset `firebase` ne contient aucun des mots-clés « edge » que
`@nuxt/icon` recherche. Mais une seule collection est découverte : les trois icônes de réseaux
retombent sur `fallbackToApi` et sont résolues au rendu via `api.iconify.design`.

**C'est le serveur qui émet cet appel, pas le navigateur du visiteur** : en SSR, `@nuxt/icon`
livre le SVG déjà inliné dans le HTML. Le gain n'est donc pas une requête épargnée au visiteur,
mais une dépendance externe de moins au rendu en production, et la latence qui va avec. Les
descendre dans le profil ne change pas la nature du problème, mais c'est le moment de le régler.

### 6. Ajustements de la ligne d'action, ajoutés en cours de route

Décidés après l'implémentation des cinq décisions ci-dessus, en travaillant la même section.

**Le tarif journalier rejoint la ligne d'action**, entre la puce de disponibilité et le bouton :
« 500 € » en display 22 px, « /jour » en 13 px atténué, les deux alignés sur la même ligne de base
pour que le suffixe s'assoie sur le montant au lieu de flotter. Pas de cadre — la ligne compte déjà
une puce et un bouton, un troisième objet encadré l'aurait alourdie ; le contraste de taille porte
seul l'accent. Clé `profile.rate.perDay` en FR et EN, montant en constante avec espace insécable.

**Le bouton reçoit une flèche sortante** (`material-symbols:arrow-outward`) et **sa hauteur est
verrouillée sur celle de la puce** par une variable `--cta-height` portée par `.profile-cta`,
appliquée en `min-height`. La hauteur est imposée plutôt que déduite du padding vertical : elle
reste alignée même si la police change.

**La gouttière de la ligne d'action reprend celle de la ligne de contact** (`12px 28px` au lieu de
`14px`) : les deux rangées se lisent sur la même trame.

**Le libellé passe en blanc gras sur un vert assombri.** Le blanc était demandé ; sur `#42b883` il
ne donne que **2,50:1**, là où un texte de 14 px en réclame 4,5:1 — et le survol éclaircissant
vers `#4fd39a` tombait à **1,89:1**, dégradant la lisibilité au moment même où le pointeur la
sollicite. Le poids 800 n'ouvre aucune dispense : celle de WCAG pour le gras commence à 18,7 px.
Le fond passe donc au vert d'accent assombri à 70 %, `#2e815c`, qui porte le blanc à **4,77:1** ;
le survol remonte à `#359369`, soit 3,79:1.

**Les puces de la ligne de contact sont remontées de 2 px.** `align-items: center` alignait les
boîtes au pixel — mesuré, centre de puce et centre de span à 291,6 px tous les deux — mais le
centre d'une line-box n'est pas le centre du texte : la boîte réserve la place des descendantes,
qu'aucun des cinq libellés ne porte. Les glyphes occupaient donc la moitié haute et les dessins
portaient 2,5 px trop bas. `line-height` n'y changeait rien, le demi-leading se répartissant
également de part et d'autre. Après correction, l'écart tombe à 0–0,5 px.

## Vérifications

- [ ] Desktop ≥ 1200 px : la ligne de contact tient d'un seul tenant, les deux colonnes se
      terminent à moins de 20 px l'une de l'autre
- [ ] Entre 700 et 1100 px : la ligne tient toujours sur un rang
- [ ] En dessous de 700 px : la ligne se replie proprement, aucune entrée tronquée
- [ ] L'en-tête ne montre plus que le téléchargement du CV et l'indicateur de langue
- [ ] Les trois liens externes ouvrent bien leur profil dans un nouvel onglet
- [ ] `pnpm build` passe, et son journal annonce
      `discovered local-installed 2 collections: material-symbols, simple-icons`
- [ ] Puce de disponibilité et bouton font la même hauteur (32 px)
- [ ] Le libellé blanc du bouton tient 4,5:1 au repos comme au survol
- [ ] Les puces de contact sont alignées optiquement sur les glyphes, à moins d'1 px

**Contrainte de méthode.** Chrome headless plafonne son viewport à ~485 px sur macOS, quelle que
soit la valeur passée à `--window-size` : une capture demandée à 380 px est un recadrage d'une
page rendue à 485 px, ce qui coupe les derniers pixels et fait passer un rendu correct pour un
débordement. `--headless=old` a le même plafond. Toute vérification en dessous de 485 px doit
donc passer par `Emulation.setDeviceMetricsOverride` via le protocole CDP — faisable sans
dépendance, Node 22 exposant `WebSocket` en global.

## Points réversibles

- La gouttière de la ligne de contact (`gap: 12px 28px`) et le seuil de repli qui en découle
- Le vert appliqué aux icônes de réseaux : les repasser en blanc atténué distinguerait les
  profils externes des coordonnées, au prix de l'unité de la ligne
- Le choix de `--space-column` plutôt qu'un token vertical dédié, si l'échelle d'espacement
  gagne d'autres usages verticaux à 48 px

## Hors périmètre

- **La mesure de ligne des paragraphes de `AboutSection`** : ils courent sur toute la largeur du
  conteneur, soit ~970 px, bien au-delà du profil. Si la question du confort de lecture se
  repose, c'est là qu'elle se posera — pas dans le profil.
- **La navigation de l'en-tête** : les quatre liens d'ancre ne changent pas.
- **Le carrousel projets** : ses cartes dépassent volontairement de leur conteneur, c'est son
  mécanisme de défilement.
