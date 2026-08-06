<template>
  <section class="profile-section">
    <div class="profile-avatar">
      <OrganismsCharacterPanel/>
    </div>
    <div class="profile-content">
      <p
          v-for="(line, index) in profileDescription"
          :key="index"
          class="profile-line"
          :class="{ 'profile-line--secondary': index >= 2 }"
      >
        {{ line }}
      </p>

      <ul class="contact-list">
        <!-- L'icône tient lieu de puce : décorative, le texte porte déjà l'information. -->
        <li class="contact-item">
          <img src="/icons/cv/location.svg" alt="" aria-hidden="true" class="contact-bullet"/>
          <span>{{ t('profile.contact.location') }}</span>
        </li>

        <!-- Un lien tel: en toutes circonstances — c'est ce qui sert sur un
             téléphone. Là où un vrai pointeur existe, composer le numéro n'a
             aucun sens : le clic copie alors le numéro au lieu d'appeler. -->
        <li class="contact-item contact-item--phone">
          <a :href="`tel:${PHONE_E164}`" class="contact-link" @click="onPhoneClick">
            <img src="/icons/cv/phone.svg" alt="" aria-hidden="true" class="contact-bullet"/>
            <span>{{ PHONE_DISPLAY }}</span>
            <Icon
                name="material-symbols:content-copy-outline"
                class="contact-copy"
                aria-hidden="true"
            />
          </a>
          <!-- role="status" : la confirmation est annoncée aux lecteurs d'écran,
               que le tooltip soit visible ou non. -->
          <span
              class="contact-tip"
              :class="{ 'contact-tip--pinned': feedback !== 'idle' }"
              role="status"
          >
            {{ tipLabel }}
          </span>
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

      <div class="profile-cta">
        <!-- role="status" : un lecteur d'écran annonce le changement si la disponibilité bascule. -->
        <span
            class="availability-chip"
            :class="isAvailable ? 'availability-chip--on' : 'availability-chip--off'"
            role="status"
        >
          <span class="availability-dot" aria-hidden="true"/>
          {{ isAvailable ? t('profile.availability.available') : t('profile.availability.unavailable') }}
        </span>

        <!-- Le montant porte l'accent par le seul contraste de taille : pas de
             cadre, la ligne compte déjà une puce et un bouton. -->
        <p class="rate">
          <span class="rate-amount">{{ DAILY_RATE }}</span><span class="rate-unit">{{ t('profile.rate.perDay') }}</span>
        </p>

        <a :href="`mailto:${EMAIL}`" class="hire-button">
          {{ t('profile.contact.hireMe') }}
          <Icon name="material-symbols:arrow-outward" class="hire-button-icon" aria-hidden="true"/>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, ref} from 'vue'

const {t} = useI18n()

const profileDescription = computed(() => [
  t('profile.description.line1'),
  t('profile.description.line2', {years: devExperienceYears()}),
  t('profile.description.line3'),
])

const PHONE_DISPLAY = '06 68 51 07 78'

/** Format E.164 pour le lien tel: — le seul que composent tous les systèmes. */
const PHONE_E164 = '+33668510778'

const EMAIL = 'cdurcy@gmail.com'

/** Espace insécable avant le symbole : la typographie française l'impose,
 et il empêche le montant de se couper en fin de ligne. */
const DAILY_RATE = '500 €'

/** Bascule manuelle de la disponibilité affichée dans la chip. */
const isAvailable = true

/** Ce que le tooltip raconte, selon ce qui vient de se passer. */
const feedback = ref<'idle' | 'copied' | 'failed'>('idle')

/** Vide au repos : le tooltip ne confirme, il n'invite pas. C'est l'icône de
 copie apparaissant au survol qui signale l'action. */
const tipLabel = computed(() => {
  if (feedback.value === 'copied') return t('profile.contact.phoneCopied')
  if (feedback.value === 'failed') return t('profile.contact.phoneCopyFailed')
  return ''
})

let resetTimer: ReturnType<typeof setTimeout> | undefined

/**
 * Vrai seulement là où composer un numéro ne sert à rien et où le presse-papier
 * est accessible. `pointer: fine` écarte les tablettes tactiles, qui savent
 * appeler ; `navigator.clipboard` est absent hors contexte sécurisé.
 */
