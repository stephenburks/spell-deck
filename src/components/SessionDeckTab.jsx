import { useState, useEffect, useMemo } from 'react'
import { Box, Heading, Text, VStack, Alert, Button, HStack } from '@chakra-ui/react'
import SpellCard from './spellCard.jsx'
import { loadSessionDeck, saveSessionDeck } from '../utils/localStorage.js'
import { groupSpellsByLevel, getLevelOrder, isCantrip } from '../utils/spellGrouping.js'
import { validateSessionSpell, sanitizeSpellArray } from '../utils/validation.js'

export default function SessionDeckTab() {
	const [sessionSpells, setSessionSpells] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	// Load session deck data
	const loadSessionDeckData = () => {
		try {
			const sessionDeckData = loadSessionDeck()
			const sanitizedSpells = sanitizeSpellArray(sessionDeckData.spells || [])
			// Filter to only include spells with sessionId (session spells)
			const validSessionSpells = sanitizedSpells.filter(
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

	// Listen for localStorage changes to refresh session deck when other tabs add spells
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
		const levelOrder = getLevelOrder()
		return levelOrder.filter((level) => groupedSpells[level] && groupedSpells[level].length > 0)
	}, [groupedSpells])

	// Count cantrips and leveled spells for display
	const spellCounts = useMemo(() => {
		const cantrips = sessionSpells.filter((spell) => isCantrip(spell)).length
		const leveledSpells = sessionSpells.filter((spell) => !isCantrip(spell)).length
		return { cantrips, leveledSpells, total: sessionSpells.length }
	}, [sessionSpells])

	// Burn spell (remove leveled spell from session)
	const burnSpell = (sessionId) => {
		try {
			// Find the spell to burn
			const spellToBurn = sessionSpells.find((spell) => spell.sessionId === sessionId)
			if (!spellToBurn) {
				setError('Spell not found in session.')
				return false
			}

			// Check if it's a cantrip (cantrips cannot be burned)
			if (isCantrip(spellToBurn)) {
				setError('Cantrips cannot be burned - they have unlimited use.')
				return false
			}

			// Remove the spell from session
			const updatedSessionSpells = sessionSpells.filter(
				(spell) => spell.sessionId !== sessionId
			)

			// Save to localStorage
			const success = saveSessionDeck(updatedSessionSpells)
			if (!success) {
				setError('Failed to burn spell from session.')
				return false
			}

			// Update local state
			setSessionSpells(updatedSessionSpells)
			setError(null)
			return true
		} catch (err) {
			console.error('Failed to burn spell:', err)
			setError('Failed to burn spell from session.')
			return false
		}
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
					<HStack justify="space-between" align="flex-start" mb={2}>
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
								onClick={clearSession}>
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
						<VStack spacing={4} align="stretch">
							{groupedSpells[level].map((spell) => (
								<SpellCard
									key={spell.sessionId}
									spell={spell}
									context="session"
									onAction={handleSpellAction}
									sessionId={spell.sessionId}
									isCantrip={isCantrip(spell)}
								/>
							))}
						</VStack>
					</Box>
				))}
			</VStack>
		</Box>
	)
}
