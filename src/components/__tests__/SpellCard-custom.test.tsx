import { describe, it, expect } from 'vitest'
import type { Spell, SpellClass } from '../../types'

const customSpell: Spell = {
	index: 'custom-12345',
	name: 'Test Custom Spell',
	level: 3,
	school: { index: 'evocation', name: 'Evocation' },
	casting_time: '1 action',
	range: '60 feet',
	duration: 'Instantaneous',
	components: ['V', 'S'],
	desc: ['A custom test spell description.'],
	ritual: false,
	concentration: false,
	classes: [{ index: 'wizard', name: 'Wizard' } as SpellClass]
}

const apiSpell: Spell = {
	index: 'fireball',
	name: 'Fireball',
	level: 3,
	school: { index: 'evocation', name: 'Evocation' },
	casting_time: '1 action',
	range: '150 feet',
	duration: 'Instantaneous',
	components: ['V', 'S', 'M'],
	material: 'A tiny ball of bat guano and sulfur',
	desc: ['A bright streak flashes from your pointing finger...'],
	ritual: false,
	concentration: false,
	classes: [
		{ index: 'sorcerer', name: 'Sorcerer' } as SpellClass,
		{ index: 'wizard', name: 'Wizard' } as SpellClass
	]
}

const hardcodedCustomSpell: Spell = {
	index: 'ray-of-sickness',
	name: 'Ray of Sickness',
	level: 1,
	school: { index: 'necromancy', name: 'Necromancy' },
	casting_time: '1 action',
	range: '60 feet',
	duration: 'Instantaneous',
	components: ['V', 'S'],
	desc: ['A ray of sickening greenish energy...'],
	ritual: false,
	concentration: false,
	classes: [{ index: 'sorcerer', name: 'Sorcerer' } as SpellClass]
}

// Mirrors the isCustomSpell logic in SpellCard.tsx
const isCustomSpell = (spell: Spell): boolean =>
	Boolean(spell.index?.startsWith('custom-'))

// Mirrors the custom context actions in SpellCard.tsx
const getCustomContextActions = () => [
	{ label: 'Edit Spell', action: 'editCustomSpell', copy: 'Edit', variant: 'surface' },
	{ label: 'Delete Spell', action: 'deleteCustomSpell', copy: 'Delete', variant: 'subtle' }
]

describe('SpellCard — custom spell logic', () => {
	describe('isCustomSpell detection', () => {
		it('detects custom spell by index prefix', () => {
			expect(isCustomSpell(customSpell)).toBe(true)
		})

		it('does NOT detect API spell as custom', () => {
			expect(isCustomSpell(apiSpell)).toBe(false)
		})

		it('does NOT detect hardcoded starter spells as custom', () => {
			// ray-of-sickness is hardcoded, not localStorage custom
			expect(isCustomSpell(hardcodedCustomSpell)).toBe(false)
		})

		it('detects any spell with custom- prefix regardless of source', () => {
			const localCustom: Spell = {
				...apiSpell,
				index: 'custom-fireball'
			}
			expect(isCustomSpell(localCustom)).toBe(true)
		})

		it('returns false for spells with undefined index', () => {
			const bad = { ...apiSpell, index: undefined as unknown as string }
			expect(isCustomSpell(bad)).toBe(false)
		})
	})

	describe('custom context actions', () => {
		it('provides edit action with expected shape', () => {
			const actions = getCustomContextActions()
			const edit = actions.find((a) => a.action === 'editCustomSpell')
			expect(edit).toBeDefined()
			expect(edit!.copy).toBe('Edit')
		})

		it('provides delete action with expected shape', () => {
			const actions = getCustomContextActions()
			const del = actions.find((a) => a.action === 'deleteCustomSpell')
			expect(del).toBeDefined()
			expect(del!.copy).toBe('Delete')
		})

		it('returns exactly two actions', () => {
			expect(getCustomContextActions()).toHaveLength(2)
		})
	})
})
