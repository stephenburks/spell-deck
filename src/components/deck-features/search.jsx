import { useCallback, useState, useEffect } from 'react'
import { Input } from '@chakra-ui/react'
import Loading from '../loading'
import SpellCard from '../spellCard'
import { useSpellSearch } from '../../hooks/useSearchIndex'

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

// SearchableSpellList.jsx
export default function SearchableSpellList({ spells, className, loading, progress, isComplete }) {
	const [searchTerm, setSearchTerm] = useState('')
	const debouncedSearchTerm = useDebounce(searchTerm, 300)

	// Use the new Fuse.js powered search
	const filteredSpells = useSpellSearch(spells, debouncedSearchTerm)

	// Add debugging
	console.log('SearchableSpellList Debug:', {
		className,
		spellsReceived: spells,
		spellCount: spells?.length,
		loading,
		searchTerm,
		filteredCount: filteredSpells?.length
	})

	// In your SearchableSpellList component, add this:
	useEffect(() => {
		console.log('=== SEARCH DATA DEBUG ===')
		console.log('Spells count:', spells?.length)
		console.log('Is complete:', isComplete)
		console.log('Loading:', loading)
		console.log('Search term:', debouncedSearchTerm)
		console.log('Filtered results:', filteredSpells?.length)

		if (spells?.length > 0) {
			const spellNames = spells.map((s) => s.name).sort()
			console.log('Available spell names:', spellNames)
			console.log('Last spell alphabetically:', spellNames[spellNames.length - 1])
		}
	}, [spells, isComplete, loading, debouncedSearchTerm, filteredSpells])

	const handleInputChange = useCallback((e) => {
		setSearchTerm(e.target.value)
	}, [])

	return (
		<div>
			<Input
				placeholder={`Search ${className} spells...`}
				value={searchTerm}
				onChange={(e) => handleInputChange(e)}
			/>

			{/* Add progress indicator */}
			{loading && progress && (
				<div style={{ padding: '8px 0', fontSize: '14px', color: '#666' }}>
					Loading spells... {progress.loaded} of {progress.total} ({progress.percentage}%)
					{!isComplete && <span> - You can search what's loaded so far</span>}
				</div>
			)}

			{/* Existing search results summary */}
			{searchTerm.trim() && filteredSpells.length > 0 && (
				<div style={{ padding: '8px 0', fontSize: '14px', color: '#666' }}>
					Found {filteredSpells.length} spell{filteredSpells.length !== 1 ? 's' : ''}{' '}
					matching "{searchTerm}"
					{!isComplete && <span> (search may be incomplete - still loading)</span>}
				</div>
			)}

			<div className="spell-list">
				{filteredSpells.length === 0 && loading && <Loading />}

				{filteredSpells.length === 0 &&
					!loading &&
					searchTerm.trim() &&
					searchTerm.length >= 2 && (
						<div className="no-results">
							No spells found matching "{searchTerm}". Try a different search term or
							check spelling.
						</div>
					)}

				{filteredSpells.length === 0 &&
					!loading &&
					searchTerm.trim() &&
					searchTerm.length < 2 && (
						<div className="no-results">
							Enter at least 2 characters to search spells.
						</div>
					)}

				{filteredSpells.map((spell) => (
					<SpellCard key={spell.index} spell={spell} currentClass={className} />
				))}
			</div>
		</div>
	)
}
