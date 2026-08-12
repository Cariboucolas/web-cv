# Refonte du contenu — cap recruteurs

**Date :** 2026-08-12
**Statut :** design validé ; chantier A implémenté sur la branche `feat/profile-banner-rework`
(`dec329c`), chantiers B à E à faire

## Problème

Les lots 1 à 3 ont refait la forme du site sans jamais toucher au fond. Le résultat est un
déséquilibre visible dans le dépôt lui-même : trois lots de refonte UI en six semaines — champ de
cubes réactif au curseur, cadres d'appareil en unités de container query, échelle d'espacement
explicite — pendant que les six projets pointent tous sur `link: '#'` et que deux d'entre eux
n'ont aucune capture.

Ce déséquilibre trahissait la finalité réelle du site jusqu'ici : un terrain de jeu technique avec
un vernis de vitrine passive. Cette finalité a changé. Le site doit maintenant convaincre, et le
contenu devient le chantier.

L'état des lieux relève cinq défauts de fond :

- **Chaque description de projet commence par les mêmes trois mots**, « Conception et développement
  de… », six fois sur six. C'est le registre de l'activité, pas celui du résultat.
- **Les chiffres existent et sont bons, mais ils sont en fin de phrase** : 10K utilisateurs/mois,
  5K/mois, 2K/jour, 15K utilisateurs, 500+ postes administrés.
- **Les descriptions de projets sont le copier-coller des `highlights` d'expériences**, et les deux
  copies ont déjà divergé : dans Expériences, Winkyverse porte « Implémentation KYC » sans la
  levée ; dans Projets, il porte la levée sans le KYC. Aucun outil ne signale cette dérive.
- **Le site s'adressait à deux publics à la fois** : le bouton disait « Embauchez-moi » pendant que
  le bandeau affichait un TJM.
- **Deux chiffres d'ancienneté cohabitaient** sans être articulés : « {years} ans » dans le profil,
  « plus de 15 ans dans l'IT » dans l'à-propos.

## Le cadre

**Ce qu'est le site :** un CV en ligne, sous forme dynamique. Pas une vitrine d'entreprise.

**Pour qui :** les recruteurs avant tout.

**Ce qu'il doit produire :** une mission longue en régie de préférence, un CDI si l'opportunité
parle. Les conditions et surtout le projet décident, pas le statut.

**Le principe directeur, qui a tranché la moitié des arbitrages : ne rien préempter.** Quand la
cible est floue, le bon critère n'est pas « qu'est-ce qui attire le plus ? » mais « qu'est-ce qui
exclut le moins ? ». Les deux questions ont des réponses différentes, et c'est la seconde qui
décide ici. Afficher un TJM exclut catégoriquement le recruteur en CDI ; son absence n'exclut
personne et coûte au pire un échange de mail avec un recruteur en régie. L'asymétrie est totale.

**Critère transversal :** la lecture doit être rapide.

**Rythme :** des après-midis successives, une PR chacune.

## Décisions validées

### 1. Le bandeau profil cesse de trancher le statut — chantier A

**Le tarif journalier quitte le site CV.** `DAILY_RATE = '500 €'` est retiré de `ProfileSection`,
avec ses trois règles `.rate*` et la clé i18n `profile.rate`. Il vivra sur le support CDCRAFT, où
il s'appliquera **à 400 €**.

**Le mot « freelance » quitte la première ligne de description.** Un titre doit dire ce qu'on fait,
pas sous quel régime on facture. Un recruteur en CDI qui lit « freelance » en première ligne
classe la page avant d'arriver aux projets ; un acheteur de régie ne sera pas rebuté par son
absence, puisqu'il la déduit du parcours.

**Le bouton passe de « Embauchez-moi » à « Parlons de votre projet »** (clé `profile.contact.hireMe`
renommée en `cta`). C'est la seule des formulations envisagées qui parle de ce que l'interlocuteur
a plutôt que de ce qu'on veut, et un recruteur a toujours un projet à défendre — un poste à
pourvoir se raconte comme une équipe et un produit.

**Les deux anciennetés fusionnent en une affirmation unique** : « 5 ans de développement en équipes
agiles sur des produits à forte audience, adossés à 15 ans en IT ». Présentés comme deux chiffres
séparés, ils se lisaient comme une hésitation ; articulés, le parcours helpdesk → sysadmin → dev
devient l'argument qu'il est.

