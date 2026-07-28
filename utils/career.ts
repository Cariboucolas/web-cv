/**
 * Source unique de vérité pour toute durée affichée sur le site.
 * Les textes ne codent plus de nombre d'années en dur : ils le reçoivent d'ici.
 */

/** Début de carrière en développement : février 2021. Mois indexé à 0. */
export const DEV_CAREER_START = new Date(2021, 1, 1)

/**
 * Années révolues écoulées depuis `start`.
 * On retranche une année tant que la date anniversaire n'est pas passée,
 * sans quoi janvier afficherait déjà l'année suivante.
 */
export function fullYearsSince(start: Date, now: Date = new Date()): number {
  const years = now.getFullYear() - start.getFullYear()
  const monthDiff = now.getMonth() - start.getMonth()
  const anniversaryPassed =
    monthDiff > 0 || (monthDiff === 0 && now.getDate() >= start.getDate())
  return anniversaryPassed ? years : years - 1
}

/** Nombre d'années d'expérience en développement, à la date du jour. */
export function devExperienceYears(now: Date = new Date()): number {
  return fullYearsSince(DEV_CAREER_START, now)
}

/** Année en cours, utilisée pour les expériences toujours en poste. */
export function currentYear(now: Date = new Date()): number {
  return now.getFullYear()
}
