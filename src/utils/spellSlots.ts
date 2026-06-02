/**
 * D&D 5e SRD spell slot progression tables
 * Rows: character level, Columns: spell slots per spell level (1st-9th)
 */

export const FULL_CASTER_SLOTS: Record<number, number[]> = {
	1: [2],
	2: [3],
	3: [4, 2],
	4: [4, 3],
	5: [4, 3, 2],
	6: [4, 3, 3],
	7: [4, 3, 3, 1],
	8: [4, 3, 3, 2],
	9: [4, 3, 3, 3, 1],
	10: [4, 3, 3, 3, 2],
	11: [4, 3, 3, 3, 2, 1],
	12: [4, 3, 3, 3, 2, 1],
	13: [4, 3, 3, 3, 2, 1, 1],
	14: [4, 3, 3, 3, 2, 1, 1],
	15: [4, 3, 3, 3, 2, 1, 1, 1],
	16: [4, 3, 3, 3, 2, 1, 1, 1],
	17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
	18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
	19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
	20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
}

export const HALF_CASTER_SLOTS: Record<number, number[]> = {
	1: [],
	2: [2],
	3: [3],
	4: [3],
	5: [4, 2],
	6: [4, 2],
	7: [4, 3],
	8: [4, 3],
	9: [4, 3, 2],
	10: [4, 3, 2],
	11: [4, 3, 3],
	12: [4, 3, 3],
	13: [4, 3, 3, 1],
	14: [4, 3, 3, 1],
	15: [4, 3, 3, 2],
	16: [4, 3, 3, 2],
	17: [4, 3, 3, 3, 1],
	18: [4, 3, 3, 3, 1],
	19: [4, 3, 3, 3, 2],
	20: [4, 3, 3, 3, 2]
}

export const WARLOCK_SLOTS: Record<number, { count: number; level: number }> = {
	1: { count: 1, level: 1 },
	2: { count: 2, level: 1 },
	3: { count: 2, level: 2 },
	4: { count: 2, level: 2 },
	5: { count: 2, level: 3 },
	6: { count: 2, level: 3 },
	7: { count: 2, level: 4 },
	8: { count: 2, level: 4 },
	9: { count: 2, level: 5 },
	10: { count: 2, level: 5 },
	11: { count: 3, level: 5 },
	12: { count: 3, level: 5 },
	13: { count: 3, level: 5 },
	14: { count: 3, level: 5 },
	15: { count: 3, level: 5 },
	16: { count: 3, level: 5 },
	17: { count: 4, level: 5 },
	18: { count: 4, level: 5 },
	19: { count: 4, level: 5 },
	20: { count: 4, level: 5 }
}

export type CasterType = 'full' | 'half' | 'warlock'

export const getSlotsForLevel = (
	characterLevel: number,
	casterType: CasterType
): number[] => {
	const clamped = Math.max(1, Math.min(20, Math.floor(characterLevel)))

	if (casterType === 'warlock') {
		const entry = WARLOCK_SLOTS[clamped]
		if (!entry) return []
		const slots: number[] = []
		for (let i = 1; i < entry.level; i++) slots.push(0)
		slots.push(entry.count)
		return slots
	}

	const table = casterType === 'half' ? HALF_CASTER_SLOTS : FULL_CASTER_SLOTS
	return table[clamped] || []
}

export const CASTER_TYPES: { value: CasterType; label: string }[] = [
	{ value: 'full', label: 'Full Caster (Bard, Cleric, Druid, Sorcerer, Wizard)' },
	{ value: 'half', label: 'Half Caster (Paladin, Ranger, Artificer)' },
	{ value: 'warlock', label: 'Warlock (Pact Magic)' }
]

export const STORAGE_KEY = 'spell-deck-slot-tracker'

export interface SlotState {
	characterLevel: number
	casterType: CasterType
	usedSlots: Record<number, number> // spellLevel → count used
}
