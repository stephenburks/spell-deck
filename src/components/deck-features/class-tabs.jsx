import { useState } from 'react'
import { HStack, Tabs, ScrollArea } from '@chakra-ui/react'
import SearchableSpellList from './search'
import Loading from '../loading'
import { Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard } from '../icons/index'
import { useClassSpellsProgressive, useSpellStructure } from '../../hooks/useSpells'

// Map class names to their corresponding icons
const getClassIcon = (className) => {
	const iconMap = {
		Bard: Bard,
		Cleric: Cleric,
		Druid: Druid,
		Paladin: Paladin,
		Ranger: Ranger,
		Sorcerer: Sorcerer,
		Warlock: Warlock,
		Wizard: Wizard
	}

	const IconComponent = iconMap[className]
	return IconComponent ? <IconComponent size="1.2rem" /> : null
}

export default function SpellTabs({ classes }) {
	const [activeTab, setActiveTab] = useState(null)
	const { data: spellStructure } = useSpellStructure()

	// Fix: Extract the actual class name from the tab value
	const activeClassName = activeTab?.value || activeTab || null

	// Add debugging
	console.log('SpellTabs Debug:', {
		classes,
		activeTab,
		activeClassName, // This should now be just "Paladin"
		spellStructure,
		spellIdsForActiveTab: spellStructure?.[activeClassName]
	})

	// Only load spells for the active tab - use the extracted class name
	// In class-tabs.jsx, replace the useClassSpells call with:
	const {
		data: activeClassSpells = [],
		isLoading: isLoadingSpells,
		isComplete,
		progress,
		error: spellsError
	} = useClassSpellsProgressive(
		activeClassName,
		spellStructure?.[activeClassName],
		!!activeClassName
	)

	// Add more debugging
	console.log('Spell Query Debug:', {
		activeClassName,
		activeClassSpells,
		spellCount: activeClassSpells?.length,
		isLoadingSpells,
		spellsError
	})

	return (
		<div className="spell-list-container">
			{classes.length === 0 && <Loading />}
			<Tabs.Root onValueChange={setActiveTab}>
				<Tabs.List>
					<ScrollArea.Root>
						<ScrollArea.Viewport>
							<ScrollArea.Content py="4" className="scroll-area_horizontal">
								<HStack>
									{classes.map((className) => (
										<Tabs.Trigger
											key={className}
											value={className}
											className={`spell-card__tab-${className.toLowerCase()}`}>
											{getClassIcon(className)}
											{className}
											{activeClassName === className && isLoadingSpells && (
												<span style={{ marginLeft: '4px' }}>
													{progress.percentage}%
												</span>
											)}
										</Tabs.Trigger>
									))}
								</HStack>
							</ScrollArea.Content>
						</ScrollArea.Viewport>
					</ScrollArea.Root>
				</Tabs.List>

				{classes.map((className) => (
					// Update your content area to show progress:
					<Tabs.Content
						key={className}
						value={className}
						className={`spell-card__content-${className.toLowerCase()}`}>
						{activeClassName === className && spellsError ? (
							<div>
								Error loading spells: {spellsError.message}
								<button onClick={() => window.location.reload()}>Retry</button>
							</div>
						) : (
							<SearchableSpellList
								spells={activeClassName === className ? activeClassSpells : []}
								className={className}
								loading={isLoadingSpells}
								progress={activeClassName === className ? progress : null}
								isComplete={activeClassName === className ? isComplete : true}
							/>
						)}
					</Tabs.Content>
				))}
			</Tabs.Root>
		</div>
	)
}
