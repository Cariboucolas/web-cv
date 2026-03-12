<template>
  <header class="page-header">
    <div class="header-content">
      <a href="#about" class="header-link">{{ $t('about.title') }}</a>
      <span class="header-separator">•</span>
      <a href="#experiences" class="header-link">{{ $t('experiences.title') }}</a>
      <span class="header-separator">•</span>
      <a href="#skills" class="header-link">{{ $t('skills.title') }}</a>
      <span class="header-separator">•</span>
      <a href="#projects" class="header-link">{{ $t('projects.title') }}</a>
    </div>
    <div class="header-actions">
      <a
          v-for="link in socialLinks"
          :key="link.key"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="header-social"
      >
        <Icon :name="link.icon" size="16"/>
      </a>
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

const socialLinks = [
  {
    key: 'github',
    icon: 'simple-icons:github',
    url: 'https://github.com/Cariboucolas',
  },
  {
    key: 'linkedin',
    icon: 'simple-icons:linkedin',
    url: 'https://www.linkedin.com/in/colas-durcy-5b5bbba5/',
  },
  {
    key: 'malt',
    icon: 'simple-icons:malt',
    url: 'https://www.malt.fr/profile/colasdurcy',
  },
  {
    key: 'download',
    icon: 'material-symbols:download',
    url: `https://firebasestorage.googleapis.com/v0/b/cv-portfolio-b023a.appspot.com/o/${encodeURIComponent('cv/cv-colas-durcy.pdf')}?alt=media`,
  },
]
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 50px;
  padding-top: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 20px;
}

.header-link {
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: 600;
  font-family: "Orbitron", sans-serif;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  text-decoration: none;
  transition: color 0.2s ease;
}

.header-separator {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  user-select: none;
}

.header-link:hover {
  color: #42b883;
}

.header-social {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.2s ease;
}

.header-social:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  color: #42b883;
}

@media (max-width: 900px) {
  .header-link {
    font-size: 10px;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    height: auto;
    gap: 10px;
    align-items: flex-end;
  }

  .header-content {
    gap: 5px;
    justify-content: flex-end;
  }

  .header-link {
    font-size: 8px;
    letter-spacing: 1px;
  }

  .header-separator {
    font-size: 8px;
  }

  .header-actions {
    padding-left: 0;
  }

}
</style>
