import { HStack, Tabs, ScrollArea } from '@chakra-ui/react'
import SearchableSpellList from './search'
import Loading from '../loading'
import { Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard } from '../icons/index'

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

export default function SpellTabs({ spellsByClass, loading }) {
	const classNames = spellsByClass

	return (
		<div className="spell-list-container">
			{classNames.length === 0 && loading && <Loading />}
			<Tabs.Root>
				<Tabs.List>
					<ScrollArea.Root>
						<ScrollArea.Viewport>
							<ScrollArea.Content py="4" className="scroll-area_horizontal">
								<HStack>
									{classNames.map((spellClass) => (
										<Tabs.Trigger
											key={spellClass}
											value={spellClass[0]}
											className={`spell-card__tab-${spellClass[0].toLowerCase()}`}>
											{getClassIcon(spellClass[0])}
											{spellClass[0]}
										</Tabs.Trigger>
									))}
								</HStack>
							</ScrollArea.Content>
						</ScrollArea.Viewport>
					</ScrollArea.Root>
				</Tabs.List>
				{classNames.map((spellClass) => (
					<Tabs.Content
						value={spellClass[0]}
						className={`spell-card__content-${spellClass[0].toLowerCase()}`}>
						<SearchableSpellList
							spells={spellClass[1]}
							className={spellClass[0]}
							loading={loading}
						/>
					</Tabs.Content>
				))}
			</Tabs.Root>
		</div>
	)
}
