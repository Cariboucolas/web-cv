<template>
  <div class="top-bar">
    <div class="top-bar-content">
      <div class="top-icons">
        <MoleculesNavigationIcon
          v-for="(item, index) in navItems"
          :key="index"
          :icon="item.icon"
          :active="activeSection === item.key"
          :highlighted="activeSection === item.key"
          @click="$emit('section-change', item.key)"
        />
        <AtomsLanguageIndicator :lang="currentLang" @click="$emit('toggle-language')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NavItem {
  key: string
  label: string
  icon: string
}

interface Props {
  navItems: NavItem[]
  activeSection: string
  currentLang: string
}

defineProps<Props>()

defineEmits<{
  'section-change': [key: string]
  'toggle-language': []
}>()
</script>

<style scoped>
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
</style>

