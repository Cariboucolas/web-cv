<template>
  <div class="game-ui-container">
    <!-- Fond avec étoiles -->
    <div class="stars-background">
      <div v-for="(star, i) in stars" :key="i" class="star" :style="star"></div>
    </div>

    <!-- Liseré supérieur -->
    <div class="top-bar">
      <div class="top-bar-content">
        <!-- Icônes carrées à droite -->
        <div class="top-icons">
          <div 
            v-for="(item, index) in navItems" 
            :key="index"
            class="top-icon-square"
            :class="{ active: activeSection === item.key, highlighted: activeSection === item.key }"
            @click="activeSection = item.key"
          >
            <Icon :name="item.icon" size="18" />
          </div>
          <div class="top-icon-square" @click="toggleLanguage">
            <span class="lang-indicator">{{ currentLang.toUpperCase() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal - Structure verticale en deux colonnes -->
    <div class="main-content">
      <!-- Panneau gauche - Profil/Avatar (comme le personnage dans l'image) -->
      <div class="left-panel">
        <div class="character-panel">
          <div class="character-avatar">
            <v-avatar size="300" class="large-avatar">
              <v-img src="https://avatars0.githubusercontent.com/u/0000001" />
            </v-avatar>
          </div>
          <div class="character-info">
            <h1 class="character-name">WEB DEVELOPER</h1>
            <h2 class="character-title">FULLSTACK</h2>
          </div>
        </div>
      </div>

      <!-- Panneau droit - Contenu textuel (comme le panneau de dialogue) -->
      <div class="right-panel">
        <div class="text-panel">
          <!-- Profil -->
          <div v-if="activeSection === 'profile'" class="text-content">
            <div class="text-block">
              <p class="text-line">Développeur passionné avec plus de 15 ans d'expérience dans l'IT.</p>
              <p class="text-line">Reconversion vers le développement il y a 4 ans, guidé par ma passion du digital et la découverte du code.</p>
            </div>
            <div class="text-block">
              <p class="text-line">Mon parcours unique, débutant comme technicien helpdesk et évoluant vers l'administration système et réseaux, m'a doté d'une vision globale des systèmes d'information.</p>
            </div>
            <div class="text-block">
              <p class="text-line">En tant que freelance, je m'attache particulièrement aux principes du Clean Code et aux pratiques artisanales du développement.</p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="activeSection === 'about'" class="text-content">
            <div class="text-block">
              <AboutSection />
            </div>
          </div>

          <!-- Skills -->
          <div v-if="activeSection === 'skills'" class="text-content">
            <div class="text-block">
              <SkillsSection />
            </div>
          </div>

          <!-- Portfolio -->
          <div v-if="activeSection === 'portfolio'" class="text-content">
            <div class="text-block">
              <PortfolioSection />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Liseré inférieur -->
    <div class="bottom-bar">
      <div class="bottom-bar-content">
        <!-- Bloc de titre avec forme diagonale -->
        <div class="title-block-diagonal">
          <div class="title-left">
            <span class="title-text">{{ hoveredLinkTitle || 'INFO' }}</span>
          </div>
          <div class="title-right"></div>
        </div>

        <!-- Icônes carrées avec nombres -->
        <div class="social-squares">
          <a
            v-for="(link, index) in socialLinks"
            :key="index"
            :href="link.url"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener noreferrer' : undefined"
            class="social-square"
            @mouseenter="hoveredLink = link.key"
            @mouseleave="hoveredLink = null"
            @click="link.action && link.action()"
          >
            <Icon :name="link.icon" size="20" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const currentLang = ref<'fr' | 'en'>('fr')
const activeSection = ref('profile')
const hoveredLink = ref<string | null>(null)

// Navigation items
const navItems = computed(() => [
  { key: 'profile', label: 'PROFIL', icon: 'material-symbols:person' },
  { key: 'about', label: 'DESCRIPTION', icon: 'material-symbols:description' },
  { key: 'skills', label: 'SKILLS', icon: 'material-symbols:psychology' },
  { key: 'portfolio', label: 'PORTFOLIO', icon: 'material-symbols:folder' }
])

// Labels pour la barre supérieure
const currentSectionLabel = computed(() => {
  const item = navItems.value.find(item => item.key === activeSection.value)
  return item?.label || 'PROFIL'
})

// Social links
const socialLinks = computed(() => [
  {
    key: 'github',
    icon: 'simple-icons:github',
    title: 'GitHub',
    placeholder: 'CODE',
    url: 'https://github.com',
    external: true
  },
  {
    key: 'linkedin',
    icon: 'simple-icons:linkedin',
    title: 'LinkedIn',
    placeholder: 'NETWORK',
    url: 'https://linkedin.com',
    external: true
  },
  {
    key: 'malt',
    icon: 'simple-icons:malt',
    title: 'Malt',
    placeholder: 'FREELANCE',
    url: 'https://malt.fr',
    external: true
  },
  {
    key: 'download',
    icon: 'material-symbols:download-outline',
    title: 'Télécharger CV',
    placeholder: 'DOWNLOAD',
    url: '#',
    external: false,
    action: () => {
      console.log('Download CV')
    }
  }
])

// Titre dynamique selon le hover
const hoveredLinkTitle = computed(() => {
  if (!hoveredLink.value) return ''
  const link = socialLinks.value.find(l => l.key === hoveredLink.value)
  // Ne pas afficher "Malt" pour l'icône Malt
  if (link?.key === 'malt') return ''
  return link?.title || ''
})

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'fr' ? 'en' : 'fr'
}

// Watch language change
watch(currentLang, (newLang) => {
  console.log('Language changed to:', newLang)
})

// Génération fixe des positions des étoiles (une seule fois)
const stars = ref<Array<Record<string, string>>>([])

// Générer les positions des étoiles une seule fois au montage
onMounted(() => {
  const starsArray: Array<Record<string, string>> = []
  for (let i = 0; i < 100; i++) {
    const size = Math.random() * 2 + 1
    const left = Math.random() * 100
    const top = Math.random() * 100
    const delay = Math.random() * 3
    const duration = 2 + Math.random() * 3
    
    starsArray.push({
      width: `${size}px`,
      height: `${size}px`,
      left: `${left}%`,
      top: `${top}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`
    })
  }
  stars.value = starsArray
})
</script>

<style scoped>
@import url("https://fonts.cdnfonts.com/css/mona-sans");
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&display=swap");

* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.game-ui-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0a0a0a;
  font-family: "Mona Sans", sans-serif;
  color: #e0e0e0;
}

/* Fond avec étoiles animées */
.stars-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.star {
  position: absolute;
  background: #ffffff;
  border-radius: 0;
  animation: twinkle infinite ease-in-out;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Liseré supérieur */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 30px;
}

.top-bar-content {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.top-icons {
  display: flex;
  gap: 8px;
}

.top-icon-square {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.top-icon-square:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}

.top-icon-square.active {
  background: rgba(66, 184, 131, 0.15);
  border-color: rgba(66, 184, 131, 0.4);
}

.top-icon-square.highlighted::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: rgba(255, 200, 0, 0.3);
  border: 1px solid rgba(255, 200, 0, 0.5);
  z-index: -1;
}

.lang-indicator {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: "Orbitron", sans-serif;
}

/* Contenu principal - Structure verticale en deux colonnes */
.main-content {
  position: fixed;
  top: 70px;
  bottom: 140px;
  left: 0;
  right: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 0;
  overflow: hidden;
}

/* Panneau gauche - Profil/Avatar */
.left-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(5, 5, 5, 0.3);
}