**La pastille de disponibilité reste.** Elle a brièvement failli disparaître par un enchaînement de
décisions localement correctes : on l'avait supprimée au motif que le bouton porterait la
disponibilité, puis le bouton a cessé d'en parler. À côté d'un CTA qui ne dit plus « disponible »,
elle ne répète rien, et l'information est à haute valeur pour le lecteur visé.

**Aucune ligne de preuve chiffrée n'est ajoutée au bandeau.** Elle avait été décidée pour
contrebalancer le tarif — « afficher un prix tôt n'est tenable que si la valeur est posée aussi
tôt » — puis le tarif a été retiré et la contrepartie a survécu à ce qu'elle compensait. Sans prix
à justifier, trois chiffres sans référent désorientent au lieu de prouver : levés par qui, pour
quel projet, mesurés où. La preuve chiffrée appartient aux cartes projets, où elle a son contexte
(voir décision 3).

### 2. Les expériences portent la trajectoire — chantier B

**Les trois entités Decathlon sont regroupées en une relation continue depuis 2021**, les
périmètres passant en sous-niveaux via la structure `subProjects` qui existe déjà. C'est le
changement le plus rentable de toute la refonte. Les données actuelles éclatent WeParis
(2021-2023), MayDay (2023-2025) et InStore (2025-) en trois entrées : un lecteur qui balaie voit
trois missions courtes chez trois entités, quand la réalité est un même client depuis quatre ans.
Le découpage actuel détruit le meilleur argument de la page, parce qu'il répond « non » à la seule
question que pose un recruteur — est-ce qu'on le garde ?

**Brocorp reste la structure contractante de 2022, avec ses deux clients finaux nommés** : Mainbot
(Winkyverse) et EthernalHorizons (Mechachain). Brocorp était une structure officieuse où le
titulaire était le binôme du gérant : la revendiquer comme « ma société » serait une approximation
qui se retourne en entretien. La présenter exactement, en nommant deux clients servis la même
année, donne ce que la revendication cherchait — une capacité de charge.

**Les trois expériences pré-dev sont condensées en un bloc compact.** Infodis (2005-2007),
Intersport (2008-2016) et Biscuiterie Poult (2016-2020) occupent aujourd'hui trois entrées sur
sept, avec trois à quatre puces chacune, sur des sujets sans rapport avec le poste visé —
masterisation de postes, GLPI, Nagios. Elles deviennent une ligne du type « 15 ans en IT :
helpdesk → administration système & réseaux », une ou deux puces de Poult conservées. Les 15 ans
sont un argument, pas un CV parallèle.

**Un repli progressif a été envisagé pour ce bloc, et écarté.** Il aurait été *cohérent* avec le
design system : la règle qui interdit tout état de survol aux cartes d'expérience est une règle
d'honnêteté d'affordance, pas une interdiction de l'interaction, et un bloc réellement dépliable
aurait droit à un état visuel. Il est écarté pour trois raisons. Il introduit un second idiome
d'interaction dans une section qui n'en a aucune, brouillant le signal actuel — ce qui s'ouvre,
c'est un projet. Il coûte un état, un `aria-expanded`, un libellé dans deux langues et un
comportement mobile. Surtout, il n'atteint pas l'objectif : un lecteur en lecture rapide ne
déplie pas, donc le contenu est masqué de fait. Condenser oblige à choisir ce qui compte et
produit la lecture rapide ; replier délègue le choix à un lecteur qui ne le fera pas. Le repli
brille quand le contenu caché est précieux pour une minorité, pas quand il est moins important
pour tous.

**Plus aucune redite avec la section Projets.** Cette section porte la trajectoire et le contexte
employeur ; la preuve chiffrée vit ailleurs.

### 3. Les projets portent le résultat — chantier C

**Division du travail entre les deux sections.** Projets porte le résultat et la preuve chiffrée,
Expériences porte la trajectoire. Ce n'est pas un arbitrage esthétique : deux copies d'un même
fait divergent silencieusement, comme l'a déjà fait Winkyverse, et aucun typecheck ni lint ni
capture ne le signale. Une seule adresse par fait rend la dérive impossible.

