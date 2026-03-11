<template>
  <footer class="social-footer">
    <div class="social-title-block">
      <div class="title-left">
        <span class="title-text">{{ hoveredLinkTitle }}</span>
      </div>
      <div class="title-right"></div>
    </div>
    <div class="social-squares">
      <AtomsSocialSquare
          v-for="(link, index) in socialLinks"
          :key="index"
          :icon="link.icon"
          :url="link.url"
          :external="link.external"
          :download="link.download"
          :action="link.action"
          @mouseenter="hoveredLink = link.key"
          @mouseleave="hoveredLink = null"
      />
    </div>
  </footer>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'

// @ts-expect-error - useI18n est auto-importé par @nuxtjs/i18n
const {t} = useI18n()

const hoveredLink = ref<string | null>(null)

const socialLinks = computed(() => [
  {
    key: 'github',
    icon: 'simple-icons:github',
    url: 'https://github.com/Cariboucolas',
    external: true,
  },
  {
    key: 'linkedin',
    icon: 'simple-icons:linkedin',
    url: 'https://www.linkedin.com/in/colas-durcy-5b5bbba5/',
    external: true,
  },
  {
    key: 'malt',
    icon: 'simple-icons:malt',
    url: 'https://www.malt.fr/profile/colasdurcy',
    external: true,
  },
  {
    key: 'download',
    icon: 'material-symbols:download',
    url: `https://firebasestorage.googleapis.com/v0/b/cv-portfolio-b023a.appspot.com/o/${encodeURIComponent('cv/cv-colas-durcy.pdf')}?alt=media`,
    external: true,
  },
])

const hoveredLinkTitle = computed(() => {
  if (!hoveredLink.value) {
    return ''
  }
  if (hoveredLink.value === 'malt') {
    return t('bottomBar.social.malt')
  }
  if (hoveredLink.value === 'download') {
    return t('bottomBar.social.download')
  }
  return hoveredLink.value.charAt(0).toUpperCase() + hoveredLink.value.slice(1)
})
</script>

<style scoped>
.social-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.social-title-block {
  display: flex;
  align-items: center;
  height: 40px;
}

.social-squares {
  display: flex;
  gap: 20px;
}

@media (max-width: 640px) {
  .social-footer {
    gap: 16px;
  }

  .social-squares {
    gap: 12px;
  }
}
</style>
