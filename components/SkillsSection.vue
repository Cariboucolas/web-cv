<template>
  <div >
    <div class="grid grid-cols-2 gap-6">
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

    <div class="mt-6 pt-4 border-t border-white/10">
      <p class="text-sm text-gray-400">
        Toutes ces compétences sont mises en pratique quotidiennement dans mes projets, 
        avec une attention particulière portée aux bonnes pratiques et à la qualité du code.
      </p>
    </div>
  </div>
</template>