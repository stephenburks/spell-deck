import { useState, useEffect } from 'react'
import { Box, Tabs, Tooltip } from '@chakra-ui/react'
import DailySpellsTab from './tabs/DailySpellsTab.jsx'
import SpellbookTab from './tabs/SpellbookTab.jsx'
import SpellDeckTab from './tabs/SpellDeckTab.jsx'
import SpellLibraryTab from './tabs/SpellLibraryTab.jsx'
import ReadmeTab from './tabs/ReadmeTab.jsx'
import { initializeLocalStorage } from '../utils/localStorage.js'
import Icon from './IconRegistry.jsx'

/**
 * SpellInterface - Main container component with tabbed interface
 *
 * Provides five horizontal tabs:
 * - "Spells of the Day": Daily random spell selection
 * - "Spellbook": Personal spell library management
 * - "Spell Deck": Active session spell management
 * - "Spell Library": Complete searchable spell index
 * - "README": Project information and documentation
 *
 * Features:
 * - Tab state persistence during user session
 * - localStorage initialization on mount
 * - Chakra UI Tabs for consistent styling and accessibility
 */
export default function SpellInterface() {
	// Tab state management with session persistence
	const [activeTabIndex, setActiveTabIndex] = useState(() => {
		// Load saved tab index from sessionStorage (persists during browser session)
		const savedTabIndex = sessionStorage.getItem('spell-interface-active-tab')
		return savedTabIndex ? parseInt(savedTabIndex, 10) : 0
	})

	// Initialize localStorage data on component mount
	useEffect(() => {
		// Initialize localStorage
		const initResults = initializeLocalStorage()

		// Log initialization results for debugging
		console.log('SpellInterface localStorage initialization:', initResults)

		// Check if any initialization failed
		const failedInits = Object.entries(initResults)
			.filter(([key, success]) => !success)
			.map(([store]) => store)

		if (failedInits.length > 0) {
			console.warn('Failed to initialize localStorage for:', failedInits.join(', '))
		}
	}, [])

	// Handle tab change and persist to sessionStorage
	const handleTabChange = (index) => {
		setActiveTabIndex(index)

		// Persist tab state during user session
		try {
			sessionStorage.setItem('spell-interface-active-tab', index.toString())
		} catch (error) {
			console.warn('Failed to save tab state to sessionStorage:', error)
		}
	}

	return (
		<Box className="spell-interface-container" w="100%" h="100%">
			<Tabs.Root
				value={activeTabIndex.toString()}
				onValueChange={(details) => handleTabChange(parseInt(details.value, 10))}
				variant="enclosed"
				size="lg">
				{/* Tab List - Five horizontal tabs with scroll */}
				<Box
					overflowX="auto"
					overflowY="hidden"
					width="100%"
					pt={2}
					pb={4}
					css={{
						'&::-webkit-scrollbar': {
							display: 'none'
						}
					}}>
					<Tabs.List
						background="transparent"
						display="flex"
						flexWrap="nowrap"
						minWidth="max-content"
						gap={2}>
						<Tabs.Trigger value="0" flexShrink={0}>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<Box display="flex" alignItems="center" gap={2}>
										<Icon name="spells-of-the-day" folder="tabs" />
										Spells of the Day
									</Box>
								</Tooltip.Trigger>
								<Tooltip.Positioner>
									<Tooltip.Content style={{ textTransform: 'none' }}>
										Daily randomized spell selections organized by class
									</Tooltip.Content>
								</Tooltip.Positioner>
							</Tooltip.Root>
						</Tabs.Trigger>
						<Tabs.Trigger value="1" flexShrink={0}>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<Box display="flex" alignItems="center" gap={2}>
										<Icon name="spellbook" folder="tabs" />
										Book
									</Box>
								</Tooltip.Trigger>
								<Tooltip.Positioner>
									<Tooltip.Content style={{ textTransform: 'none' }}>
										Spell Book - Your personal collection of saved spells
									</Tooltip.Content>
								</Tooltip.Positioner>
							</Tooltip.Root>
						</Tabs.Trigger>
						<Tabs.Trigger value="2" flexShrink={0}>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<Box display="flex" alignItems="center" gap={2}>
										<Icon name="session-deck" folder="tabs" />
										Deck
									</Box>
								</Tooltip.Trigger>
								<Tooltip.Positioner>
									<Tooltip.Content style={{ textTransform: 'none' }}>
										Spell Deck - Active session spells with spell slot tracking
									</Tooltip.Content>
								</Tooltip.Positioner>
							</Tooltip.Root>
						</Tabs.Trigger>
						<Tabs.Trigger value="3" flexShrink={0}>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<Box display="flex" alignItems="center" gap={2}>
										<Icon name="spell-deck" folder="tabs" />
										Library
									</Box>
								</Tooltip.Trigger>
								<Tooltip.Positioner>
									<Tooltip.Content style={{ textTransform: 'none' }}>
										Spell Library - Searchable database of all D&D 5e spells
									</Tooltip.Content>
								</Tooltip.Positioner>
							</Tooltip.Root>
						</Tabs.Trigger>
						<Tabs.Trigger value="4" flexShrink={0}>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<Box display="flex" alignItems="center" gap={2}>
										<Icon name="readme" folder="tabs" />
										README
									</Box>
								</Tooltip.Trigger>
								<Tooltip.Positioner>
									<Tooltip.Content style={{ textTransform: 'none' }}>
										How to use the spell management system
									</Tooltip.Content>
								</Tooltip.Positioner>
							</Tooltip.Root>
						</Tabs.Trigger>
					</Tabs.List>
				</Box>

				{/* Tab Content Panels */}
				<Tabs.Content value="0">
					<DailySpellsTab />
				</Tabs.Content>

				<Tabs.Content value="1">
					<SpellbookTab />
				</Tabs.Content>

				<Tabs.Content value="2">
					<SpellDeckTab />
				</Tabs.Content>

				<Tabs.Content value="3">
					<SpellLibraryTab />
				</Tabs.Content>

				<Tabs.Content value="4">
					<ReadmeTab />
				</Tabs.Content>
			</Tabs.Root>
		</Box>
	)
}
