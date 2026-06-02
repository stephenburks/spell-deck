import { describe, it, expect } from 'vitest'
import { validateSpellObject, validateSessionSpell, getValidSpells } from '../validation.ts'

const validSpell = {
	index: 'acid-arrow',
	name: 'Acid Arrow',
	level: 2
}

describe('validateSpellObject', () => {
	it('returns false for null', () => {
		expect(validateSpellObject(null)).toBe(false)
	})

	it('returns false for undefined', () => {
		expect(validateSpellObject(undefined)).toBe(false)
	})

	it('returns false for non-object (string)', () => {
		expect(validateSpellObject('not-an-object')).toBe(false)
	})

	it('returns false for non-object (number)', () => {
		expect(validateSpellObject(42)).toBe(false)
	})

	it('returns false for non-object (array)', () => {
		expect(validateSpellObject([])).toBe(false)
	})

	it('returns false when index is missing', () => {
		expect(validateSpellObject({ name: 'Test', level: 1 })).toBe(false)
	})

	it('returns false when index is empty string', () => {
		expect(validateSpellObject({ index: '', name: 'Test', level: 1 })).toBe(false)
	})

	it('returns false when name is missing', () => {
		expect(validateSpellObject({ index: 'test', level: 1 })).toBe(false)
	})

	it('returns false when name is empty string', () => {
		expect(validateSpellObject({ index: 'test', name: '', level: 1 })).toBe(false)
	})

	it('returns false when level is missing', () => {
		expect(validateSpellObject({ index: 'test', name: 'Test' })).toBe(false)
	})

	it('returns false when level is not an integer', () => {
		expect(validateSpellObject({ index: 'test', name: 'Test', level: 2.5 })).toBe(false)
	})

	it('returns false when level is negative', () => {
		expect(validateSpellObject({ index: 'test', name: 'Test', level: -1 })).toBe(false)
	})

	it('returns false when level is greater than 9', () => {
		expect(validateSpellObject({ index: 'test', name: 'Test', level: 10 })).toBe(false)
	})

	it('returns true for a valid spell', () => {
		expect(validateSpellObject(validSpell)).toBe(true)
	})

	it('returns true for a cantrip (level 0)', () => {
		expect(validateSpellObject({ index: 'fire-bolt', name: 'Fire Bolt', level: 0 })).toBe(true)
	})

	it('returns true for a 9th-level spell', () => {
		expect(
			validateSpellObject({ index: 'wish', name: 'Wish', level: 9 })
		).toBe(true)
	})
})

describe('validateSessionSpell', () => {
	it('returns false for null', () => {
		expect(validateSessionSpell(null)).toBe(false)
	})

	it('returns false for a valid spell missing sessionId', () => {
		expect(validateSessionSpell(validSpell)).toBe(false)
	})

	it('returns false for empty sessionId', () => {
		expect(
			validateSessionSpell({ ...validSpell, sessionId: '' })
		).toBe(false)
	})

	it('returns true for valid spell with sessionId', () => {
		expect(
			validateSessionSpell({ ...validSpell, sessionId: 'abc123' })
		).toBe(true)
	})
})

describe('getValidSpells', () => {
	it('returns empty array for null', () => {
		expect(getValidSpells(null)).toEqual([])
	})

	it('returns empty array for undefined', () => {
		expect(getValidSpells(undefined)).toEqual([])
	})

	it('returns empty array for string', () => {
		expect(getValidSpells('not-array')).toEqual([])
	})

	it('returns empty array for empty array', () => {
		expect(getValidSpells([])).toEqual([])
	})

	it('returns only valid spells from mixed array', () => {
		const mixed = [validSpell, null, { index: 'test', name: 'Test', level: 1 }, undefined]
		expect(getValidSpells(mixed)).toHaveLength(2)
	})

	it('returns empty array when all spells are invalid', () => {
		expect(getValidSpells([null, undefined, 'bad'])).toEqual([])
	})

	it('preserves order of valid spells', () => {
		const spells = [
			{ index: 'a', name: 'A', level: 1 },
			{ index: 'b', name: 'B', level: 2 }
		]
		expect(getValidSpells(spells)).toEqual(spells)
	})
})
