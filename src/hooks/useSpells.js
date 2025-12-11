import { useQuery } from '@tanstack/react-query'
import { getSpellIndexesByClass, getSpellDetailsForClass } from '../api'

// Hook to get the spell structure (class -> spell IDs mapping)
export function useSpellStructure() {
	return useQuery({
		queryKey: ['spellStructure'],
		queryFn: getSpellIndexesByClass,
		staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days - structure rarely changes
		gcTime: 7 * 24 * 60 * 60 * 1000, // Keep in cache for 7 days
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	})
}

// Hook to get spell details for a specific class (lazy loaded)
export function useClassSpells(className, spellIds, enabled = true) {
	return useQuery({
		queryKey: ['classSpells', className],
		queryFn: () => getSpellDetailsForClass(className, spellIds),
		enabled: enabled && spellIds && spellIds.length > 0,
		staleTime: 24 * 60 * 60 * 1000, // 24 hours
		gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	})
}

// Hook to get all available class names
export function useSpellClasses() {
	const { data: spellStructure, isLoading, error, isError } = useSpellStructure()

	return {
		classes: spellStructure ? Object.keys(spellStructure) : [],
		spellStructure, // Also return the full structure for other components
		isLoading,
		error,
		isError
	}
}
