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
        <li v-for="item in contactItems" :key="item.key" class="contact-item">
          <!-- L'icône tient lieu de puce : décorative, le texte porte déjà l'information. -->
          <img :src="item.icon" alt="" aria-hidden="true" class="contact-bullet"/>
          <span>{{ item.label }}</span>
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

        <a :href="`mailto:${EMAIL}`" class="hire-button">
          {{ t('profile.contact.hireMe') }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed} from 'vue'

// @ts-expect-error - useI18n est auto-importé par @nuxtjs/i18n
const {t} = useI18n()

const profileDescription = computed(() => [
  t('profile.description.line1'),
  t('profile.description.line2', { years: devExperienceYears() }),
  t('profile.description.line3'),
])

const PHONE_DISPLAY = '06 68 51 07 78'

const EMAIL = 'cdurcy@gmail.com'

/** Bascule manuelle de la disponibilité affichée dans la chip. */
const isAvailable = true

const contactItems = computed(() => [
  {
    key: 'location',
    icon: '/icons/cv/location.svg',
    label: t('profile.contact.location'),
  },
  {
    key: 'phone',
    icon: '/icons/cv/phone.svg',
    label: PHONE_DISPLAY,
  },
])
</script>

<style scoped>
.profile-section {
  display: flex;
  gap: var(--space-entry);
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

/* ── Liste de contact : les SVG de public/icons/cv/ servent de puces ── */
.contact-list {
  list-style: none;
  margin: var(--space-entry) 0 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
}

.contact-bullet {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  /* Les SVG sont déjà au vert #42b883 : aucune recoloration nécessaire. */
}

/* ── Appel à l'action : disponibilité + bouton ── */
.profile-cta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: var(--space-entry);
}

.availability-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
}

.availability-chip--on {
  color: #42b883;
  background: rgba(66, 184, 131, 0.1);
  border-color: rgba(66, 184, 131, 0.3);
}

.availability-chip--off {
  color: #e05260;
  background: rgba(224, 82, 96, 0.1);
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
  padding: 9px 20px;
  border-radius: 8px;
  background: #42b883;
  color: #0a0a0a;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.hire-button:hover {
  background: #4fd39a;
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .profile-section {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .profile-section {
    gap: 24px;
  }

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
