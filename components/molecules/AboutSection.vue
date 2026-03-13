<template>
  <div class="about-content">
    <p class="about-paragraph">{{ $t('about.paragraphs.p1') }}</p>
    <p class="about-paragraph">{{ $t('about.paragraphs.p2') }}</p>
    <p class="about-paragraph">{{ $t('about.paragraphs.p3') }}</p>
    <p class="about-paragraph">{{ $t('about.paragraphs.p4') }}</p>
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
