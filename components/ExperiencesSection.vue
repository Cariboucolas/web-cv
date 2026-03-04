<template>
  <section class="w-full pt-6">

    <!-- Mobile: cards empilées -->
    <div class="sm:hidden">
      <div class="xp-mobile-list">
        <div v-for="(xp, index) in experiences" :key="index" class="xp-mobile-card">
          <div class="xp-mobile-header">
            <div class="xp-mobile-header-icon" :class="{ 'xp-logo--oversized': isOversized(xp.company) }" :style="getCompanyBg(xp.company) ? { background: getCompanyBg(xp.company) } : {}">
              <img v-if="getCompanyLogo(xp.company)" :src="getCompanyLogo(xp.company)!" :alt="xp.company" class="xp-logo" />
              <Icon v-else name="material-symbols:work-outline" size="28" />
            </div>
            <div class="xp-mobile-header-text">
              <div class="xp-mobile-period">{{ formatPeriod(xp) }}</div>
              <h4 class="xp-mobile-company">{{ xp.position }}</h4>
              <p class="xp-mobile-position">{{ xp.company }}</p>
            </div>
          </div>
          <div class="xp-mobile-tags">
            <span v-for="tech in xp.technologies" :key="tech" class="xp-mobile-tag">
              {{ tech }}
            </span>
          </div>
          <ul class="xp-mobile-highlights">
            <li v-for="(highlight, hi) in xp.highlights" :key="hi">{{ highlight }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Desktop: timeline + cards -->
    <div class="hidden sm:block">
      <div class="xp-timeline">
        <div v-for="(xp, index) in experiences" :key="index" class="xp-row">
          <!-- Timeline -->
          <div class="timeline-col">
            <span class="timeline-dot" :class="{ 'timeline-dot--active': xp.periodEnd === null }"></span>
          </div>

          <!-- Card -->
          <div class="xp-card">
            <div class="xp-header">
              <div class="xp-header-icon" :class="{ 'xp-logo--oversized': isOversized(xp.company) }" :style="getCompanyBg(xp.company) ? { background: getCompanyBg(xp.company) } : {}">
                <img v-if="getCompanyLogo(xp.company)" :src="getCompanyLogo(xp.company)!" :alt="xp.company" class="xp-logo" />
                <Icon v-else name="material-symbols:work-outline" size="32" />
              </div>
              <div class="xp-header-text">
                <div class="xp-header-top">
                  <h4 class="xp-company">{{ xp.position }}</h4>
                  <span class="xp-period">{{ formatPeriod(xp) }}</span>
                </div>
                <p class="xp-position">{{ xp.company }}</p>
              </div>
            </div>
            <div class="xp-tags">
              <span v-for="tech in xp.technologies" :key="tech" class="desktop-tag">
                {{ tech }}
              </span>
            </div>
            <ul class="xp-highlights">
              <li v-for="(highlight, hi) in xp.highlights" :key="hi">{{ highlight }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// @ts-expect-error - auto-importé par @nuxtjs/i18n
const { t, tm, rt } = useI18n()

interface Experience {
  company: string
  position: string
  periodStart: string
  periodEnd: string | null
  technologies: string[]
  highlights: string[]
}

const experiences = computed<Experience[]>(() => {
  const raw = tm('experiences.items')
  if (!Array.isArray(raw)) return []
  return raw.map((item: any) => ({
    company: rt(item.company),
    position: rt(item.position),
    periodStart: rt(item.periodStart),
    periodEnd: item.periodEnd ? rt(item.periodEnd) : null,
    technologies: Array.isArray(item.technologies)
      ? item.technologies.map((tech: any) => rt(tech))
      : [],
    highlights: Array.isArray(item.highlights)
      ? item.highlights.map((h: any) => rt(h))
      : [],
  }))
})

const companyLogos: Record<string, string> = {
  'Decathlon MayDay': '/logos/logo_mayday.png',
  'Decathlon WeParis': '/logos/logo_weparis.png',
  'Decathlon InStore': '/logos/logo_decathlon.jpg',
  'Biscuiterie Poult': '/logos/logo_poult.jpg',
  'Intersport': '/logos/logo_intersport.jpg',
}

const getCompanyLogo = (company: string): string | null => {
  return companyLogos[company] ?? null
}

const companyBgColors: Record<string, string> = {
  'Decathlon InStore': '#0363d0',
  'Decathlon MayDay': '#ffffff',
  'Biscuiterie Poult': '#ffffff',
  'Intersport': '#ffffff',
}

const getCompanyBg = (company: string): string | null => {
  return companyBgColors[company] ?? null
}

const isOversized = (company: string): boolean => {
  return company === 'Decathlon InStore'
}

const formatPeriod = (xp: Experience): string => {
  if (xp.periodEnd === null) {
    return `${xp.periodStart} - ${t('experiences.today')}`
  }
  if (xp.periodStart === xp.periodEnd) {
    return xp.periodStart
  }
  return `${xp.periodStart} - ${xp.periodEnd}`
}
</script>

<style scoped>
/* ── Mobile ── */
.xp-mobile-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.xp-mobile-card {
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xp-mobile-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.xp-mobile-header-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #42b883;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.xp-mobile-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.xp-mobile-period {
  font-size: 11px;
  font-weight: 500;
  color: #42b883;
  letter-spacing: 0.5px;
}

.xp-mobile-company {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.xp-mobile-position {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.xp-mobile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.xp-mobile-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: #1e1e1e;
  border-radius: 4px;
  color: #42b883;
}

.xp-mobile-highlights {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xp-mobile-highlights li {
  font-size: 13px;
  line-height: 1.6;
  color: #aaa;
  padding-left: 14px;
  position: relative;
}

.xp-mobile-highlights li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #42b883;
}

/* ── Desktop: timeline + cards ── */
.xp-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.xp-row {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

/* Timeline column */
.timeline-col {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 40px;
  position: relative;
}

.timeline-col::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: -24px;
  width: 2px;
  background: rgba(66, 184, 131, 0.35);
  transform: translateX(-50%);
}

.xp-row:first-child .timeline-col::before {
  top: 40px;
}

.xp-row:last-child .timeline-col::before {
  bottom: auto;
  height: 46px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #42b883;
  position: relative;
  z-index: 1;
  border: 2px solid #0a0a0a;
}

.timeline-dot--active {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(66, 184, 131, 0.5); }
  50% { box-shadow: 0 0 0 6px rgba(66, 184, 131, 0); }
}

/* Card */
.xp-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  gap: 14px;
  box-shadow: 0 0 30px rgba(66, 184, 131, 0.06);
}

.xp-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
}

.xp-header-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #42b883;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.xp-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.xp-logo--oversized .xp-logo {
  width: 150%;
  height: 150%;
  object-fit: cover;
}

.xp-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.xp-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.xp-period {
  font-size: 13px;
  font-weight: 700;
  color: #42b883;
  white-space: nowrap;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.xp-company {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
  margin: 0;
}

.xp-position {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.xp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.desktop-tag {
  font-size: 11px;
  padding: 3px 8px;
  background: #1e1e1e;
  border-radius: 4px;
  color: #42b883;
}

.xp-highlights {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xp-highlights li {
  font-size: 14px;
  line-height: 1.7;
  color: #aaa;
  padding-left: 16px;
  position: relative;
}

.xp-highlights li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #42b883;
}
</style>
