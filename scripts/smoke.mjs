#!/usr/bin/env node
/**
 * Test de fumée du site construit. Sert `.output/public` puis vérifie, à deux
 * breakpoints, cinq invariants qui ne demandent aucune image de référence.
 *
 *   node scripts/smoke.mjs [racine]
 */

import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { openPage } from './lib/cdp.mjs'

const root = resolve(process.argv[2] ?? '.output/public')
const BREAKPOINTS = [390, 1440]
const SECTIONS = ['about', 'experiences', 'skills', 'projects']

/**
 * Le fragment de chemin que l'adresse de téléchargement doit porter, par
 * langue. Volontairement partiel : ce test décrit ce qu'un visiteur obtient —
 * le CV de la langue qu'il lit — et non la forme exacte de l'URL, qui
 * appartient au composant. Le nom du bucket ou l'encodage peuvent changer sans
 * que l'invariant devienne faux.
 */
const CV_DOWNLOAD_TARGETS = {
  fr: 'cv-colas-durcy-fr.pdf',
  en: 'cv-colas-durcy-en.pdf',
}

/** Les deux actions de l'en-tête : le lien qui rapporte le CV, et la bascule. */
const DOWNLOAD_LINK = '.header-actions a'
const LANGUAGE_TOGGLE = '.header-actions .icon-button'

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

/**
 * Écoute sur le port 0 : le système en attribue un libre, ce qui évite toute
 * collision avec un serveur de développement déjà lancé ou un autre job. Le
 * rappel de `listen` dit exactement quand le serveur est prêt, là où un serveur
 * externe imposerait une attente arbitraire.
 */
const startServer = () =>
  new Promise((ready) => {
    const server = createServer(async (request, response) => {
      // `decodeURIComponent` lève sur une séquence d'échappement mal formée
      // (`%E0` orphelin, par exemple). Sans ce filet, l'exception échapperait
      // au callback async de `createServer`, deviendrait un rejet non géré et
      // tuerait le processus avant que le `finally { server.close() }` plus
      // bas n'ait sa chance de tourner.
      let requestedPath
      try {
        requestedPath = decodeURIComponent(request.url.split('?')[0])
      } catch {
        response.writeHead(400).end()
        return
      }

      const relativePath = requestedPath.endsWith('/')
        ? `${requestedPath}index.html`
        : requestedPath
      const filePath = join(root, normalize(relativePath))

      // Un `..` dans l'URL ne doit pas sortir de la racine servie.
      if (!filePath.startsWith(root + sep) && filePath !== root) {
        response.writeHead(403).end()
        return
      }

      try {
        const contents = await readFile(filePath)
        response.writeHead(200, {
          'content-type':
            MIME_TYPES[extname(filePath)] ?? 'application/octet-stream',
        })
        response.end(contents)
      } catch {
        response.writeHead(404).end()
      }
    })

    server.listen(0, '127.0.0.1', () =>
      ready({ server, port: server.address().port }),
    )
  })

/**
 * Le lien de téléchargement de l'en-tête doit viser le CV PDF de la langue
 * affichée, et suivre la bascule sans que la page soit rechargée.
 *
 * Le CV PDF est servi par un autre domaine que le site : le test ne peut rien
 * observer de plus que l'adresse visée, et surtout pas le fichier lui-même. Un
 * CV périmé ou absent en production n'est donc pas de son ressort — c'est une
 * exclusion assumée, un CI qui rougit pour du contenu finit ignoré.
 *
 * Renvoie la liste des violations relevées.
 */
