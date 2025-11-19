<template>
  <div class="text-panel">
    <div class="text-content">
      <!-- Profil -->
      <div v-if="activeSection === 'profile'" class="text-block">
        <p class="text-line">{{ $t('profile.description.line1') }}</p>
        <p class="text-line">{{ $t('profile.description.line2') }}</p>
        <p class="text-line">{{ $t('profile.description.line3') }}</p>
        <p class="text-line">{{ $t('profile.description.line4') }}</p>
      </div>

      <!-- Description -->
      <div v-if="activeSection === 'about'" class="text-block">
        <AboutSection />
      </div>

      <!-- Skills -->
      <div v-if="activeSection === 'skills'" class="text-block">
        <SkillsSection />
      </div>

      <!-- Portfolio -->
      <div v-if="activeSection === 'portfolio'" class="text-block">
        <PortfolioSection />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  activeSection: string
}

defineProps<Props>()
</script>

<style scoped>
.text-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0;
  padding: 50px;
  min-height: 100%;
  box-shadow: none;
}

.text-panel :deep(.v-sheet),
.text-panel :deep(.v-card),
.text-panel :deep(.v-card-text) {
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  border: none !important;
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

@media (max-width: 1024px) {
  .text-panel {
    padding: 30px;
  }
}
</style>

