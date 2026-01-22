/**
 * Helper to merge additional custom spells with API spells
 * @param {Array} apiSpells - Spells from the API
 * @param {Array} customSpells - Additional spell objects to include
 * @returns {Array} Combined and deduplicated spell array, sorted alphabetically
 */
export const mergeAdditionalSpells = (apiSpells = [], customSpells = []) => {
	const combined = [...apiSpells, ...customSpells]

	// Remove duplicates by index
	const uniqueSpells = combined.reduce((acc, spell) => {
		if (!acc.some((s) => s.index === spell.index)) {
			acc.push(spell)
		}
		return acc
	}, [])

	// Sort alphabetically by name
	return uniqueSpells.sort((a, b) => a.name.localeCompare(b.name))
}
