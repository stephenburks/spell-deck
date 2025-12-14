import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllSpellIndexes, getSpellsByIndexes } from '../api'
import { loadDailySpells, saveDailySpells } from '../utils/localStorage'
import { sanitizeSpellObject } from '../utils/validation'

/**
 * Hook for managing daily spells with optimized loading
 * Only fetches the 12 spells needed for the day instead of the entire database
 */
export function useDailySpells() {
	const [dailySpells, setDailySpells] = useState([])
	const [lastGenerated, setLastGenerated] = useState(null)
	const [isGenerating, setIsGenerating] = useState(false)

	// Get current date in YYYY-MM-DD format
	const getCurrentDate = () => {
		const now = new Date()
		return now.toISOString().split('T')[0]
	}

	// Check if daily spells need to be refreshed
	const needsRefresh = useCallback(() => {
		if (!lastGenerated) return true
		const currentDate = getCurrentDate()
		return lastGenerated !== currentDate
	}, [lastGenerated])

	// Fetch all spell indexes (lightweight operation)
	const spellIndexesQuery = useQuery({
		queryKey: ['spellIndexes'],
		queryFn: getAllSpellIndexes,
		staleTime: 24 * 60 * 60 * 1000, // 24 hours
		gcTime: 24 * 60 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	})

	// Generate 12 random spell indexes
	const generateRandomSpellIndexes = useCallback((allIndexes, count = 12) => {
		if (!allIndexes || allIndexes.length === 0) {
			return []
		}

		const availableIndexes = [...allIndexes]
		const selectedIndexes = []
		const numToSelect = Math.min(count, availableIndexes.length)

		for (let i = 0; i < numToSelect; i++) {
			const randomIndex = Math.floor(Math.random() * availableIndexes.length)
			const selectedIndex = availableIndexes.splice(randomIndex, 1)[0]
			selectedIndexes.push(selectedIndex)
		}

		return selectedIndexes
	}, [])

	// Load daily spells from localStorage
	const loadStoredDailySpells = useCallback(() => {
		const storedData = loadDailySpells()

		if (storedData.spells && storedData.spells.length === 12 && storedData.generatedDate) {
			setDailySpells(storedData.spells)
			setLastGenerated(storedData.generatedDate)
			return true
		}

		setDailySpells([])
		setLastGenerated(null)
		return false
	}, [])

	// Generate new daily spells
	const generateDailySpells = useCallback(async () => {
		if (!spellIndexesQuery.data || isGenerating) {
			return
		}

		setIsGenerating(true)

		try {
			// Generate 12 random spell indexes
			const randomIndexes = generateRandomSpellIndexes(spellIndexesQuery.data, 12)

			if (randomIndexes.length === 0) {
				throw new Error('No spell indexes available')
			}

			// Fetch only the 12 selected spells
			const fetchedSpells = await getSpellsByIndexes(randomIndexes)

			// Validate and sanitize spells
			const validSpells = fetchedSpells
				.map((spell) => sanitizeSpellObject(spell))
				.filter(Boolean)

			if (validSpells.length === 0) {
				throw new Error('No valid spells fetched')
			}

			// Save to localStorage
			const currentDate = getCurrentDate()
			const success = saveDailySpells(validSpells, currentDate)

			if (success) {
				setDailySpells(validSpells)
				setLastGenerated(currentDate)
				console.log(`Generated ${validSpells.length} daily spells for ${currentDate}`)
			} else {
				throw new Error('Failed to save daily spells to localStorage')
			}
		} catch (error) {
			console.error('Error generating daily spells:', error)
			// Fallback: try to load any existing spells
			loadStoredDailySpells()
		} finally {
			setIsGenerating(false)
		}
	}, [spellIndexesQuery.data, isGenerating, generateRandomSpellIndexes, loadStoredDailySpells])

	// Load stored spells on mount
	useEffect(() => {
		loadStoredDailySpells()
	}, [loadStoredDailySpells])

	// Generate new spells when indexes are available and refresh is needed
	useEffect(() => {
		if (spellIndexesQuery.data && needsRefresh() && !isGenerating) {
			generateDailySpells()
		}
	}, [spellIndexesQuery.data, needsRefresh, generateDailySpells, isGenerating])

	return {
		// Daily spells data
		dailySpells,
		lastGenerated,

		// Loading states
		isLoading: spellIndexesQuery.isLoading || isGenerating,
		isGenerating,

		// Error states
		error: spellIndexesQuery.error,
		hasError: !!spellIndexesQuery.error,

		// Utility functions
		needsRefresh: needsRefresh(),
		refreshDailySpells: generateDailySpells,

		// Query info
		spellIndexCount: spellIndexesQuery.data?.length || 0,

		// Helper methods
		getCurrentDate
	}
}
