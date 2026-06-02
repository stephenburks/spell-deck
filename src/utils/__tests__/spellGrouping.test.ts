import { describe, it, expect } from 'vitest'
import {
	getLevelLabel,
	groupSpellsByLevel,
	getOrderedSpellGroups,
	getSpellsForLevel,
	countSpellsByLevel,
	generateSessionId,
	addSessionId,
	removeSessionId
} from '../spellGrouping.ts'
import type { Spell } from '../../types.ts'

const fireBolt: Spell = {
	index: 'fire-bolt',
	name: 'Fire Bolt',
	level: 0,
	desc: ['Deals fire damage.'],
	range: '120 feet',
	components: ['V', 'S'],
	ritual: false,
	duration: 'Instantaneous',
	concentration: false,
	casting_time: '1 action',
	school: { index: 'evocation', name: 'Evocation' },
	classes: [{ index: 'sorcerer', name: 'Sorcerer' }]
}

const magicMissile: Spell = {
	index: 'magic-missile',
	name: 'Magic Missile',
	level: 1,
	desc: ['Three darts of magical force.'],
	range: '120 feet',
	components: ['V', 'S'],
	ritual: false,
	duration: 'Instantaneous',
	concentration: false,
	casting_time: '1 action',
	school: { index: 'evocation', name: 'Evocation' },
	classes: [{ index: 'wizard', name: 'Wizard' }]
}

const wish: Spell = {
	index: 'wish',
	name: 'Wish',
	level: 9,
	desc: ['The mightiest spell.'],
	range: 'Self',
	components: ['V'],
	ritual: false,
	duration: 'Instantaneous',
	concentration: false,
	casting_time: '1 action',
	school: { index: 'conjuration', name: 'Conjuration' },
	classes: [{ index: 'wizard', name: 'Wizard' }]
}

describe('getLevelLabel', () => {
	it('returns "Cantrips" for level 0', () => {
		expect(getLevelLabel(0)).toBe('Cantrips')
	})

	it('returns "Level 1" for level 1', () => {
		expect(getLevelLabel(1)).toBe('Level 1')
	})

	it('returns "Level 9" for level 9', () => {
		expect(getLevelLabel(9)).toBe('Level 9')
	})
})

describe('groupSpellsByLevel', () => {
	it('returns empty object for null', () => {
		expect(groupSpellsByLevel(null)).toEqual({})
	})

	it('returns empty object for string', () => {
		expect(groupSpellsByLevel('not-array')).toEqual({})
	})

	it('returns empty object for empty array', () => {
		expect(groupSpellsByLevel([])).toEqual({})
	})

	it('groups spells into correct level keys', () => {
		const result = groupSpellsByLevel([fireBolt, magicMissile, wish])
		expect(Object.keys(result)).toHaveLength(3)
		expect(result['Cantrips']).toHaveLength(1)
		expect(result['Level 1']).toHaveLength(1)
		expect(result['Level 9']).toHaveLength(1)
	})

	it('sorts spells alphabetically within each level', () => {
		const a = { ...fireBolt, name: 'Z Spell', index: 'z-spell' }
		const b = { ...fireBolt, name: 'A Spell', index: 'a-spell' }
		const result = groupSpellsByLevel([a, b])
		expect(result['Cantrips']?.[0].name).toBe('A Spell')
		expect(result['Cantrips']?.[1].name).toBe('Z Spell')
	})

	it('skips spells with missing level', () => {
		const result = groupSpellsByLevel([
			{ name: 'Bad', index: 'bad' } as Spell,
			magicMissile
		])
		expect(Object.keys(result)).toHaveLength(1)
	})

	it('handles mixed valid and invalid entries', () => {
		const result = groupSpellsByLevel([null, fireBolt, undefined])
		expect(result['Cantrips']).toHaveLength(1)
	})
})

