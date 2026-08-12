<template>
  <div class="about-content">
    <!-- Deux paragraphes : la trajectoire, puis ce que je cherche. Les deux
         précédents disaient la même chose que ceux-ci sous une autre forme. -->
    <p class="about-paragraph">{{ $t('about.paragraphs.p1', { years: devExperienceYears() }) }}</p>
    <p class="about-paragraph">{{ $t('about.paragraphs.p2') }}</p>
  </div>
</template>

<style scoped>
.about-content {
  display: flex;
  flex-direction: column;
}

.about-paragraph {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 16px 0;
}
</style>
