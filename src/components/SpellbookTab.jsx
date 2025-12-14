import { useState, useEffect, useMemo } from 'react'
import { Box, Heading, Text, VStack, Alert } from '@chakra-ui/react'
import SpellCard from './spellCard.jsx'
import {
	loadSpellbook,
	removeSpellFromSpellbook,
	loadSessionDeck,
	saveSessionDeck
} from '../utils/localStorage.js'
import { groupSpellsByLevel, getLevelOrder, addSessionId } from '../utils/spellGrouping.js'
import { validateSpellObject, sanitizeSpellArray } from '../utils/validation.js'

export default function SpellbookTab() {
	const [spellbookSpells, setSpellbookSpells] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	// Load spellbook data
	const loadSpellbookData = () => {
		try {
			const spellbookData = loadSpellbook()
			const sanitizedSpells = sanitizeSpellArray(spellbookData.spells || [])
			setSpellbookSpells(sanitizedSpells)
		} catch (err) {
			console.error('Failed to load spellbook:', err)
			setError('Failed to load your spellbook. Starting with an empty collection.')
			setSpellbookSpells([])
		}
	}

	// Load spellbook data on component mount
	useEffect(() => {
		loadSpellbookData()
		setLoading(false)
	}, [])

	// Listen for localStorage changes to refresh spellbook when other tabs add spells
	useEffect(() => {
		const handleStorageChange = (event) => {
			if (event.key === 'user-spellbook') {
				loadSpellbookData()
			}
		}

		window.addEventListener('storage', handleStorageChange)
		return () => {
			window.removeEventListener('storage', handleStorageChange)
		}
	}, [])

	// Group spells by level for display
	const groupedSpells = useMemo(() => {
		return groupSpellsByLevel(spellbookSpells)
	}, [spellbookSpells])

	// Get ordered level groups for consistent display
	const orderedLevels = useMemo(() => {
		const levelOrder = getLevelOrder()
		return levelOrder.filter((level) => groupedSpells[level] && groupedSpells[level].length > 0)
	}, [groupedSpells])

	// Remove spell from spellbook
	const removeFromSpellbook = (spell) => {
		const result = removeSpellFromSpellbook(spell.index)

		if (result.success) {
			// Reload spellbook data to reflect changes
			const spellbookData = loadSpellbook()
			const sanitizedSpells = sanitizeSpellArray(spellbookData.spells || [])
			setSpellbookSpells(sanitizedSpells)
			setError(null)
		} else {
			setError(result.message)
		}

		return result.success
	}

	// Add spell from spellbook to session deck
	const addToSession = (spell) => {
		if (!validateSpellObject(spell)) {
			setError('Invalid spell data. Cannot add to session.')
			return false
		}

		try {
			// Load current session deck
			const sessionDeckData = loadSessionDeck()
			const currentSessionSpells = sessionDeckData.spells || []

			// Add sessionId to the spell for session tracking
			const sessionSpell = addSessionId(spell)
			if (!sessionSpell) {
				setError('Failed to prepare spell for session.')
				return false
			}

			// Add to session deck
			const updatedSessionSpells = [...currentSessionSpells, sessionSpell]

			// Save to localStorage
			const success = saveSessionDeck(updatedSessionSpells)
			if (!success) {
				setError('Failed to add spell to session.')
				return false
			}

			setError(null)
			return true
		} catch (err) {
			console.error('Failed to add spell to session:', err)
			setError('Failed to add spell to session.')
			return false
		}
	}

	// Handle spell card actions
	const handleSpellAction = (actionType, spell) => {
		switch (actionType) {
			case 'removeFromSpellbook':
				removeFromSpellbook(spell)
				break
			case 'addToSession':
				addToSession(spell)
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
				<Text>Loading your spellbook...</Text>
			</Box>
		)
	}

	return (
		<Box p={4}>
			<VStack spacing={6} align="stretch">
				{/* Header */}
				<Box>
					<Heading as="h2" size="lg" mb={2}>
						My Spellbook
					</Heading>
					<Text color="gray.600">
						Your personal collection of spells. Add spells from other tabs or remove
						ones you no longer need.
					</Text>
					{spellbookSpells.length > 0 && (
						<Text fontSize="sm" color="gray.500" mt={1}>
							{spellbookSpells.length} spell{spellbookSpells.length !== 1 ? 's' : ''}{' '}
							in your spellbook
						</Text>
					)}
				</Box>

				{/* Error Alert */}
				{error && <Alert status="error">{error}</Alert>}

				{/* Empty State */}
				{spellbookSpells.length === 0 && (
					<Box textAlign="center" py={8}>
						<Text fontSize="lg" color="gray.500" mb={4}>
							Your spellbook is empty
						</Text>
						<Text color="gray.400">
							Add spells from the "Spells of the Day" or "Spell Deck" tabs to build
							your personal collection.
						</Text>
					</Box>
				)}

				{/* Spell Groups by Level */}
				{orderedLevels.map((level) => (
					<Box key={level}>
						<Heading as="h3" size="md" mb={4} color="blue.600">
							{level} ({groupedSpells[level].length})
						</Heading>
						<VStack spacing={4} align="stretch">
							{groupedSpells[level].map((spell) => (
								<SpellCard
									key={spell.index}
									spell={spell}
									context="spellbook"
									onAction={handleSpellAction}
								/>
							))}
						</VStack>
					</Box>
				))}
			</VStack>
		</Box>
	)
}
