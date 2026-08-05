#!/usr/bin/env node
/**
 * Capture une page à un viewport arbitraire, y compris sous les ~485 px
 * où `chrome --headless --screenshot` plafonne et se contente de recadrer.
 *
 * On passe donc par le protocole CDP et `Emulation.setDeviceMetricsOverride`,
 * qui impose un vrai viewport. Aucune dépendance : Node 22 expose `WebSocket`.
 *
 *   node scripts/shot.mjs <url> <sortie.png> <largeur> [hauteur] [--full]
 */

import { spawn } from 'node:child_process'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const [url, out, widthArg, heightArg] = process.argv.slice(2)
const fullPage = process.argv.includes('--full')

if (!url || !out || !widthArg) {
  console.error(
    'usage: node scripts/shot.mjs <url> <sortie.png> <largeur> [hauteur] [--full]',
  )
  process.exit(1)
}

const width = Number(widthArg)
const height = Number(heightArg) || 800
const port = 9222 + Math.floor(Math.random() * 500)

const profile = await mkdtemp(join(tmpdir(), 'shot-'))
const chrome = spawn(
  CHROME,
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

/** Le port n'écoute pas immédiatement : on réessaie jusqu'à ce qu'il réponde. */
const waitForTarget = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`)
      const targets = await res.json()
      const page = targets.find((t) => t.type === 'page')
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch {
      /* pas encore prêt */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('Chrome n’a pas ouvert son port de débogage')
}

const wsUrl = await waitForTarget()
const ws = new WebSocket(wsUrl)
await new Promise((resolve, reject) => {
  ws.onopen = resolve
  ws.onerror = () => reject(new Error('connexion CDP impossible'))
})

let nextId = 0
const pending = new Map()
const events = []

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id !== undefined) {
    const resolve = pending.get(msg.id)
    pending.delete(msg.id)
    resolve?.(msg.result)
  } else {
    events.push(msg.method)
  }
}

const send = (method, params = {}) => {
  const id = ++nextId
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve) => pending.set(id, resolve))
}

await send('Page.enable')
// Le viewport imposé ici est celui que voient les media queries, contrairement
// à --window-size qui ne fait que dimensionner l'image finale.
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 768,
})
await send('Page.navigate', { url })

/** On attend le chargement, puis un délai fixe pour les polices et l'hydratation. */
for (let i = 0; i < 80; i++) {
  if (events.includes('Page.loadEventFired')) break
  await new Promise((r) => setTimeout(r, 100))
}
await new Promise((r) => setTimeout(r, 1500))

const { result } = await send('Runtime.evaluate', {
  expression:
    'JSON.stringify({ vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth })',
  returnByValue: true,
})
const metrics = JSON.parse(result.value)

const shot = await send('Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: fullPage,
})
await writeFile(out, Buffer.from(shot.data, 'base64'))

ws.close()
chrome.kill()

const debord =
  metrics.sw > metrics.vw ? ` DEBORDEMENT +${metrics.sw - metrics.vw}px` : ''
console.log(
  `${out}  viewport=${metrics.vw}px  scrollWidth=${metrics.sw}px${debord}`,
)
