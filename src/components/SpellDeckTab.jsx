import { useState, useEffect, useMemo, useCallback } from 'react'
import {
	Box,
	Heading,
	Text,
	VStack,
	HStack,
	Input,
	Alert,
	Badge,
	Button,
	Flex,
	Wrap,
	WrapItem,
	SimpleGrid
} from '@chakra-ui/react'
import SpellCard from './spellCard.jsx'
import Loading from './loading.jsx'
import { useAllSpells } from '../hooks/useAllSpells.js'
import { addSpellToSpellbook, addSpellToSessionDeck } from '../utils/localStorage.js'
import { validateSpellObject } from '../utils/validation.js'
import { useSpellSearch } from '../hooks/useSearchIndex.js'

// Custom hook for debouncing search input
function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}

export default function SpellDeckTab() {
	// Fetch all spells using the existing hook
	const { spells, isLoading, hasError, error, spellCount } = useAllSpells()

	// Search and filter state
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedClasses, setSelectedClasses] = useState([])
	const [selectedLevels, setSelectedLevels] = useState([])
	const [selectedSchools, setSelectedSchools] = useState([])
	const [actionError, setActionError] = useState(null)

	// Debounce search term to prevent excessive filtering
	const debouncedSearchTerm = useDebounce(searchTerm, 300)

	// Extract unique values for filter dropdowns
	const filterOptions = useMemo(() => {
		if (!spells || spells.length === 0) {
			return { classes: [], levels: [], schools: [] }
		}

		const classesSet = new Set()
		const levelsSet = new Set()
		const schoolsSet = new Set()

		spells.forEach((spell) => {
			// Extract classes
			if (spell.classes && Array.isArray(spell.classes)) {
				spell.classes.forEach((cls) => {
					if (cls.name) classesSet.add(cls.name)
				})
			}

			// Extract levels
			if (typeof spell.level === 'number') {
				levelsSet.add(spell.level)
			}

			// Extract schools
			if (spell.school && spell.school.name) {
				schoolsSet.add(spell.school.name)
			}
		})

		return {
			classes: Array.from(classesSet).sort(),
			levels: Array.from(levelsSet).sort((a, b) => a - b),
			schools: Array.from(schoolsSet).sort()
		}
	}, [spells])

	// Use Fuse.js for fast search (only when there's a search term)
	const searchResults = useSpellSearch(spells, debouncedSearchTerm)

	// Apply filters and search
	const filteredSpells = useMemo(() => {
		if (!spells || spells.length === 0) return []

		// Start with search results if there's a search term, otherwise use all spells
		let filtered = debouncedSearchTerm.trim() ? searchResults : spells

		// Apply class filters
		if (selectedClasses.length > 0) {
			filtered = filtered.filter((spell) => {
				if (!spell.classes || !Array.isArray(spell.classes)) return false
				return spell.classes.some((cls) => selectedClasses.includes(cls.name))
			})
		}

		// Apply level filters
		if (selectedLevels.length > 0) {
			filtered = filtered.filter((spell) => selectedLevels.includes(spell.level))
		}

		// Apply school filters
		if (selectedSchools.length > 0) {
			filtered = filtered.filter((spell) => {
				if (!spell.school || !spell.school.name) return false
				return selectedSchools.includes(spell.school.name)
			})
		}

		// Limit results for performance (show first 100 when no search term)
		if (
			!debouncedSearchTerm.trim() &&
			selectedClasses.length === 0 &&
			selectedLevels.length === 0 &&
			selectedSchools.length === 0
		) {
			return filtered.slice(0, 100)
		}

		return filtered
	}, [
		spells,
		searchResults,
		selectedClasses,
		selectedLevels,
		selectedSchools,
		debouncedSearchTerm
	])

	// Handle filter changes
	const handleClassFilter = useCallback((className) => {
		setSelectedClasses((prev) => {
			if (prev.includes(className)) {
				return prev.filter((c) => c !== className)
			} else {
				return [...prev, className]
			}
		})
	}, [])

	const handleLevelFilter = useCallback((level) => {
		setSelectedLevels((prev) => {
			if (prev.includes(level)) {
				return prev.filter((l) => l !== level)
			} else {
				return [...prev, level]
			}
		})
	}, [])

	const handleSchoolFilter = useCallback((school) => {
		setSelectedSchools((prev) => {
			if (prev.includes(school)) {
				return prev.filter((s) => s !== school)
			} else {
				return [...prev, school]
			}
		})
	}, [])

	// Clear all filters
	const clearAllFilters = useCallback(() => {
		setSelectedClasses([])
		setSelectedLevels([])
		setSelectedSchools([])
		setSearchTerm('')
	}, [])

	// Add spell to spellbook
	const addToSpellbook = useCallback((spell) => {
		if (!validateSpellObject(spell)) {
			setActionError('Invalid spell data. Cannot add to spellbook.')
			return false
		}

		const result = addSpellToSpellbook(spell)
		if (result.success) {
			setActionError(null)
		} else {
			setActionError(result.message)
		}
		return result.success
	}, [])

	// Add spell to session deck
	const addToSession = useCallback((spell) => {
		console.log('SpellDeckTab: Adding spell to session:', spell.name)

		if (!validateSpellObject(spell)) {
			console.error('SpellDeckTab: Invalid spell data:', spell)
			setActionError('Invalid spell data. Cannot add to session.')
			return false
		}

		console.log('SpellDeckTab: Spell validation passed, calling addSpellToSessionDeck')
		const result = addSpellToSessionDeck(spell)
		console.log('SpellDeckTab: addSpellToSessionDeck result:', result)

		if (result.success) {
			console.log('SpellDeckTab: Successfully added spell to session')
			setActionError(null)
		} else {
			console.error('SpellDeckTab: Failed to add spell to session:', result.message)
			setActionError(result.message)
		}
		return result.success
	}, [])

	// Handle spell card actions
	const handleSpellAction = useCallback(
		(actionType, spell) => {
			switch (actionType) {
				case 'addToSpellbook':
					addToSpellbook(spell)
					break
				case 'addToSession':
					addToSession(spell)
					break
				default:
					console.warn('Unknown action type:', actionType)
			}
		},
		[addToSpellbook, addToSession]
	)

	// Clear error after a delay
	useEffect(() => {
		if (actionError) {
			const timer = setTimeout(() => {
				setActionError(null)
			}, 5000)
			return () => clearTimeout(timer)
		}
	}, [actionError])

	// Loading state
	if (isLoading) {
		return (
			<Box p={4}>
				<VStack spacing={4} align="stretch">
					<Heading as="h2" size="lg">
						Spell Deck
					</Heading>
					<Loading />
					<Text color="gray.600">Loading complete spell database...</Text>
					<Text fontSize="sm" color="gray.500">
						This may take a few moments as we fetch all{' '}
						{spellCount > 0 ? spellCount : '319'} spells
					</Text>
				</VStack>
			</Box>
		)
	}

	// Error state
	if (hasError) {
		return (
			<Box p={4}>
				<VStack spacing={4} align="stretch">
					<Heading as="h2" size="lg">
						Spell Deck
					</Heading>
					<Alert status="error">
						Failed to load spells: {error?.message || 'Unknown error'}
					</Alert>
				</VStack>
			</Box>
		)
	}

	return (
		<Box p={4}>
			<VStack spacing={6} align="stretch">
				{/* Header */}
				<Box>
					<Heading as="h2" size="lg" mb={2}>
						Spell Deck
					</Heading>
					<Text color="gray.600">
						Search and browse all available spells. Add spells to your spellbook or
						session deck.
					</Text>
				</Box>

				{/* Search Input */}
				<Box>
					<Input
						placeholder="Search spells by name or description..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						size="lg"
					/>
				</Box>

				{/* Filters */}
				<Box>
					<Heading as="h3" size="md" mb={3}>
						Filters
					</Heading>

					<VStack spacing={4} align="stretch">
						{/* Class Filters */}
						<Box>
							<Text fontWeight="semibold" mb={2}>
								Classes
							</Text>
							<Wrap spacing={2}>
								{filterOptions.classes.map((className) => (
									<WrapItem key={className}>
										<Button
											size="sm"
											variant={
												selectedClasses.includes(className)
													? 'solid'
													: 'outline'
											}
											onClick={() => handleClassFilter(className)}>
											{className}
										</Button>
									</WrapItem>
								))}
							</Wrap>
						</Box>

						{/* Level Filters */}
						<Box>
							<Text fontWeight="semibold" mb={2}>
								Levels
							</Text>
							<Wrap spacing={2}>
								{filterOptions.levels.map((level) => (
									<WrapItem key={level}>
										<Button
											size="sm"
											variant={
												selectedLevels.includes(level) ? 'solid' : 'outline'
											}
											onClick={() => handleLevelFilter(level)}>
											{level === 0 ? 'Cantrip' : `Level ${level}`}
										</Button>
									</WrapItem>
								))}
							</Wrap>
						</Box>

						{/* School Filters */}
						<Box>
							<Text fontWeight="semibold" mb={2}>
								Schools
							</Text>
							<Wrap spacing={2}>
								{filterOptions.schools.map((school) => (
									<WrapItem key={school}>
										<Button
											size="sm"
											variant={
												selectedSchools.includes(school)
													? 'solid'
													: 'outline'
											}
											onClick={() => handleSchoolFilter(school)}>
											{school}
										</Button>
									</WrapItem>
								))}
							</Wrap>
						</Box>

						{/* Clear Filters Button */}
						{(selectedClasses.length > 0 ||
							selectedLevels.length > 0 ||
							selectedSchools.length > 0 ||
							searchTerm.trim()) && (
							<Box>
								<Button variant="ghost" onClick={clearAllFilters}>
									Clear All Filters
								</Button>
							</Box>
						)}
					</VStack>
				</Box>

				{/* Results Counter */}
				<Box>
					<Flex justify="space-between" align="center">
						<Text fontSize="sm" color="gray.600">
							Showing {filteredSpells.length} of {spellCount} spells
							{!debouncedSearchTerm.trim() &&
								selectedClasses.length === 0 &&
								selectedLevels.length === 0 &&
								selectedSchools.length === 0 &&
								filteredSpells.length === 100 && (
									<Text as="span" fontSize="xs" color="gray.500" ml={2}>
										(limited to first 100 for performance - use search or
										filters to narrow results)
									</Text>
								)}
						</Text>
						{(selectedClasses.length > 0 ||
							selectedLevels.length > 0 ||
							selectedSchools.length > 0) && (
							<HStack spacing={2}>
								<Text fontSize="sm" color="gray.500">
									Active filters:
								</Text>
								{selectedClasses.map((cls) => (
									<Badge key={cls} variant="solid" size="sm">
										{cls}
									</Badge>
								))}
								{selectedLevels.map((level) => (
									<Badge key={level} variant="solid" size="sm">
										{level === 0 ? 'Cantrip' : `L${level}`}
									</Badge>
								))}
								{selectedSchools.map((school) => (
									<Badge key={school} variant="solid" size="sm">
										{school}
									</Badge>
								))}
							</HStack>
						)}
					</Flex>
				</Box>

				{/* Action Error Alert */}
				{actionError && <Alert status="error">{actionError}</Alert>}

				{/* Empty State */}
				{filteredSpells.length === 0 && !isLoading && (
					<Box textAlign="center" py={8}>
						<Text fontSize="lg" color="gray.500" mb={4}>
							No spells found
						</Text>
						<Text color="gray.400">
							{searchTerm.trim() ||
							selectedClasses.length > 0 ||
							selectedLevels.length > 0 ||
							selectedSchools.length > 0
								? 'Try adjusting your search terms or filters.'
								: 'No spells available in the database.'}
						</Text>
					</Box>
				)}

				{/* Spell Results */}
				{filteredSpells.length > 0 && (
					<SimpleGrid
						columns={{ base: 1, md: 1, lg: 2, xl: 3 }}
						className="spell-list-container"
						spacing={3}>
						{filteredSpells.map((spell) => (
							<SpellCard
								key={spell.index}
								spell={spell}
								context="deck"
								onAction={handleSpellAction}
							/>
						))}
					</SimpleGrid>
				)}
			</VStack>
		</Box>
	)
}