**Deux formats, deux registres.** La carte (`shortDescription`, deux lignes) met le chiffre en
tête : elle est lue en balayage, et y placer le contexte d'abord dépense la seule ligne visible.
La modale (`description`) déroule le récit en trois temps — problème, intervention, résultat —
et c'est là que le lecteur vérifie que le chiffre n'est pas du décor.

**Winkyverse passe de « 10M+ euros » à 24,5 M€, avec le rôle cadré.** Le chiffre affiché
sous-estimait de plus de moitié. Ce qui se vend ici n'est pas le succès du token mais d'avoir tenu
une plateforme de vente et un KYC sous une charge de 24,5 M€ en quelques semaines — une preuve
d'ingénierie, vraie quoi qu'il soit advenu du cours ensuite. Cadrer le rôle protège mieux que
minorer le chiffre, qui laisserait sans défense face à un interlocuteur connaissant le dossier.

**Mechachain nomme EthernalHorizons comme client.**

**Winkyverse et Mechachain mettent en avant leur contexte partagé** — de fortes contraintes en peu
de temps — plutôt que de s'opposer par l'angle. Ce sont deux clients distincts servis la même
année sur des exercices proches.

**`mc` et `mechachain` gardent leur icône `material-symbols`**, faute de captures. La grille reste
hétérogène, et c'est assumé.

**Le CTA « Voir le projet → » disparaît là où `link` est vide.** Une flèche qui ne mène nulle part
est pire que pas de flèche : le visiteur clique, rien ne se passe, et il conclut que le site est
inachevé — l'inverse exact du signal recherché quand on vend de la rigueur technique.

### 4. L'ordre des sections suit l'ordre du CV — chantier D

**Nouvel ordre : Profil → Expériences → Projets → Compétences → À propos**, les ancres de
navigation suivant. Les deux extrémités étaient mal placées : « À propos », le bloc le moins
scannable du site avec ses quatre paragraphes de prose continue, occupait la deuxième position là
où l'attention est maximale, pendant que Projets, qui doit porter la preuve, fermait la page. Un
recruteur lit un CV dans l'ordre du CV : qui es-tu, où as-tu travaillé, qu'as-tu produit. Descendre
« À propos » ne lui retire rien — celui qui arrive jusque-là est déjà intéressé, et c'est
exactement le lecteur à qui un texte long profite.

**« À propos » est réduit à deux paragraphes.** Ses paragraphes 3 et 4 disent aujourd'hui la même
chose : Clean Code et pratiques artisanales d'un côté, « double expertise » et « valeur ajoutée
unique » de l'autre. Il garde le seul endroit du site où le titulaire parle à la première personne,
mais cesse de se répéter.

### 5. Le nettoyage — chantier E

**Les sept `cover_*.svg` sont supprimés.** Aucun n'est référencé, y compris `cover_rsb.svg` dont le
projet n'existe nulle part ailleurs dans le dépôt. Ce ne sont d'ailleurs pas des visuels : 800
octets chacun, tous le même gabarit — un rectangle `#111` avec un dégradé radial vert.

**`interface Project` est dédupliquée.** Elle est définie deux fois, `ProjectsSection.vue:109` et
`ProjectModal.vue:72`, sans type partagé — il n'existe ni `app/types/` ni `app/composables/`. Nuxt
auto-importe les composants mais pas les types, donc la voie de moindre résistance était de
recopier l'interface. Les deux copies peuvent diverger sans que `pnpm typecheck` s'en plaigne,
chacune étant cohérente localement.

**La dérogation aux tests est écrite dans `CLAUDE.md`.** Ce dépôt n'aura pas de suite de tests, et
c'est un écart assumé aux règles globales du poste de travail. Un site d'une page dont la
quasi-totalité du risque est visuel se teste mal en unitaire : ce qui casse ici, ce sont des pixels,
et la vérification par capture headless aux deux breakpoints tient déjà ce rôle. Le seul îlot qui
mériterait des tests est `app/utils/career.ts`, trois fonctions de date pures avec un piège
d'anniversaire déjà commenté — mais tant que la contradiction n'est pas écrite, elle se rejoue à
chaque session.

### 6. Les faits corrigés par la recherche

