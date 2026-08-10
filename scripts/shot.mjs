#!/usr/bin/env node
/**
 * Capture une page à un viewport arbitraire, y compris sous les ~485 px
 * où `chrome --headless --screenshot` plafonne et se contente de recadrer.
 *
 * On passe par le protocole CDP et `Emulation.setDeviceMetricsOverride`,
 * qui impose un vrai viewport. La mécanique vit dans lib/cdp.mjs, partagée
 * avec le test de fumée.
 *
 *   node scripts/shot.mjs <url> <sortie.png> <largeur> [hauteur] [--full] [--still]
 */

import { openPage } from './lib/cdp.mjs'

const [url, outputPath, widthArgument, heightArgument] = process.argv.slice(2)
const fullPage = process.argv.includes('--full')
const still = process.argv.includes('--still')

if (!url || !outputPath || !widthArgument) {
  console.error(
    'usage: node scripts/shot.mjs <url> <sortie.png> <largeur> [hauteur] [--full] [--still]',
  )
  process.exit(1)
}

const page = await openPage({
  width: Number(widthArgument),
  height: Number(heightArgument) || 800,
  still,
})

await page.goto(url)
const { clientWidth, scrollWidth } = await page.metrics()
await page.screenshot(outputPath, { fullPage })
page.close()

const overflow =
  scrollWidth > clientWidth
    ? ` DEBORDEMENT +${scrollWidth - clientWidth}px`
    : ''
console.log(
  `${outputPath}  viewport=${clientWidth}px  scrollWidth=${scrollWidth}px${overflow}`,
)
