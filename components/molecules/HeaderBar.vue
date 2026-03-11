<template>
  <header class="page-header">
    <div class="header-content">
      <div class="header-title">{{ $t('profile.title') }} • {{ $t('profile.subtitle') }}</div>
      <AtomsLanguageIndicator :lang="currentLang" @click="toggleLanguage"/>
    </div>
  </header>
</template>

<script setup lang="ts">
import {computed} from 'vue'

// @ts-expect-error - useI18n est auto-importé par @nuxtjs/i18n
const {locale} = useI18n()

const currentLang = computed(() => locale.value as 'fr' | 'en')

const toggleLanguage = () => {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 50px;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-title {
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: 600;
  font-family: "Orbitron", sans-serif;
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 900px) {
  .header-title {
    font-size: 10px;
  }
}
</style>
