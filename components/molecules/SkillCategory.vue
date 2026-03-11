<template>
  <div class="skill-category">
    <h3 class="text-primary text-lg mb-3 flex items-center gap-2">
      <Icon :name="icon" size="24"/>
      {{ label }}
    </h3>
    <div class="flex flex-wrap gap-2">
      <AtomsSkillBadge
          v-for="skill in skills"
          :key="skill.label"
          :icon="skill.icon"
          :label="skill.label"
          :level="skill.level"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface SkillBadgeData {
  icon: string
  label: string
  level?: number
}

defineProps<{
  icon: string
  label: string
  skills: SkillBadgeData[]
}>()
</script>
