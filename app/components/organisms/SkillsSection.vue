<template>
  <div class="skills-grid">
    <div
        v-for="(category, index) in skillCategories"
        :key="category.label"
        v-reveal="index"
        class="skills-row"
    >
      <span class="skills-label">{{ category.label }}</span>
      <span class="skills-list">
        <template v-for="(skill, i) in category.skills" :key="skill.name">{{ skill.name }}<template
            v-if="i < category.skills.length - 1"> · </template></template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Skill {
  name: string
}

const skillCategories: { label: string; skills: Skill[] }[] = [
  {
    label: 'Frontend',
    skills: [
      { name: 'Vue' },
      { name: 'Nuxt' },
      { name: 'React' },
      { name: 'Next' },
      { name: 'JavaScript' },
      { name: 'TypeScript' },
      { name: 'Tailwind' },
    ],
  },
  {
    label: 'Backend & Data',
    skills: [
      { name: 'Firebase' },
      { name: 'Node.js' },
      { name: 'SQL' },
      { name: 'NoSQL' },
      { name: 'REST APIs' },
    ],
  },
  {
    label: 'DevOps',
    skills: [{ name: 'Git' }, { name: 'CI/CD' }, { name: 'Docker' }],
  },
  {
    label: 'Architecture',
    skills: [{ name: 'TDD' }, { name: 'DDD' }, { name: 'Hexagonal' }],
  },
  {
    label: 'Tests',
    skills: [
      { name: 'Cypress' },
      { name: 'Playwright' },
      { name: 'Jest' },
      { name: 'Mocha' },
    ],
  },
  {
    label: 'Langages',
    skills: [{ name: 'Python' }, { name: 'Java' }],
  },
]
</script>

<style scoped>
.skills-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-grid);
}

.skills-row {
  display: flex;
  gap: var(--space-grid);
  align-items: baseline;
}

.skills-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #8a8a8a;
  width: 140px;
  flex-shrink: 0;
}

.skills-list {
  font-size: 14px;
  color: #c4c4c4;
  line-height: 1.7;
}

@media (max-width: 640px) {
  .skills-row {
    flex-direction: column;
    gap: var(--space-inner-sm);
  }

  .skills-label {
    width: auto;
  }

  .skills-list {
    font-size: 13px;
  }
}
</style>
