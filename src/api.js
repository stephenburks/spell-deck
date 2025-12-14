const BASE_URL = 'https://www.dnd5eapi.co'

// Helper function to add delay between requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// KEEP - still needed by getSpellCastingClasses
export async function getAllClasses() {
	const response = await fetch(`${BASE_URL}/api/2014/classes`)
	const classIndexes = await response.json()
	return classIndexes.results
}

// KEEP - still needed by getSpellIndexesByClass
export async function getSpellCastingClasses() {
	const allClasses = await getAllClasses()
	const spellClasses = []

	await Promise.all(
		allClasses.map(async (cls) => {
			const response = await fetch(`${BASE_URL}/api/2014/classes/${cls.index}/spells`)

			if (!response.ok) {
				throw new Error(`Failed to fetch spells for class: ${cls.name}`)
			}

			const hasSpellCastingAbility = await response.json()

			if (hasSpellCastingAbility.count > 0) {
				spellClasses.push(cls.name)
			}
		})
	)

	return spellClasses
}

// NEW - replaces the old approach
export async function getSpellIndexesByClass() {
	const spellCastingClasses = await getSpellCastingClasses()
	const spellsByClass = {}

	await Promise.all(
		spellCastingClasses.map(async (className) => {
			try {
				const response = await fetch(
					`${BASE_URL}/api/2014/classes/${className.toLowerCase()}/spells`
				)
				if (response.ok) {
					const classSpells = await response.json()
					spellsByClass[className] = classSpells.results.map((spell) => spell.index)
				} else {
					console.warn(`No spells found for class: ${className}`)
					spellsByClass[className] = []
				}
			} catch (error) {
				console.warn(`Failed to fetch spells for ${className}:`, error)
				spellsByClass[className] = []
			}
		})
	)

	return spellsByClass
}

// New function to fetch all spells from the complete database
export async function getAllSpellDetails() {
	try {
		// Get spell indexes by class
		const spellsByClass = await getSpellIndexesByClass()

		if (!spellsByClass || typeof spellsByClass !== 'object') {
			throw new Error('Failed to fetch spell structure from API')
		}

		// Collect all unique spell indexes
		const allSpellIndexes = new Set()
		Object.values(spellsByClass).forEach((spellIds) => {
			if (Array.isArray(spellIds)) {
				spellIds.forEach((id) => {
					if (typeof id === 'string' && id.trim()) {
						allSpellIndexes.add(id.trim())
					}
				})
			}
		})

		if (allSpellIndexes.size === 0) {
			throw new Error('No spell indexes found in API response')
		}

		// Convert to array and create URL objects for fetchSpellsBatch
		const spellIndexArray = Array.from(allSpellIndexes)
		const spellUrls = spellIndexArray.map((index) => ({ url: `/api/2014/spells/${index}` }))

		console.log(`Fetching ${spellUrls.length} unique spells...`)

		// Fetch spells in batches with better error handling
		const allSpells = []
		const failedSpells = []
		const batchSize = 10
		const delayMs = 500

		for (let i = 0; i < spellUrls.length; i += batchSize) {
			const batch = spellUrls.slice(i, i + batchSize)

			try {
				const batchResults = await Promise.allSettled(
					batch.map((index) =>
						fetch(BASE_URL + index.url).then((response) => {
							if (!response.ok) {
								throw new Error(`HTTP ${response.status}: ${response.statusText}`)
							}
							return response.json()
						})
					)
				)

				// Process batch results
				batchResults.forEach((result, batchIndex) => {
					if (result.status === 'fulfilled') {
						const spell = result.value
						if (validateSpellObject(spell)) {
							allSpells.push(spell)
						} else {
							console.warn(`Invalid spell object:`, spell)
							failedSpells.push(batch[batchIndex].url)
						}
					} else {
						console.warn(
							`Failed to fetch spell ${batch[batchIndex].url}:`,
							result.reason
						)
						failedSpells.push(batch[batchIndex].url)
					}
				})

				// Add delay between batches (except for the last one)
				if (i + batchSize < spellUrls.length) {
					await delay(delayMs)
				}
			} catch (error) {
				console.error(`Batch fetch failed:`, error)
				failedSpells.push(...batch.map((b) => b.url))
			}
		}

		if (failedSpells.length > 0) {
			console.warn(`Failed to fetch ${failedSpells.length} spells:`, failedSpells)
		}

		// Sort alphabetically by name
		const sortedSpells = allSpells.sort((a, b) => a.name.localeCompare(b.name))

		console.log(
			`Successfully loaded ${sortedSpells.length} spells (${failedSpells.length} failed)`
		)
		return sortedSpells
	} catch (error) {
		console.error('getAllSpellDetails failed:', error)
		throw error
	}
}