const canCopyInstead = () =>
    !!navigator.clipboard &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches

const onPhoneClick = async (event: MouseEvent) => {
  if (!canCopyInstead()) return

  event.preventDefault()
  clearTimeout(resetTimer)

  try {
    await navigator.clipboard.writeText(PHONE_DISPLAY)
    feedback.value = 'copied'
  } catch {
    // Le presse-papier peut être refusé par la politique de permissions. On le
    // dit plutôt que de laisser croire à une copie qui n'a pas eu lieu.
    feedback.value = 'failed'
  }

  resetTimer = setTimeout(() => {
    feedback.value = 'idle'
  }, 2000)
}

onBeforeUnmount(() => clearTimeout(resetTimer))

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
</script>

<style scoped>
.profile-section {
  display: flex;
  /* Gouttière de colonne, pas d'entrée : --space-entry laissait le texte
     coller à l'avatar. Le token retombe seul aux valeurs verticales une
     fois la section repliée en pile (voir assets/css/main.css). */
  gap: var(--space-column);
  align-items: flex-start;
  flex-wrap: wrap;
}

.profile-avatar {
  /* Largeur fixe et alignement à gauche : la photo se cale sur le même axe
     que les titres de section, seul axe de la page depuis la suppression
     des cartes. */
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.profile-content {
  /* Le padding de 30px datait des cartes de section supprimées : il décalait
     le texte de 30px vers le bas et vers la droite, désalignant les deux
     colonnes. */
  flex: 1 1 360px;
}

.profile-line {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 var(--space-grid) 0;
}

/* ── Ligne de contact : coordonnées puis profils externes, même grammaire.
      Les deux premières puces sont des SVG de public/icons/cv/, les trois
      suivantes des icônes Iconify — toutes au vert d'accent. ── */
.contact-list {
  list-style: none;
  /* 48 px et non 32 : --space-column nomme une gouttière horizontale mais porte
     ici le rythme vertical. Sa dégression à 32 puis 24 px sur petits écrans est
     voulue — moins d'air quand la place manque. */
  margin: var(--space-column) 0 0 0;
  padding: 0;
  /* En ligne, pas en colonne : les cinq entrées tiennent sur un rang de 554 px
     jusqu'à 700 px de viewport, et se replient d'elles-mêmes en dessous. */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 28px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  /* Gras sur toute la ligne, coordonnées comprises : elle s'affirme face aux
     paragraphes qui restent en 400. Les chasses de Mona Sans ne varient pas
     avec le poids, donc la ligne garde exactement sa largeur. */
  font-weight: 900;
  color: rgba(255, 255, 255, 0.85);
}

.contact-link {
  /* Ancre de l'icône de copie, qui se place à droite du libellé sans peser
     dans le flux. */
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

/* Le gras étant désormais permanent, le survol ne se signale que par la
   couleur — rien ne change de graisse sous le curseur. */
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

.contact-bullet {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  /* Les SVG sont déjà au vert #42b883 : aucune recoloration nécessaire. */
}

/* ── Téléphone : copie au clic là où le survol existe ── */
.contact-item--phone {
  /* Ancre du tooltip, qui vit hors du lien pour rester hors de sa zone cliquable. */
  position: relative;
}

.contact-copy {
  /* Hors du flux, dans la gouttière de 28px qui suit l'entrée : réservée dans le
     flux, elle creusait un trou de 27px au repos et déséquilibrait la ligne.
     Ici elle n'occupe rien et ne décale donc rien en apparaissant. */
  position: absolute;
  left: 100%;
  margin-left: 5px;
  width: 15px;
  height: 15px;
  opacity: 0;
  color: rgba(255, 255, 255, 0.5);
  transition: opacity 0.2s ease;
}

.contact-tip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  padding: 3px 8px;
  border-radius: 5px;
  background: #1e1e1e;
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.2px;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.75);
  opacity: 0;
  /* Le tooltip ne doit jamais intercepter le pointeur : il se placerait entre
     le curseur et le lien, et le survol se mettrait à clignoter. */
  pointer-events: none;
  transition: opacity 0.2s ease;
}