describe('getOrderedSpellGroups', () => {
	it('returns empty array for empty input', () => {
		expect(getOrderedSpellGroups([])).toEqual([])
	})

	it('returns groups in level order (Cantrips through Level 9)', () => {
		const result = getOrderedSpellGroups([wish, fireBolt])
		expect(result[0].level).toBe('Cantrips')
		expect(result[1].level).toBe('Level 9')
	})

	it('omits levels with no spells', () => {
		const result = getOrderedSpellGroups([magicMissile])
		expect(result).toHaveLength(1)
		expect(result[0].level).toBe('Level 1')
	})

	it('includes level, spells, and count on each group', () => {
		const result = getOrderedSpellGroups([magicMissile])
		expect(result[0]).toHaveProperty('level')
		expect(result[0]).toHaveProperty('spells')
		expect(result[0]).toHaveProperty('count')
		expect(result[0].count).toBe(1)
	})
})

describe('getSpellsForLevel', () => {
	it('returns empty array for sparse input', () => {
		expect(getSpellsForLevel(null, 1)).toEqual([])
		expect(getSpellsForLevel('bad', 1)).toEqual([])
	})

	it('returns only spells matching the level', () => {
		const result = getSpellsForLevel([fireBolt, magicMissile], 0)
		expect(result).toHaveLength(1)
		expect(result[0].index).toBe('fire-bolt')
	})

	it('returns alphabetically sorted results', () => {
		const a = { ...fireBolt, name: 'Z Cantrip', index: 'z-cantrip' }
		const b = { ...fireBolt, name: 'A Cantrip', index: 'a-cantrip' }
		const result = getSpellsForLevel([a, b], 0)
		expect(result[0].name).toBe('A Cantrip')
	})
})

describe('countSpellsByLevel', () => {
	it('returns all 10 level keys with value 0 for empty array', () => {
		const result = countSpellsByLevel([])
		expect(Object.keys(result)).toHaveLength(10)
		expect(result['Cantrips']).toBe(0)
		expect(result['Level 9']).toBe(0)
	})

	it('correctly counts spells per level', () => {
		const result = countSpellsByLevel([fireBolt, magicMissile, fireBolt])
		expect(result['Cantrips']).toBe(2)
		expect(result['Level 1']).toBe(1)
	})

	it('returns initialized counts for non-array input', () => {
		expect(countSpellsByLevel(null)).toHaveProperty('Cantrips')
	})
})

describe('generateSessionId', () => {
	it('returns a string', () => {
		expect(typeof generateSessionId()).toBe('string')
	})

	it('generates largely unique IDs', () => {
		const ids = new Set(Array.from({ length: 100 }, () => generateSessionId()))
		expect(ids.size).toBeGreaterThan(90)
	})

	it('contains both timestamp and random component', () => {
		const id = generateSessionId()
		expect(id).toMatch(/^\d+_\d+$/)
	})
})

describe('addSessionId', () => {
	it('returns null for null input', () => {
		expect(addSessionId(null)).toBeNull()
	})

	it('returns null for non-object input', () => {
		expect(addSessionId('string')).toBeNull()
	})

	it('does not mutate the original object', () => {
		const original = { ...magicMissile }
		addSessionId(magicMissile)
		expect(magicMissile).toEqual(original)
	})

	it('preserves all original spell properties', () => {
		const result = addSessionId(magicMissile)
		expect(result?.index).toBe('magic-missile')
		expect(result?.name).toBe('Magic Missile')
		expect(result?.level).toBe(1)
	})

	it('adds a non-empty sessionId', () => {
		const result = addSessionId(magicMissile)
		expect(typeof result?.sessionId).toBe('string')
		expect(result?.sessionId.length).toBeGreaterThan(0)
	})
})

describe('removeSessionId', () => {
	it('returns null for null input', () => {
		expect(removeSessionId(null)).toBeNull()
	})

	it('returns null for non-object input', () => {
		expect(removeSessionId(42)).toBeNull()
	})

	it('strips sessionId from the spell object', () => {
		const withSession = { ...magicMissile, sessionId: 'abc123' }
		const result = removeSessionId(withSession)
		expect(result).not.toHaveProperty('sessionId')
		expect(result?.index).toBe('magic-missile')
	})

	it('returns new object (does not mutate original)', () => {
		const withSession = { ...magicMissile, sessionId: 'abc123' }
		removeSessionId(withSession)
		expect(withSession).toHaveProperty('sessionId')
	})
})
