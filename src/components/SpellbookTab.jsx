import { useState, useEffect, useMemo } from 'react'
import {
	Box,
	Heading,
	Text,
	VStack,
	Alert,
	SimpleGrid,
	AccordionRoot,
	AccordionItem,
	AccordionItemTrigger,
	AccordionItemBody,
	AccordionItemContent
} from '@chakra-ui/react'
import SpellCard from './spellCard.jsx'
import {
	loadSpellbook,
	removeSpellFromSpellbook,
	addSpellToSessionDeck
} from '../utils/localStorage.js'
import { groupSpellsByLevel, getLevelOrder } from '../utils/spellGrouping.js'
import { validateSpellObject, sanitizeSpellArray } from '../utils/validation.js'
import eventBus, { EVENTS } from '../utils/eventBus.js'

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

	// Listen for real-time spellbook updates from other tabs
	useEffect(() => {
		const unsubscribeSpellbookUpdated = eventBus.on(EVENTS.SPELLBOOK_UPDATED, (data) => {
			setSpellbookSpells(sanitizeSpellArray(data.spells || []))
		})

		const unsubscribeSpellAdded = eventBus.on(EVENTS.SPELL_ADDED_TO_SPELLBOOK, (data) => {
			setSpellbookSpells(sanitizeSpellArray(data.spells || []))
		})

		const unsubscribeSpellRemoved = eventBus.on(EVENTS.SPELL_REMOVED_FROM_SPELLBOOK, (data) => {
			setSpellbookSpells(sanitizeSpellArray(data.spells || []))
		})

		// Also listen for localStorage changes from other browser tabs
		const handleStorageChange = (event) => {
			if (event.key === 'user-spellbook') {
				loadSpellbookData()
			}
		}

		window.addEventListener('storage', handleStorageChange)

		return () => {
			unsubscribeSpellbookUpdated()
			unsubscribeSpellAdded()
			unsubscribeSpellRemoved()
			window.removeEventListener('storage', handleStorageChange)
		}
	}, [])

	// Group spells by level for display
	const groupedSpells = useMemo(() => {
		return groupSpellsByLevel(spellbookSpells)
	}, [spellbookSpells])

	// Get all levels (always show all levels, even if empty)
	const allLevels = useMemo(() => {
		return getLevelOrder()
	}, [])

	// Get levels that have spells (for default expanded state)
	const levelsWithSpells = useMemo(() => {
		const levelOrder = getLevelOrder()
		return levelOrder.filter((level) => groupedSpells[level] && groupedSpells[level].length > 0)
	}, [groupedSpells])

	// Remove spell from spellbook
	const removeFromSpellbook = (spell) => {
		const result = removeSpellFromSpellbook(spell.index)

		if (result.success) {
			// Update local state immediately (optimistic update)
			setSpellbookSpells(sanitizeSpellArray(result.spells || []))
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

		const result = addSpellToSessionDeck(spell)
		if (result.success) {
			setError(null)
		} else {
			setError(result.message)
		}
		return result.success
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

				{/* Spell Groups by Level - Show all levels, expand only those with spells */}
				<AccordionRoot collapsible="true" defaultValue={levelsWithSpells}>
					{allLevels.map((level) => {
						const spellsForLevel = groupedSpells[level] || []
						const hasSpells = spellsForLevel.length > 0

						return (
							<AccordionItem key={level} value={level}>
								<AccordionItemTrigger>
									<Box flex="1" textAlign="left">
										<Heading
											as="h3"
											size="md"
											color={hasSpells ? 'blue.600' : 'gray.400'}>
											{level} ({spellsForLevel.length})
										</Heading>
									</Box>
								</AccordionItemTrigger>
								<AccordionItemContent>
									<AccordionItemBody pb={4}>
										{hasSpells ? (
											<SimpleGrid
												columns={{ base: 1, md: 1, lg: 2, xl: 3 }}
												className="spell-list-container"
												spacing={3}>
												{spellsForLevel.map((spell) => (
													<SpellCard
														key={spell.index}
														spell={spell}
														context="spellbook"
														onAction={handleSpellAction}
													/>
												))}
											</SimpleGrid>
										) : (
											<Text color="gray.500" fontStyle="italic">
												No spells in this level yet
											</Text>
										)}
									</AccordionItemBody>
								</AccordionItemContent>
							</AccordionItem>
						)
					})}
				</AccordionRoot>
			</VStack>
		</Box>
	)
}