/* Épinglé après un clic : la confirmation s'affiche même curseur parti. */
.contact-tip--pinned {
  opacity: 1;
  color: #42b883;
  border-color: rgba(66, 184, 131, 0.35);
}

/* Seule l'icône répond au survol : le tooltip ne paraît qu'après un clic, via
   --pinned. Rien de tout cela sur un appareil tactile, où le lien tel: reprend
   son rôle. */
@media (hover: hover) and (pointer: fine) {
  .contact-item--phone:hover .contact-copy {
    opacity: 1;
  }
}

/* Rattrapage optique. `align-items: center` aligne les boîtes au pixel, mais le
   centre d'une line-box n'est pas le centre du texte : la boîte réserve la place
   des descendantes, qu'aucun de ces cinq libellés ne contient. Les glyphes
   occupent donc la moitié haute et les puces portaient 2,5 px trop bas. */
.contact-bullet,
.contact-bullet-icon,
.contact-copy {
  transform: translateY(-2px);
}

/* ── Appel à l'action : disponibilité + tarif + bouton ── */
.profile-cta {
  /* Une hauteur unique pour la puce et le bouton : ils se lisent comme deux
     objets de même rang, et non comme un bouton qui écrase une étiquette. */
  --cta-height: 32px;
  display: flex;
  align-items: center;
  /* Même gouttière que la ligne de contact au-dessus : les deux rangées se
     lisent sur la même trame plutôt que chacune sur la sienne. */
  gap: 12px 28px;
  flex-wrap: wrap;
  margin-top: var(--space-column);
}

.availability-chip {
  display: inline-flex;
  align-items: center;
  min-height: var(--cta-height);
  gap: 8px;
  padding: 5px 12px 5px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
}

/* ── Tarif journalier ── */
.rate {
  /* Alignement sur la ligne de base : le suffixe s'assoit sur le montant
     plutôt que de flotter à mi-hauteur. */
  display: inline-flex;
  align-items: baseline;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.rate-amount {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.rate-unit {
  /* 2 px pour desserrer la barre oblique du symbole : à 22 px contre 13, les
     deux glyphes se télescopent sans ce dégagement. */
  margin-left: 2px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}

.availability-chip--on {
  color: #42b883;
  background: #101b16;
  border-color: rgba(66, 184, 131, 0.3);
}

.availability-chip--off {
  color: #e05260;
  background: #1f1113;
  border-color: rgba(224, 82, 96, 0.3);
}

.availability-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  /* Le halo est porté par box-shadow : il s'anime sans déplacer la mise en page. */
  animation: availability-pulse 2s ease-out infinite;
}

@keyframes availability-pulse {
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 1;
  }
  70% {
    box-shadow: 0 0 0 6px transparent;
    opacity: 0.85;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
    opacity: 1;
  }
}

/* Le clignotement peut gêner : on le neutralise si l'utilisateur l'a demandé. */
@media (prefers-reduced-motion: reduce) {
  .availability-dot {
    animation: none;
  }
}

.hire-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* Hauteur imposée plutôt que déduite du padding vertical : c'est ce qui la
     verrouille sur celle de la puce quelle que soit la police. */
  min-height: var(--cta-height);
  padding: 0 18px;
  border-radius: 8px;
  /* Le vert d'accent assombri à 70 %. Sur #42b883, un libellé blanc de 14 px ne
     donne que 2,5:1 — très en dessous des 4,5:1 attendus, et le survol
     éclaircissant tombait à 1,89. Ce vert-ci porte le blanc à 4,77:1. */
  background: #2e815c;
  /* L'icône suit par currentColor. */
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.hire-button-icon {
  width: 16px;
  height: 16px;
}

.hire-button:hover {
  /* S'éclaircit sans repasser sous le seuil : 3,79:1 au pointeur. */
  background: #359369;
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .profile-section {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .profile-avatar {
    flex: none;
    width: 100%;
  }

  .profile-content {
    flex: none;
    padding: 0;
    min-height: unset;
  }

  .profile-line--secondary {
    display: none;
  }
}
</style>
