<template>
  <div class="skills-grid">
    <div
        v-for="(category, index) in skillCategories"
        :key="category.key"
        v-reveal="index"
        class="skills-row"
    >
      <span class="skills-label">{{ t(`skills.categories.${category.key}`) }}</span>
      <span class="skills-list">
        <template v-for="(skill, i) in category.skills" :key="skill">{{ skill }}<template
            v-if="i < category.skills.length - 1"> · </template></template>
      </span>
    </div>

    <p v-reveal="skillCategories.length" class="skills-learning">{{ t('skills.learning') }}</p>
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
 * Les noms de technologies ne se traduisent pas ; seuls les libellés de
 * catégorie passent par l'i18n.
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
      'Architecture hexagonale',
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

/* La seule phrase en prose de la section, et c'est le but : Rust tourne dans
   Pixl64 sans être une compétence acquise, et aucune étiquette posée entre
   `TypeScript` et `Vue.js` ne saurait dire ça. Une ligne de texte le peut.
   Elle s'aligne sur la colonne des listes — largeur du libellé plus la
   gouttière — pour prolonger la lecture au lieu d'ouvrir un nouveau bloc. */
.skills-learning {
  margin-top: var(--space-entry);
  margin-left: calc(140px + var(--space-grid));
  max-width: 62ch;
  font-size: 14px;
  line-height: 1.7;
  color: #8a8a8a;
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

  /* Les libellés ne tiennent plus leur colonne : la phrase repart du bord. */
  .skills-learning {
    margin-left: 0;
    font-size: 13px;
  }
}
</style>
