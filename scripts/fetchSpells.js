// scripts/fetchSpells.js
// Run with: node scripts/fetchSpells.js
// Writes output to: public/data/spells.json

const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://www.dnd5eapi.co/api/2014'
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'spells.json')

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchJSON(url) {
	const res = await fetch(url)
	if (!res.ok) throw new Error(`${res.status} ${url}`)
	return res.json()
}

async function main() {
	console.log('Fetching spell index...')
	const { results } = await fetchJSON(`${BASE_URL}/spells?limit=500`)
	console.log(`Found ${results.length} spells. Fetching details...`)

	const spells = []
	const batchSize = 20

	for (let i = 0; i < results.length; i += batchSize) {
		const batch = results.slice(i, i + batchSize)
		const batchResults = await Promise.all(
			batch.map((s) => fetchJSON(`${BASE_URL}/spells/${s.index}`))
		)
		spells.push(...batchResults)
		process.stdout.write(`\r  ${spells.length}/${results.length}`)
		if (i + batchSize < results.length) await delay(200)
	}

	spells.sort((a, b) => a.name.localeCompare(b.name))

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(spells, null, 2))
	console.log(`\nWrote ${spells.length} spells to ${OUTPUT_PATH}`)
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
