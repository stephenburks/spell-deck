import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
	STORAGE_KEYS,
	safeLoadFromStorage,
	safeSaveToStorage,
	loadSpellbook,
	saveSpellbook,
	addSpellToSpellbook,
	removeSpellFromSpellbook,
	addSpellToSessionDeck,
	removeSpellFromSessionDeck,
	clearAllSpellData,
	initializeLocalStorage
} from '../localStorage.ts'
import type { Spell } from '../../../types.ts'

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
	desc: ['Three darts.'],
	range: '120 feet',
	components: ['V', 'S'],
	ritual: false,
	duration: 'Instantaneous',
	concentration: false,
	casting_time: '1 action',
	school: { index: 'evocation', name: 'Evocation' },
	classes: [{ index: 'wizard', name: 'Wizard' }]
}

beforeEach(() => {
	localStorage.clear()
})

describe('safeLoadFromStorage', () => {
	it('returns default when key does not exist', () => {
		expect(safeLoadFromStorage('nonexistent', 'default')).toBe('default')
	})

	it('returns parsed JSON when key exists', () => {
		localStorage.setItem('test-key', JSON.stringify({ value: 42 }))
		expect(safeLoadFromStorage('test-key', null)).toEqual({ value: 42 })
	})

	it('returns default on corrupt JSON', () => {
		localStorage.setItem('test-key', '{bad json')
		expect(safeLoadFromStorage('test-key', 'fallback')).toBe('fallback')
	})
})

describe('safeSaveToStorage', () => {
	it('returns true on successful save', () => {
		expect(safeSaveToStorage('test-key', { data: 'test' })).toBe(true)
		expect(localStorage.getItem('test-key')).toBe('{"data":"test"}')
	})

	it('returns false on quota exceeded', () => {
		const setItem = vi.spyOn(Storage.prototype, 'setItem')
		setItem.mockImplementationOnce(() => {
			throw new Error('QuotaExceededError')
		})
		expect(safeSaveToStorage('test-key', 'data')).toBe(false)
		setItem.mockRestore()
	})
})

describe('spellbook operations', () => {
	it('loadSpellbook returns empty data initially', () => {
		const data = loadSpellbook()
		expect(data.spells).toEqual([])
		expect(data.lastModified).toBeTruthy()
	})

	it('saveSpellbook persists spells', () => {
		saveSpellbook([fireBolt])
		const data = loadSpellbook()
		expect(data.spells).toHaveLength(1)
		expect(data.spells[0].index).toBe('fire-bolt')
	})

	it('addSpellToSpellbook adds a spell', () => {
		const result = addSpellToSpellbook(fireBolt)
		expect(result.success).toBe(true)
		expect(result.spells).toHaveLength(1)
	})

	it('addSpellToSpellbook prevents duplicates', () => {
		addSpellToSpellbook(fireBolt)
		const result = addSpellToSpellbook(fireBolt)
		expect(result.success).toBe(false)
		expect(result.message).toContain('already in your collection')
	})

	it('removeSpellFromSpellbook removes by index', () => {
		addSpellToSpellbook(fireBolt)
		addSpellToSpellbook(magicMissile)
		const result = removeSpellFromSpellbook('fire-bolt')
		expect(result.success).toBe(true)
		expect(result.spells).toHaveLength(1)
		expect(result.spells![0].index).toBe('magic-missile')
	})
})

describe('session deck operations', () => {
	it('addSpellToSessionDeck adds with sessionId', () => {
		const result = addSpellToSessionDeck(magicMissile)
		expect(result.success).toBe(true)
		expect(result.sessionSpell).toBeDefined()
		expect(typeof result.sessionSpell!.sessionId).toBe('string')
	})

	it('removeSpellFromSessionDeck removes by sessionId', () => {
		const addResult = addSpellToSessionDeck(magicMissile)
		const sessionId = addResult.sessionSpell!.sessionId
		const removeResult = removeSpellFromSessionDeck(sessionId)
		expect(removeResult.success).toBe(true)
		expect(removeResult.spells).toHaveLength(0)
	})

	it('removeSpellFromSessionDeck only removes matching sessionId', () => {
		const r1 = addSpellToSessionDeck(fireBolt)
		addSpellToSessionDeck(magicMissile)
		const result = removeSpellFromSessionDeck(r1.sessionSpell!.sessionId)
		expect(result.spells).toHaveLength(1)
	})
})

describe('clearAllSpellData', () => {
	it('removes all spell data', () => {
		addSpellToSpellbook(fireBolt)
		addSpellToSessionDeck(magicMissile)
		clearAllSpellData()
		expect(loadSpellbook().spells).toEqual([])
	})
})

describe('initializeLocalStorage', () => {
	it('creates missing storage keys', () => {
		const results = initializeLocalStorage()
		expect(results).toHaveProperty('spellbook')
		expect(results).toHaveProperty('session_deck')
		expect(results).toHaveProperty('daily_spells')
	})

	it('preserves existing valid data', () => {
		addSpellToSpellbook(fireBolt)
		initializeLocalStorage()
		expect(loadSpellbook().spells).toHaveLength(1)
	})
})
