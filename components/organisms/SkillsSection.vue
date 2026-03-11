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
      {icon: 'ri:vuejs-line', label: 'Vue'},
      {icon: 'simple-icons:nuxtdotjs', label: 'Nuxt'},
      {icon: 'ri:reactjs-line', label: 'React'},
      {icon: 'simple-icons:nextdotjs', label: 'Next'},
      {icon: 'simple-icons:javascript', label: 'JavaScript'},
      {icon: 'simple-icons:typescript', label: 'TypeScript'},
      {icon: 'simple-icons:tailwindcss', label: 'Tailwind'},
    ],
  },
  {
    icon: 'material-symbols:dns-outline',
    label: 'Back-end',
    skills: [
      {icon: 'ri:firebase-line', label: 'Firebase'},
      {icon: 'ri:nodejs-line', label: 'Node.js'},
      {icon: 'material-symbols:database', label: 'SQL'},
      {icon: 'simple-icons:mongodb', label: 'NoSQL'},
      {icon: 'material-symbols:api', label: 'REST APIs'},
    ],
  },
  {
    icon: 'material-symbols:build-circle-outline',
    label: 'DevOps & Outils',
    skills: [
      {icon: 'ri:git-branch-line', label: 'Git'},
      {icon: 'material-symbols:cycle', label: 'CI/CD'},
      {icon: 'simple-icons:docker', label: 'Docker'},
    ],
  },
  {
    icon: 'material-symbols:architecture',
    label: 'Architecture',
    skills: [
      {icon: 'material-symbols:check-circle-outline', label: 'TDD'},
      {icon: 'material-symbols:domain', label: 'DDD'},
      {icon: 'material-symbols:hexagon', label: 'Hexagonal'},
    ],
  },
  {
    icon: 'material-symbols:science',
    label: 'Tests',
    skills: [
      {icon: 'simple-icons:cypress', label: 'Cypress'},
      {icon: 'simple-icons:playwright', label: 'Playwright'},
      {icon: 'simple-icons:jest', label: 'Jest'},
      {icon: 'simple-icons:mocha', label: 'Mocha'},
    ],
  },
  {
    icon: 'material-symbols:code',
    label: 'Langages',
    skills: [
      {icon: 'simple-icons:python', label: 'Python'},
      {icon: 'simple-icons:java', label: 'Java'},
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
    skills: [{name: 'Vue'}, {name: 'Nuxt'}, {name: 'React'}, {name: 'Next'}, {name: 'JavaScript'}, {name: 'TypeScript'}, {name: 'Tailwind'}],
  },
  {
    label: 'Backend & Data',
    skills: [{name: 'Firebase'}, {name: 'Node.js'}, {name: 'SQL'}, {name: 'NoSQL'}, {name: 'REST APIs'}],
  },
  {
    label: 'DevOps',
    skills: [{name: 'Git'}, {name: 'CI/CD'}, {name: 'Docker'}],
  },
  {
    label: 'Architecture',
    skills: [{name: 'TDD'}, {name: 'DDD'}, {name: 'Hexagonal'}],
  },
  {
    label: 'Tests',
    skills: [{name: 'Cypress'}, {name: 'Playwright'}, {name: 'Jest'}, {name: 'Mocha'}],
  },
  {
    label: 'Langages',
    skills: [{name: 'Python'}, {name: 'Java'}],
  },
]
</script>
