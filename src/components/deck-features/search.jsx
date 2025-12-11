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
export default function SearchableSpellList({ spells, className, loading }) {
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

			{/* Search results summary */}
			{searchTerm.trim() && filteredSpells.length > 0 && (
				<div style={{ padding: '8px 0', fontSize: '14px', color: '#666' }}>
					Found {filteredSpells.length} spell{filteredSpells.length !== 1 ? 's' : ''}{' '}
					matching "{searchTerm}"
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
					<SpellCard key={spell.index} spell={spell} />
				))}
			</div>
		</div>
	)
}
