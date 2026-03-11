<template>
  <div>
    <!-- Mobile : liste compacte -->
    <div class="sm:hidden space-y-3">
      <div v-for="category in mobileCategories" :key="category.label" class="flex gap-3 items-baseline">
        <span class="text-xs text-gray-500 uppercase tracking-widest w-24 shrink-0">{{ category.label }}</span>
        <span class="text-sm text-gray-300">
          <template v-for="(skill, i) in category.skills" :key="skill.name">
            {{ skill.name }}
          <template
              v-if="i < category.skills.length - 1"> ·
          </template>
          </template>
        </span>
      </div>
    </div>

    <!-- Desktop : cards -->
    <div class="hidden sm:grid grid-cols-2 gap-6">
      <MoleculesSkillCategory
          v-for="category in desktopCategories"
          :key="category.label"
          :icon="category.icon"
          :label="category.label"
          :skills="category.skills"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface DesktopCategory {
  icon: string
  label: string
  skills: { icon: string; label: string; level?: number }[]
}

const desktopCategories: DesktopCategory[] = [
  {
    icon: 'material-symbols:monitor-outline',
    label: 'Front-end',
    skills: [
      {icon: 'ri:vuejs-line', label: 'Vue.js'},
      {icon: 'simple-icons:nuxtdotjs', label: 'Nuxt'},
      {icon: 'simple-icons:typescript', label: 'TypeScript'},
    ],
  },
  {
    icon: 'material-symbols:dns-outline',
    label: 'Back-end',
    skills: [
      {icon: 'ri:firebase-line', label: 'Firebase'},
      {icon: 'ri:nodejs-line', label: 'Node.js'},
    ],
  },
  {
    icon: 'material-symbols:build-circle-outline',
    label: 'DevOps',
    skills: [
      {icon: 'ri:github-line', label: 'GitHub'},
      {icon: 'ri:gitlab-line', label: 'GitLab'},
      {icon: 'ri:git-branch-line', label: 'Git'},
    ],
  },
  {
    icon: 'material-symbols:architecture',
    label: 'Architecture',
    skills: [
      {icon: 'material-symbols:hexagon', label: 'Hexagonal'},
      {icon: 'material-symbols:domain', label: 'DDD'},
      {icon: 'material-symbols:cycle', label: 'TDD'},
    ],
  },
]

interface MobileSkill {
  name: string
  level?: string
}

const mobileCategories: { label: string; skills: MobileSkill[] }[] = [
  {
    label: 'Frontend',
    skills: [{name: 'Nuxt.js'}, {name: 'React'}],
  },
  {
    label: 'Backend & Data',
    skills: [{name: 'Firebase'}, {name: 'REST APIs'}],
  },
  {
    label: 'Outils & Pratiques',
    skills: [
      {name: 'Git'},
      {name: 'CI/CD'},
      {name: 'TDD'},
      {name: 'DDD'},
      {name: 'Datadog'},
      {name: 'Sentry'},
    ],
  },
  {
    label: 'Tests',
    skills: [{name: 'Jest'}, {name: 'Cypress (E2E)'}],
  },
  {
    label: 'Langages',
    skills: [
      {name: 'TypeScript', level: 'avancé'},
      {name: 'Java', level: 'débutant'},
      {name: 'Kotlin', level: 'débutant'},
      {name: 'Python', level: 'débutant'},
    ],
  },
]
</script>
