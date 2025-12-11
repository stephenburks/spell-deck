// import { createContext, useCallback, useContext, useState, useEffect } from 'react'
// import { getAllSpells, getSpellsByClass } from '../../api'
// import Loading from '../../components/loading'

// const SpellContext = createContext()

// export function SpellProvider({ children }) {
// 	const [spells, setSpells] = useState([])
// 	const [spellsById, setSpellsById] = useState({})
// 	const [spellsByClass, setSpellsByClass] = useState({})
// 	const [classSpellCounts, setClassSpellCounts] = useState({})
// 	const [loading, setLoading] = useState(true)
// 	const [error, setError] = useState(null)
// 	const [isInitialized, setIsInitialized] = useState(false)
// 	const savedSpells = localStorage.getItem('spells')

// 	const getSpellsForClass = useCallback(
// 		(className) => {
// 			const spellIds = spellsByClass[className] || []
// 			return spellIds.map((id) => spellsById[id]).filter(Boolean)
// 		},
// 		[spellsById, spellsByClass]
// 	)

// 	const fetchSpellData = useCallback(async () => {
// 		try {
// 			setLoading(true)
// 			const allSpells = savedSpells ? JSON.parse(savedSpells) : await getAllSpells()
// 			setSpells(allSpells)

// 			const sortedSpellData = await getSpellsByClass(JSON.stringify(allSpells))
// 			setSpellsById(sortedSpellData.spellsById)
// 			setSpellsByClass(sortedSpellData.spellsByClass)
// 			setClassSpellCounts(sortedSpellData.classSpellCounts)

// 			setIsInitialized(true)
// 		} catch (err) {
// 			setError(err.message)
// 		} finally {
// 			setLoading(false)
// 		}
// 	}, [savedSpells])

// 	useEffect(() => {
// 		fetchSpellData()
// 	}, [fetchSpellData])

// 	if (!isInitialized) {
// 		return <Loading /> // Or your loading component
// 	}

// 	if (error) {
// 		return <div>Error loading spell data: {error}</div> // Or your error component
// 	}

// 	return (
// 		<SpellContext.Provider
// 			value={{
// 				spells,
// 				spellsById,
// 				spellsByClass,
// 				classSpellCounts,
// 				getSpellsForClass,
// 				loading,
// 				error
// 			}}>
// 			{children}
// 		</SpellContext.Provider>
// 	)
// }

// export function useSpells() {
// 	const context = useContext(SpellContext)
// 	if (context === undefined) {
// 		throw new Error('useSpells must be used within a SpellProvider')
// 	}
// 	return context
// }
import { createContext, useContext } from 'react'
import { useSpellStructure } from '../../hooks/useSpells'
import Loading from '../../components/loading'

const SpellContext = createContext()

export function SpellProvider({ children }) {
	const spellStructureQuery = useSpellStructure()

	// Show loading for initial structure fetch
	if (spellStructureQuery.isLoading) {
		return <Loading />
	}

	// Show error if structure fetch fails
	if (spellStructureQuery.isError) {
		return (
			<div>
				Error loading spell data: {spellStructureQuery.error?.message || 'Unknown error'}
				<button
					onClick={() => spellStructureQuery.refetch()}
					style={{ marginLeft: '10px', padding: '5px 10px' }}>
					Retry
				</button>
			</div>
		)
	}

	return <SpellContext.Provider value={{ spellStructureQuery }}>{children}</SpellContext.Provider>
}

export function useSpells() {
	const context = useContext(SpellContext)
	if (context === undefined) {
		throw new Error('useSpells must be used within a SpellProvider')
	}
	return context
}
