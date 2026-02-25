<template>
  <div class="bottom-bar">
    <div class="bottom-bar-content">
      <AtomsTitleBlock :text="displayTitle" />
      <div class="social-squares">
        <AtomsSocialSquare
          v-for="(link, index) in socialLinks"
          :key="index"
          :icon="link.icon"
          :url="link.url"
          :external="link.external"
          :action="link.action"
          @mouseenter="$emit('link-hover', link.key)"
          @mouseleave="$emit('link-leave')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SocialLink {
  key: string
  icon: string
  title: string
  placeholder: string
  url: string
  external: boolean
  action?: () => void
}

interface Props {
  socialLinks: SocialLink[]
  hoveredLink: string | null
}

const props = defineProps<Props>()
// @ts-expect-error - useI18n is auto-imported by @nuxtjs/i18n
const { t } = useI18n()

const displayTitle = computed(() => {
  if (!props.hoveredLink) {
    return t('bottomBar.defaultTitle')
  }
  const link = props.socialLinks.find((l) => l.key === props.hoveredLink)
  if (link?.key === 'malt') {
    return ''
  }
  return link ? t(`bottomBar.social.${link.key}`) : t('bottomBar.defaultTitle')
})

defineEmits<{
  'link-hover': [key: string]
  'link-leave': []
}>()
</script>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 30px;
}

.bottom-bar-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.social-squares {
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style>

