import { createContext, useCallback, useContext, useState, useEffect } from 'react'
import { getAllSpells, getSpellsByClass } from '../../api'
import Loading from '../../components/loading'

const SpellContext = createContext()

export function SpellProvider({ children }) {
	const [spells, setSpells] = useState([])
	const [spellsByClass, setSpellsByClass] = useState({})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [isInitialized, setIsInitialized] = useState(false)
	const savedSpells = localStorage.getItem('spells')

	const fetchSpellData = useCallback(async () => {
		try {
			setLoading(true)
			const allSpells = savedSpells ? JSON.parse(savedSpells) : await getAllSpells()
			setSpells(allSpells)

			const sortedSpellsByClass = await getSpellsByClass(JSON.stringify(allSpells))
			setSpellsByClass(sortedSpellsByClass)
			setIsInitialized(true)
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}, [savedSpells])

	useEffect(() => {
		fetchSpellData()
	}, [fetchSpellData])

	if (!isInitialized) {
		return <Loading /> // Or your loading component
	}

	if (error) {
		return <div>Error loading spell data: {error}</div> // Or your error component
	}

	return (
		<SpellContext.Provider
			value={{
				spells,
				spellsByClass,
				loading,
				error
			}}>
			{children}
		</SpellContext.Provider>
	)
}

export function useSpells() {
	const context = useContext(SpellContext)
	if (context === undefined) {
		throw new Error('useSpells must be used within a SpellProvider')
	}
	return context
}


