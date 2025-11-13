const BASE_URL = 'https://www.dnd5eapi.co'

// Helper function to add delay between requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper function to process spells in batches
async function fetchSpellsBatch(spellIndexes, batchSize = 10, delayMs = 1000) {
	const results = []

	for (let i = 0; i < spellIndexes.length; i += batchSize) {
		const batch = spellIndexes.slice(i, i + batchSize)
		const batchResults = await Promise.all(
			batch.map((index) => fetch(BASE_URL + index.url).then((response) => response.json()))
		)

		results.push(...batchResults)

		if (i + batchSize < spellIndexes.length) {
			await delay(delayMs) // Add delay between batches
		}
	}

	return results
}

export async function getAllSpells() {
	const response = await fetch(`${BASE_URL}/api/2014/spells`)
	const spellIndexes = await response.json()

	return fetchSpellsBatch(spellIndexes.results, 5, 2000) // 5 spells every 2 seconds
}

export async function getAllClasses() {
	const response = await fetch(`${BASE_URL}/api/2014/classes`)
	const classIndexes = await response.json()

	return classIndexes.results
}

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

export async function getSpellsByClass(spellsObject) {
	const spellCastingClasses = await getSpellCastingClasses()
	const allSpells = JSON.parse(spellsObject)
	const spellsByClass = []

	spellCastingClasses.forEach((spellClass) => {
		spellsByClass[spellClass] = []
	})

	// Process each spell once
	allSpells.forEach((spell) => {
		// Create trimmed spell without subclasses
		const { subclasses, ...spellWithoutSubclasses } = spell

		// Add spell to each of its classes
		spell.classes.forEach((cls) => {
			if (spellsByClass[cls.name]) {
				spellsByClass[cls.name].push({
					...spellWithoutSubclasses,
					classes: [cls] // Only include this specific class
				})
			}
		})
	})

	return spellsByClass
}

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
