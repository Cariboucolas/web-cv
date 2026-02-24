<template>
  <div class="character-panel">
    <div class="character-avatar">
      <v-avatar size="225" class="large-avatar">
        <v-img src="https://avatars0.githubusercontent.com/u/0000001"/>
      </v-avatar>
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
  box-shadow: 0 0 40px rgba(66, 184, 131, 0.2);
  border: 3px solid rgba(66, 184, 131, 0.3);
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
    width: 188px !important;
    height: 188px !important;
  }
}

@media (max-width: 1024px) {
  .character-panel {
    flex-direction: row;
    gap: 20px;
  }

  .large-avatar {
    width: 113px !important;
    height: 113px !important;
  }
}

@media (max-width: 640px) {
  .large-avatar {
    width: 80px !important;
    height: 80px !important;
  }

  .character-name {
    font-size: 20px;
    letter-spacing: 2px;
  }
}
</style>

