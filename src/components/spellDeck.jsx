import { useEffect, useState } from 'react'
import { getAllSpells } from '../api'
import SpellCard from './spellCard'

export default function SpellDeck() {
	const [spells, setSpells] = useState([])

	useEffect(() => {
		const savedSpells = localStorage.getItem('spells')
		if (savedSpells) {
			setSpells(JSON.parse(savedSpells))
		} else {
			getAllSpells().then((spells) => {
				setSpells(spells)
				localStorage.setItem('spells', JSON.stringify(spells))
			})
		}
	}, [])

	return (
        <div className="spell-list">
			{spells.length === 0 && <span className="loading">Loading...</span>}
			
            {spells.map((spell) => (
                <SpellCard key={spell.index} spell={spell} />
            ))}
		</div>
	)
}