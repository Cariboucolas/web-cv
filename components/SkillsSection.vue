<template>
  <div>
    <!-- Mobile : liste compacte -->
    <div class="sm:hidden space-y-3">
      <div v-for="category in categories" :key="category.label" class="flex gap-3 items-baseline">
        <span class="text-xs text-gray-500 uppercase tracking-widest w-24 shrink-0">{{ category.label }}</span>
        <span class="text-sm text-gray-300">
          <template v-for="(skill, i) in category.skills" :key="skill.name">
            {{ skill.name }}<span v-if="skill.level" class="text-xs text-gray-500"> ({{ skill.level }})</span><template v-if="i < category.skills.length - 1"> · </template>
          </template>
        </span>
      </div>
    </div>

    <!-- Desktop : cards -->
    <div class="hidden sm:grid grid-cols-2 gap-6">
      <div class="skill-category">
        <h3 class="text-primary text-lg mb-3 flex items-center gap-2">
          <Icon name="material-symbols:monitor-outline" size="24" />
          Front-end
        </h3>
        <div class="flex flex-wrap gap-2">
          <SkillBadge icon="ri:vuejs-line" label="Vue.js" :level="95" />
          <SkillBadge icon="simple-icons:nuxtdotjs" label="Nuxt" :level="90" />
          <SkillBadge icon="simple-icons:typescript" label="TypeScript" :level="85" />
        </div>
      </div>

      <div class="skill-category">
        <h3 class="text-primary text-lg mb-3 flex items-center gap-2">
          <Icon name="material-symbols:dns-outline" size="24" />
          Back-end
        </h3>
        <div class="flex flex-wrap gap-2">
          <SkillBadge icon="ri:firebase-line" label="Firebase" :level="90" />
          <SkillBadge icon="ri:nodejs-line" label="Node.js" :level="80" />
        </div>
      </div>

      <div class="skill-category">
        <h3 class="text-primary text-lg mb-3 flex items-center gap-2">
          <Icon name="material-symbols:build-circle-outline" size="24" />
          DevOps
        </h3>
        <div class="flex flex-wrap gap-2">
          <SkillBadge icon="ri:github-line" label="GitHub" :level="85" />
          <SkillBadge icon="ri:gitlab-line" label="GitLab" :level="85" />
          <SkillBadge icon="ri:git-branch-line" label="Git" :level="90" />
        </div>
      </div>

      <div class="skill-category">
        <h3 class="text-primary text-lg mb-3 flex items-center gap-2">
          <Icon name="material-symbols:architecture" size="24" />
          Architecture
        </h3>
        <div class="flex flex-wrap gap-2">
          <SkillBadge icon="material-symbols:hexagon" label="Hexagonal" :level="70" />
          <SkillBadge icon="material-symbols:domain" label="DDD" :level="75" />
          <SkillBadge icon="material-symbols:cycle" label="TDD" :level="80" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Skill {
  name: string
  level?: string
}

const categories: { label: string; skills: Skill[] }[] = [
  {
    label: 'Frontend',
    skills: [{ name: 'Nuxt.js' }, { name: 'React' }],
  },
  {
    label: 'Backend & Data',
    skills: [{ name: 'Firebase' }, { name: 'REST APIs' }],
  },
  {
    label: 'Outils & Pratiques',
    skills: [{ name: 'Git' }, { name: 'CI/CD' }, { name: 'TDD' }, { name: 'DDD' }, { name: 'Datadog' }, { name: 'Sentry' }],
  },
  {
    label: 'Tests',
    skills: [{ name: 'Jest' }, { name: 'Cypress (E2E)' }],
  },
  {
    label: 'Langages',
    skills: [
      { name: 'TypeScript', level: 'avancé' },
      { name: 'Java', level: 'débutant' },
      { name: 'Kotlin', level: 'débutant' },
      { name: 'Python', level: 'débutant' },
    ],
  },
]
</script>