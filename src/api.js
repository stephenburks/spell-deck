/**
 * D&D 5e API client for spell data
 * Handles fetching spell information from the D&D 5e API
 */

const BASE_URL = 'https://www.dnd5eapi.co/api/2014'

/**
 * Sample spell object structure for reference
 * This shows the complete structure returned by the API
 */
const SAMPLE_SPELL_OBJECT = {
	index: 'acid-arrow',
	name: 'Acid Arrow',
	desc: [
		'A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 acid damage immediately and 2d4 acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage and no damage at the end of its next turn.'
	],
	higher_level: [
		'When you cast this spell using a spell slot of 3rd level or higher, the damage (both initial and later) increases by 1d4 for each slot level above 2nd.'
	],
	range: '90 feet',
	components: ['V', 'S', 'M'],
	material: "Powdered rhubarb leaf and an adder's stomach.",
	ritual: false,
	duration: 'Instantaneous',
	concentration: false,
	casting_time: '1 action',
	level: 2,
	attack_type: 'ranged',
	damage: {
		damage_type: {
			index: 'acid',
			name: 'Acid',
			url: '/api/2014/damage-types/acid'
		},
		damage_at_slot_level: {
			2: '4d4',
			3: '5d4',
			4: '6d4',
			5: '7d4',
			6: '8d4',
			7: '9d4',
			8: '10d4',
			9: '11d4'
		}
	},
	school: {
		index: 'evocation',
		name: 'Evocation',
		url: '/api/2014/magic-schools/evocation'
	},
	classes: [
		{
			index: 'wizard',
			name: 'Wizard',
			url: '/api/2014/classes/wizard'
		}
	],
	subclasses: [
		{
			index: 'lore',
			name: 'Lore',
			url: '/api/2014/subclasses/lore'
		},
		{
			index: 'land',
			name: 'Land',
			url: '/api/2014/subclasses/land'
		}
	],
	url: '/api/2014/spells/acid-arrow',
	updated_at: '2025-10-24T20:42:14.618Z'
}

/**
 * Utility functions
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isValidSpell = (spell) =>
	spell?.index &&
	spell?.name &&
	typeof spell.level === 'number' &&
	spell.level >= 0 &&
	spell.level <= 9

/**
 * Fetch with error handling
 * @param {string} url - API endpoint
 * @returns {Promise<Object>} Response data
 */
const fetchAPI = async (url) => {
	const response = await fetch(`${BASE_URL}${url}`)
	if (!response.ok) {
		throw new Error(`API Error: ${response.status} ${response.statusText}`)
	}
	return response.json()
}

/**
 * Fetch data in batches with rate limiting
 * @param {Array} items - Items to process
 * @param {Function} fetchFn - Function to fetch each item
 * @param {number} batchSize - Items per batch
 * @param {number} delayMs - Delay between batches
 * @returns {Promise<Array>} Results array
 */
const fetchInBatches = async (items, fetchFn, batchSize = 10, delayMs = 500) => {
	const results = []
	const failed = []

	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize)

		const batchResults = await Promise.allSettled(batch.map(fetchFn))

		batchResults.forEach((result, index) => {
			if (result.status === 'fulfilled') {
				results.push(result.value)
			} else {
				failed.push(batch[index])
				console.warn(`Failed to fetch:`, batch[index], result.reason)
			}
		})

		// Rate limiting - delay between batches
		if (i + batchSize < items.length) {
			await delay(delayMs)
		}
	}

	if (failed.length > 0) {
		console.warn(`${failed.length} items failed to fetch`)
	}

	return results
}

/**
 * Get all spellcasting classes
 * @returns {Promise<Array>} Array of class names
 */
export const getSpellCastingClasses = async () => {
	const { results: allClasses } = await fetchAPI('/classes')

	const spellClasses = await fetchInBatches(
		allClasses,
		async (cls) => {
			const spells = await fetchAPI(`/classes/${cls.index}/spells`)
			return spells.count > 0 ? cls.name : null
		},
		5, // Smaller batches for class checking
		300
	)

	return spellClasses.filter(Boolean)
}

/**
 * Get all unique spell indexes from all spellcasting classes
 * @returns {Promise<Array>} Array of spell indexes
 */
export const getAllSpellIndexes = async () => {
	const spellCastingClasses = await getSpellCastingClasses()

	const classSpells = await fetchInBatches(
		spellCastingClasses,
		async (className) => {
			const spells = await fetchAPI(`/classes/${className.toLowerCase()}/spells`)
			return spells.results.map((spell) => spell.index)
		},
		3, // Conservative batching for spell lists
		400
	)

	// Get unique spell indexes
	const uniqueIndexes = [...new Set(classSpells.flat())]

	return uniqueIndexes
}

/**
 * Fetch specific spells by their indexes
 * @param {Array} spellIndexes - Array of spell indexes
 * @returns {Promise<Array>} Array of spell objects
 */
export const getSpellsByIndexes = async (spellIndexes) => {
	if (!Array.isArray(spellIndexes) || spellIndexes.length === 0) {
		return []
	}

	const spells = await fetchInBatches(
		spellIndexes,
		async (index) => {
			const spell = await fetchAPI(`/spells/${index}`)
			return isValidSpell(spell) ? spell : null
		},
		5, // Small batches for individual spell fetching
		300
	)

	const validSpells = spells.filter(Boolean)
	console.log(`Fetched ${validSpells.length}/${spellIndexes.length} valid spells`)

	return validSpells
}

/**
 * Get all spell details from the complete database
 * @returns {Promise<Array>} Array of all spell objects, sorted alphabetically
 */
export const getAllSpellDetails = async () => {
	const allIndexes = await getAllSpellIndexes()
	const allSpells = await getSpellsByIndexes(allIndexes)

	// Sort alphabetically by name
	return allSpells.sort((a, b) => a.name.localeCompare(b.name))
}

// Export sample for reference
export { SAMPLE_SPELL_OBJECT }
