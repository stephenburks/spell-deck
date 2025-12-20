import { useState, useEffect, useMemo } from 'react'
import { Box, Heading, Text, VStack, Alert, Button, HStack, SimpleGrid } from '@chakra-ui/react'
import SpellCard from '../spellCard.jsx'
import {
	loadSessionDeck,
	removeSpellFromSessionDeck,
	saveSessionDeck
} from '../../utils/localStorage.js'
import { groupSpellsByLevel } from '../../utils/spellGrouping.js'
import { validateSessionSpell, getValidSpells } from '../../utils/validation.js'

export default function SessionDeckTab() {
	const [sessionSpells, setSessionSpells] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	// Load session deck data
	const loadSessionDeckData = () => {
		try {
			const sessionDeckData = loadSessionDeck()
			const validSpells = getValidSpells(sessionDeckData.spells || [])
			// Filter to only include spells with sessionId (session spells)
			const validSessionSpells = validSpells.filter(
				(spell) => spell.sessionId && validateSessionSpell(spell)
			)
			setSessionSpells(validSessionSpells)
		} catch (err) {
			console.error('Failed to load session deck:', err)
			setError('Failed to load your session deck. Starting with an empty session.')
			setSessionSpells([])
		}
	}

	// Load session deck data on component mount
	useEffect(() => {
		loadSessionDeckData()
		setLoading(false)
	}, [])

	// Listen for localStorage changes from other browser tabs
	useEffect(() => {
		const handleStorageChange = (event) => {
			if (event.key === 'session-deck') {
				loadSessionDeckData()
			}
		}

		window.addEventListener('storage', handleStorageChange)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
		}
	}, [])

	// Group spells by level for display
	const groupedSpells = useMemo(() => {
		return groupSpellsByLevel(sessionSpells)
	}, [sessionSpells])

	// Get ordered level groups for consistent display
	const orderedLevels = useMemo(() => {
		const levels = [
			'Cantrips',
			'Level 1',
			'Level 2',
			'Level 3',
			'Level 4',
			'Level 5',
			'Level 6',
			'Level 7',
			'Level 8',
			'Level 9'
		]
		return levels.filter((level) => groupedSpells[level] && groupedSpells[level].length > 0)
	}, [groupedSpells])

	// Count cantrips and leveled spells for display
	const spellCounts = useMemo(() => {
		const cantrips = sessionSpells.filter((spell) => spell.level === 0).length
		const leveledSpells = sessionSpells.filter((spell) => spell.level > 0).length
		return { cantrips, leveledSpells, total: sessionSpells.length }
	}, [sessionSpells])

	// Burn spell (remove leveled spell from session)
	const burnSpell = (sessionId) => {
		// Find the spell to burn
		const spellToBurn = sessionSpells.find((spell) => spell.sessionId === sessionId)
		if (!spellToBurn) {
			setError('Spell not found in session.')
			return false
		}

		// Check if it's a cantrip (cantrips cannot be burned)
		if (spellToBurn.level === 0) {
			setError('Cantrips cannot be burned - they have unlimited use.')
			return false
		}

		const result = removeSpellFromSessionDeck(sessionId)
		if (result.success) {
			// Update local state immediately (optimistic update)
			setSessionSpells(
				getValidSpells(result.spells || []).filter(
					(spell) => spell.sessionId && validateSessionSpell(spell)
				)
			)
			setError(null)
		} else {
			setError(result.message)
		}
		return result.success
	}

	// Clear entire session
	const clearSession = () => {
		try {
			// Save empty session to localStorage
			const success = saveSessionDeck([])
			if (!success) {
				setError('Failed to clear session.')
				return false
			}

			// Update local state
			setSessionSpells([])
			setError(null)
			return true
		} catch (err) {
			console.error('Failed to clear session:', err)
			setError('Failed to clear session.')
			return false
		}
	}

	// Handle spell card actions
	const handleSpellAction = (actionType, spell, sessionId) => {
		switch (actionType) {
			case 'burnSpell':
				burnSpell(sessionId)
				break
			default:
				console.warn('Unknown action type:', actionType)
		}
	}

	// Clear error after a delay
	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				setError(null)
			}, 5000)
			return () => clearTimeout(timer)
		}
	}, [error])

	if (loading) {
		return (
			<Box p={4}>
				<Text>Loading your session deck...</Text>
			</Box>
		)
	}

	return (
		<Box p={4}>
			<VStack spacing={6} align="stretch">
				{/* Header */}
				<Box>
					<HStack justify="center" align="flex-start" mb={2}>
						<Box>
							<Heading as="h2" size="lg" mb={2}>
								Session Deck
							</Heading>
							<Text color="gray.600">
								Manage spells for your current game session. Burn leveled spells
								when used, cantrips have unlimited use.
							</Text>
							{sessionSpells.length > 0 && (
								<Text fontSize="sm" color="gray.500" mt={1}>
									{spellCounts.total} spell{spellCounts.total !== 1 ? 's' : ''} in
									session
									{spellCounts.cantrips > 0 && (
										<>
											{' '}
											• {spellCounts.cantrips} cantrip
											{spellCounts.cantrips !== 1 ? 's' : ''} (unlimited)
										</>
									)}
									{spellCounts.leveledSpells > 0 && (
										<>
											{' '}
											• {spellCounts.leveledSpells} leveled spell
											{spellCounts.leveledSpells !== 1 ? 's' : ''}
										</>
									)}
								</Text>
							)}
						</Box>
						{/* Clear Session Button */}
						{sessionSpells.length > 0 && (
							<Button
								variant="outline"
								colorScheme="red"
								size="sm"
								onClick={clearSession}
								position="absolute"
								right="1.5rem">
								Clear Session
							</Button>
						)}
					</HStack>
				</Box>

				{/* Error Alert */}
				{error && <Alert status="error">{error}</Alert>}

				{/* Empty State */}
				{sessionSpells.length === 0 && (
					<Box textAlign="center" py={8}>
						<Text fontSize="lg" color="gray.500" mb={4}>
							Your session deck is empty
						</Text>
						<Text color="gray.400">
							Add spells from your "Spellbook", "Spells of the Day", or "Spell Deck"
							to start your session.
						</Text>
					</Box>
				)}

				{/* Spell Groups by Level */}
				{orderedLevels.map((level) => (
					<Box key={level}>
						<Heading as="h3" size="md" mb={4} color="blue.600">
							{level} ({groupedSpells[level].length})
							{level === 'Cantrips' && (
								<Text as="span" fontSize="sm" color="green.600" ml={2}>
									(Unlimited Use)
								</Text>
							)}
						</Heading>
						<SimpleGrid
							columns={{ base: 1, md: 1, lg: 2, xl: 3 }}
							className="spell-list-container"
							spacing={3}>
							{groupedSpells[level].map((spell) => (
								<SpellCard
									key={spell.sessionId}
									spell={spell}
									context="session"
									onAction={handleSpellAction}
									sessionId={spell.sessionId}
									isCantrip={spell.level === 0}
								/>
							))}
						</SimpleGrid>
					</Box>
				))}
			</VStack>
		</Box>
	)
}
