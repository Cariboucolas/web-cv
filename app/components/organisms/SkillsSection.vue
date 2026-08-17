<template>
  <div class="skills-grid">
    <div
        v-for="(category, index) in skillRows"
        :key="category.key"
        v-reveal="index"
        class="skills-row"
    >
      <span class="skills-label">{{ t(`skills.categories.${category.key}`) }}</span>
      <span class="skills-list">
        <template v-for="(skill, i) in category.skills" :key="skill">{{ skillLabel(skill) }}<template
            v-if="i < category.skills.length - 1"> · </template></template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

/**
 * Miroir de la section COMPÉTENCES du CV PDF — même découpage, même contenu.
 * Le CV est la source, pas ce fichier : une compétence ajoutée ici sans y
 * figurer là-bas rouvre l'écart que ce miroir existe pour fermer.
 *
 * L'ordre, lui, diffère du CV. `methods` remonte en troisième position parce
 * qu'à l'écran la lecture est verticale et s'arrête tôt : les deux premières
 * lignes qualifient (ce sont les mots-clés qu'on cherche), la troisième
 * distingue. Dans un PDF dense, où l'œil balaie le bloc entier, la question
 * ne se pose pas.
 *
 * Les noms de technologies ne se traduisent pas, d'où leur présence en dur
 * ici. Deux entrées font exception parce que ce sont des expressions et non
 * des marques : elles s'écrivent en clé i18n, préfixée par `@`. Voir
 * `skillLabel`.
 */
const skillCategories: { key: string; skills: string[] }[] = [
  {
    key: 'languages',
    skills: ['TypeScript', 'JavaScript', 'Kotlin'],
  },
  {
    key: 'frameworks',
    skills: [
      'Vue.js / Nuxt',
      'Vuex / Pinia',
      'React',
      'Node.js',
      'Tailwind',
      'Vuetify',
      'Storybook',
    ],
  },
  {
    key: 'methods',
    skills: [
      'DDD',
      '@hexagonal',
      'CQRS',
      'BDD',
      'Clean Code',
      'Pair Programming',
    ],
  },
  {
    key: 'cloud',
    skills: [
      'Firebase / Firestore',
      'Vertex AI',
      'SQL / NoSQL',
      'GraphQL',
      'REST API',
    ],
  },
  {
    key: 'devops',
    skills: [
      'SonarQube',
      'Docker',
      'GitLab CI / GitHub Actions',
      'CI/CD',
      'Cypress',
      'Playwright',
      'Jest / Mocha',
      'TDD',
    ],
  },
  {
    key: 'tools',
    skills: ['Git', 'GitLab', 'GitHub', 'Datadog (RUM - Log)', 'Sentry'],
  },
]

/**
 * Ce que je pratique sans le revendiquer — déclaré à part parce que rien
 * ici ne figure parmi les compétences du CV, et que `skillCategories` doit
 * rester un miroir exact.
 *
 * Rust tourne dans Pixl64, mais la couche sécurité a été écrite en
 * apprenant le langage. L'agentique et le RAG ont été livrés sur Managers
 * Companion, et le CV lui-même y est plus prudent qu'ailleurs : il écrit
 * « participé à l'intégration » là où il écrit « conçu et développé »
 * partout ailleurs.
 *
 * `Vertex AI` ne descend pas ici pour autant, et la distinction est le fond
 * de cette ligne : l'outil a servi en production, c'est l'architecture
 * agentique qui reste un terrain en cours. L'intitulé porte la nuance, donc
 * les entrées n'ont rien à ajouter.
 */
const exploringSkills: string[] = ['Rust', '@agenticAi', 'RAG']

/** Une seule liste au rendu, deux sources qui gardent chacune leur sens. */
const skillRows = [
  ...skillCategories,
  { key: 'exploring', skills: exploringSkills },
]

/**
 * `TypeScript`, `Rust`, `RAG` sont des noms propres et s'affichent tels
 * quels. Une poignée d'entrées sont au contraire des expressions, qui
 * s'écriraient en français sur la page anglaise si on les laissait en dur :
 * le préfixe `@` les désigne comme clés de traduction.
 */
const skillLabel = (skill: string) =>
  skill.startsWith('@') ? t(`skills.terms.${skill.slice(1)}`) : skill
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
