import { defineNuxtPlugin } from 'nuxt/app'
import type { DirectiveBinding } from 'vue'

/** Classe posée sur l'élément une fois qu'il est entré dans le champ. */
const REVEALED = 'reveal--in'

/**
 * Au-delà de ce rang, plus aucun délai n'est ajouté. Sans cette borne, la
 * onzième technologie d'une liste attendrait plus d'une demi-seconde après
 * la première — une cascade se lit, elle ne se subit pas.
 */
const MAX_STEPS = 8

/**
 * Directive `v-reveal` : révèle un élément à son entrée dans le champ.
 *
 * `v-reveal` seul, ou `v-reveal="i"` pour décaler l'apparition du i-ème
 * élément d'une liste et produire une cascade.
 *
 * Le masquage lui-même est en CSS (`assets/css/main.css`), conditionné à la
 * classe `.js-reveal` posée par le script d'amorçage de `nuxt.config.ts`.
 * La directive ne fait qu'observer et marquer.
 */
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  const ensureObserver = () => {
    if (observer) return observer

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add(REVEALED)
          // Une apparition ne se rejoue jamais : remonter la page ne doit
          // rien faire clignoter.
          observer?.unobserve(entry.target)
        }
      },
      // Le bas du champ est resserré de 10% pour que l'élément soit franchement
      // entré avant d'apparaître, plutôt qu'au ras du bord.
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    )

    return observer
  }

  nuxtApp.vueApp.directive('reveal', {
    /**
     * L'attribut est posé dès le rendu serveur, pas au montage : le CSS peut
     * donc masquer l'élément au tout premier affichage, sans qu'il ait le
     * temps de se montrer puis de disparaître.
     */
    getSSRProps: () => ({ 'data-reveal': '' }),

    mounted(el: HTMLElement, binding: DirectiveBinding<number | undefined>) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      if (!('IntersectionObserver' in window)) return

      const step = Math.min(Number(binding.value) || 0, MAX_STEPS)
      if (step > 0) {
        el.style.transitionDelay = `calc(${step} * var(--reveal-step))`
      }

      // Sur une navigation client, le rendu serveur n'a pas eu lieu : on
      // repose l'attribut nous-mêmes.
      el.dataset.reveal = ''

      ensureObserver().observe(el)
    },

    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    },
  })
})
