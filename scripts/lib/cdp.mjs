/**
 * Mécanique commune aux outils qui pilotent Chrome : résolution du binaire,
 * client CDP, et les trois attentes sans lesquelles une page paraît prête
 * alors qu'elle ne l'est pas.
 *
 * Aucune dépendance : Node 22 expose `WebSocket` et `fetch`.
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** Testés dans l'ordre : la variable d'environnement gagne toujours. */
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
]

export const resolveChromePath = () => {
  const found = CHROME_CANDIDATES.find(
    (candidate) => candidate && existsSync(candidate),
  )
  if (!found) {
    throw new Error(
      'Aucun binaire Chrome trouvé. Renseignez CHROME_PATH avec son chemin.',
    )
  }
  return found
}

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

/** Le port n'écoute pas immédiatement : on réessaie jusqu'à ce qu'il réponde. */
const waitForTarget = async (port) => {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`)
      const targets = await response.json()
      const pageTarget = targets.find((target) => target.type === 'page')
      if (pageTarget?.webSocketDebuggerUrl)
        return pageTarget.webSocketDebuggerUrl
    } catch {
      /* pas encore prêt */
    }
    await wait(250)
  }
  throw new Error('Chrome n’a pas ouvert son port de débogage')
}

export const openPage = async ({ width, height = 800, still = false }) => {
  const port = 9222 + Math.floor(Math.random() * 500)
  const profile = await mkdtemp(join(tmpdir(), 'cdp-'))

  const chrome = spawn(
    resolveChromePath(),
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  /**
   * Si une erreur survient avant que la Page ne soit renvoyée, l'appelant n'a
   * encore aucune référence sur laquelle appeler `close()` : Chrome et son
   * profil temporaire resteraient orphelins. `cleanup` sert de filet de
   * sécurité pour ce chemin d'échec, et devient l'implémentation de `close()`
   * une fois la Page construite. Elle renvoie la promesse de suppression du
   * profil : le chemin d'erreur ci-dessous l'attend avant de relancer, tandis
   * que `close()` la laisse courir en tâche de fond.
   *
   * `kill()` ne fait qu'envoyer le signal : Chrome continue d'écrire dans son
   * répertoire de profil pendant qu'il termine ses sous-processus, et peut le
   * recréer juste après qu'on l'a supprimé. On attend donc la sortie réelle du
   * processus avant de supprimer, sauf si elle a déjà eu lieu.
   */
  const cleanup = () => {
    const alreadyExited = chrome.exitCode !== null || chrome.signalCode !== null
    const exited = alreadyExited
      ? Promise.resolve()
      : new Promise((resolve) => chrome.once('exit', resolve))
    chrome.kill()
    return exited.then(() => rm(profile, { recursive: true, force: true }))
  }

  try {
    const socket = new WebSocket(await waitForTarget(port))
    await new Promise((resolve, reject) => {
      socket.onopen = resolve
      socket.onerror = () => reject(new Error('connexion CDP impossible'))
    })

    let nextId = 0
    const pending = new Map()
    const events = []
    const consoleErrors = []

    socket.onmessage = (message) => {
      const payload = JSON.parse(message.data)
      if (payload.id !== undefined) {
        const resolve = pending.get(payload.id)
        pending.delete(payload.id)
        resolve?.(payload.result)
        return
      }
      events.push(payload.method)
      if (
        payload.method === 'Runtime.consoleAPICalled' &&
        payload.params.type === 'error'
      ) {
        const text = payload.params.args
          .map((argument) => argument.value ?? argument.description ?? '')
          .join(' ')
        consoleErrors.push(`console.error: ${text}`)
      }
      if (payload.method === 'Runtime.exceptionThrown') {
        const details = payload.params.exceptionDetails
        consoleErrors.push(
          `exception: ${details.exception?.description ?? details.text}`,
        )
      }
    }

    const send = (method, params = {}) => {
      const id = ++nextId
      socket.send(JSON.stringify({ id, method, params }))
      return new Promise((resolve) => pending.set(id, resolve))
    }

    await send('Page.enable')
    await send('Runtime.enable')

    // Sans cela, une capture ne voit que ce que la directive `v-reveal` a déjà
    // révélé : tout ce qui est resté hors du champ garde `opacity: 0` et laisse
    // un aplat de fond à la place du contenu. Le site prévoit déjà la sortie —
    // sous `prefers-reduced-motion: reduce`, la directive s'abstient et le CSS
    // force l'affichage — il suffit de le demander avant la navigation, pour que
    // le `matchMedia` du montage voie la bonne valeur.
    if (still) {
      await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
      })
    }

    // Le viewport imposé ici est celui que voient les media queries, contrairement
    // à --window-size qui ne fait que dimensionner l'image finale.
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    })

    const evaluate = async (expression, { awaitPromise = false } = {}) => {
      const { result } = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise,
      })
      return result.value
    }

    const goto = async (url) => {
      await send('Page.navigate', { url })

      for (let attempt = 0; attempt < 80; attempt++) {
        if (events.includes('Page.loadEventFired')) break
        await wait(100)
      }
      await wait(1500)

      /**
       * Les captures de projets dimensionnent leur carte : tant qu'elles n'ont pas
       * abouti, le bas de la page est plus court qu'il ne le sera.
       */
      for (let attempt = 0; attempt < 40; attempt++) {
        const settled = await evaluate(
          '[...document.images].every((image) => image.complete && image.naturalWidth > 0)',
        )
        if (settled) break
        await wait(250)
      }

      /**
       * `complete` dit que les octets sont arrivés, pas que l'image est peignable.
       * Le showcase pose `decoding="async"` : hors du viewport initial, le décodage
       * n'a pas lieu avant que `captureBeyondViewport` ne peigne, et la capture rend
       * un aplat de fond à la place de l'écran du téléphone. On croit alors tenir un
       * bug d'affichage qui n'existe que dans l'image.
       */
      await evaluate(
        'Promise.all([...document.images].map((image) => image.decode().catch(() => {})))',
        { awaitPromise: true },
      )
    }

    const metrics = async () =>
      JSON.parse(
        await evaluate(
          'JSON.stringify({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth })',
        ),
      )

    const screenshot = async (outputPath, { fullPage = false } = {}) => {
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: fullPage,
      })
      await writeFile(outputPath, Buffer.from(shot.data, 'base64'))
    }

    const close = () => {
      socket.close()
      // Suppression en tâche de fond : un échec ici ne doit ni bloquer
      // l'appelant ni faire planter le processus via une rejection non gérée.
      cleanup().catch(() => {})
    }

    return { send, evaluate, goto, metrics, screenshot, consoleErrors, close }
  } catch (error) {
    // Ici, contrairement à `close()`, on attend la suppression : la fonction
    // est déjà asynchrone et l'appelant l'attend, donc autant garantir que le
    // profil a disparu avant que l'erreur d'origine ne remonte.
    await cleanup().catch(() => {})
    throw error
  }
}
