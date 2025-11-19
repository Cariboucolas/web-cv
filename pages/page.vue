<template>
  <div class="page-layout">
    <div class="page-card">
      <header class="page-header">
        <div class="header-content">
          <div class="header-title">{{ $t('profile.title') }} • {{ $t('profile.subtitle') }}</div>
          <AtomsLanguageIndicator :lang="currentLang" @click="toggleLanguage" />
        </div>
      </header>

      <section class="profile-section">
        <div class="profile-avatar">
          <OrganismsCharacterPanel />
        </div>
        <div class="profile-content">
          <p v-for="(line, index) in profileDescription" :key="index" class="profile-line">
            {{ line }}
          </p>
        </div>
      </section>

      <section class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('about.title') }}</div>
        </div>
        <AboutSection />
      </section>

      <section class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('skills.title') }}</div>
        </div>
        <SkillsSection />
      </section>

      <section class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('portfolio.title') }}</div>
        </div>
        <PortfolioSection />
      </section>

      <footer class="social-footer">
        <div class="social-title-block">
          <div class="title-left">
            <span class="title-text">{{ hoveredLinkTitle || 'INFO' }}</span>
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
            :action="link.action"
            @mouseenter="hoveredLink = link.key"
            @mouseleave="hoveredLink = null"
          />
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// @ts-expect-error - useI18n est auto-importé par @nuxtjs/i18n
const { locale, t } = useI18n()
const hoveredLink = ref<string | null>(null)

const currentLang = computed(() => locale.value as 'fr' | 'en')

const profileDescription = computed(() => [
  t('profile.description.line1'),
  t('profile.description.line2'),
  t('profile.description.line3'),
  t('profile.description.line4'),
])

const socialLinks = computed(() => [
  {
    key: 'github',
    icon: 'simple-icons:github',
    url: 'https://github.com',
    external: true,
  },
  {
    key: 'linkedin',
    icon: 'simple-icons:linkedin',
    url: 'https://linkedin.com',
    external: true,
  },
  {
    key: 'malt',
    icon: 'simple-icons:malt',
    url: 'https://malt.fr',
    external: true,
  },
  {
    key: 'download',
    icon: 'material-symbols:download-outline',
    url: '#',
    external: false,
    action: () => {
      console.log('Download CV')
    },
  },
])

const hoveredLinkTitle = computed(() => {
  if (!hoveredLink.value) {
    return 'INFO'
  }
  if (hoveredLink.value === 'malt') {
    return ''
  }
  return hoveredLink.value.charAt(0).toUpperCase() + hoveredLink.value.slice(1)
})

const toggleLanguage = () => {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
}
</script>

<style scoped>
@import url("https://fonts.cdnfonts.com/css/mona-sans");
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&display=swap");

* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.page-layout {
  min-height: 100vh;
  background: #0a0a0a;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  font-family: "Mona Sans", sans-serif;
  color: #e0e0e0;
}

.page-card {
  width: min(100%, 1100px);
  background: rgba(10, 10, 10, 0.9);
  padding: 40px 50px 60px;
  display: flex;
  flex-direction: column;
  gap: 50px;
}

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
  min-height: 400px;
}

.profile-line {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 16px 0;
}

.content-section {
  background: rgba(15, 15, 15, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 18px;
  letter-spacing: 2px;
  font-family: "Orbitron", sans-serif;
}

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

@media (max-width: 900px) {
  .page-card {
    padding: 30px 24px 50px;
  }

  .profile-section {
    flex-direction: column;
  }

  .header-title {
    font-size: 10px;
  }
}
</style>
