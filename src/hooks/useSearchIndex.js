import { useMemo } from 'react'
import Fuse from 'fuse.js'

// Optimized search index hook that creates Fuse instance once
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
				{ name: 'desc', weight: 0.2 }, // Description text (lower priority but searchable)
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
			threshold: 0.3, // 0 = exact match, 1 = match anything. 0.3 is good balance
			includeScore: true, // Include relevance scores for sorting
			minMatchCharLength: 2, // Minimum characters before searching
			ignoreLocation: true, // Don't care where in the text the match occurs
			findAllMatches: true, // Find all matching patterns, not just the first
			useExtendedSearch: false // Keep it simple for now
		}

		// Create the Fuse search index ONCE
		const fuse = new Fuse(spells, fuseOptions)

		// Create a Map for quick spell lookups by index
		const spellsById = new Map(spells.map((spell) => [spell.index, spell]))

		return {
			fuse,
			spellsById,
			totalSpells: spells.length,
			// Return search function that uses the cached Fuse instance
			search: (term) => {
				if (!term?.trim() || term.length < 2) {
					return []
				}

				const results = fuse.search(term.trim())
				return results.sort((a, b) => a.score - b.score).map((result) => result.item)
			}
		}
	}, [spells])
}

// Simplified search hook that uses the cached Fuse instance
export function useSpellSearch(searchIndex, searchTerm) {
	return useMemo(() => {
		if (!searchIndex || !searchTerm?.trim()) {
			return []
		}

		return searchIndex.search(searchTerm)
	}, [searchIndex, searchTerm])
}

// Hook for efficient filtering without recreating arrays
export function useSpellFilter(spells, filters) {
	return useMemo(() => {
		if (!spells?.length) return []

		const { classes, levels, schools } = filters

		// Early return if no filters
		if (!classes?.length && !levels?.length && !schools?.length) {
			return spells
		}

		return spells.filter((spell) => {
			// Class filter
			if (classes?.length > 0) {
				if (!spell.classes?.some((cls) => classes.includes(cls.name))) {
					return false
				}
			}

			// Level filter
			if (levels?.length > 0) {
				if (!levels.includes(spell.level)) {
					return false
				}
			}

			// School filter
			if (schools?.length > 0) {
				if (!spell.school?.name || !schools.includes(spell.school.name)) {
					return false
				}
			}

			return true
		})
	}, [spells, filters])
}
