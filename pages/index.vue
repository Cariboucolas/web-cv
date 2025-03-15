<template>
  <div class="top-light"/>
  <v-card class="card pt-16" max-width="800">
    <v-avatar size="300" class="ma-auto">
      <v-img src="https://avatars0.githubusercontent.com/u/0000001"/>
    </v-avatar>
    <v-card-title class="text-h4 py-10 text-center font-weight-bold">WEB DEVELOPER FULLSTACK</v-card-title>
    <v-card-text>
      <v-card-subtitle class="text-h6 font-weight-bold">
        A propos de moi
      </v-card-subtitle>
      <AboutSection class="pb-8"/>
      <v-card-subtitle class="text-h6 font-weight-bold">
        Compétences
      </v-card-subtitle>
      <SkillsSection class="pt-4 pb-8"/>
      <v-card-subtitle class="text-h6 font-weight-bold">
        Portfolio
      </v-card-subtitle>
      <PortfolioSection class="mt-4"/>

    </v-card-text>
    <v-card-actions>
      <v-btn icon="mdiCloud" class="button"/>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
</script>

<style scoped>
@import url("https://fonts.cdnfonts.com/css/mona-sans");

* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  scroll-behavior: smooth;
}

html, body {
  overflow: hidden;
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin: 0;
  background: #343434;
  background: linear-gradient(
      180deg,
      #343434 0%,
      #252525 100%
  );
  font-family: "Mona-Sans", sans-serif;
  font-family: "Mona Sans", sans-serif;
}

.card {
  position: absolute;
  left: 0;
  right: 0;
  top: 5%;
  margin: auto;
  border-radius: 16px;
  background: #191919aa;
  background: linear-gradient(
      180deg,
      #292929aa 0%,
      #191919cc 50%
  );
  backdrop-filter: blur(4px);
  box-shadow: inset 0 2px 2px 0 #00ff0044,
  inset 0 -2px 2px 0 #0003;

  color: #ccc;
  text-shadow: 1px 1px 3px #333a;
  padding: 24px;
  padding-right: 42px;
  display: flex;
  flex-direction: column;
  justify-content: end;

  .button {
    width: fit-content;
    border-radius: 100px;
    padding: 8px 36px;
    margin-top: 12px;
    background: #fff2;
    box-shadow: 0 0 0 1px #fff3,
    inset 120px 0 100px -100px #000c,
    0 0 0 0 #fff1;

    transition: box-shadow 0.4s ease-in-out;
    cursor: pointer;

    &:hover {
      box-shadow: 0 0 0 1px #fff3,
      inset 200px 0px 100px -100px #000a,
      -4px 0 8px 2px #fff2;
    }
  }
}

.top-light {
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  width: 580px;
  height: 6px;
  border-radius: 10px;
  background: #00ff00;
  box-shadow: 0 0px 1px 1px #00cc00,
  0 1px 2px 1px #00cc00,
  0 2px 6px 1px #00cc00,
  0 4px 12px 0px #00cc00,
  0 12px 20px 12px #00cc0022;
}
</style>
