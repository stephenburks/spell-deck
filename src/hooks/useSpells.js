import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
	getSpellIndexesByClass,
	getSpellDetailsForClass,
	getSpellDetailsProgressively
} from '../api'

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

export function useClassSpellsProgressive(className, spellIds, enabled = true) {
	// Manual state for progressive updates
	const [progressiveSpells, setProgressiveSpells] = useState([])
	const [progressState, setProgressState] = useState({
		isLoading: false,
		progress: { loaded: 0, total: 0, percentage: 0 }
	})

	// React Query for caching - but simpler query
	const queryResult = useQuery({
		queryKey: ['classSpellsProgressive', className],
		queryFn: async () => {
			// Reset progressive state when starting fresh load
			setProgressiveSpells([])
			setProgressState({
				isLoading: true,
				progress: { loaded: 0, total: spellIds.length, percentage: 0 }
			})

			const allSpells = []

			await getSpellDetailsProgressively(className, spellIds, (batchData) => {
				allSpells.push(...batchData.spells)
				const sortedSpells = allSpells.sort((a, b) => a.name.localeCompare(b.name))

				// Update progressive state immediately - this triggers UI updates!
				setProgressiveSpells(sortedSpells)
				setProgressState({
					isLoading: !batchData.isComplete,
					progress: batchData.progress
				})
			})

			return allSpells.sort((a, b) => a.name.localeCompare(b.name))
		},
		enabled: enabled && spellIds && spellIds.length > 0,
		staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
		gcTime: 7 * 24 * 60 * 60 * 1000,
		retry: 2
	})

	// Use cached data if available, otherwise use progressive data
	const currentSpells = queryResult.data || progressiveSpells

	return {
		data: currentSpells,
		isLoading: queryResult.isLoading || progressState.isLoading,
		isComplete: !!queryResult.data && !progressState.isLoading,
		progress: progressState.progress,
		error: queryResult.error,
		refetch: queryResult.refetch
	}
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