.character-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.character-avatar {
  position: relative;
}

.large-avatar {
  box-shadow: 0 0 40px rgba(66, 184, 131, 0.2);
  border: 3px solid rgba(66, 184, 131, 0.3);
}

.character-info {
  text-align: center;
}

.character-name {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #42b883;
  margin: 0 0 10px 0;
  font-family: "Orbitron", sans-serif;
}

.character-title {
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-family: "Orbitron", sans-serif;
}

/* Panneau droit - Contenu textuel */
.right-panel {
  display: flex;
  flex-direction: column;
  padding: 40px 60px;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}

.right-panel::-webkit-scrollbar {
  width: 6px;
}

.right-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.right-panel::-webkit-scrollbar-thumb {
  background: rgba(66, 184, 131, 0.3);
  border-radius: 0;
}

.text-panel {
  background: rgba(15, 15, 15, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
  padding: 50px;
  min-height: 100%;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
}

.text-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.text-block {
  margin-bottom: 30px;
}

.text-line {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 20px 0;
  font-family: "Mona Sans", sans-serif;
  letter-spacing: 0.5px;
}

/* Liseré inférieur */
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

.title-block-diagonal {
  display: flex;
  align-items: center;
  height: 30px;
}

.title-left {
  background: #ffffff;
  color: #1a1a1a;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 100%, 0 100%);
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  font-family: "Orbitron", sans-serif;
  min-width: 150px;
}

.title-right {
  background: rgba(20, 20, 20, 0.9);
  height: 100%;
  clip-path: polygon(15px 0, 100% 0, 100% 100%, 30px 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-left: -15px;
  width: 80px;
}

.title-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #1a1a1a;
  font-family: "Orbitron", sans-serif;
}

.social-squares {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-square {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
}

.social-square:hover {
  color: rgba(255, 255, 255, 1);
}

.social-square:hover::before {
  content: '';
  position: absolute;
  inset: -8px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: -1;
  border-radius: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 350px 1fr;
  }
  
  .large-avatar {
    width: 250px !important;
    height: 250px !important;
  }
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .left-panel {
    padding: 20px;
  }

  .character-panel {
    flex-direction: row;
    gap: 20px;
  }

  .large-avatar {
    width: 150px !important;
    height: 150px !important;
  }

  .text-panel {
    padding: 30px;
  }
}
</style>