**Winkyverse / Mainbot.** L'ICO a levé 24,5 M€, la plus grosse ICO française de 2021, dont une
dernière tranche de 10 M€ écoulée en moins de 24 heures — d'où probablement le « 10M+ » affiché.
Mainbot est une startup incubée à l'École Polytechnique, le token $WNK tournait sur Ethereum, et la
vente s'est faite en trois phases (0,006 € / 0,008 € / 0,01 €). **Le projet a mal vieilli** : les
cotations annoncées sur Kucoin et Gate.io n'ont pas été tenues, les NFT de terrains se sont
effondrés, et une partie de la presse crypto qualifie l'ICO de controversée. Le risque est assumé,
au motif que toute plateforme ICO finit controversée — chacun croit à son projet, qui finit en
spéculation. C'est le cadrage du rôle qui protège.

**Mechachain.** Le client était EthernalHorizons, société française de jeux mobiles sur Ethereum.
Kevuru Games était l'autre prestataire, le studio de développement du jeu, et il a ensuite racheté
EthernalHorizons — d'où la confusion entre le donneur d'ordre et le repreneur.

## Ordre des chantiers

**A → B → C → D → E.**

A est le meilleur rapport impact/effort et le plus petit : le bandeau est lu par tous les visiteurs.
C est le plus lourd de loin — six projets, deux formats, deux langues — et le placer en troisième
signifie que le site lit déjà mieux avant d'attaquer le gros morceau. E est de l'écriture comptable
et referme la série.

## Vérifications

Chaque chantier est vérifié par capture headless à 1440 px et 390 px via `scripts/shot.mjs`, avec
`--still` — sans quoi les sections non révélées sortent noires. Chrome headless plafonne son
viewport à ~485 px sur macOS, ce qui interdit `chrome --headless --screenshot` pour le breakpoint
mobile.

`pnpm typecheck` et `pnpm biome check` passent avant chaque commit. La parité des clés i18n entre
`fr.json` et `en.json` est vérifiée à chaque modification de traduction.

Le chantier A a fait apparaître un défaut que seule la capture mobile révélait : la ligne de preuve
alors en place passait sur deux rangs sous 390 px et son séparateur ouvrait la seconde ligne, où il
se lisait comme une puce. La règle générale vaut au-delà de ce cas : un séparateur de liste se pose
en `::after` sur l'élément précédent, jamais en `::before` sur le suivant, sans quoi il peut ouvrir
un rang quand la liste passe à la ligne.

## Points restés ouverts

- **Le libellé `projects.viewProject`.** Si aucun des six projets n'obtient de lien réel, « Voir le
  projet → » devient mort partout. Deux issues : le supprimer, ou le remplacer par « Voir le
  détail » qui ouvre la modale. À trancher au chantier C.
- **La nature des « transferts »** cités comme contrainte partagée entre Winkyverse et Mechachain :
  transferts de tokens, de fonds, ou autre chose. Précision nécessaire pour écrire le chantier C.

## Points réversibles

- **Le retrait du tarif** est un choix de préemption, pas de pudeur. Si la cible se resserre un jour
  sur la régie seule, le réafficher redevient défendable — il filtre en amont et pose un cadre.
- **Le regroupement Decathlon** suppose que la continuité prime sur le détail des périmètres. Si un
  recruteur devait chercher une entité précise, les sous-niveaux restent lisibles.

## Hors périmètre

**CDCRAFT.** L'EURL existe depuis janvier 2026 et n'a servi jusqu'ici qu'à porter la fin des
missions MC et MGM. Elle aura son propre support, et le tarif de 400 € y vivra. Direction retenue
quand le moment viendra : une page `/cdcraft` sur ce site plutôt qu'un second dépôt — le design
system, l'i18n et le pipeline Firebase sont déjà là, alors qu'un site séparé les redemande tous.
Ouvrir ce second support pendant la refonte du CV doublerait le périmètre.

**Le repli progressif des stacks techniques.** L'idée est bonne mais mal placée sur les expériences
pré-dev. Les onze technologies listées par mission récente sont, elles, du détail réellement
précieux pour une minorité — un recruteur technique — et du bruit pour tous les autres : c'est là
que le repli aurait du sens. Chantier à part, pas celui-ci.
