import { useMemo } from 'react'
import Fuse from 'fuse.js'

export function useSpellSearchIndex(spells) {
	return useMemo(() => {
		if (!spells?.length) return null

		// Configure Fuse.js options for optimal spell searching
		const fuseOptions = {
			keys: [
				{ name: 'name', weight: 0.4 }, // Spell name gets highest priority
				{ name: 'school.name', weight: 0.2 }, // School is important for filtering
				{ name: 'level', weight: 0.1 }, // Level searches
				{ name: 'casting_time', weight: 0.1 }, // "1 action", "1 bonus action", etc.
				{ name: 'desc', weight: 0.2 } // Description text (lower priority but searchable)
			],
			threshold: 0.3, // 0 = exact match, 1 = match anything. 0.3 is good balance
			includeScore: true, // Include relevance scores for sorting
			minMatchCharLength: 2, // Minimum characters before searching
			ignoreLocation: true, // Don't care where in the text the match occurs
			findAllMatches: true, // Find all matching patterns, not just the first
			useExtendedSearch: false // Keep it simple for now
		}

		// Create the Fuse search index
		const fuse = new Fuse(spells, fuseOptions)

		// Create a Map for quick spell lookups by index
		const spellsById = new Map(spells.map((spell) => [spell.index, spell]))

		return {
			fuse,
			spellsById,
			totalSpells: spells.length
		}
	}, [spells])
}

export function useSpellSearch(spells, searchTerm) {
	const searchIndex = useSpellSearchIndex(spells)

	return useMemo(() => {
		// Return all spells if no search term
		if (!searchTerm?.trim() || !searchIndex) {
			return spells || []
		}

		const term = searchTerm.trim()

		// Don't search with very short terms to avoid too many results
		if (term.length < 2) {
			return []
		}

		// Perform the search
		const searchResults = searchIndex.fuse.search(term)

		// Extract the spell objects and sort by relevance score (lower score = better match)
		return searchResults
			.sort((a, b) => a.score - b.score)
			.map((result) => result.item)
			.slice(0, 50) // Limit results to prevent UI overload
	}, [spells, searchTerm, searchIndex])
}
