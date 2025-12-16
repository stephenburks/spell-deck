import { useQuery } from '@tanstack/react-query'
import { getAllSpellDetails } from '../api'

/**
 * Hook to fetch all spells from the complete spell database
 * Combines spells from all classes, removes duplicates, and provides comprehensive error handling
 *
 * @returns {Object} Query result with data, loading, error states and additional utilities
 */
export function useAllSpells() {
	const queryResult = useQuery({
		queryKey: ['allSpells'],
		queryFn: getAllSpellDetails,
		staleTime: 24 * 60 * 60 * 1000, // 24 hours - spells don't change often
		gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
		retry: 3, // Increased retry attempts for better reliability
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		// Add network error retry logic
		retryCondition: (error) => {
			// Retry on network errors, timeouts, and 5xx server errors
			return (
				error?.message?.includes('fetch') ||
				error?.message?.includes('network') ||
				error?.message?.includes('timeout') ||
				error?.message?.includes('500') ||
				error?.message?.includes('502') ||
				error?.message?.includes('503') ||
				error?.message?.includes('504')
			)
		}
	})

	// Return enhanced query result with additional utilities
	return {
		...queryResult,
		// Convenience properties for better DX
		spells: queryResult.data || [],
		isLoaded: !!queryResult.data && !queryResult.isLoading,
		hasError: !!queryResult.error,
		spellCount: queryResult.data?.length || 0,
		// Helper method to get spells by level
		getSpellsByLevel: (level) => {
			if (!queryResult.data) return []
			return queryResult.data.filter((spell) => spell.level === level)
		},
		// Helper method to search spells by name
		searchSpells: (searchTerm) => {
			if (!queryResult.data || !searchTerm) return queryResult.data || []
			const term = searchTerm.toLowerCase()
			return queryResult.data.filter(
				(spell) =>
					spell.name.toLowerCase().includes(term) ||
					spell.desc?.some((desc) => desc.toLowerCase().includes(term))
			)
		}
	}
}
