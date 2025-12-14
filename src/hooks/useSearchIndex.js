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
	return useMemo(() => {
		if (!searchTerm?.trim() || !spells?.length) {
			return spells || []
		}

		const term = searchTerm.trim()
		if (term.length < 2) {
			return []
		}

		const fuseOptions = {
			keys: [
				{ name: 'name', weight: 0.4 },
				{ name: 'school.name', weight: 0.2 },
				{ name: 'level', weight: 0.15 },
				{ name: 'casting_time', weight: 0.1 },
				{ name: 'desc', weight: 0.15 },
				// Add computed field for level/cantrip searching
				{
					name: 'searchableLevel',
					weight: 0.2,
					getFn: (spell) => {
						if (spell.level === 0) {
							return 'cantrip 0 level0' // Multiple search terms for level 0
						}
						return `level${spell.level} ${spell.level}` // "level1 1", "level2 2", etc.
					}
				}
			],
			threshold: 0.3,
			includeScore: true,
			minMatchCharLength: 2,
			ignoreLocation: true,
			findAllMatches: true,
			useExtendedSearch: false
		}

		const fuse = new Fuse(spells, fuseOptions)
		const searchResults = fuse.search(term)

		return searchResults
			.sort((a, b) => a.score - b.score)
			.map((result) => result.item)
			.slice(0, 50)
	}, [spells, searchTerm])
}
