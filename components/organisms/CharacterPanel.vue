<template>
  <div class="character-panel">
    <div class="character-avatar">
      <div class="large-avatar">
        <img src="/images/avatar.jpg" alt="Colas Durcy" class="avatar-img"/>
      </div>
    </div>
    <div class="character-info">
      <h1 class="character-name">{{ 'Colas Durcy' }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.character-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.character-avatar {
  position: relative;
}

.large-avatar {
  width: 225px;
  height: 225px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(66, 184, 131, 0.2);
  border: 3px solid rgba(66, 184, 131, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center -10%;
}

.character-info {
  text-align: center;
}

.character-name {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #42b883;
  margin: 0 0 10px 0;
  font-family: "Orbitron", sans-serif;
}

@media (max-width: 1200px) {
  .large-avatar {
    width: 188px;
    height: 188px;
  }
}

@media (max-width: 1024px) {
  .character-panel {
    flex-direction: row;
    gap: 20px;
  }

  .large-avatar {
    width: 113px;
    height: 113px;
  }
}

@media (max-width: 640px) {
  .character-panel {
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .large-avatar {
    width: 130px;
    height: 130px;
  }

  .character-info {
    flex: 1;
    text-align: right;
  }

  .character-name {
    font-size: 26px;
    letter-spacing: 3px;
  }
}
</style>

