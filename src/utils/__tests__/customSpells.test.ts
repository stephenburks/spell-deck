import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
	loadCustomSpells,
	saveCustomSpells,
	addCustomSpell,
	updateCustomSpell,
	deleteCustomSpell,
	exportCustomSpellsJson,
	importCustomSpellsJson,
	generateCustomSpellIndex
} from '../customSpells'
import type { Spell } from '../../types'

const mockStorage = new Map<string, string>()

vi.stubGlobal('localStorage', {
	getItem: vi.fn((key: string) => mockStorage.get(key) ?? null),
	setItem: vi.fn((key: string, value: string) => {
		mockStorage.set(key, value)
	}),
	removeItem: vi.fn((key: string) => {
		mockStorage.delete(key)
	}),
	clear: vi.fn(() => mockStorage.clear()),
	key: vi.fn(() => null),
	length: 0
})

function makeSpell(overrides: Partial<Spell> = {}): Spell {
	return {
		index: '',
		name: 'Test Spell',
		level: 1,
		school: { index: 'evocation', name: 'Evocation' },
		casting_time: '1 action',
		range: 'Touch',
		duration: 'Instantaneous',
		components: ['V', 'S'],
		desc: ['A test spell.'],
		ritual: false,
		concentration: false,
		classes: [{ index: 'wizard', name: 'Wizard' }],
		...overrides
	}
}

