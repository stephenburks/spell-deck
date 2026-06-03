import { describe, it, expect } from 'vitest'
import { getSlotsForLevel, CASTER_TYPES, STORAGE_KEY } from '../spellSlots.ts'

describe('getSlotsForLevel', () => {
	describe('full caster (Bard, Cleric, Druid, Sorcerer, Wizard)', () => {
		it('returns correct slots for level 1 full caster', () => {
			expect(getSlotsForLevel(1, 'full')).toEqual([2])
		})

		it('returns correct slots for level 5 full caster', () => {
			// 4 1st, 3 2nd, 2 3rd
			expect(getSlotsForLevel(5, 'full')).toEqual([4, 3, 2])
		})

		it('returns correct slots for level 10 full caster', () => {
			// 4 1st, 3 2nd, 3 3rd, 3 4th, 2 5th
			expect(getSlotsForLevel(10, 'full')).toEqual([4, 3, 3, 3, 2])
		})

		it('returns correct slots for level 20 full caster', () => {
			expect(getSlotsForLevel(20, 'full')).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1])
		})
	})

	describe('half caster (Paladin, Ranger, Artificer)', () => {
		it('returns empty array for level 1 half caster (no slots yet)', () => {
			expect(getSlotsForLevel(1, 'half')).toEqual([])
		})

		it('returns correct slots for level 2 half caster', () => {
			expect(getSlotsForLevel(2, 'half')).toEqual([2])
		})

		it('returns correct slots for level 10 half caster', () => {
			// 4 1st, 3 2nd, 2 3rd
			expect(getSlotsForLevel(10, 'half')).toEqual([4, 3, 2])
		})

		it('returns correct slots for level 20 half caster', () => {
			expect(getSlotsForLevel(20, 'half')).toEqual([4, 3, 3, 3, 2])
		})
	})

	describe('warlock (Pact Magic)', () => {
		it('returns correct pact slots for level 1 warlock', () => {
			// 1 slot at 1st level
			expect(getSlotsForLevel(1, 'warlock')).toEqual([1])
		})

		it('returns correct pact slots for level 3 warlock', () => {
			// 2 slots at 2nd level
			expect(getSlotsForLevel(3, 'warlock')).toEqual([0, 2])
		})

		it('returns correct pact slots for level 5 warlock', () => {
			// 2 slots at 3rd level
			expect(getSlotsForLevel(5, 'warlock')).toEqual([0, 0, 2])
		})

		it('returns correct pact slots for level 11 warlock', () => {
			// 3 slots at 5th level
			expect(getSlotsForLevel(11, 'warlock')).toEqual([0, 0, 0, 0, 3])
		})

		it('returns correct pact slots for level 20 warlock', () => {
			// 4 slots at 5th level
			expect(getSlotsForLevel(20, 'warlock')).toEqual([0, 0, 0, 0, 4])
		})

		it('handles warlock level 7 (2 slots at 4th level)', () => {
			expect(getSlotsForLevel(7, 'warlock')).toEqual([0, 0, 0, 2])
		})
	})

	describe('edge cases', () => {
		it('clamps character level below 1 to 1', () => {
			expect(getSlotsForLevel(0, 'full')).toEqual([2])
		})

		it('clamps character level above 20 to 20', () => {
			expect(getSlotsForLevel(21, 'full')).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1])
		})

		it('clamps negative levels to 1', () => {
			expect(getSlotsForLevel(-5, 'full')).toEqual([2])
		})

		it('clamps fractional levels down', () => {
			// Math.floor(5.7) = 5 → [4, 3, 2]
			expect(getSlotsForLevel(5.7, 'full')).toEqual([4, 3, 2])
		})

		it('handles large level for warlock (clamped to 20)', () => {
			expect(getSlotsForLevel(100, 'warlock')).toEqual([0, 0, 0, 0, 4])
		})
	})
})

describe('CASTER_TYPES', () => {
	it('has three entries', () => {
		expect(CASTER_TYPES).toHaveLength(3)
	})

	it('has full caster as first option', () => {
		expect(CASTER_TYPES[0].value).toBe('full')
	})

	it('has half caster as second option', () => {
		expect(CASTER_TYPES[1].value).toBe('half')
	})

	it('has warlock as third option', () => {
		expect(CASTER_TYPES[2].value).toBe('warlock')
	})
})

describe('STORAGE_KEY', () => {
	it('is spell-deck-slot-tracker', () => {
		expect(STORAGE_KEY).toBe('spell-deck-slot-tracker')
	})
})
