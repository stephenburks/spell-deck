import { useCallback } from 'react'
import { Box, Heading, Text, SimpleGrid, Alert, Button, HStack } from '@chakra-ui/react'
import SpellCard from './spellCard.jsx'
import Loading from './loading.jsx'
import { useDailySpells } from '../hooks/useDailySpells.js'
import { addSpellToSpellbook, addSpellToSessionDeck } from '../utils/localStorage.js'
import { validateSpellObject } from '../utils/validation.js'

/**
 * DailySpellsTab component
 * Displays 12 randomly selected spells that refresh daily at midnight
 * Uses optimized loading - only fetches the 12 needed spells instead of entire database
 * Provides actions to add spells to spellbook or session deck
 */
export default function DailySpellsTab() {
	// Use optimized daily spells hook
	const {
		dailySpells,
		lastGenerated,
		isLoading,
		isGenerating,
		error,
		hasError,
		needsRefresh,
		refreshDailySpells,
		spellIndexCount
	} = useDailySpells()

	/**
	 * Handle adding a spell to the user's spellbook
	 */
	const handleAddToSpellbook = useCallback((spell) => {
		const result = addSpellToSpellbook(spell)
		if (result.success) {
			console.log(`Added "${spell.name}" to spellbook`)
		} else {
			console.log(`Failed to add to spellbook: ${result.message}`)
		}
	}, [])

	/**
	 * Handle adding a spell to the session deck
	 */
	const handleAddToSession = useCallback((spell) => {
		const result = addSpellToSessionDeck(spell)
		if (result.success) {
			console.log(`Added "${spell.name}" to session deck`)
		} else {
			console.log(`Failed to add to session: ${result.message}`)
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

	// Show loading state while spell indexes or daily spells are being fetched
	if (isLoading) {
		return (
			<Box p={6}>
				<Heading size="lg" mb={4}>
					Spells of the Day
				</Heading>
				<Loading />
				<Text mt={4} color="gray.600">
					{isGenerating ? 'Generating your daily spells...' : 'Loading spell database...'}
				</Text>
				{spellIndexCount > 0 && (
					<Text fontSize="sm" color="gray.500" mt={2}>
						Found {spellIndexCount} spells in database
					</Text>
				)}
			</Box>
		)
	}

	// Show error state if spell loading failed
	if (hasError) {
		return (
			<Box p={6}>
				<Heading size="lg" mb={4}>
					Spells of the Day
				</Heading>
				<Alert status="error" mb={4}>
					Failed to load spells: {error?.message || 'Unable to fetch spell database'}.
					Please check your connection and try again.
				</Alert>
				<Button onClick={refreshDailySpells} disabled={isGenerating}>
					Retry
				</Button>
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
			<HStack justify="center" align="flex-start" mb={6}>
				<Box>
					<Heading size="lg" mb={2}>
						Spells of the Day
					</Heading>
					<Text color="gray.600">
						{dailySpells.length} randomly selected spells for {lastGenerated || 'today'}
					</Text>
					{spellIndexCount > 0 && (
						<Text fontSize="sm" color="gray.500" mt={1}>
							Selected from {spellIndexCount} available spells
						</Text>
					)}
				</Box>

				{/* Manual refresh button */}
				<Button
					variant="outline"
					size="sm"
					onClick={refreshDailySpells}
					disabled={isGenerating}
					title={needsRefresh ? 'Generate new daily spells' : 'Refresh current spells'}
					position="absolute"
					right="1.5rem">
					{isGenerating ? 'Generating...' : needsRefresh ? 'Generate New' : 'Refresh'}
				</Button>
			</HStack>

			<SimpleGrid
				columns={{ base: 1, md: 1, lg: 2, xl: 3 }}
				className="spell-list-container"
				spacing={3}>
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
