import { useState, useEffect } from 'react'
import { Box, Tabs } from '@chakra-ui/react'
import DailySpellsTab from './DailySpellsTab.jsx'
import SpellbookTab from './SpellbookTab.jsx'
import SessionDeckTab from './SessionDeckTab.jsx'
import SpellDeckTab from './SpellDeckTab.jsx'
import { initializeLocalStorage } from '../utils/localStorage.js'
import { runCompleteMigration, isMigrationNeeded } from '../utils/migration.js'

/**
 * SpellInterface - Main container component with tabbed interface
 *
 * Provides four horizontal tabs:
 * - "Spells of the Day": Daily random spell selection
 * - "Spellbook": Personal spell library management
 * - "Session Deck": Active session spell management
 * - "Spell Deck": Complete searchable spell index
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
		// Run migration first if needed
		if (isMigrationNeeded()) {
			console.log('Running data migration...')
			const migrationResult = runCompleteMigration()
			console.log('Migration result:', migrationResult.summary)
		}

		// Then initialize localStorage
		const initResults = initializeLocalStorage()

		// Log initialization results for debugging
		console.log('SpellInterface localStorage initialization:', initResults)

		// Check if any initialization failed
		const failedInits = Object.entries(initResults)
			.filter(([key, success]) => key !== 'migration' && !success)
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
				{/* Tab List - Four horizontal tabs */}
				<Tabs.List>
					<Tabs.Trigger value="0">Spells of the Day</Tabs.Trigger>
					<Tabs.Trigger value="1">Spellbook</Tabs.Trigger>
					<Tabs.Trigger value="2">Session Deck</Tabs.Trigger>
					<Tabs.Trigger value="3">Spell Deck</Tabs.Trigger>
				</Tabs.List>

				{/* Tab Content Panels */}
				<Tabs.Content value="0">
					<DailySpellsTab />
				</Tabs.Content>

				<Tabs.Content value="1">
					<SpellbookTab />
				</Tabs.Content>

				<Tabs.Content value="2">
					<SessionDeckTab />
				</Tabs.Content>

				<Tabs.Content value="3">
					<SpellDeckTab />
				</Tabs.Content>
			</Tabs.Root>
		</Box>
	)
}
