import { useState, useEffect, useMemo } from 'react'
import {
	Box,
	Heading,
	Text,
	VStack,
	Alert,
	Button,
	HStack,
	Input,
	SimpleGrid,
	AccordionRoot,
	AccordionItem,
	AccordionItemTrigger,
	AccordionItemContent,
	Separator,
	Badge
} from '@chakra-ui/react'
import SpellCard from '../SpellCard.jsx'
import {
	loadSessionDeck,
	removeSpellFromSessionDeck,
	saveSessionDeck,
	getActiveCampaign
} from '../../utils/localStorage.js'
import { groupSpellsByLevel } from '../../utils/spellGrouping.js'
import { validateSessionSpell, getValidSpells } from '../../utils/validation.js'
import { toaster } from '../ui/toaster'
import SpellSlotTracker from '../SpellSlotTracker'
import { STORAGE_KEY as SLOT_TRACKER_KEY } from '../../utils/spellSlots'
import {
	loadBurnHistory,
	addBurnedSpell,
	clearBurnHistory,
	getRelativeTime
} from '../../utils/burnHistory.ts'

const STATS_STORAGE_KEY = 'spell-deck-character-stats'

const loadCharacterStats = () => {
	try {
		const raw = localStorage.getItem(STATS_STORAGE_KEY)
		if (raw) return JSON.parse(raw)
	} catch {}
	return { saveDC: 13, attackBonus: 5 }
}

const saveCharacterStats = (stats) => {
	localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats))
}