const checkDownloadFollowsLocale = async (page) => {
  const violations = []

  const readTarget = () =>
    page.evaluate(`document.querySelector('${DOWNLOAD_LINK}')?.href ?? null`)

  const frenchTarget = await readTarget()
  if (frenchTarget === null) {
    violations.push('lien de téléchargement absent de l’en-tête')
    return violations
  }
  if (!frenchTarget.includes(CV_DOWNLOAD_TARGETS.fr)) {
    violations.push(
      `lien de téléchargement en français : ${CV_DOWNLOAD_TARGETS.fr} attendu, vu ${frenchTarget}`,
    )
  }

  // Ce témoin distingue les deux façons de rater la bascule. Sans lui, une page
  // rechargée reviendrait au français et produirait le même message qu'une
  // cible restée figée, alors que la cause et le correctif diffèrent.
  await page.evaluate('window.__smokeSameDocument = true')

  const hasToggle = await page.evaluate(
    `Boolean(document.querySelector('${LANGUAGE_TOGGLE}'))`,
  )
  if (!hasToggle) {
    violations.push('bascule de langue absente de l’en-tête')
    return violations
  }
  await page.evaluate(`document.querySelector('${LANGUAGE_TOGGLE}').click()`)

  // La bascule charge le fichier de locale à la demande — i18n v10 impose le
  // chargement différé — donc l'adresse ne change pas dans le tick du clic. On
  // attend qu'elle change plutôt que de dormir une durée choisie au jugé.
  let englishTarget = frenchTarget
  for (
    let attempt = 0;
    attempt < 40 && englishTarget === frenchTarget;
    attempt++
  ) {
    await wait(100)
    englishTarget = await readTarget()
  }

  const sameDocument = await page.evaluate(
    'window.__smokeSameDocument === true',
  )
  if (!sameDocument) {
    violations.push('la bascule de langue a rechargé la page')
    return violations
  }

  if (!englishTarget?.includes(CV_DOWNLOAD_TARGETS.en)) {
    violations.push(
      `lien de téléchargement après bascule en anglais : ${CV_DOWNLOAD_TARGETS.en} attendu, vu ${englishTarget}`,
    )
  }

  return violations
}

/** Renvoie la liste des violations relevées à ce breakpoint. */
const checkBreakpoint = async (baseUrl, width) => {
  const violations = []
  let page

  try {
    page = await openPage({ width, height: 900, still: true })
    await page.goto(`${baseUrl}/`)

    const { clientWidth, scrollWidth } = await page.metrics()
    if (scrollWidth > clientWidth) {
      violations.push(
        `débordement horizontal de ${scrollWidth - clientWidth}px (scrollWidth ${scrollWidth} > viewport ${clientWidth})`,
      )
    }

    const missingSections = await page.evaluate(
      `JSON.stringify(${JSON.stringify(SECTIONS)}.filter((sectionId) => !document.getElementById(sectionId)))`,
    )
    for (const sectionId of JSON.parse(missingSections)) {
      violations.push(`section #${sectionId} absente de la page`)
    }

    const undecodable = await page.evaluate(
      'Promise.all([...document.images].map((image) => image.decode().then(() => null, () => image.currentSrc || image.src))).then((results) => JSON.stringify(results.filter(Boolean)))',
      { awaitPromise: true },
    )
    for (const source of JSON.parse(undecodable)) {
      violations.push(`image non décodable : ${source}`)
    }

    // En dernier : cet invariant est le seul qui agisse sur la page, et il la
    // laisse en anglais. Le passer avant les autres leur ferait vérifier un
    // état que le visiteur n'obtient pas au chargement.
    violations.push(...(await checkDownloadFollowsLocale(page)))

    for (const consoleError of page.consoleErrors) {
      violations.push(consoleError)
    }
  } catch (error) {
    // Un échec de lancement de Chrome ou de la prise de contact CDP ne doit
    // pas faire planter le script : il devient une violation comme les
    // autres, avec le message d'origine conservé intégralement.
    violations.push(error.message)
  } finally {
    page?.close()
  }

  return violations
}

const { server, port } = await startServer()
const baseUrl = `http://127.0.0.1:${port}`
let totalViolations = 0

try {
  for (const width of BREAKPOINTS) {
    const violations = await checkBreakpoint(baseUrl, width)
    if (violations.length === 0) {
      console.log(`${width}px : conforme`)
      continue
    }
    totalViolations += violations.length
    for (const violation of violations) {
      console.error(`${width}px : ${violation}`)
    }
  }
} finally {
  // Le serveur doit s'arrêter même si une violation imprévue s'échappe de
  // la boucle : sans ce filet, le port resterait ouvert derrière un process
  // qui a pourtant déjà rendu la main.
  server.close()
}

process.exit(totalViolations === 0 ? 0 : 1)
