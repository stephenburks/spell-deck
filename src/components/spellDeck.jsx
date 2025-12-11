import { useSpellClasses } from '../hooks/useSpells'
import SpellTabs from './deck-features/class-tabs'
import Loading from './loading'

export default function SpellDeck() {
	const { classes, isLoading, error, isError } = useSpellClasses()

	if (isError) {
		return (
			<div>
				Error: {error?.message || 'Failed to load spell classes'}
				<button onClick={() => window.location.reload()}>Retry</button>
			</div>
		)
	}

	if (isLoading) {
		return <Loading />
	}

	return <SpellTabs classes={classes} />
}
