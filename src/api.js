const BASE_URL = 'https://www.dnd5eapi.co'

// Helper function to add delay between requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper function to process spells in batches
async function fetchSpellsBatch(spellIndexes, batchSize = 10, delayMs = 1000) {
	const results = []

	for (let i = 0; i < spellIndexes.length; i += batchSize) {
		const batch = spellIndexes.slice(i, i + batchSize)
		const batchResults = await Promise.all(
			batch.map((index) =>
				fetch(BASE_URL + index.url).then((response) => response.json())
			)
		)

		results.push(...batchResults)

		if (i + batchSize < spellIndexes.length) {
			await delay(delayMs) // Add delay between batches
		}
	}

	return results
}

export async function getAllSpells() {
	const response = await fetch(`${BASE_URL}/api/2014/spells`)
	const spellIndexes = await response.json()

	console.log('Fetched spell indexes:', spellIndexes)
	console.log(`Fetching ${spellIndexes.results.length} spells in batches...`)

	return fetchSpellsBatch(spellIndexes.results, 5, 2000) // 5 spells every 2 seconds
}

async function getSpellsList(index) {
	const response = await fetch(`${BASE_URL}/api/2014/spells`)
	const spellIndexes = await response.json()

	return spellIndexes.results
}

export async function fetchSpellPage(pageParam = 1) {
	const SPELLS_PER_PAGE = 12

	const spellsList = await getSpellsList()

	const start = pageParam * SPELLS_PER_PAGE
	const end = start + SPELLS_PER_PAGE
	const spellPageIndexes = spellsList.slice(start, end)

	const spells = await Promise.all(
		spellPageIndexes.map((index) =>
			fetch(`${BASE_URL}${index.url}`).then((response) => response.json())
		)
	)

	console.log(`Fetched page ${pageParam} with ${spells.length} spells.`)
	console.log('Batch complete')

	return {
		spells,
		nextPage: end < spellsList.length ? pageParam + 1 : null, // Determine if there's a next page
		totalSpells: spellsList.length
	}
}
