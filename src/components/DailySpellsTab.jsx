import { useState, useEffect, useCallback } from 'react'
import { Box, Heading, Text, SimpleGrid, Alert } from '@chakra-ui/react'
import SpellCard from './spellCard.jsx'
import Loading from './loading.jsx'
import { useAllSpells } from '../hooks/useAllSpells.js'
import {
	loadDailySpells,
	saveDailySpells,
	loadSpellbook,
	saveSpellbook,
	loadSessionDeck,
	saveSessionDeck
} from '../utils/localStorage.js'
import { validateSpellObject, sanitizeSpellObject } from '../utils/validation.js'
import { addSessionId } from '../utils/spellGrouping.js'

/**
 * DailySpellsTab component
 * Displays 12 randomly selected spells that refresh daily at midnight
 * Provides actions to add spells to spellbook or session deck
 */
export default function DailySpellsTab() {
	const [dailySpells, setDailySpells] = useState([])
	const [lastGenerated, setLastGenerated] = useState(null)
	const [isGenerating, setIsGenerating] = useState(false)

	// Fetch all spells for random selection
	const { data: allSpells, isLoading: isLoadingSpells, error: spellsError } = useAllSpells()

	/**
	 * Get current date in YYYY-MM-DD format
	 */
	const getCurrentDate = () => {
		const now = new Date()
		return now.toISOString().split('T')[0]
	}

	/**
	 * Check if daily spells need to be refreshed (midnight refresh logic)
	 */
	const needsRefresh = useCallback(() => {
		if (!lastGenerated) return true

		const currentDate = getCurrentDate()
		return lastGenerated !== currentDate
	}, [lastGenerated])

	/**
	 * Generate 12 random spells from the complete spell database
	 */
	const generateDailySpells = useCallback(() => {
		if (!allSpells || allSpells.length === 0) {
			console.warn('No spells available for daily generation')
			return []
		}

		// Create a copy of the spells array to avoid mutating the original
		const availableSpells = [...allSpells]
		const selectedSpells = []

		// Select 12 random spells (or all available if less than 12)
		const numToSelect = Math.min(12, availableSpells.length)

		for (let i = 0; i < numToSelect; i++) {
			const randomIndex = Math.floor(Math.random() * availableSpells.length)
			const selectedSpell = availableSpells.splice(randomIndex, 1)[0]

			// Validate and sanitize the spell
			const sanitizedSpell = sanitizeSpellObject(selectedSpell)
			if (sanitizedSpell) {
				selectedSpells.push(sanitizedSpell)
			}
		}

		return selectedSpells
	}, [allSpells])

	/**
	 * Load daily spells from localStorage or generate new ones
	 */
	const loadDailySpellsData = useCallback(() => {
		const storedData = loadDailySpells()

		if (storedData.spells && storedData.spells.length === 12 && storedData.generatedDate) {
			setDailySpells(storedData.spells)
			setLastGenerated(storedData.generatedDate)
		} else {
			// No valid stored data, will generate new spells when allSpells is available
			setDailySpells([])
			setLastGenerated(null)
		}
	}, [])

	/**
	 * Generate and save new daily spells
	 */
	const refreshDailySpells = useCallback(() => {
		if (!allSpells || isGenerating) return

		setIsGenerating(true)

		try {
			const newSpells = generateDailySpells()
			const currentDate = getCurrentDate()

			// Save to localStorage
			const success = saveDailySpells(newSpells, currentDate)

			if (success) {
				setDailySpells(newSpells)
				setLastGenerated(currentDate)
				console.log(`Generated ${newSpells.length} daily spells for ${currentDate}`)
			} else {
				console.error('Failed to save daily spells to localStorage')
			}
		} catch (error) {
			console.error('Error generating daily spells:', error)
		} finally {
			setIsGenerating(false)
		}
	}, [allSpells, generateDailySpells, isGenerating])

	/**
	 * Handle adding a spell to the user's spellbook
	 */
	const handleAddToSpellbook = useCallback((spell) => {
		try {
			const spellbookData = loadSpellbook()

			// Check if spell already exists in spellbook (prevent duplicates)
			const existingSpell = spellbookData.spells.find((s) => s.index === spell.index)
			if (existingSpell) {
				console.log(`Spell "${spell.name}" is already in spellbook`)
				return
			}

			// Add spell to spellbook
			const updatedSpells = [...spellbookData.spells, spell]
			const success = saveSpellbook(updatedSpells)

			if (success) {
				console.log(`Added "${spell.name}" to spellbook`)
			} else {
				console.error('Failed to save spell to spellbook')
			}
		} catch (error) {
			console.error('Error adding spell to spellbook:', error)
		}
	}, [])

	/**
	 * Handle adding a spell to the session deck
	 */
	const handleAddToSession = useCallback((spell) => {
		try {
			const sessionData = loadSessionDeck()

			// Add session ID to the spell
			const sessionSpell = addSessionId(spell)
			if (!sessionSpell) {
				console.error('Failed to create session spell')
				return
			}

			// Add spell to session deck
			const updatedSpells = [...sessionData.spells, sessionSpell]
			const success = saveSessionDeck(updatedSpells)

			if (success) {
				console.log(`Added "${spell.name}" to session deck`)
			} else {
				console.error('Failed to save spell to session deck')
			}
		} catch (error) {
			console.error('Error adding spell to session deck:', error)
		}
	}, [])

	/**
	 * Handle spell card actions
	 */
	const handleSpellAction = useCallback(
		(actionType, spell) => {
			if (!validateSpellObject(spell)) {
				console.error('Invalid spell object for action:', actionType)
				return
			}

			switch (actionType) {
				case 'addToSpellbook':
					handleAddToSpellbook(spell)
					break
				case 'addToSession':
					handleAddToSession(spell)
					break
				default:
					console.warn('Unknown action type:', actionType)
			}
		},
		[handleAddToSpellbook, handleAddToSession]
	)

	// Load daily spells on component mount
	useEffect(() => {
		loadDailySpellsData()
	}, [loadDailySpellsData])

	// Generate new spells when allSpells is available and refresh is needed
	useEffect(() => {
		if (allSpells && allSpells.length > 0 && needsRefresh()) {
			refreshDailySpells()
		}
	}, [allSpells, needsRefresh, refreshDailySpells])

	// Show loading state while spells are being fetched
	if (isLoadingSpells) {
		return (
			<Box p={6}>
				<Heading size="lg" mb={4}>
					Spells of the Day
				</Heading>
				<Loading />
				<Text mt={4} color="gray.600">
					Loading spell database...
				</Text>
			</Box>
		)
	}

	// Show error state if spell loading failed
	if (spellsError) {
		return (
			<Box p={6}>
				<Heading size="lg" mb={4}>
					Spells of the Day
				</Heading>
				<Alert status="error">
					<Alert.Icon />
					<Box>
						<Alert.Title>Failed to load spells</Alert.Title>
						<Alert.Description>
							Unable to fetch spell database. Please check your connection and try
							again.
						</Alert.Description>
					</Box>
				</Alert>
			</Box>
		)
	}

	// Show generating state
	if (isGenerating) {
		return (
			<Box p={6}>
				<Heading size="lg" mb={4}>
					Spells of the Day
				</Heading>
				<Loading />
				<Text mt={4} color="gray.600">
					Generating today's spell selection...
				</Text>
			</Box>
		)
	}

	// Show empty state if no daily spells are available
	if (!dailySpells || dailySpells.length === 0) {
		return (
			<Box p={6}>
				<Heading size="lg" mb={4}>
					Spells of the Day
				</Heading>
				<Text color="gray.600">
					No daily spells available. Please try refreshing the page.
				</Text>
			</Box>
		)
	}

	return (
		<Box p={6}>
			<Heading size="lg" mb={2}>
				Spells of the Day
			</Heading>
			<Text color="gray.600" mb={6}>
				{dailySpells.length} randomly selected spells for {lastGenerated || 'today'}
			</Text>

			<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
				{dailySpells.map((spell, index) => (
					<SpellCard
						key={`${spell.index}-${index}`}
						spell={spell}
						context="daily"
						onAction={handleSpellAction}
					/>
				))}
			</SimpleGrid>
		</Box>
	)
}
