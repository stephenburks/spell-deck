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
	WrapItem
} from '@chakra-ui/react'
import Loading from './loading.jsx'
import VirtualizedSpellList from './virtualizedSpellList.jsx'
import { useAllSpells } from '../hooks/useAllSpells.js'
import { addSpellToSpellbook, addSpellToSessionDeck } from '../utils/localStorage.js'
import { validateSpellObject } from '../utils/validation.js'
import { useSpellSearchIndex, useSpellSearch } from '../hooks/useSearchIndex.js'

// Custom hook for debouncing search input with immediate feedback
function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value)
	const [isDebouncing, setIsDebouncing] = useState(false)

	useEffect(() => {
		// Set debouncing state immediately when value changes
		if (value !== debouncedValue) {
			setIsDebouncing(true)
		}

		const handler = setTimeout(() => {
			setDebouncedValue(value)
			setIsDebouncing(false)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay, debouncedValue])

	return { debouncedValue, isDebouncing }
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
	const { debouncedValue: debouncedSearchTerm, isDebouncing } = useDebounce(searchTerm, 400) // Increased for better performance

	// Create search index once when spells load
	const searchIndex = useSpellSearchIndex(spells)

	// Extract unique values for filter dropdowns (memoized for performance)
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

	// Use optimized search with early return for short terms
	const searchResults = useSpellSearch(searchIndex, debouncedSearchTerm)

	// Memoize filter state to prevent unnecessary recalculations
	const filterState = useMemo(
		() => ({
			hasClassFilter: selectedClasses.length > 0,
			hasLevelFilter: selectedLevels.length > 0,
			hasSchoolFilter: selectedSchools.length > 0,
			hasSearchTerm: debouncedSearchTerm.trim().length >= 2
		}),
		[selectedClasses.length, selectedLevels.length, selectedSchools.length, debouncedSearchTerm]
	)

	// Apply filters efficiently with optimized logic
	const filteredSpells = useMemo(() => {
		if (!spells || spells.length === 0) return []

		// Start with search results if there's a valid search term, otherwise use all spells
		const baseSpells = filterState.hasSearchTerm ? searchResults : spells

		// Early return if no filters are active
		if (
			!filterState.hasClassFilter &&
			!filterState.hasLevelFilter &&
			!filterState.hasSchoolFilter
		) {
			return baseSpells
		}

		// Apply filters with optimized logic
		return baseSpells.filter((spell) => {
			// Class filter - check first as it's most common
			if (filterState.hasClassFilter) {
				if (!spell.classes?.some((cls) => selectedClasses.includes(cls.name))) {
					return false
				}
			}

			// Level filter - simple number comparison
			if (filterState.hasLevelFilter) {
				if (!selectedLevels.includes(spell.level)) {
					return false
				}
			}

			// School filter - check last as it's least common
			if (filterState.hasSchoolFilter) {
				if (!spell.school?.name || !selectedSchools.includes(spell.school.name)) {
					return false
				}
			}

			return true
		})
	}, [spells, searchResults, selectedClasses, selectedLevels, selectedSchools, filterState])

	// Handle filter changes (optimized with useCallback)
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
			// Trigger localStorage event to update spellbook tab
			window.dispatchEvent(
				new StorageEvent('storage', {
					key: 'user-spellbook',
					newValue: JSON.stringify({
						spells: result.spells,
						lastModified: new Date().toISOString()
					})
				})
			)
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
			// Trigger localStorage event to update session deck tab
			window.dispatchEvent(
				new StorageEvent('storage', {
					key: 'session-deck',
					newValue: JSON.stringify({
						spells: result.spells,
						lastModified: new Date().toISOString()
					})
				})
			)
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

	// Check if any filters are active
	const hasActiveFilters = useMemo(() => {
		return (
			selectedClasses.length > 0 ||
			selectedLevels.length > 0 ||
			selectedSchools.length > 0 ||
			searchTerm.trim()
		)
	}, [selectedClasses, selectedLevels, selectedSchools, searchTerm])

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
				<Box position="relative">
					<Input
						placeholder="Search spells by name, description, or level (e.g., 'cantrip', 'level 3')..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						size="lg"
					/>
					{isDebouncing && searchTerm.length >= 2 && (
						<Box
							position="absolute"
							right="12px"
							top="50%"
							transform="translateY(-50%)"
							width="16px"
							height="16px"
							border="2px solid #e2e8f0"
							borderTop="2px solid #3182ce"
							borderRadius="50%"
							animation="spin 1s linear infinite"
						/>
					)}
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
											fontWeight="bold"
											color="white"
											backgroundColor={`var(--color-${className.toLowerCase()})`}
											variant={
												selectedClasses.includes(className)
													? 'solid'
													: 'subtle'
											}
											onClick={() => handleClassFilter(className)}>
											<Box
												as="span"
												display="inline-block"
												width="1.5rem"
												height="1.5rem"
												backgroundImage={`var(--${className.toLowerCase()}-icon)`}
												backgroundSize="contain"
												backgroundRepeat="no-repeat"
												backgroundPosition="center"
												mr={1}
											/>
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
													? 'subtle'
													: 'outline'
											}
											onClick={() => handleSchoolFilter(school)}>
											<Box
												as="span"
												display="inline-block"
												width="1.5rem"
												height="1.5rem"
												backgroundImage={`var(--${school.toLowerCase()}-icon)`}
												backgroundSize="contain"
												backgroundRepeat="no-repeat"
												backgroundPosition="center"
												mr={1}
											/>
											{school}
										</Button>
									</WrapItem>
								))}
							</Wrap>
						</Box>

						{/* Clear Filters Button */}
						{hasActiveFilters && (
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
							{debouncedSearchTerm.trim() && (
								<Text as="span" fontSize="xs" color="blue.500" ml={2}>
									(search results)
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
									<Badge
										key={cls}
										className="filter-badge"
										variant="solid"
										size="sm">
										{cls}
									</Badge>
								))}
								{selectedLevels.map((level) => (
									<Badge
										key={level}
										className="filter-badge"
										variant="solid"
										size="sm">
										{level === 0 ? 'Cantrip' : `L${level}`}
									</Badge>
								))}
								{selectedSchools.map((school) => (
									<Badge
										key={school}
										className="filter-badge"
										variant="solid"
										size="sm">
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
							{hasActiveFilters
								? 'Try adjusting your search terms or filters.'
								: 'No spells available in the database.'}
						</Text>
					</Box>
				)}

				{/* Virtualized Spell Results */}
				{filteredSpells.length > 0 && (
					<VirtualizedSpellList
						spells={filteredSpells}
						onAction={handleSpellAction}
						context="deck"
						itemsPerPage={50}
					/>
				)}

				{/* Add CSS for spinner animation */}
				<style jsx>{`
					@keyframes spin {
						0% {
							transform: rotate(0deg);
						}
						100% {
							transform: rotate(360deg);
						}
					}
				`}</style>
			</VStack>
		</Box>
	)
}
