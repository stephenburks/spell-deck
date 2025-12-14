import { useQuery } from '@tanstack/react-query'
import { getSpellIndexesByClass } from '../api'

/**
 * Hook to fetch all spells from the complete spell database
 * Combines spells from all classes and removes duplicates
 */
export function useAllSpells() {
	return useQuery({
		queryKey: ['allSpells'],
		queryFn: async () => {
			// Get spell indexes by class
			const spellsByClass = await getSpellIndexesByClass()

			// Collect all unique spell indexes
			const allSpellIndexes = new Set()
			Object.values(spellsByClass).forEach((spellIds) => {
				spellIds.forEach((id) => allSpellIndexes.add(id))
			})

			// Convert to array and fetch spell details
			const spellIndexArray = Array.from(allSpellIndexes)
			console.log(`Fetching ${spellIndexArray.length} unique spells...`)

			// Fetch spell details in batches
			const BASE_URL = 'https://www.dnd5eapi.co'
			const batchSize = 10
			const delayMs = 500
			const allSpells = []

			for (let i = 0; i < spellIndexArray.length; i += batchSize) {
				const batch = spellIndexArray.slice(i, i + batchSize)
				const batchResults = await Promise.all(
					batch.map((index) =>
						fetch(`${BASE_URL}/api/2014/spells/${index}`).then((response) =>
							response.json()
						)
					)
				)

				allSpells.push(...batchResults)

				// Add delay between batches (except for the last one)
				if (i + batchSize < spellIndexArray.length) {
					await new Promise((resolve) => setTimeout(resolve, delayMs))
				}
			}

			// Sort alphabetically by name
			const sortedSpells = allSpells.sort((a, b) => a.name.localeCompare(b.name))

			console.log(`Loaded ${sortedSpells.length} total spells`)
			return sortedSpells
		},
		staleTime: 24 * 60 * 60 * 1000, // 24 hours - spells don't change often
		gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	})
}