// Helper function to validate spell objects
function validateSpellObject(spell) {
	return (
		spell &&
		typeof spell.index === 'string' &&
		typeof spell.name === 'string' &&
		typeof spell.level === 'number' &&
		spell.level >= 0 &&
		spell.level <= 9
	)
}

// Get all spell indexes without fetching full spell details (lightweight)
export async function getAllSpellIndexes() {
	try {
		const spellsByClass = await getSpellIndexesByClass()

		if (!spellsByClass || typeof spellsByClass !== 'object') {
			throw new Error('Failed to fetch spell structure from API')
		}

		// Collect all unique spell indexes
		const allSpellIndexes = new Set()
		Object.values(spellsByClass).forEach((spellIds) => {
			if (Array.isArray(spellIds)) {
				spellIds.forEach((id) => {
					if (typeof id === 'string' && id.trim()) {
						allSpellIndexes.add(id.trim())
					}
				})
			}
		})

		return Array.from(allSpellIndexes)
	} catch (error) {
		console.error('getAllSpellIndexes failed:', error)
		throw error
	}
}

// Fetch specific spells by their indexes (for daily spells)
export async function getSpellsByIndexes(spellIndexes) {
	if (!Array.isArray(spellIndexes) || spellIndexes.length === 0) {
		return []
	}

	try {
		const spells = []
		const failedSpells = []
		const batchSize = 5 // Smaller batches for daily spells
		const delayMs = 300

		for (let i = 0; i < spellIndexes.length; i += batchSize) {
			const batch = spellIndexes.slice(i, i + batchSize)

			try {
				const batchResults = await Promise.allSettled(
					batch.map((index) =>
						fetch(`${BASE_URL}/api/2014/spells/${index}`).then((response) => {
							if (!response.ok) {
								throw new Error(`HTTP ${response.status}: ${response.statusText}`)
							}
							return response.json()
						})
					)
				)

				// Process batch results
				batchResults.forEach((result, batchIndex) => {
					if (result.status === 'fulfilled') {
						const spell = result.value
						if (validateSpellObject(spell)) {
							spells.push(spell)
						} else {
							console.warn(`Invalid spell object:`, spell)
							failedSpells.push(batch[batchIndex])
						}
					} else {
						console.warn(`Failed to fetch spell ${batch[batchIndex]}:`, result.reason)
						failedSpells.push(batch[batchIndex])
					}
				})

				// Add delay between batches (except for the last one)
				if (i + batchSize < spellIndexes.length) {
					await delay(delayMs)
				}
			} catch (error) {
				console.error(`Batch fetch failed:`, error)
				failedSpells.push(...batch)
			}
		}

		if (failedSpells.length > 0) {
			console.warn(`Failed to fetch ${failedSpells.length} spells:`, failedSpells)
		}

		console.log(`Successfully loaded ${spells.length} spells (${failedSpells.length} failed)`)
		return spells
	} catch (error) {
		console.error('getSpellsByIndexes failed:', error)
		throw error
	}
}

// getAllSpellDetails is already exported above

// const sampleSpellObject = {
// 	index: 'acid-arrow',
// 	name: 'Acid Arrow',
// 	desc: [
// 		'A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 acid damage immediately and 2d4 acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage and no damage at the end of its next turn.'
// 	],
// 	higher_level: [
// 		'When you cast this spell using a spell slot of 3rd level or higher, the damage (both initial and later) increases by 1d4 for each slot level above 2nd.'
// 	],
// 	range: '90 feet',
// 	components: ['V', 'S', 'M'],
// 	material: "Powdered rhubarb leaf and an adder's stomach.",
// 	ritual: false,
// 	duration: 'Instantaneous',
// 	concentration: false,
// 	casting_time: '1 action',
// 	level: 2,
// 	attack_type: 'ranged',
// 	damage: {
// 		damage_type: {
// 			index: 'acid',
// 			name: 'Acid',
// 			url: '/api/2014/damage-types/acid'
// 		},
// 		damage_at_slot_level: {
// 			2: '4d4',
// 			3: '5d4',
// 			4: '6d4',
// 			5: '7d4',
// 			6: '8d4',
// 			7: '9d4',
// 			8: '10d4',
// 			9: '11d4'
// 		}
// 	},
// 	school: {
// 		index: 'evocation',
// 		name: 'Evocation',
// 		url: '/api/2014/magic-schools/evocation'
// 	},
// 	classes: [
// 		{
// 			index: 'wizard',
// 			name: 'Wizard',
// 			url: '/api/2014/classes/wizard'
// 		}
// 	],
// 	subclasses: [
// 		{
// 			index: 'lore',
// 			name: 'Lore',
// 			url: '/api/2014/subclasses/lore'
// 		},
// 		{
// 			index: 'land',
// 			name: 'Land',
// 			url: '/api/2014/subclasses/land'
// 		}
// 	],
// 	url: '/api/2014/spells/acid-arrow',
// 	updated_at: '2025-10-24T20:42:14.618Z'
// }
