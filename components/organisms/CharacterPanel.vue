<template>
  <div class="character-panel">
    <div class="character-avatar">
      <div class="large-avatar">
        <picture>
          <source
              type="image/webp"
              srcset="/images/avatar-224.webp 224w, /images/avatar-336.webp 336w, /images/avatar-448.webp 448w"
              sizes="(max-width: 1024px) 110px, (max-width: 1200px) 140px, 160px"
          />
          <img
              src="/images/avatar-448.jpg"
              alt=""
              class="avatar-img"
              width="160"
              height="160"
              decoding="async"
          />
        </picture>
      </div>
    </div>
    <div class="character-info">
      <h1 class="character-name">Colas Durcy</h1>
      <p class="character-role">
        {{ t('profile.title') }}
        <span class="character-role-accent">{{ t('profile.subtitle') }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error - useI18n est auto-importé par @nuxtjs/i18n
const { t } = useI18n()
</script>

<style scoped>
.character-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 30px;
}

.character-avatar {
  position: relative;
}

.large-avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  /* Halo et bordure atténués : l'avatar ne doit plus concurrencer le titre
     de poste qu'on ajoute sous le nom. */
  box-shadow: 0 0 24px rgba(66, 184, 131, 0.12);
  border: 2px solid rgba(66, 184, 131, 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.character-info {
  text-align: left;
}

.character-name {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.8px;
  color: #fff;
  margin: 0;
}

.character-role {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: #42b883;
  margin: var(--space-inner-md) 0 0;
  line-height: 1.2;
}

.character-role-accent {
  display: block;
  color: #42b883;
}

@media (max-width: 1200px) {
  .large-avatar {
    width: 140px;
    height: 140px;
  }
}

@media (max-width: 1024px) {
  .character-panel {
    flex-direction: row;
    gap: 24px;
    align-items: center;
  }

  .character-info {
    text-align: left;
  }

  .large-avatar {
    width: 110px;
    height: 110px;
  }

  .character-name {
    font-size: 26px;
  }

  .character-role {
    font-size: 17px;
  }
}

@media (max-width: 640px) {
  /* En dessous de 640px, on repasse en colonne centrée : l'alignement à
     gauche de la tablette laissait le titre de poste orphelin sous un
     avatar plus large que lui. */
  .character-panel {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    width: 100%;
  }

  .character-info {
    flex: none;
    text-align: center;
  }

  .large-avatar {
    width: 110px;
    height: 110px;
  }

  .character-name {
    font-size: 24px;
    letter-spacing: -0.5px;
  }

  .character-role {
    font-size: 16px;
  }
}
</style>
