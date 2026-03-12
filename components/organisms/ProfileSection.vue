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
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed} from 'vue'

// @ts-expect-error - useI18n est auto-importé par @nuxtjs/i18n
const {t} = useI18n()

const profileDescription = computed(() => [
  t('profile.description.line1'),
  t('profile.description.line2'),
  t('profile.description.line3'),
  t('profile.description.line4'),
])
</script>

<style scoped>
.profile-section {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.profile-avatar {
  flex: 1 1 320px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.profile-content {
  flex: 1 1 360px;
  background: transparent;
  padding: 30px;
}

.profile-line {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 16px 0;
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
