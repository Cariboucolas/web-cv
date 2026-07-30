<template>
  <div class="page-layout">
    <div class="page-card">
      <MoleculesHeaderBar/>

      <OrganismsProfileSection/>

      <section id="about" class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('about.title') }}</div>
        </div>
        <MoleculesAboutSection/>
      </section>

      <section id="experiences" class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('experiences.title') }}</div>
        </div>
        <OrganismsExperiencesSection/>
      </section>

      <section id="skills" class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('skills.title') }}</div>
        </div>
        <OrganismsSkillsSection/>
      </section>

      <section id="projects" class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('projects.title') }}</div>
        </div>
        <OrganismsProjectsSection/>
      </section>

    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.page-layout {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  justify-content: center;
  font-family: var(--font-body);
  color: #e0e0e0;
}

.page-card {
  width: min(100%, 1100px);
  padding: 0 50px 60px;
  display: flex;
  flex-direction: column;
  /* C'est ce vide qui sépare les sections : la carte encadrée a disparu. */
  gap: var(--space-section);
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-title);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: #fff;
}

@media (max-width: 640px) {
  .page-card {
    padding: 8px 16px 40px;
  }

  .section-title {
    font-size: 19px;
  }
}
</style>
