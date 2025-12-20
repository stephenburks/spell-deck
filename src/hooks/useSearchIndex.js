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
				{
					name: 'classes',
					weight: 0.25,
					getFn: (spell) => {
						// Extract class names for searching
						if (!spell.classes || !Array.isArray(spell.classes)) return ''
						return spell.classes.map((cls) => cls.name).join(' ')
					}
				}, // Class names for filtering
				{
					name: 'searchableLevel',
					weight: 0.15,
					getFn: (spell) => {
						if (spell.level === 0) {
							return 'cantrip 0 level0' // Multiple search terms for level 0
						}
						return `level${spell.level} ${spell.level}` // "level1 1", "level2 2", etc.
					}
				}, // Level/cantrip searching
				{ name: 'level', weight: 0.1 }, // Raw level numbers for direct searches
				{ name: 'school.name', weight: 0.1 }, // School names
				{ name: 'desc', weight: 0.05 } // Description text (lowest priority)
			],
			threshold: 0.25, // Lower threshold for more precise matches (0 = exact, 1 = anything)
			includeScore: true, // Include relevance scores for sorting
			minMatchCharLength: 2, // Minimum characters before searching
			ignoreLocation: false, // Location matters for relevance
			findAllMatches: false, // Only find first match for better performance
			useExtendedSearch: false, // Keep it simple for performance
			shouldSort: true, // Let Fuse handle sorting
			distance: 50, // Shorter distance for more precise matches
			maxPatternLength: 32, // Limit pattern length for performance
			isCaseSensitive: false // Case insensitive search
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

				const results = fuse.search(term.trim(), { limit: 100 }) // Limit results for performance

				// Filter out results with very poor scores (> 0.6 means very loose match)
				const filteredResults = results.filter((result) => result.score <= 0.6)

				return filteredResults
					.sort((a, b) => a.score - b.score) // Sort by relevance (lower score = better match)
					.map((result) => result.item)
			}
		}
	}, [spells])
}

// Simplified search hook that uses the cached Fuse instance with better performance
export function useSpellSearch(searchIndex, searchTerm) {
	return useMemo(() => {
		// Early return for empty/short search terms
		if (!searchIndex || !searchTerm?.trim() || searchTerm.trim().length < 2) {
			return []
		}

		// Use the cached search function from the index
		return searchIndex.search(searchTerm.trim())
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