describe('customSpells', () => {
	beforeEach(() => {
		mockStorage.clear()
		// Set active campaign to default
		mockStorage.set('spell-deck-active-campaign', 'default')
	})

	describe('loadCustomSpells', () => {
		it('returns empty array when no spells stored', () => {
			expect(loadCustomSpells()).toEqual([])
		})

		it('returns stored spells for active campaign', () => {
			const spells = [makeSpell({ index: 'custom-1', name: 'Fireball Jr' })]
			saveCustomSpells(spells)
			const loaded = loadCustomSpells()
			expect(loaded).toHaveLength(1)
			expect(loaded[0].name).toBe('Fireball Jr')
		})

		it('returns empty array for corrupted data', () => {
			mockStorage.set('spell-deck-custom-spells-default', 'not-json')
			expect(loadCustomSpells()).toEqual([])
		})
	})

	describe('addCustomSpell', () => {
		it('adds a spell and assigns a custom index', () => {
			const spell = makeSpell({ name: 'New Spell' })
			const result = addCustomSpell(spell)
			expect(result).not.toBeNull()
			expect(result!.index).toMatch(/^custom-\d+$/)
			expect(result!.name).toBe('New Spell')
		})

		it('preserves existing custom index', () => {
			const spell = makeSpell({ index: 'custom-my-spell', name: 'Preserved' })
			const result = addCustomSpell(spell)
			expect(result!.index).toBe('custom-my-spell')
		})

		it('persists to localStorage', () => {
			addCustomSpell(makeSpell({ name: 'Persisted' }))
			const loaded = loadCustomSpells()
			expect(loaded).toHaveLength(1)
			expect(loaded[0].name).toBe('Persisted')
		})

		it('returns null for invalid spell', () => {
			const invalid = { name: 'No Index' } as unknown as Spell
			expect(addCustomSpell(invalid)).toBeNull()
		})

		it('returns null for duplicate index', () => {
			const spell = makeSpell({ index: 'custom-same', name: 'First' })
			addCustomSpell(spell)
			const dupe = makeSpell({ index: 'custom-same', name: 'Duplicate' })
			expect(addCustomSpell(dupe)).toBeNull()
		})

		it('rejects spell with missing name', () => {
			const bad = makeSpell({ name: '' })
			expect(addCustomSpell(bad)).toBeNull()
		})

		it('rejects spell with level > 9', () => {
			const bad = makeSpell({ level: 10 })
			expect(addCustomSpell(bad)).toBeNull()
		})
	})

	describe('updateCustomSpell', () => {
		it('updates an existing spell', () => {
			const spell = makeSpell({ index: 'custom-1', name: 'Original' })
			addCustomSpell(spell)
			const updated = updateCustomSpell('custom-1', { name: 'Updated' })
			expect(updated).not.toBeNull()
			expect(updated!.name).toBe('Updated')
		})

		it('returns null for non-existent spell', () => {
			expect(updateCustomSpell('nonexistent', { name: 'Nope' })).toBeNull()
		})

		it('rejects update that invalidates the spell', () => {
			const spell = makeSpell({ index: 'custom-1', name: 'Valid' })
			addCustomSpell(spell)
			expect(updateCustomSpell('custom-1', { name: '' })).toBeNull()
		})

		it('preserves unchanged fields', () => {
			const spell = makeSpell({ index: 'custom-1', name: 'Original', level: 3 })
			addCustomSpell(spell)
			const updated = updateCustomSpell('custom-1', { name: 'New Name' })
			expect(updated!.level).toBe(3)
		})
	})

	describe('deleteCustomSpell', () => {
		it('removes a spell by index', () => {
			addCustomSpell(makeSpell({ index: 'custom-1', name: 'Gone' }))
			expect(deleteCustomSpell('custom-1')).toBe(true)
			expect(loadCustomSpells()).toEqual([])
		})

		it('returns false for non-existent spell', () => {
			expect(deleteCustomSpell('nonexistent')).toBe(false)
		})

		it('does not remove other spells', () => {
			addCustomSpell(makeSpell({ index: 'custom-1', name: 'Keep' }))
			addCustomSpell(makeSpell({ index: 'custom-2', name: 'Remove' }))
			deleteCustomSpell('custom-2')
			const remaining = loadCustomSpells()
			expect(remaining).toHaveLength(1)
			expect(remaining[0].name).toBe('Keep')
		})
	})

	describe('exportCustomSpellsJson', () => {
		it('exports spells as formatted JSON', () => {
			addCustomSpell(makeSpell({ index: 'custom-1', name: 'Export Me' }))
			const json = exportCustomSpellsJson()
			const parsed = JSON.parse(json)
			expect(Array.isArray(parsed)).toBe(true)
			expect(parsed[0].name).toBe('Export Me')
		})

		it('returns empty array JSON when no spells', () => {
			expect(exportCustomSpellsJson()).toBe('[]')
		})
	})

	describe('importCustomSpellsJson', () => {
		it('imports valid spells', () => {
			const json = JSON.stringify([makeSpell({ index: 'custom-import', name: 'Imported' })])
			const result = importCustomSpellsJson(json)
			expect(result.imported).toBe(1)
			expect(result.errors).toEqual([])
		})

		it('rejects invalid JSON', () => {
			const result = importCustomSpellsJson('not json')
			expect(result.imported).toBe(0)
			expect(result.errors).toContain('Invalid JSON format')
		})

		it('rejects non-array JSON', () => {
			const result = importCustomSpellsJson('{"not": "array"}')
			expect(result.imported).toBe(0)
			expect(result.errors[0]).toContain('array')
		})

		it('skips invalid spells in mixed array', () => {
			const json = JSON.stringify([
				makeSpell({ index: 'custom-good', name: 'Valid' }),
				{ name: 'No Index' } // invalid
			])
			const result = importCustomSpellsJson(json)
			expect(result.imported).toBe(1)
			expect(result.errors).toHaveLength(1)
		})

		it('assigns custom index to spells without one', () => {
			const spell = makeSpell({ name: 'No Index Spell' })
			spell.index = 'not-custom'
			const json = JSON.stringify([spell])
			const result = importCustomSpellsJson(json)
			expect(result.imported).toBe(1)
			const loaded = loadCustomSpells()
			expect(loaded[0].index).toMatch(/^custom-\d+$/)
		})

		it('merges with existing spells', () => {
			addCustomSpell(makeSpell({ index: 'custom-1', name: 'Existing' }))
			const json = JSON.stringify([makeSpell({ index: 'custom-2', name: 'New Import' })])
			const result = importCustomSpellsJson(json)
			expect(result.imported).toBe(1)
			const all = loadCustomSpells()
			expect(all).toHaveLength(2)
		})
	})

	describe('generateCustomSpellIndex', () => {
		it('generates timestamp-based index in correct format', () => {
			const idx = generateCustomSpellIndex()
			expect(idx).toMatch(/^custom-\d+$/)
		})
	})
})
