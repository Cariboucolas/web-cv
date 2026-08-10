#!/usr/bin/env node
/**
 * Test de fumée du site construit. Sert `.output/public` puis vérifie, à deux
 * breakpoints, quatre invariants qui ne demandent aucune image de référence.
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
