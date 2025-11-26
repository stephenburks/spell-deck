import { useCallback, useMemo, useState, useEffect } from 'react'
import { Input } from '@chakra-ui/react'
import Loading from '../loading'
import SpellCard from '../spellCard'

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

	const handleInputChange = useCallback((e) => {
		setSearchTerm(e.target.value)
	}, [])

	const filteredSpells = useMemo(() => {
		if (!debouncedSearchTerm?.trim()) return spells

		const term = debouncedSearchTerm.toLowerCase()

		// First pass: search primary fields only
		const primaryMatches = spells.filter((spell) =>
			[spell.name, spell.school?.name, spell.level, spell.casting_time].some((field) =>
				field?.toString().toLowerCase().includes(term)
			)
		)

		// If we found matches, return them sorted
		if (primaryMatches.length > 0) {
			return primaryMatches.sort(
				(firstSpell, secondSpell) =>
					secondSpell.name.toLowerCase().includes(term) -
					firstSpell.name.toLowerCase().includes(term)
			)
		}

		// Fallback: search descriptions only if no primary matches AND term is long enough
		// if (term.length >= 3) {
		// 	return spells.filter((spell) =>
		// 		spell.desc?.some((desc) => desc.toLowerCase().includes(term))
		// 	)
		// }

		// Return empty if term too short and no primary matches
		return []
	}, [spells, debouncedSearchTerm])

	return (
		<div>
			<Input
				placeholder={`Search ${className} spells...`}
				value={searchTerm}
				onChange={(e) => handleInputChange(e)}
			/>

			<div className="spell-list">
				{filteredSpells.length === 0 && loading && <Loading />}

				{filteredSpells.length === 0 && !loading && searchTerm.trim() && (
					<div className="no-results">No spells found matching "{searchTerm}"</div>
				)}

				{filteredSpells.map((spell) => (
					<SpellCard key={spell.index} spell={spell} />
				))}
			</div>
		</div>
	)
}
