<template>
  <div class="home h-screen overflow-hidden p-2">
    <div class="max-w-6xl mx-auto h-full">
      <!-- Desktop Layout -->
      <div class="hidden md:flex md:items-center md:justify-center h-full">
        <div class="grid grid-cols-2 gap-4 container mx-auto px-2">
          <AboutSection class="col-span-1 cursor-pointer" @click="openSection('about')" />
          <PortfolioSection class="col-span-1 cursor-pointer" @click="openSection('portfolio')" />
          <div class="col-span-2 flex justify-center items-center my-4">
            <v-avatar size="200" class="elevation-4 bg-secondary">
              <Icon name="material-symbols:person" size="100" class="text-primary" />
            </v-avatar>
          </div>
          <SkillsSection class="col-span-1 cursor-pointer" @click="openSection('skills')" />
          <ContactSection class="col-span-1 cursor-pointer" @click="openSection('contact')" />
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="md:hidden flex flex-col gap-6">
        <div class="flex justify-center py-8">
          <v-avatar size="200" class="elevation-4 bg-secondary">
            <Icon name="material-symbols:person" size="100" class="text-primary" />
          </v-avatar>
        </div>
        <AboutSection />
        <PortfolioSection />
        <SkillsSection />
        <ContactSection />
      </div>

      <!-- Modal Section -->
      <Transition name="modal">
        <div v-if="activeSection" 
             class="fixed inset-0 flex items-center justify-center z-20"
        >
          <!-- Backdrop avec flou et transparence -->
          <div class="absolute inset-0 backdrop-blur-lg bg-black/30"
               @click="closeSection"
          ></div>

          <!-- Modal content -->
          <div class="relative z-30 max-w-2xl w-full m-4 transform 
                      bg-[var(--color-secondary)]
                      p-6 rounded-lg shadow-2xl"
               @click.stop
          >
            <button 
              @click="closeSection" 
              class="absolute top-4 right-4 text-white hover:text-primary"
            >
              <Icon name="material-symbols:close" size="24" />
            </button>
            <div class="section !transform-none">
              <template v-if="activeSection === 'about'">
                <AboutModal />
              </template>
              <template v-else-if="activeSection === 'portfolio'">
                <PortfolioModal />
              </template>
              <template v-else-if="activeSection === 'skills'">
                <SkillsModal />
              </template>
              <template v-else-if="activeSection === 'contact'">
                <ContactModal />
              </template>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Download Button -->
      <div class="fixed top-4 right-4 z-10">
        <button @click="downloadPDF" class="btn">
          <span class="hidden md:inline">Télécharger CV</span>
          <Icon 
            name="material-symbols:download" 
            class="md:hidden"
            size="24"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AboutSection from '~/components/AboutSection.vue'
import ContactSection from '~/components/ContactSection.vue'
import PortfolioSection from '~/components/PortfolioSection.vue'
import SkillsSection from '~/components/SkillsSection.vue'
import AboutModal from '~/components/modals/AboutModal.vue'
import ContactModal from '~/components/modals/ContactModal.vue'
import PortfolioModal from '~/components/modals/PortfolioModal.vue'
import SkillsModal from '~/components/modals/SkillsModal.vue'

const activeSection = ref<string | null>(null)

const openSection = (section: string) => {
  activeSection.value = section
}

const closeSection = () => {
  activeSection.value = null
}

const downloadPDF = () => {
  // Logique pour générer et télécharger le PDF
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.section-modal {
  animation: zoom-in 0.3s ease;
}

@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
