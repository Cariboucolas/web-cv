<template>
  <div class="page-layout">
    <div class="page-card">
      <MoleculesHeaderBar/>

      <OrganismsProfileSection/>

      <section class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('about.title') }}</div>
        </div>
        <MoleculesAboutSection/>
      </section>

      <section class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('experiences.title') }}</div>
        </div>
        <OrganismsExperiencesSection/>
      </section>

      <section class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('skills.title') }}</div>
        </div>
        <OrganismsSkillsSection/>
      </section>

      <section class="content-section">
        <div class="section-header">
          <div class="section-title">{{ $t('projects.title') }}</div>
        </div>
        <OrganismsProjectsSection/>
      </section>

      <OrganismsSocialFooter/>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.cdnfonts.com/css/mona-sans");
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&display=swap");

* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.page-layout {
  min-height: 100vh;
  background: #0a0a0a;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  font-family: "Mona Sans", sans-serif;
  color: #e0e0e0;
}

.page-card {
  width: min(100%, 1100px);
  background: rgba(10, 10, 10, 0.9);
  padding: 40px 50px 60px;
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.content-section {
  background: rgba(15, 15, 15, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 18px;
  letter-spacing: 2px;
  font-family: "Orbitron", sans-serif;
}

@media (max-width: 900px) {
  .page-card {
    padding: 30px 24px 50px;
  }
}

@media (max-width: 640px) {
  .page-layout {
    padding: 16px 0 40px;
  }

  .page-card {
    padding: 8px 16px 40px;
    gap: 32px;
  }

  .content-section {
    background: transparent;
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 24px 0;
  }

  .section-title {
    font-size: 14px;
    letter-spacing: 1.5px;
  }

}
</style>