export default function SpellDeckTab() {
	const [sessionSpells, setSessionSpells] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [burnHistory, setBurnHistory] = useState(loadBurnHistory)
	const [characterStats, setCharacterStats] = useState(loadCharacterStats)

	useEffect(() => {
		const interval = setInterval(() => setBurnHistory([...loadBurnHistory()]), 30000)
		return () => clearInterval(interval)
	}, [])

	// Load spell deck data
	const loadSessionDeckData = () => {
		try {
			const campaignId = getActiveCampaign()
			const sessionDeckData = loadSessionDeck(campaignId !== 'default' ? campaignId : undefined)
			const validSpells = getValidSpells(sessionDeckData.spells || [])
			// Filter to only include spells with sessionId (session spells)
			const validSessionSpells = validSpells.filter(
				(spell) => spell.sessionId && validateSessionSpell(spell)
			)
			setSessionSpells(validSessionSpells)
		} catch (err) {
			console.error('Failed to load spell deck:', err)
			setError('Failed to load your spell deck. Starting with an empty session.')
			setSessionSpells([])
		}
	}

	// Load and listen for campaign changes
	useEffect(() => {
		loadSessionDeckData()
		setLoading(false)
		const handler = () => {
			loadSessionDeckData()
			setError(null)
		}
		window.addEventListener('spell-deck:campaign-changed', handler)
		return () => window.removeEventListener('spell-deck:campaign-changed', handler)
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

	// Auto-mark spell slot as used when burning a spell
	const markSlotUsed = (level) => {
		try {
			const raw = localStorage.getItem(SLOT_TRACKER_KEY)
			if (!raw) return
			const slotState = JSON.parse(raw)
			if (!slotState || typeof slotState !== 'object') return
			slotState.usedSlots = slotState.usedSlots || {}
			slotState.usedSlots[level] = (slotState.usedSlots[level] || 0) + 1
			slotState.characterLevel = slotState.characterLevel || 5
			slotState.casterType = slotState.casterType || 'full'
			localStorage.setItem(SLOT_TRACKER_KEY, JSON.stringify(slotState))
			window.dispatchEvent(new Event('spell-deck:slot-changed'))
			toaster.create({
				title: 'Slot Used',
				description: `Marked one level ${level} spell slot as used (${slotState.usedSlots[level]} total)`,
				status: 'success',
				duration: 2000
			})
		} catch (err) {
			console.warn('Failed to auto-mark spell slot:', err)
		}
	}

	// Burn spell (remove leveled spell from session)
	const burnSpell = (sessionId) => {
		// Find the spell to burn
		const spellToBurn = sessionSpells.find((spell) => spell.sessionId === sessionId)
		if (!spellToBurn) {
			setError('Spell not found in session.')
			toaster.create({
				title: 'Error',
				description: 'Spell not found in session.',
				status: 'error',
				duration: 3000
			})
			return false
		}

		// Check if it's a cantrip (cantrips cannot be burned)
		if (spellToBurn.level === 0) {
			setError('Cantrips cannot be burned - they have unlimited use.')
			toaster.create({
				title: 'Cannot Burn Cantrip',
				description: 'Cantrips have unlimited use and cannot be burned.',
				status: 'warning',
				duration: 3000
			})
			return false
		}

		const campaignId = getActiveCampaign()
		const result = removeSpellFromSessionDeck(sessionId, campaignId !== 'default' ? campaignId : undefined)
		if (result.success) {
			setSessionSpells(
				getValidSpells(result.spells || []).filter(
					(spell) => spell.sessionId && validateSessionSpell(spell)
				)
			)
			setError(null)

			markSlotUsed(spellToBurn.level)

			toaster.create({
				title: 'Spell Burned',
				description: `"${spellToBurn.name}" has been burned and removed from your spell deck`,
				status: 'info',
				duration: 3000
			})

			addBurnedSpell(spellToBurn.name, spellToBurn.level)
			setBurnHistory(loadBurnHistory())
		} else {
			setError(result.message)
			toaster.create({
				title: 'Error',
				description: result.message,
				status: 'error',
				duration: 3000
			})
		}
		return result.success
	}

	// Clear entire session
	const clearSession = () => {
		try {
			// Save empty session to localStorage
			const campaignId = getActiveCampaign()
		const success = saveSessionDeck([], campaignId !== 'default' ? campaignId : undefined)
			if (!success) {
				setError('Failed to clear session.')
				toaster.create({
					title: 'Error',
					description: 'Failed to clear session.',
					status: 'error',
					duration: 3000
				})
				return false
			}

			// Update local state
			setSessionSpells([])
			setBurnHistory([])
			clearBurnHistory()
			setError(null)
			toaster.create({
				title: 'Session Cleared',
				description: 'All spells have been removed from your spell deck',
				status: 'info',
				duration: 3000
			})
			return true
		} catch (err) {
			console.error('Failed to clear session:', err)
			setError('Failed to clear session.')
			toaster.create({
				title: 'Error',
				description: 'Failed to clear session.',
				status: 'error',
				duration: 3000
			})
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
			<Box p={4} pt={2}>
				<Text>Loading your spell deck...</Text>
			</Box>
		)
	}

	return (
		<Box p={4} pt={2}>
			<VStack spacing={6} align="stretch">
				{/* Header */}
				<Box>
					<HStack justify="center" align="flex-start" mb={2}>
						<Box>
							<Heading as="h2" size="lg" mb={2}>
								Spell Deck
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
							<HStack gap={3} mt={3} flexWrap="wrap">
								<HStack gap={1}>
									<Text fontSize="sm" color="gray.500" whiteSpace="nowrap">Save DC</Text>
									<Input
										type="number"
										size="xs"
										width="60px"
										min={0}
										max={30}
										value={characterStats.saveDC}
										onChange={(e) => {
											const next = { ...characterStats, saveDC: Number(e.target.value) || 0 }
											setCharacterStats(next)
											saveCharacterStats(next)
										}}
									/>
								</HStack>
								<HStack gap={1}>
									<Text fontSize="sm" color="gray.500" whiteSpace="nowrap">Attack Bonus</Text>
									<Input
										type="number"
										size="xs"
										width="60px"
										min={0}
										max={20}
										value={characterStats.attackBonus}
										onChange={(e) => {
											const next = { ...characterStats, attackBonus: Number(e.target.value) || 0 }
											setCharacterStats(next)
											saveCharacterStats(next)
										}}
									/>
								</HStack>
							</HStack>
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
							Your spell deck is empty
						</Text>
						<Text color="gray.400">
							Add spells from your "Spellbook", "Spells of the Day", or "Spell
							Library" to start your session.
						</Text>
					</Box>
				)}

				{/* Spell Groups by Level - Accordions */}
				{orderedLevels.length > 0 && (
					<AccordionRoot defaultValue={orderedLevels} multiple>
						{orderedLevels.map((level) => (
							<AccordionItem key={level} value={level}>
								<AccordionItemTrigger>
									<HStack justify="space-between" width="100%">
										<Text fontWeight="bold" color="blue.600">
											{level} ({groupedSpells[level].length})
											{level === 'Cantrips' && (
												<Text
													as="span"
													fontSize="sm"
													color="green.600"
													ml={2}>
													(Unlimited Use)
												</Text>
											)}
										</Text>
									</HStack>
								</AccordionItemTrigger>
								<AccordionItemContent>
									<SimpleGrid
										columns={{ base: 1, md: 1, lg: 2, xl: 3 }}
										className="spell-list-container"
										spacing={3}
										pt={2}>
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
								</AccordionItemContent>
							</AccordionItem>
						))}
					</AccordionRoot>
				)}
				<SpellSlotTracker />

				<Box
					p={4}
					borderWidth="1px"
					borderColor="border.default"
					borderRadius="md"
					bg="bg.surface">
					<HStack justifyContent="space-between" alignItems="center" mb={2}>
						<Heading as="h3" size="md">
							Burn History
						</Heading>
						{burnHistory.length > 0 && (
							<Button
								size="xs"
								variant="ghost"
								colorPalette="red"
								onClick={() => {
									clearBurnHistory()
									setBurnHistory([])
								}}>
								Clear history
							</Button>
						)}
					</HStack>
					{burnHistory.length === 0 ? (
						<Text fontSize="sm" color="text.secondary">
							No spells burned this session
						</Text>
					) : (
						<AccordionRoot defaultValue={['burn-history']} collapsible>
							<AccordionItem value="burn-history">
								<AccordionItemTrigger>
									<Text fontSize="sm">
										{burnHistory.length} spell{burnHistory.length !== 1 ? 's' : ''} burned
									</Text>
								</AccordionItemTrigger>
								<AccordionItemContent>
									<VStack gap={1} align="stretch" pt={2}>
										{burnHistory.map((entry, i) => (
											<Box key={`${entry.timestamp}-${i}`}>
												{i > 0 && <Separator my={1} />}
												<HStack
													justifyContent="space-between"
													alignItems="center"
													py={1}>
													<HStack gap={2}>
														<Text fontWeight="medium">{entry.name}</Text>
														<Badge colorPalette="blue" variant="subtle">
															Lv {entry.level}
														</Badge>
													</HStack>
													<Text fontSize="xs" color="text.secondary">
														{getRelativeTime(entry.timestamp)}
													</Text>
												</HStack>
											</Box>
										))}
									</VStack>
								</AccordionItemContent>
							</AccordionItem>
						</AccordionRoot>
					)}
				</Box>
			</VStack>
		</Box>
	)
}
