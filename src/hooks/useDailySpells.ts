import { useState, useEffect, useCallback } from 'react'
import { useAllSpells } from './useAllSpells'
import { loadDailySpells, saveDailySpells } from '../utils/localStorage'
import { validateSpellObject } from '../utils/validation'
import type { Spell } from '../types'

/**
 * Simple PRNG seeded by a string — produces deterministic results for the same date
 */
const seededRandom = (seed: string) => {
	let h = 0
	for (let i = 0; i < seed.length; i++) {
		h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
	}
	return () => {
		h = (h ^ (h >>> 13)) | 0
		h = (h ^ (h << 17)) | 0
		h = (h ^ (h >>> 5)) | 0
		return (h >>> 0) / 4294967296
	}
}

/**
 * Fisher-Yates shuffle with a seeded PRNG — deterministic for the same seed
 */
const seededShuffle = <T>(array: T[], seed: string): T[] => {
	const result = [...array]
	const random = seededRandom(seed)
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1))
		;[result[i], result[j]] = [result[j], result[i]]
	}
	return result
}

/**
 * Hook for managing daily spells
 * Picks 12 random spells from the cached spell data, seeded by date for consistency
 */
export function useDailySpells() {
	const [dailySpells, setDailySpells] = useState<Spell[]>([])
	const [lastGenerated, setLastGenerated] = useState<string | null>(null)
	const [isGenerating, setIsGenerating] = useState(false)

	const { spells: allSpells, isLoaded } = useAllSpells()

	const getCurrentDate = () => {
		return new Date().toISOString().split('T')[0]
	}

	const needsRefresh = useCallback(() => {
		if (!lastGenerated) return true
		return lastGenerated !== getCurrentDate()
	}, [lastGenerated])

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

	const generateDailySpells = useCallback(() => {
		if (!allSpells || allSpells.length === 0 || isGenerating) {
			return
		}

		setIsGenerating(true)

		try {
			const currentDate = getCurrentDate()
			const shuffled = seededShuffle(allSpells, currentDate)
			const selected = shuffled.slice(0, 12)

			const validSpells = selected.filter(validateSpellObject)

			if (validSpells.length === 0) {
				throw new Error('No valid spells found')
			}

			const success = saveDailySpells(validSpells, currentDate)

			if (success) {
				setDailySpells(validSpells)
				setLastGenerated(currentDate)
			} else {
				throw new Error('Failed to save daily spells to localStorage')
			}
		} catch (error) {
			console.error('Error generating daily spells:', error)
			loadStoredDailySpells()
		} finally {
			setIsGenerating(false)
		}
	}, [allSpells, isGenerating, loadStoredDailySpells])

	useEffect(() => {
		loadStoredDailySpells()
	}, [loadStoredDailySpells])

	useEffect(() => {
		if (isLoaded && needsRefresh() && !isGenerating) {
			generateDailySpells()
		}
	}, [isLoaded, needsRefresh, generateDailySpells, isGenerating])

	return {
		dailySpells,
		lastGenerated,
		isLoading: !isLoaded || isGenerating,
		isGenerating,
		error: null,
		hasError: false,
		needsRefresh: needsRefresh(),
		refreshDailySpells: generateDailySpells,
		spellIndexCount: allSpells?.length || 0,
		getCurrentDate
	}
}
