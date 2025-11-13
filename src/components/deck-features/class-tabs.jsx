import { Tabs } from '@chakra-ui/react'
import SpellCard from '../spellCard'
import Loading from '../loading'

export default function SpellTabs({ spellsByClass, loading }) {
	const classNames = spellsByClass
	console.log('Rendering SpellTabs with classNames:', classNames)

	return (
		<div className="spell-class-tabs">
			{classNames.length === 0 && loading && <Loading />}

			<Tabs.Root>
				<Tabs.List>
					{classNames.map((spellClass) => (
						<Tabs.Trigger key={spellClass} value={spellClass[0]}>
							{spellClass[0]}
						</Tabs.Trigger>
					))}
				</Tabs.List>
				{classNames.map((spellClass) => (
					<Tabs.Content key={spellClass} value={spellClass[0]}>
						<div className="spell-list">
							{spellClass[1].length === 0 && loading && <Loading />}

							{spellClass[1].map((spell) => (
								<SpellCard key={spell.index} spell={spell} />
							))}
						</div>
					</Tabs.Content>
				))}
			</Tabs.Root>
		</div>
	)
}
