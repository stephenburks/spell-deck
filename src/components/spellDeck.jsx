import { useSpells } from '../data/context/spellDataContext'
import SpellTabs from './deck-features/class-tabs'

export default function SpellDeck() {
	const { spellsByClass, loading, error } = useSpells()
	console.log('Rendering SpellDeck with spellsByClass:', spellsByClass)

	if (error) return <div>Error: {error}</div>

	const spellClassEntries = Object.entries(spellsByClass)

	return (
		<>
			<SpellTabs spellsByClass={spellClassEntries} loading={loading} />
		</>
	)
}
